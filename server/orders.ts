"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { orderItem, order as orderTable, user } from "@/db/schema";
import { auth } from "@/lib/auth";

const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().min(1),
  notes: z.string().optional(),
});

const orderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  notes: z.string().optional(),
});

export async function placeOrder(input: z.infer<typeof orderSchema>) {
  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: z.treeifyError(parsed.error) };
  }

  const session = await auth.api.getSession({
    headers: await (async () => {
      const { headers } = await import("next/headers");
      return headers();
    })(),
  });

  if (!session?.user) {
    return { ok: false, error: "Unauthorized" };
  }

  const { items, notes } = parsed.data;

  try {
    const productIds = items.map((item) => item.productId);
    const products = await db.query.product.findMany({
      where: (product, { inArray }) => inArray(product.id, productIds),
      with: {
        organization: true,
      },
    });

    if (products.length !== items.length) {
      return { ok: false, error: "One or more products not found" };
    }

    // Ensure all products belong to the same organization
    const organizationIds = [...new Set(products.map((p) => p.organizationId))];
    if (organizationIds.length > 1) {
      return {
        ok: false,
        error: "All products must belong to the same organization",
      };
    }

    const organizationId = organizationIds[0];
    const organization = products[0].organization;

    let totalPrice = 0;
    const orderItems = items.map((item) => {
      const productData = products.find((p) => p.id === item.productId);
      if (!productData) throw new Error("Product not found");

      const priceAtOrder = productData.price;
      const subtotal = Number(priceAtOrder) * item.quantity;
      totalPrice += subtotal;

      return {
        productId: item.productId,
        productName: productData.name,
        quantity: item.quantity,
        priceAtOrder,
        subtotal: subtotal.toFixed(2),
        notes: item.notes,
      };
    });

    const [newOrder] = await db
      .insert(orderTable)
      .values({
        userId: session.user.id,
        organizationId,
        notes: notes || null,
        totalPrice: totalPrice.toFixed(2),
      })
      .returning();

    await db.insert(orderItem).values(
      orderItems.map((item) => ({
        orderId: newOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        priceAtOrder: item.priceAtOrder,
        subtotal: item.subtotal,
      })),
    );

    const userData = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    });

    const metadata = organization.metadata
      ? typeof organization.metadata === "string"
        ? JSON.parse(organization.metadata)
        : organization.metadata
      : {};

    const whatsappPhone = metadata.phone;

    if (!whatsappPhone) {
      return {
        ok: true,
        orderId: newOrder.id,
        error: "Merchant WhatsApp number not configured",
      };
    }

    const formatPrice = (price: number) =>
      new Intl.NumberFormat("rw-RW", {
        style: "currency",
        currency: "RWF",
        maximumFractionDigits: 0,
      }).format(price);

    const itemsList = orderItems
      .map(
        (item) =>
          `📦 *${item.productName}*\n` +
          `   Qty: ${item.quantity} × ${formatPrice(Number(item.priceAtOrder))} = ${formatPrice(Number(item.subtotal))}` +
          (item.notes ? `\n   _Note: ${item.notes}_` : ""),
      )
      .join("\n\n");

    const orderDate = new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(newOrder.createdAt);

    const message =
      `🛒 *New Order #${newOrder.orderNumber}*\n` +
      `📅 ${orderDate}\n\n` +
      `Hello! I'd like to place an order:\n\n` +
      itemsList +
      `\n\n💵 *Total: ${formatPrice(totalPrice)}*\n` +
      (notes ? `\n📝 *Order Note: ${notes}*\n` : "") +
      `\n👤 *Customer: ${userData?.name || session.user.name}*\n` +
      `📧 Email: ${userData?.email || session.user.email}\n\n` +
      "_*Powered by Starva*_";

    const whatsappUrl = `https://wa.me/${whatsappPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`;

    revalidatePath("/");

    return {
      ok: true,
      orderId: newOrder.id,
      whatsappUrl,
    };
  } catch (error) {
    console.error("Order placement error:", error);
    return { ok: false, error: "Failed to place order" };
  }
}
