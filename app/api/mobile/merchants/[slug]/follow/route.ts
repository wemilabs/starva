import { and, eq } from "drizzle-orm";
import { connection, type NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { organization, userFollowOrganization } from "@/db/schema";
import { getMobileSession } from "@/lib/mobile-auth";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  await connection();

  try {
    const session = await getMobileSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;

    const org = await db.query.organization.findFirst({
      where: eq(organization.slug, slug),
    });

    if (!org) {
      return NextResponse.json(
        { error: "Merchant not found" },
        { status: 404 },
      );
    }

    const existingFollow = await db.query.userFollowOrganization.findFirst({
      where: and(
        eq(userFollowOrganization.userId, session.user.id),
        eq(userFollowOrganization.organizationId, org.id),
      ),
    });

    if (existingFollow) {
      return NextResponse.json(
        { error: "Already following this merchant" },
        { status: 400 },
      );
    }

    await db.insert(userFollowOrganization).values({
      userId: session.user.id,
      organizationId: org.id,
    });

    return NextResponse.json({ success: true, following: true });
  } catch (error) {
    console.error("Failed to follow merchant:", error);
    return NextResponse.json(
      { error: "Failed to follow merchant" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  await connection();

  try {
    const session = await getMobileSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;

    const org = await db.query.organization.findFirst({
      where: eq(organization.slug, slug),
    });

    if (!org) {
      return NextResponse.json(
        { error: "Merchant not found" },
        { status: 404 },
      );
    }

    await db
      .delete(userFollowOrganization)
      .where(
        and(
          eq(userFollowOrganization.userId, session.user.id),
          eq(userFollowOrganization.organizationId, org.id),
        ),
      );

    return NextResponse.json({ success: true, following: false });
  } catch (error) {
    console.error("Failed to unfollow merchant:", error);
    return NextResponse.json(
      { error: "Failed to unfollow merchant" },
      { status: 500 },
    );
  }
}
