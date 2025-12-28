import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { payment, subscription } from "@/db/schema";
import { PRICING_PLANS } from "@/lib/constants";
import { createNotification } from "@/server/push-notifications";

// Verify webhook signature if secret is configured
function verifyWebhookSignature(
  _payload: string, // Will be used for HMAC verification if Paypack supports it
  signature: string | null
): boolean {
  const secret = process.env.PAYPACK_WEBHOOK_SECRET_KEY;

  // If no secret configured, skip verification (for testing)
  if (!secret) {
    console.warn(
      "[Paypack Webhook] No PAYPACK_WEBHOOK_SECRET_KEY configured - skipping verification"
    );
    return true;
  }

  if (!signature) {
    console.error("[Paypack Webhook] Missing signature header");
    return false;
  }

  // Simple secret comparison (check Paypack docs for proper HMAC method if available)
  return signature === secret;
}

type PaypackWebhookEvent = {
  event_id: string;
  event_kind: "transaction:processed" | "transaction:created";
  created_at: string;
  data: {
    ref: string;
    kind: "CASHIN" | "CASHOUT";
    fee: number;
    merchant: string;
    client: string;
    amount: number;
    status: "pending" | "successful" | "failed";
    created_at: string;
    processed_at?: string;
  };
};

export async function POST(request: Request) {
  console.log("[Paypack Webhook] Received request");

  try {
    const body = await request.text();
    const signature = request.headers.get("x-paypack-signature");

    // Verify signature if secret is configured
    if (!verifyWebhookSignature(body, signature)) {
      console.error("[Paypack Webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event: PaypackWebhookEvent = JSON.parse(body);
    console.log("[Paypack Webhook] Event:", event.event_kind, event.data.ref);

    // Only process CASHIN transactions
    if (event.data.kind !== "CASHIN") {
      console.log("[Paypack Webhook] Skipping non-CASHIN event");
      return NextResponse.json({ received: true, skipped: true });
    }

    const { ref, status } = event.data;

    // Find payment by Paypack ref
    const existingPayment = await db.query.payment.findFirst({
      where: (p, { eq }) => eq(p.paypackRef, ref),
    });

    if (!existingPayment) {
      console.log("Payment not found for ref:", ref);
      return NextResponse.json({ received: true, notFound: true });
    }

    // Already processed
    if (existingPayment.status !== "pending") {
      return NextResponse.json({ received: true, alreadyProcessed: true });
    }

    if (status === "successful") {
      await processSuccessfulPayment(existingPayment);
    } else if (status === "failed") {
      await processFailedPayment(existingPayment);
    }

    return NextResponse.json({ received: true, processed: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function processSuccessfulPayment(
  paymentRecord: typeof payment.$inferSelect
) {
  if (!paymentRecord.planName) return;

  const plan = PRICING_PLANS.find((p) => p.name === paymentRecord.planName);
  if (!plan) return;

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  // Update payment status
  await db
    .update(payment)
    .set({
      status: "successful",
      processedAt: now,
    })
    .where(eq(payment.id, paymentRecord.id));

  // Update or create subscription
  const existingSub = await db.query.subscription.findFirst({
    where: (s, { eq }) => eq(s.userId, paymentRecord.userId),
  });

  if (existingSub) {
    await db
      .update(subscription)
      .set({
        planName: paymentRecord.planName,
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        lastPaymentId: paymentRecord.id,
        orderLimit: plan.orderLimit,
        maxOrgs: plan.maxOrgs,
        maxProductsPerOrg: plan.maxProductsPerOrg,
        trialEndsAt: null,
        renewalReminderSentAt: null,
        finalReminderSentAt: null,
        updatedAt: now,
      })
      .where(eq(subscription.userId, paymentRecord.userId));
  } else {
    await db.insert(subscription).values({
      userId: paymentRecord.userId,
      planName: paymentRecord.planName,
      status: "active",
      startDate: now,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      lastPaymentId: paymentRecord.id,
      orderLimit: plan.orderLimit,
      maxOrgs: plan.maxOrgs,
      maxProductsPerOrg: plan.maxProductsPerOrg,
      phoneNumber: paymentRecord.phoneNumber,
    });
  }

  // Send notification
  await createNotification({
    userId: paymentRecord.userId,
    type: "payment_successful",
    title: "Payment Successful! 🎉",
    message: `Your ${
      paymentRecord.planName
    } subscription is now active until ${periodEnd.toLocaleDateString()}.`,
    actionUrl: "/usage/billing",
    sendPush: true,
  });
}

async function processFailedPayment(
  paymentRecord: typeof payment.$inferSelect
) {
  await db
    .update(payment)
    .set({ status: "failed" })
    .where(eq(payment.id, paymentRecord.id));

  // Notify user of failure
  await createNotification({
    userId: paymentRecord.userId,
    type: "payment_failed",
    title: "Payment Failed",
    message: `Your payment for ${paymentRecord.planName} plan failed. Please try again.`,
    actionUrl: "/usage/billing",
    sendPush: true,
  });
}
