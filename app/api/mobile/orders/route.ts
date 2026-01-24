import { desc, eq, sql } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { member, order, orderItem, user } from "@/db/schema";
import { decrypt, encrypt } from "@/lib/encryption";
import {
  errorResponse,
  getMobileSession,
  successResponse,
  unauthorizedResponse,
} from "@/lib/mobile-auth";
import { realtime } from "@/lib/realtime";
import { getProductsStock } from "@/server/inventory";
import { createOrderNotification } from "@/server/notifications";
import { checkOrderLimit } from "@/server/subscription";

const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().min(1),
  notes: z.string().optional(),
});

const placeOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getMobileSession();
    if (!session?.user) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    const orders = await db.query.order.findMany({
      where: eq(order.userId, session.user.id),
      with: {
        organization: {
          columns: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        orderItems: {
          with: {
            product: {
              columns: {
                id: true,
                name: true,
                imageUrls: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: [desc(order.createdAt)],
      limit,
      offset,
    });

    const decryptedOrders = orders.map((ord) => ({
      ...ord,
      totalPrice: decrypt(ord.totalPrice),
      orderItems: ord.orderItems.map((item) => ({
        ...item,
        priceAtOrder: decrypt(item.priceAtOrder),
        subtotal: decrypt(item.subtotal),
      })),
    }));

    return successResponse({
      orders: decryptedOrders,
      total: decryptedOrders.length,
    });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return errorResponse("Failed to fetch orders", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getMobileSession();
    if (!session?.user) return unauthorizedResponse();

    const body = await request.json();
    const parsed = placeOrderSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Invalid order data", 400);
    }

    const { items, notes } = parsed.data;

    const productIds = items.map((item) => item.productId);
    const products = await db.query.product.findMany({
      where: (product, { inArray }) => inArray(product.id, productIds),
      with: {
        organization: true,
      },
    });

    if (products.length !== items.length) {
      return errorResponse("One or more products not found", 404);
    }

    const organizationIds = [...new Set(products.map((p) => p.organizationId))];
    if (organizationIds.length > 1) {
      return errorResponse(
        "All products must belong to the same organization",
        400,
      );
    }

    const organizationId = organizationIds[0];

    const orgOwner = await db.query.member.findFirst({
      where: eq(member.organizationId, organizationId),
      with: { user: true },
    });

    if (!orgOwner) {
      return errorResponse("Organization owner not found", 404);
    }

    const orderLimit = await checkOrderLimit(organizationId);
    if (!orderLimit.canCreate) {
      return errorResponse(
        `Merchant has reached their monthly order limit of ${orderLimit.maxOrders}`,
        429,
      );
    }

    const stockCheck = await getProductsStock({ productIds, organizationId });
    if (!stockCheck.ok) {
      return errorResponse("Failed to check product availability", 500);
    }

    const stockWarnings: string[] = [];
    for (const item of items) {
      const productStock = stockCheck.stocks.find(
        (s) => s.id === item.productId,
      );
      if (productStock?.inventoryEnabled) {
        const availableStock = productStock.currentStock || 0;
        if (item.quantity > availableStock) {
          stockWarnings.push(
            `Only ${availableStock} units available for ${
              products.find((p) => p.id === item.productId)?.name
            }`,
          );
        }
      }
    }

    let totalPrice = 0;
    const orderItems = items.map((item) => {
      const productData = products.find((p) => p.id === item.productId);
      if (!productData) throw new Error("Product not found");

      let priceAtOrder = productData.price;
      let subtotal = 0;

      if (productData.category === "real-estate") {
        priceAtOrder = productData.price;
        subtotal = 0;
      } else {
        subtotal = Number(priceAtOrder) * item.quantity;
      }

      if (productData.category !== "real-estate") {
        totalPrice += subtotal;
      } else if (!productData.isLandlord) {
        totalPrice += Number(productData.visitFees || "0") * item.quantity;
      }

      const displaySubtotal =
        productData.category === "real-estate"
          ? Number(priceAtOrder) * item.quantity
          : subtotal;

      return {
        productId: item.productId,
        productName: productData.name,
        quantity: item.quantity,
        priceAtOrder,
        subtotal: displaySubtotal.toFixed(2),
        notes: item.notes,
      };
    });

    const maxOrderResult = await db
      .select({
        maxNum: sql<number>`COALESCE(MAX(${order.orderNumber}), 0)`,
      })
      .from(order)
      .where(eq(order.organizationId, organizationId));
    const nextOrderNumber = (maxOrderResult[0]?.maxNum || 0) + 1;

    const [newOrder] = await db
      .insert(order)
      .values({
        orderNumber: nextOrderNumber,
        userId: session.user.id,
        organizationId,
        notes: notes || null,
        totalPrice: encrypt(totalPrice.toFixed(2)),
      })
      .returning();

    await db.insert(orderItem).values(
      orderItems.map((item) => ({
        orderId: newOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        priceAtOrder: encrypt(String(item.priceAtOrder)),
        subtotal: encrypt(item.subtotal),
      })),
    );

    const userData = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    });

    const { notificationId } = await createOrderNotification({
      organizationId,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      type: "new",
      customerName: userData?.name || session.user.name,
      customerEmail: userData?.email || session.user.email,
      total: totalPrice.toFixed(2),
      itemCount: items.length,
    });

    await realtime.channel(`org:${organizationId}`).emit("orders.new", {
      notificationId,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      customerName: userData?.name || session.user.name,
      customerEmail: userData?.email || session.user.email,
      total: totalPrice.toFixed(2),
      organizationId,
      itemCount: items.length,
      createdAt: newOrder.createdAt.toISOString(),
    });

    return successResponse(
      {
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        totalPrice: totalPrice.toFixed(2),
        stockWarnings: stockWarnings.length > 0 ? stockWarnings : undefined,
      },
      201,
    );
  } catch (error) {
    console.error("Failed to place order:", error);
    return errorResponse("Failed to place order", 500);
  }
}
