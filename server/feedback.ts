"use server";

import { verifySession } from "@/data/user-session";
import { db } from "@/db/drizzle";
import { feedback, type FeedbackType } from "@/db/schema";
import { revalidatePath } from "next/cache";

type SubmitFeedbackInput = {
  type: FeedbackType;
  subject: string;
  message: string;
  email?: string;
};

export async function submitFeedback(data: SubmitFeedbackInput) {
  const sessionData = await verifySession();

  if (!sessionData.success || !sessionData.session?.user?.id) {
    return {
      success: false,
      error: "You must be signed in to submit feedback",
    };
  }

  try {
    await db.insert(feedback).values({
      userId: sessionData.session.user.id,
      type: data.type,
      subject: data.subject,
      message: data.message,
      email: data.email || sessionData.session.user.email,
      status: "pending",
    });

    revalidatePath("/feedback");

    return {
      success: true,
      message: "Thank you for your feedback! We'll review it soon.",
    };
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return {
      success: false,
      error: "Failed to submit feedback. Please try again.",
    };
  }
}