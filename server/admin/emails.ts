"use server";

import { and, count, desc, eq, gte, ilike, or } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { db } from "@/db/drizzle";
import { emailAttachment, receivedEmail } from "@/db/schema";
import { logAdminAction } from "@/lib/admin/admin-audit";
import { requireAdmin } from "@/lib/admin/admin-auth";
import { requireAdminRateLimit } from "@/lib/admin/admin-rate-limit";
import { decrypt } from "@/lib/encryption";

const utapi = new UTApi();

export async function getReceivedEmails(
  options: {
    limit?: number;
    offset?: number;
    search?: string;
    status?: "received" | "processed" | "failed";
  } = {},
) {
  await requireAdmin();

  const { limit = 50, offset = 0, search, status } = options;

  const whereConditions = [];

  if (status === "received") {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    whereConditions.push(gte(receivedEmail.createdAt, today));
  } else if (status) whereConditions.push(eq(receivedEmail.status, status));

  if (search) {
    const searchConditions = or(
      ilike(receivedEmail.from, `%${search}%`),
      ilike(receivedEmail.subject, `%${search}%`),
      ilike(receivedEmail.textBody, `%${search}%`),
    );
    if (searchConditions) whereConditions.push(searchConditions);
  }

  const emails = await db.query.receivedEmail.findMany({
    where: and(...whereConditions),
    with: {
      attachments: true,
    },
    orderBy: [desc(receivedEmail.createdAt)],
    limit,
    offset,
  });

  return emails;
}

export async function getReceivedEmailById(emailId: string) {
  await requireAdmin();

  const email = await db.query.receivedEmail.findFirst({
    where: eq(receivedEmail.emailId, emailId),
    with: {
      attachments: true,
    },
  });

  if (!email) throw new Error("Email not found");

  return email;
}

export async function getEmailAttachmentUrl(id: string) {
  await requireAdmin();

  const attachment = await db.query.emailAttachment.findFirst({
    where: eq(emailAttachment.id, id),
  });

  if (!attachment) throw new Error("Attachment not found");

  const decryptedFileKey = decrypt(attachment.fileKey || "");
  if (decryptedFileKey)
    return `https://${process.env.UPLOADTHING_APP_ID}.ufs.sh/f/${decryptedFileKey}`;

  if (attachment.expiresAt && attachment.expiresAt > new Date())
    return decrypt(attachment.downloadUrl || "");

  throw new Error("Attachment URL has expired");
}

export async function deleteReceivedEmail(emailId: string) {
  const session = await requireAdmin();
  await requireAdminRateLimit(session.user.id, "delete_email", true);

  const email = await db.query.receivedEmail.findFirst({
    where: eq(receivedEmail.emailId, emailId),
  });
  if (!email) throw new Error("Email not found");

  const attachments = await db.query.emailAttachment.findMany({
    where: eq(emailAttachment.emailId, emailId),
    columns: {
      fileKey: true,
    },
  });

  for (const attachment of attachments) {
    const decryptedKey = decrypt(attachment.fileKey || "");
    if (decryptedKey)
      try {
        await utapi.deleteFiles(decryptedKey);
      } catch (error) {
        console.error(
          `Failed to delete attachment ${attachment.fileKey}:`,
          error,
        );
      }
  }

  await db.delete(receivedEmail).where(eq(receivedEmail.emailId, emailId));

  await logAdminAction({
    adminId: session.user.id,
    action: "DELETE_EMAIL",
    targetId: emailId,
    targetType: "email",
    metadata: { subject: email.subject, from: email.from },
  });

  return { success: true };
}

export async function getEmailStats() {
  await requireAdmin();

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Get counts for each status
  const [total, receivedToday, processed, failed] = await Promise.all([
    db.select({ count: count() }).from(receivedEmail),
    db
      .select({ count: count() })
      .from(receivedEmail)
      .where(gte(receivedEmail.createdAt, today)),
    db
      .select({ count: count() })
      .from(receivedEmail)
      .where(eq(receivedEmail.status, "processed")),
    db
      .select({ count: count() })
      .from(receivedEmail)
      .where(eq(receivedEmail.status, "failed")),
  ]);

  return {
    total: total[0]?.count || 0,
    received: receivedToday[0]?.count || 0,
    processed: processed[0]?.count || 0,
    failed: failed[0]?.count || 0,
  };
}
