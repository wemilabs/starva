"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { subscription } from "@/db/schema";
import { PRICING_PLANS } from "@/lib/constants";

export async function getUserSubscription(userId: string) {
  const [currentSubscription] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, userId))
    .orderBy(desc(subscription.createdAt))
    .limit(1);

  if (!currentSubscription) return null;

  const plan = PRICING_PLANS.find(
    (p) => p.name === currentSubscription.planName
  );

  return {
    ...currentSubscription,
    plan,
  };
}

export async function createSubscription(userId: string, planName: string) {
  const plan = PRICING_PLANS.find((p) => p.name === planName);
  if (!plan) {
    throw new Error(`Invalid plan name: ${planName}`);
  }

  const trialEndsAt = plan.price === 0 ? null : new Date();
  if (trialEndsAt) {
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);
  }

  const [newSubscription] = await db
    .insert(subscription)
    .values({
      userId,
      planName,
      status: plan.price === 0 ? "active" : "trial",
      trialEndsAt,
      startDate: new Date(),
      orderLimit: plan.orderLimit,
      maxOrgs: plan.maxOrgs,
      maxProductsPerOrg: plan.maxProductsPerOrg,
    })
    .returning();

  return newSubscription;
}

export async function updateSubscription(userId: string, planName: string) {
  const existingSubscription = await getUserSubscription(userId);
  const plan = PRICING_PLANS.find((p) => p.name === planName);
  if (!plan) {
    throw new Error(`Invalid plan name: ${planName}`);
  }

  if (!existingSubscription) {
    return createSubscription(userId, planName);
  }

  const [updatedSubscription] = await db
    .update(subscription)
    .set({
      planName,
      orderLimit: plan.orderLimit,
      maxOrgs: plan.maxOrgs,
      maxProductsPerOrg: plan.maxProductsPerOrg,
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

  if (
    !userSub ||
    userSub.status === "cancelled" ||
    userSub.status === "expired"
  ) {
    return {
      canCreate: false,
      maxOrgs: 0,
      currentOrgs: totalOrgs,
      planName: null,
    };
  }

  const plan = userSub.plan;
  const maxOrgs =
    plan?.name === "Free"
      ? 2
      : plan?.name === "Growth"
      ? 10
      : plan?.name === "Pro"
      ? -1
      : 0;

  return {
    canCreate: maxOrgs === -1 || totalOrgs < maxOrgs,
    maxOrgs: maxOrgs === -1 ? "Unlimited" : maxOrgs,
    currentOrgs: totalOrgs,
    planName: plan?.name || null,
  };
}

export async function checkProductLimit(organizationId: string) {
  const orgOwner = await db.query.member.findFirst({
    where: (member, { eq }) => eq(member.organizationId, organizationId),
    with: {
      user: true,
    },
  });

  if (!orgOwner) {
    return {
      canCreate: false,
      maxProducts: 0,
      currentProducts: 0,
      planName: null,
    };
  }

  const userSub = await getUserSubscription(orgOwner.userId);

  if (
    !userSub ||
    userSub.status === "cancelled" ||
    userSub.status === "expired"
  ) {
    return {
      canCreate: false,
      maxProducts: 0,
      currentProducts: 0,
      planName: null,
    };
  }

  const plan = userSub.plan;
  const maxProductsPerOrg = plan?.maxProductsPerOrg || 0;

  const currentProducts = await db.query.product.findMany({
    where: (product, { eq }) => eq(product.organizationId, organizationId),
  });

  const totalProducts = currentProducts.length;

  return {
    canCreate: maxProductsPerOrg === null || totalProducts < maxProductsPerOrg,
    maxProducts: maxProductsPerOrg === null ? "Unlimited" : maxProductsPerOrg,
    currentProducts: totalProducts,
    planName: plan?.name || null,
  };
}

export async function checkOrderLimit(organizationId: string) {
  const orgOwner = await db.query.member.findFirst({
    where: (member, { eq }) => eq(member.organizationId, organizationId),
    with: {
      user: true,
    },
  });

  if (!orgOwner) {
    return {
      canCreate: false,
      maxOrders: 0,
      currentOrders: 0,
      planName: null,
    };
  }

  const userSub = await getUserSubscription(orgOwner.userId);

  if (
    !userSub ||
    userSub.status === "cancelled" ||
    userSub.status === "expired"
  ) {
    return {
      canCreate: false,
      maxOrders: 0,
      currentOrders: 0,
      planName: null,
    };
  }

  const plan = userSub.plan;
  const maxOrders = plan?.orderLimit || 0;

  // Get current month's order usage for this organization
  const currentMonth = new Date().toISOString().slice(0, 7);

  const orderUsage = await db.query.orderUsageTracking.findFirst({
    where: (tracking, { eq, and }) =>
      and(
        eq(tracking.organizationId, organizationId),
        eq(tracking.monthYear, currentMonth)
      ),
  });

  const currentOrders = orderUsage?.orderCount || 0;

  return {
    canCreate: maxOrders === null || currentOrders < maxOrders,
    maxOrders: maxOrders === null ? "Unlimited" : maxOrders,
    currentOrders,
    planName: plan?.name || null,
  };
}
