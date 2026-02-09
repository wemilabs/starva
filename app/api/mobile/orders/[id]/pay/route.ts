import { eq } from "drizzle-orm";
import { connection, type NextRequest } from "next/server";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { order, payment } from "@/db/schema";
import { decrypt, encrypt } from "@/lib/encryption";
import {
  errorResponse,
  getMobileSession,
  successResponse,
  unauthorizedResponse,
} from "@/lib/mobile-auth";
import { initiatePayment as paypackInitiate } from "@/lib/paypack";
import { calculateOrderFees, formatRwandanPhone } from "@/lib/utils";

const payOrderSchema = z.object({
  phoneNumber: z.string().min(10),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await connection();

  try {
    const session = await getMobileSession();
    if (!session?.user) return unauthorizedResponse();

    const { id: orderId } = await params;

    const body = await request.json();
    const parsed = payOrderSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Invalid phone number", 400);
    }

    const { phoneNumber } = parsed.data;

    const orderData = await db.query.order.findFirst({
      where: eq(order.id, orderId),
      with: {
        organization: true,
      },
    });

    if (!orderData) {
      return errorResponse("Order not found", 404);
    }

    if (orderData.userId !== session.user.id) {
      return errorResponse("You can only pay for your own orders", 403);
    }

    if (orderData.isPaid) {
      return errorResponse("Order is already paid", 400);
    }

    if (orderData.status === "cancelled") {
      return errorResponse("Cannot pay for a cancelled order", 400);
    }

    const phone = formatRwandanPhone(phoneNumber);
    const baseAmountRWF = Number(decrypt(orderData.totalPrice));
    const fees = calculateOrderFees(baseAmountRWF);

    const result = await paypackInitiate(phone, fees.totalAmount);

    const [newPayment] = await db
      .insert(payment)
      .values({
        userId: session.user.id,
        organizationId: orderData.organizationId,
        phoneNumber: encrypt(phone),
        amount: encrypt(String(fees.totalAmount)),
        baseAmount: encrypt(String(fees.baseAmount)),
        paypackFee: encrypt(String(fees.paypackFee)),
        platformFee: encrypt(String(fees.platformFee)),
        currency: "RWF",
        kind: "CASHIN",
        planName: null,
        billingPeriod: null,
        isRenewal: false,
        paypackRef: result.ref,
        status: "pending",
        orderId,
      })
      .returning();

    return successResponse({
      paymentId: newPayment.id,
      paypackRef: result.ref,
      amount: fees.totalAmount,
      status: "pending",
      message: "Please approve the payment on your phone",
    });
  } catch (error) {
    console.error("Failed to initiate payment:", error);
    return errorResponse("Failed to initiate payment", 500);
  }
}
