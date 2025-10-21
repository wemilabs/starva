import { db } from "@/db/drizzle";
import { feedback, user } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import "server-only";

export async function getFeedbackByUser(userId: string) {
  return await db
    .select({
      id: feedback.id,
      type: feedback.type,
      status: feedback.status,
      subject: feedback.subject,
      message: feedback.message,
      email: feedback.email,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt,
    })
    .from(feedback)
    .where(eq(feedback.userId, userId))
    .orderBy(desc(feedback.createdAt));
}

export async function getAllFeedback() {
  return await db
    .select({
      id: feedback.id,
      type: feedback.type,
      status: feedback.status,
      subject: feedback.subject,
      message: feedback.message,
      email: feedback.email,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
    .from(feedback)
    .leftJoin(user, eq(feedback.userId, user.id))
    .orderBy(desc(feedback.createdAt));
}

export async function getFeedbackById(id: string) {
  const result = await db
    .select()
    .from(feedback)
    .where(eq(feedback.id, id))
    .limit(1);
  return result[0] || null;
}