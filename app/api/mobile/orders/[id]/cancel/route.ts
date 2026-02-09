import { eq } from "drizzle-orm";
import { connection, type NextRequest } from "next/server";

import { db } from "@/db/drizzle";
import { order, orderItem } from "@/db/schema";
import {
  errorResponse,
  getMobileSession,
  successResponse,
  unauthorizedResponse,
} from "@/lib/mobile-auth";
import { realtime } from "@/lib/realtime";
import { updateStock } from "@/server/inventory";

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
        user: true,
        organization: true,
      },
    });

    if (!existingOrder) {
      return errorResponse("Order not found", 404);
    }

    if (existingOrder.userId !== session.user.id) {
      return errorResponse("You can only cancel your own orders", 403);
    }

    if (existingOrder.status === "delivered") {
      return errorResponse("Cannot cancel a delivered order", 400);
    }

    if (existingOrder.status === "cancelled") {
      return errorResponse("Order is already cancelled", 400);
    }

    const orderItems = await db.query.orderItem.findMany({
      where: eq(orderItem.orderId, orderId),
      with: {
        product: {
          columns: {
            id: true,
            inventoryEnabled: true,
          },
        },
      },
    });

    if (existingOrder.status === "confirmed") {
      for (const item of orderItems) {
        if (item.product.inventoryEnabled) {
          await updateStock({
            productId: item.productId,
            organizationId: existingOrder.organizationId,
            quantityChange: item.quantity,
            changeType: "return",
            reason: `Order ${orderId} cancelled by customer`,
            revalidateTargetPath: "/point-of-sales/inventory",
          });
        }
      }
    }

    const now = new Date();

    await db
      .update(order)
      .set({
        status: "cancelled",
        updatedAt: now,
      })
      .where(eq(order.id, orderId));

    await realtime
      .channel(`org:${existingOrder.organizationId}`)
      .emit("orders.cancelled", {
        orderId: existingOrder.id,
        orderNumber: existingOrder.orderNumber,
        cancelledBy: "customer",
        storeName: existingOrder.organization.name,
        customerName: existingOrder.user.name,
        organizationId: existingOrder.organizationId,
        userId: existingOrder.userId,
        cancelledAt: now.toISOString(),
      });

    return successResponse({ message: "Order cancelled successfully" });
  } catch (error) {
    console.error("Failed to cancel order:", error);
    return errorResponse("Failed to cancel order", 500);
  }
}
