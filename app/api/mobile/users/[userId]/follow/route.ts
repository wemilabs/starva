import { eq } from "drizzle-orm";
import { connection, type NextRequest } from "next/server";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import {
  errorResponse,
  getMobileSession,
  successResponse,
  unauthorizedResponse,
} from "@/lib/mobile-auth";
import { toggleUserFollow } from "@/server/follows";

const toggleFollowSchema = z.object({
  revalidateTargetPath: z.string().optional().default("/"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  await connection();

  try {
    const session = await getMobileSession();
    if (!session?.user) return unauthorizedResponse();

    const { userId } = await params;
    const body = await request.json();
    const parsed = toggleFollowSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Invalid request data", 400);
    }

    if (userId === session.user.id) {
      return errorResponse("Cannot follow yourself", 400);
    }

    const targetUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!targetUser) {
      return errorResponse("User not found", 404);
    }

    const result = await toggleUserFollow({
      userId: userId,
      revalidateTargetPath: parsed.data.revalidateTargetPath,
    });

    if (!result.ok) {
      const errorMessage =
        typeof result.error === "string" ? result.error : "Validation failed";
      return errorResponse(errorMessage, 400);
    }

    return successResponse({
      success: true,
      following: result.isFollowing,
      followersCount: result.followersCount,
    });
  } catch (error) {
    console.error("Failed to follow user:", error);
    return errorResponse("Failed to follow user", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  await connection();

  try {
    const session = await getMobileSession();
    if (!session?.user) return unauthorizedResponse();

    const { userId } = await params;
    const body = await request.json();
    const parsed = toggleFollowSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Invalid request data", 400);
    }

    const targetUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!targetUser) {
      return errorResponse("User not found", 404);
    }

    const result = await toggleUserFollow({
      userId: userId,
      revalidateTargetPath: parsed.data.revalidateTargetPath,
    });

    if (!result.ok) {
      const errorMessage =
        typeof result.error === "string" ? result.error : "Validation failed";
      return errorResponse(errorMessage, 400);
    }

    return successResponse({
      success: true,
      following: result.isFollowing,
      followersCount: result.followersCount,
    });
  } catch (error) {
    console.error("Failed to unfollow user:", error);
    return errorResponse("Failed to unfollow user", 500);
  }
}
