"use server";

import { and, desc, eq } from "drizzle-orm";
import { verifySession } from "@/data/user-session";
import { db } from "@/db/drizzle";
import { member, orderNotification } from "@/db/schema";

export async function getOrderNotifications(
  organizationId: string,
  limit = 50,
) {
  const sessionResult = await verifySession();
  if (!sessionResult.success || !sessionResult.session?.user)
    return { ok: false, error: "Unauthorized", notifications: [] };

  const membership = await db.query.member.findFirst({
    where: and(
      eq(member.organizationId, organizationId),
      eq(member.userId, sessionResult.session.user.id),
    ),
  });

  if (!membership)
    return {
      ok: false,
      error: "Only organization members can view notifications",
      notifications: [],
    };

  const notifications = await db.query.orderNotification.findMany({
    where: eq(orderNotification.organizationId, organizationId),
    orderBy: [desc(orderNotification.createdAt)],
    limit,
  });

  return { ok: true, notifications };
}

export async function getUnreadOrderNotificationCount(organizationId: string) {
  const sessionResult = await verifySession();
  if (!sessionResult.success || !sessionResult.session?.user)
    return { ok: false, error: "Unauthorized", count: 0 };

  const membership = await db.query.member.findFirst({
    where: and(
      eq(member.organizationId, organizationId),
      eq(member.userId, sessionResult.session.user.id),
    ),
  });

  if (!membership)
    return {
      ok: false,
      error: "Only organization members can view notification count",
      count: 0,
    };

  const result = await db
    .select({ count: orderNotification.id })
    .from(orderNotification)
    .where(
      and(
        eq(orderNotification.organizationId, organizationId),
        eq(orderNotification.read, false),
      ),
    );

  return { ok: true, count: result.length };
}

export async function markOrderNotificationAsRead(notificationId: string) {
  const sessionResult = await verifySession();
  if (!sessionResult.success || !sessionResult.session?.user)
    return { ok: false, error: "Unauthorized" };

  const notification = await db.query.orderNotification.findFirst({
    where: eq(orderNotification.id, notificationId),
  });

  if (!notification) return { ok: false, error: "Notification not found" };

  const membership = await db.query.member.findFirst({
    where: and(
      eq(member.organizationId, notification.organizationId),
      eq(member.userId, sessionResult.session.user.id),
    ),
  });

  if (!membership)
    return {
      ok: false,
      error: "Only organization members can mark notifications as read",
    };

  await db
    .update(orderNotification)
    .set({ read: true })
    .where(eq(orderNotification.id, notificationId));

  return { ok: true };
}

export async function markAllOrderNotificationsAsRead(organizationId: string) {
  const sessionResult = await verifySession();
  if (!sessionResult.success || !sessionResult.session?.user)
    return { ok: false, error: "Unauthorized" };

  const membership = await db.query.member.findFirst({
    where: and(
      eq(member.organizationId, organizationId),
      eq(member.userId, sessionResult.session.user.id),
    ),
  });

  if (!membership)
    return {
      ok: false,
      error: "Only organization members can mark notifications as read",
    };

  await db
    .update(orderNotification)
    .set({ read: true })
    .where(
      and(
        eq(orderNotification.organizationId, organizationId),
        eq(orderNotification.read, false),
      ),
    );

  return { ok: true };
}

export async function createOrderNotification(data: {
  organizationId: string;
  orderId: string;
  orderNumber: number;
  type: "new" | "status_update";
  customerName?: string;
  customerEmail?: string;
  total?: string;
  itemCount?: number;
}) {
  const [notification] = await db
    .insert(orderNotification)
    .values(data)
    .returning({ id: orderNotification.id });

  return { success: true, notificationId: notification.id };
}
