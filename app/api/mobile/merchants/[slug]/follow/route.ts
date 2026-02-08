import { eq } from "drizzle-orm";
import { connection, type NextRequest } from "next/server";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { organization } from "@/db/schema";
import {
  errorResponse,
  getMobileSession,
  successResponse,
  unauthorizedResponse,
} from "@/lib/mobile-auth";
import { toggleOrganizationFollow } from "@/server/follows";

const toggleFollowSchema = z.object({
  revalidateTargetPath: z.string().optional().default("/"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  await connection();

  try {
    const session = await getMobileSession();
    if (!session?.user) return unauthorizedResponse();

    const { slug } = await params;
    const body = await request.json();
    const parsed = toggleFollowSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Invalid request data", 400);
    }

    const org = await db.query.organization.findFirst({
      where: eq(organization.slug, slug),
    });

    if (!org) {
      return errorResponse("Merchant not found", 404);
    }

    const result = await toggleOrganizationFollow({
      organizationId: org.id,
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
    console.error("Failed to follow merchant:", error);
    return errorResponse("Failed to follow merchant", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  await connection();

  try {
    const session = await getMobileSession();
    if (!session?.user) return unauthorizedResponse();

    const { slug } = await params;
    const body = await request.json();
    const parsed = toggleFollowSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Invalid request data", 400);
    }

    const org = await db.query.organization.findFirst({
      where: eq(organization.slug, slug),
    });

    if (!org) {
      return errorResponse("Merchant not found", 404);
    }

    const result = await toggleOrganizationFollow({
      organizationId: org.id,
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
    console.error("Failed to unfollow merchant:", error);
    return errorResponse("Failed to unfollow merchant", 500);
  }
}
