"use server";

import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { type AdminActionType, adminAuditLog } from "@/db/schema";

type AuditLogParams = {
  adminId: string;
  action: AdminActionType;
  targetId?: string;
  targetType?: "user" | "email" | "feedback" | "order" | "product";
  metadata?: Record<string, unknown>;
};

export async function logAdminAction({
  adminId,
  action,
  targetId,
  targetType,
  metadata,
}: AuditLogParams) {
  const headersList = await headers();
  const ipAddress =
    headersList.get("x-forwarded-for")?.split(",")[0] ||
    headersList.get("x-real-ip") ||
    "unknown";
  const userAgent = headersList.get("user-agent") || "unknown";

  await db.insert(adminAuditLog).values({
    adminId,
    action,
    targetId,
    targetType,
    metadata: metadata ? JSON.stringify(metadata) : null,
    ipAddress,
    userAgent,
  });
}
