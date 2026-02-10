import { desc, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { order } from "@/db/schema";
import { decrypt } from "@/lib/encryption";
import {
  errorResponse,
  getMobileSession,
  successResponse,
  unauthorizedResponse,
} from "@/lib/mobile-auth";
import { createOrderForUser } from "@/server/orders";

const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().min(1),
  notes: z.string().optional(),
});

const placeOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  notes: z.string().optional(),
  deliveryLocation: z.string().min(1).optional(),
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

    const { items, notes, deliveryLocation } = parsed.data;

    const result = await createOrderForUser({
      items,
      notes,
      deliveryLocation,
      userId: session.user.id,
      userEmail: session.user.email,
      userName: session.user.name,
    });

    if (!result.ok) {
      const errorMessage =
        typeof result.error === "string" ? result.error : "Validation failed";
      return errorResponse(errorMessage, 400);
    }

    return successResponse(
      {
        orderId: result.orderId,
        orderNumber: result.orderNumber,
        totalPrice: result.totalPrice,
        deliveryLocation: result.deliveryLocation,
        stockWarnings: result.stockWarnings,
      },
      201,
    );
  } catch (error) {
    console.error("Failed to place order:", error);
    return errorResponse("Failed to place order", 500);
  }
}
