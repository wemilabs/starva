import { and, eq, gt, isNull, lte, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { subscription } from "@/db/schema";
import { PRICING_PLANS } from "@/lib/constants";
import {
  createNotification,
  sendPushToUser,
} from "@/server/push-notifications";
import { applyScheduledDowngrades } from "@/server/subscription";

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const in7Days = new Date(now);
  in7Days.setDate(in7Days.getDate() + 7);
  const in3Days = new Date(now);
  in3Days.setDate(in3Days.getDate() + 3);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    // Get subscriptions expiring in 7 days (first reminder)
    const expiring7Days = await db
      .select()
      .from(subscription)
      .where(
        and(
          eq(subscription.status, "active"),
          lte(subscription.currentPeriodEnd, in7Days),
          gt(subscription.currentPeriodEnd, in3Days),
          isNull(subscription.renewalReminderSentAt)
        )
      );

    // Get subscriptions expiring in 3 days (urgent reminder)
    const expiring3Days = await db
      .select()
      .from(subscription)
      .where(
        and(
          eq(subscription.status, "active"),
          lte(subscription.currentPeriodEnd, in3Days),
          gt(subscription.currentPeriodEnd, tomorrow),
          isNull(subscription.finalReminderSentAt)
        )
      );

    // Get subscriptions expiring tomorrow (final reminder)
    const expiringTomorrow = await db
      .select()
      .from(subscription)
      .where(
        and(
          eq(subscription.status, "active"),
          lte(subscription.currentPeriodEnd, tomorrow),
          gt(subscription.currentPeriodEnd, now)
        )
      );

    // Get expired subscriptions to downgrade (not Hobby)
    const expired = await db
      .select()
      .from(subscription)
      .where(
        and(
          eq(subscription.status, "active"),
          lte(subscription.currentPeriodEnd, now),
          or(
            eq(subscription.planName, "Growth"),
            eq(subscription.planName, "Pro"),
            eq(subscription.planName, "Pro+")
          )
        )
      );

    // Process 7-day reminders
    for (const sub of expiring7Days) {
      await sendRenewalReminder(sub, "7d");
    }

    // Process 3-day reminders
    for (const sub of expiring3Days) {
      await sendRenewalReminder(sub, "3d");
    }

    // Process 1-day reminders
    for (const sub of expiringTomorrow) {
      await sendRenewalReminder(sub, "1d");
    }

    // Apply scheduled downgrades (user-initiated plan changes)
    const scheduledDowngradesApplied = await applyScheduledDowngrades();

    // Process expired - downgrade to Hobby
    for (const sub of expired) {
      await downgradeToHobby(sub);
    }

    return NextResponse.json({
      success: true,
      processed: {
        reminders7d: expiring7Days.length,
        reminders3d: expiring3Days.length,
        reminders1d: expiringTomorrow.length,
        scheduledDowngrades: scheduledDowngradesApplied,
        downgraded: expired.length,
      },
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Failed to process renewals" },
      { status: 500 }
    );
  }
}

async function sendRenewalReminder(
  sub: typeof subscription.$inferSelect,
  timing: "7d" | "3d" | "1d"
) {
  const messages = {
    "7d": {
      title: "📅 Subscription Expiring Soon",
      body: `Your ${sub.planName} plan expires in 7 days. Renew to keep your premium features.`,
      url: "/usage/billing",
    },
    "3d": {
      title: "⚠️ 3 Days Left!",
      body: `Your ${sub.planName} plan expires in 3 days. Don't lose access to your features!`,
      url: "/usage/billing",
    },
    "1d": {
      title: "🚨 Last Day to Renew!",
      body: `Your ${sub.planName} expires TOMORROW. Renew now to avoid downgrade.`,
      url: "/usage/billing",
    },
  };

  const msg = messages[timing];

  // Send Web Push Notification
  await sendPushToUser(sub.userId, {
    title: msg.title,
    body: msg.body,
    url: msg.url,
    tag: `renewal-${timing}`,
    requireInteraction: timing === "1d",
    actions:
      timing !== "7d" ? [{ action: "renew", title: "Renew Now" }] : undefined,
  });

  // Create in-app notification
  await createNotification({
    userId: sub.userId,
    type: `renewal_reminder_${timing}` as
      | "renewal_reminder_7d"
      | "renewal_reminder_3d"
      | "renewal_reminder_1d",
    title: msg.title,
    message: msg.body,
    actionUrl: msg.url,
    sendPush: false, // Already sent above
  });

  // Update reminder tracking
  const updateField =
    timing === "7d"
      ? { renewalReminderSentAt: new Date() }
      : { finalReminderSentAt: new Date() };

  await db
    .update(subscription)
    .set(updateField)
    .where(eq(subscription.id, sub.id));
}

async function downgradeToHobby(sub: typeof subscription.$inferSelect) {
  const hobbyPlan = PRICING_PLANS.find((p) => p.name === "Hobby");
  if (!hobbyPlan) return;

  await db
    .update(subscription)
    .set({
      planName: "Hobby",
      status: "expired",
      orderLimit: hobbyPlan.orderLimit,
      maxOrgs: hobbyPlan.maxOrgs,
      maxProductsPerOrg: hobbyPlan.maxProductsPerOrg,
      updatedAt: new Date(),
    })
    .where(eq(subscription.id, sub.id));

  // Send notification
  await sendPushToUser(sub.userId, {
    title: "Subscription Expired",
    body: `Your ${sub.planName} plan has expired. You've been moved to the free Hobby plan.`,
    url: "/usage/billing",
    tag: "subscription-expired",
    requireInteraction: true,
    actions: [{ action: "renew", title: "Upgrade Now" }],
  });

  await createNotification({
    userId: sub.userId,
    type: "subscription_expired",
    title: "Subscription Expired",
    message: `Your ${sub.planName} plan has expired. You've been moved to the free Hobby plan. Upgrade anytime to restore your premium features.`,
    actionUrl: "/usage/billing",
    sendPush: false,
  });
}
