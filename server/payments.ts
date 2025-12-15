"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/data/user-session";
import { db } from "@/db/drizzle";
import { payment, subscription } from "@/db/schema";
import { PRICING_PLANS } from "@/lib/constants";
import {
  getTransactionEvents,
  initiatePayment as paypackInitiate,
} from "@/lib/paypack";
import { convertUsdToRwf, formatRwandanPhone } from "@/lib/utils";
import { createNotification } from "./push-notifications";

export async function initiateSubscriptionPayment(data: {
  planName: string;
  phoneNumber: string;
  isRenewal: boolean;
}) {
  const verified = await verifySession();
  if (!verified.success) return { ok: false, error: "Unauthorized" };

  const { session } = verified;

  const plan = PRICING_PLANS.find((p) => p.name === data.planName);
  if (!plan || plan.price === null || plan.price === 0)
    return { error: "Invalid plan" };

  try {
    const phone = formatRwandanPhone(data.phoneNumber);
    const amountRWF = convertUsdToRwf(plan.price);

    const result = await paypackInitiate(phone, amountRWF);

    // Create payment record
    const [newPayment] = await db
      .insert(payment)
      .values({
        userId: session.user.id,
        phoneNumber: phone,
        amount: String(amountRWF),
        currency: "RWF",
        planName: data.planName,
        isRenewal: data.isRenewal,
        paypackRef: result.ref,
        status: "pending",
      })
      .returning();

    // Store phone number on subscription for future reminders
    const existingSub = await db.query.subscription.findFirst({
      where: (s, { eq }) => eq(s.userId, session.user.id),
    });

    if (existingSub) {
      await db
        .update(subscription)
        .set({ phoneNumber: phone })
        .where(eq(subscription.userId, session.user.id));
    }

    return {
      paymentId: newPayment.id,
      paypackRef: result.ref,
      status: "pending",
      message: "Please approve the payment on your phone",
    };
  } catch (error) {
    console.error("Payment initiation failed:", error);
    return { error: "Failed to initiate payment. Please try again." };
  }
}

export async function checkPaymentStatus(paypackRef: string) {
  const verified = await verifySession();
  if (!verified.success) return { ok: false, error: "Unauthorized" };

  // Get payment from our DB
  const existingPayment = await db.query.payment.findFirst({
    where: (p, { eq }) => eq(p.paypackRef, paypackRef),
  });

  if (!existingPayment) return { error: "Payment not found", status: "error" };

  // If already processed, return current status
  if (existingPayment.status !== "pending")
    return { status: existingPayment.status };

  // Check with Paypack
  try {
    const events = await getTransactionEvents(paypackRef);
    const latestEvent = events[0];

    if (!latestEvent) return { status: "pending" };

    const transactionStatus = latestEvent.data?.status;

    if (transactionStatus === "successful") {
      await processSuccessfulPayment(existingPayment);
      return { status: "successful" };
    }

    if (transactionStatus === "failed") {
      await db
        .update(payment)
        .set({ status: "failed" })
        .where(eq(payment.id, existingPayment.id));
      return { status: "failed" };
    }

    return { status: "pending" };
  } catch (error) {
    console.error("Status check failed:", error);
    return { status: "pending" };
  }
}

async function processSuccessfulPayment(
  paymentRecord: typeof payment.$inferSelect
) {
  const verified = await verifySession();
  if (!verified.success) return { ok: false, error: "Unauthorized" };

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

  // Create notification
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

  revalidatePath("/usage/billing");
  revalidatePath("/usage/pricing");
}

export async function getUserPayments(limit = 10) {
  const verified = await verifySession();
  if (!verified.success) return [];

  const { session } = verified;

  const payments = await db.query.payment.findMany({
    where: (p, { eq }) => eq(p.userId, session.user.id),
    orderBy: (p, { desc }) => [desc(p.createdAt)],
    limit,
  });

  return payments;
}

export async function getPaymentByRef(paypackRef: string) {
  return db.query.payment.findFirst({
    where: (p, { eq }) => eq(p.paypackRef, paypackRef),
  });
}
