import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { db } from "@/db/drizzle";
import { order, payment } from "@/db/schema";
import { decrypt } from "@/lib/encryption";
import {
  errorResponse,
  getMobileSession,
  successResponse,
  unauthorizedResponse,
} from "@/lib/mobile-auth";
import { getTransactionEvents } from "@/lib/paypack";
import { realtime } from "@/lib/realtime";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getMobileSession();
    if (!session?.user) return unauthorizedResponse();

    const { id: orderId } = await params;
    const { searchParams } = new URL(request.url);
    const paypackRef = searchParams.get("ref");

    if (!paypackRef) {
      return errorResponse("Payment reference is required", 400);
    }

    const existingPayment = await db.query.payment.findFirst({
      where: eq(payment.paypackRef, paypackRef),
    });

    if (!existingPayment) {
      return errorResponse("Payment not found", 404);
    }

    if (existingPayment.orderId !== orderId) {
      return errorResponse("Payment does not match order", 400);
    }

    if (existingPayment.userId !== session.user.id) {
      return errorResponse("Unauthorized", 403);
    }

    if (existingPayment.status !== "pending") {
      return successResponse({ status: existingPayment.status });
    }

    const events = await getTransactionEvents(paypackRef);
    const latestEvent = events[0];

    if (!latestEvent) {
      return successResponse({ status: "pending" });
    }

    const transactionStatus = latestEvent.data?.status;

    if (transactionStatus === "successful") {
      const now = new Date();

      await db
        .update(payment)
        .set({
          status: "successful",
          processedAt: now,
        })
        .where(eq(payment.id, existingPayment.id));

      const paidOrder = await db.query.order.findFirst({
        where: eq(order.id, orderId),
        with: {
          user: true,
        },
      });

      if (paidOrder) {
        await db
          .update(order)
          .set({
            isPaid: true,
            paidAt: now,
            updatedAt: now,
          })
          .where(eq(order.id, orderId));

        await realtime
          .channel(`org:${paidOrder.organizationId}`)
          .emit("orders.paid", {
            orderId: paidOrder.id,
            orderNumber: paidOrder.orderNumber,
            customerName: paidOrder.user.name,
            total: decrypt(paidOrder.totalPrice),
            organizationId: paidOrder.organizationId,
            paidAt: now.toISOString(),
          });
      }

      return successResponse({ status: "successful" });
    }

    if (transactionStatus === "failed") {
      await db
        .update(payment)
        .set({ status: "failed" })
        .where(eq(payment.id, existingPayment.id));

      return successResponse({ status: "failed" });
    }

    return successResponse({ status: "pending" });
  } catch (error) {
    console.error("Failed to check payment status:", error);
    return successResponse({ status: "pending" });
  }
}
