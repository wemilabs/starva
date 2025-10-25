"use server";

import { db } from "@/db/drizzle";
import { subscription } from "@/db/schema";
import { PRICING_PLANS } from "@/lib/constants";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getUserSubscription(userId: string) {
  const [currentSubscription] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, userId))
    .orderBy(desc(subscription.createdAt))
    .limit(1);

  if (!currentSubscription) return null;

  const plan = PRICING_PLANS.find((p) => p.name === currentSubscription.planName);

  return {
    ...currentSubscription,
    plan,
  };
}

export async function createSubscription(userId: string, planName: string) {
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  const [newSubscription] = await db
    .insert(subscription)
    .values({
      userId,
      planName,
      status: "trial",
      trialEndsAt,
      startDate: new Date(),
    })
    .returning();

  revalidatePath("/pricing");

  return newSubscription;
}

export async function updateSubscription(userId: string, planName: string) {
  const existingSubscription = await getUserSubscription(userId);

  if (!existingSubscription) {
    return createSubscription(userId, planName);
  }

  const [updatedSubscription] = await db
    .update(subscription)
    .set({
      planName,
      updatedAt: new Date(),
    })
    .where(eq(subscription.userId, userId))
    .returning();

  revalidatePath("/pricing");

  return updatedSubscription;
}

export async function cancelSubscription(userId: string) {
  const [cancelledSubscription] = await db
    .update(subscription)
    .set({
      status: "cancelled",
      cancelledAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(subscription.userId, userId))
    .returning();

  revalidatePath("/pricing");

  return cancelledSubscription;
}

export async function activateSubscription(userId: string) {
  const [activatedSubscription] = await db
    .update(subscription)
    .set({
      status: "active",
      trialEndsAt: null,
      updatedAt: new Date(),
    })
    .where(eq(subscription.userId, userId))
    .returning();

  revalidatePath("/pricing");

  return activatedSubscription;
}

export async function checkOrganizationLimit(userId: string) {
  const userSub = await getUserSubscription(userId);

  const userOrgs = await db.query.member.findMany({
    where: (member, { eq }) => eq(member.userId, userId),
  });

  const totalOrgs = userOrgs.length;

  if (!userSub || userSub.status === "cancelled" || userSub.status === "expired") {
    return {
      canCreate: false,
      maxOrgs: 0,
      currentOrgs: totalOrgs,
      planName: null,
    };
  }

  const plan = userSub.plan;
  const maxOrgs =
    plan?.name === "Starter"
      ? 1
      : plan?.name === "Growth"
        ? 3
        : plan?.name === "Pro"
          ? 10
          : -1;

  return {
    canCreate: maxOrgs === -1 || totalOrgs < maxOrgs,
    maxOrgs: maxOrgs === -1 ? "Unlimited" : maxOrgs,
    currentOrgs: totalOrgs,
    planName: plan?.name || null,
  };
}
