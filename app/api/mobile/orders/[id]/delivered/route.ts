import { eq } from "drizzle-orm";
import { connection, type NextRequest } from "next/server";

import { db } from "@/db/drizzle";
import { order } from "@/db/schema";
import {
  errorResponse,
  getMobileSession,
  successResponse,
  unauthorizedResponse,
} from "@/lib/mobile-auth";
import { realtime } from "@/lib/realtime";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await connection();

  try {
    const session = await getMobileSession();
    if (!session?.user) return unauthorizedResponse();

    const { id: orderId } = await params;

    const existingOrder = await db.query.order.findFirst({
      where: eq(order.id, orderId),
      with: {
        organization: true,
        user: true,
      },
    });

    if (!existingOrder) {
      return errorResponse("Order not found", 404);
    }

    if (existingOrder.userId !== session.user.id) {
      return errorResponse("Only the customer can mark this as delivered", 403);
    }

    if (existingOrder.status === "delivered") {
      return errorResponse("Order is already delivered", 400);
    }

    if (existingOrder.status === "cancelled") {
      return errorResponse("Cannot mark a cancelled order as delivered", 400);
    }

    const now = new Date();

    await db
      .update(order)
      .set({
        status: "delivered",
        updatedAt: now,
      })
      .where(eq(order.id, orderId));

    await realtime
      .channel(`org:${existingOrder.organizationId}`)
      .emit("orders.delivered", {
        orderId: existingOrder.id,
        orderNumber: existingOrder.orderNumber,
        storeName: existingOrder.organization.name,
        customerName: existingOrder.user.name,
        deliveredAt: now.toISOString(),
      });

    return successResponse({ message: "Order marked as delivered" });
  } catch (error) {
    console.error("Failed to mark order as delivered:", error);
    return errorResponse("Failed to mark order as delivered", 500);
  }
}
