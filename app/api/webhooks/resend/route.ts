import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { Webhook } from "svix";
import { UTApi } from "uploadthing/server";
import { db } from "@/db/drizzle";
import { emailAttachment, receivedEmail } from "@/db/schema";

const resend = new Resend(process.env.RESEND_API_KEY);
const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
const utapi = new UTApi();

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    console.error("RESEND_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
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
        { status: 400 }
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
        { status: 401 }
      );
    }

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
      { status: 500 }
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
      // Map attachments to include download_url if missing
      const attachmentsWithUrl = email.attachments.map(
        (att: {
          id: string;
          filename: string;
          content_type: string;
          content_id?: string;
          content_disposition?: string;
          download_url?: string;
        }) => ({
          ...att,
          download_url:
            att.download_url ||
            `https://api.resend.com/emails/${email_id}/attachments/${att.id}`,
        })
      );
      await processAttachments(email_id, attachmentsWithUrl);
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

async function processAttachments(
  emailId: string,
  attachments: Array<{
    id: string;
    filename: string;
    content_type: string;
    content_disposition?: string;
    content_id?: string;
    download_url: string;
    expires_at?: string;
  }>
) {
  for (const attachment of attachments) {
    try {
      // Download attachment from Resend
      const response = await fetch(attachment.download_url);
      if (!response.ok) {
        throw new Error(
          `Failed to download attachment: ${response.statusText}`
        );
      }

      const arrayBuffer = await response.arrayBuffer();

      // Create a File object for UploadThing
      const file = new File([arrayBuffer], attachment.filename, {
        type: attachment.content_type,
      });

      // Upload to UploadThing for permanent storage
      const uploadResponse = await utapi.uploadFiles([file]);

      if (!uploadResponse[0]?.data) {
        throw new Error("Failed to upload attachment to UploadThing");
      }

      // Store attachment metadata in database
      await db.insert(emailAttachment).values({
        emailId,
        attachmentId: attachment.id,
        filename: attachment.filename,
        contentType: attachment.content_type,
        size: arrayBuffer.byteLength,
        contentDisposition: attachment.content_disposition,
        contentId: attachment.content_id,
        downloadUrl: attachment.download_url || "",
        expiresAt: attachment.expires_at
          ? new Date(attachment.expires_at)
          : null,
        fileKey: uploadResponse[0]?.data?.key || "",
        uploadedAt: new Date(),
      });

      console.log(`Successfully processed attachment ${attachment.filename}`);
    } catch (error) {
      console.error(
        `Failed to process attachment ${attachment.filename}:`,
        error
      );
    }
  }
}
