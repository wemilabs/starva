"use server";

import { and, desc, eq } from "drizzle-orm";
import { verifySession } from "@/data/user-session";
import { db } from "@/db/drizzle";
import { orderNotification } from "@/db/schema";

export async function getOrderNotifications(
  organizationId: string,
  limit = 50
) {
  const sessionResult = await verifySession();
  if (!sessionResult.success || !sessionResult.session?.user)
    throw new Error("Unauthorized");

  const notifications = await db.query.orderNotification.findMany({
    where: eq(orderNotification.organizationId, organizationId),
    orderBy: [desc(orderNotification.createdAt)],
    limit,
  });

  return notifications;
}

export async function getUnreadOrderNotificationCount(organizationId: string) {
  const sessionResult = await verifySession();
  if (!sessionResult.success || !sessionResult.session?.user)
    throw new Error("Unauthorized");

  const result = await db
    .select({ count: orderNotification.id })
    .from(orderNotification)
    .where(
      and(
        eq(orderNotification.organizationId, organizationId),
        eq(orderNotification.read, false)
      )
    );

  return result.length;
}

export async function markOrderNotificationAsRead(notificationId: string) {
  const sessionResult = await verifySession();
  if (!sessionResult.success || !sessionResult.session?.user)
    throw new Error("Unauthorized");

  await db
    .update(orderNotification)
    .set({ read: true })
    .where(eq(orderNotification.id, notificationId));

  return { success: true };
}

export async function markAllOrderNotificationsAsRead(organizationId: string) {
  const sessionResult = await verifySession();
  if (!sessionResult.success || !sessionResult.session?.user)
    throw new Error("Unauthorized");

  await db
    .update(orderNotification)
    .set({ read: true })
    .where(
      and(
        eq(orderNotification.organizationId, organizationId),
        eq(orderNotification.read, false)
      )
    );

  return { success: true };
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
  await db.insert(orderNotification).values(data);

  return { success: true };
}
