import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { Webhook } from "svix";
import { UTApi } from "uploadthing/server";
import { db } from "@/db/drizzle";
import { emailAttachment, receivedEmail } from "@/db/schema";
import { encrypt } from "@/lib/encryption";

interface ResendWebhookEvent {
  type: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject?: string;
    message_id?: string;
  };
}

const resend = new Resend(process.env.RESEND_API_KEY);
const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
const utapi = new UTApi();

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    console.error("RESEND_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  try {
    const body = await request.text();
    const headersList = await headers();

    // Get the svix-id header
    const svixId = headersList.get("svix-id");
    const svixTimestamp = headersList.get("svix-timestamp");
    const svixSignature = headersList.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature)
      return NextResponse.json(
        { error: "Missing required svix headers" },
        { status: 400 },
      );

    // Verify webhook signature
    const wh = new Webhook(webhookSecret);
    let event: unknown;

    try {
      event = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      });
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 },
      );
    }

    // Handle email.received event
    if (
      event &&
      typeof event === "object" &&
      "type" in event &&
      event.type === "email.received"
    ) {
      const webhookEvent = event as ResendWebhookEvent;
      await handleEmailReceived(webhookEvent.data);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

async function handleEmailReceived(data: {
  email_id: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject?: string;
  message_id?: string;
}) {
  const { email_id, from, to, cc, bcc, subject, message_id } = data;

  try {
    const { data: email } = await resend.emails.receiving.get(email_id);

    // Store email in database
    await db.insert(receivedEmail).values({
      emailId: email_id,
      from,
      to,
      cc: cc || [],
      bcc: bcc || [],
      subject,
      htmlBody: email?.html,
      textBody: email?.text,
      messageId: message_id,
      status: "received" as const,
    });

    if (email?.attachments && email.attachments.length > 0) {
      try {
        const { data: attachments, error } =
          await resend.emails.receiving.attachments.list({ emailId: email_id });

        if (error)
          throw new Error(`Failed to fetch attachments: ${error.message}`);

        for (const attachment of attachments.data || []) {
          try {
            const response = await fetch(attachment.download_url || "");
            if (!response.ok) {
              console.error(`Failed to download ${attachment.filename}`);
              continue;
            }

            // Get the file's contents
            const buffer = Buffer.from(await response.arrayBuffer());

            // Sanitize sender email for use in file path
            const sanitizedEmail = from
              .replace(/@/g, "_at_")
              .replace(/[^a-zA-Z0-9_.-]/g, "_");
            const timestamp = Date.now();
            const randomSuffix = Math.random().toString(36).substring(2, 8);
            const originalFilename = attachment.filename || "attachment";
            const organizedFilename = `emails/${sanitizedEmail}/${email_id}/${timestamp}_${randomSuffix}_${originalFilename}`;

            // Create a File object for UploadThing with organized name
            const file = new File([buffer], organizedFilename, {
              type: attachment.content_type,
            });

            // Upload to UploadThing for permanent storage
            const uploadResponse = await utapi.uploadFiles([file]);

            if (!uploadResponse[0]?.data)
              throw new Error("Failed to upload attachment to UploadThing");

            // Store attachment metadata in database
            await db.insert(emailAttachment).values({
              emailId: email_id,
              attachmentId: attachment.id,
              filename: attachment.filename || "attachment",
              contentType:
                attachment.content_type || "application/octet-stream",
              size: buffer.byteLength,
              contentDisposition: attachment.content_disposition,
              contentId: attachment.content_id,
              downloadUrl: encrypt(attachment.download_url || ""),
              expiresAt: attachment.expires_at
                ? new Date(attachment.expires_at)
                : null,
              fileKey: encrypt(uploadResponse[0]?.data?.key || ""),
              uploadedAt: new Date(),
            });
          } catch (error) {
            console.error(
              `Failed to process attachment ${attachment.filename}:`,
              error,
            );
          }
        }
      } catch (error) {
        console.error("Failed to fetch attachments:", error);
      }
    }

    await db
      .update(receivedEmail)
      .set({
        status: "processed",
        processedAt: new Date(),
      })
      .where(eq(receivedEmail.emailId, email_id));
  } catch (error) {
    console.error(`Failed to process email ${email_id}:`, error);

    try {
      await db
        .update(receivedEmail)
        .set({
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        })
        .where(eq(receivedEmail.emailId, email_id));
    } catch (updateError) {
      console.error("Failed to update email status:", updateError);
    }

    throw error;
  }
}
