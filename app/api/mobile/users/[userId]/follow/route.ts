import { and, eq } from "drizzle-orm";
import { connection, type NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { user, userFollowUser } from "@/db/schema";
import { getMobileSession } from "@/lib/mobile-auth";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  await connection();

  try {
    const session = await getMobileSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;

    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 },
      );
    }

    const targetUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingFollow = await db.query.userFollowUser.findFirst({
      where: and(
        eq(userFollowUser.followerId, session.user.id),
        eq(userFollowUser.followingId, userId),
      ),
    });

    if (existingFollow) {
      return NextResponse.json(
        { error: "Already following this user" },
        { status: 400 },
      );
    }

    await db.insert(userFollowUser).values({
      followerId: session.user.id,
      followingId: userId,
    });

    return NextResponse.json({ success: true, following: true });
  } catch (error) {
    console.error("Failed to follow user:", error);
    return NextResponse.json(
      { error: "Failed to follow user" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  await connection();

  try {
    const session = await getMobileSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;

    await db
      .delete(userFollowUser)
      .where(
        and(
          eq(userFollowUser.followerId, session.user.id),
          eq(userFollowUser.followingId, userId),
        ),
      );

    return NextResponse.json({ success: true, following: false });
  } catch (error) {
    console.error("Failed to unfollow user:", error);
    return NextResponse.json(
      { error: "Failed to unfollow user" },
      { status: 500 },
    );
  }
}
