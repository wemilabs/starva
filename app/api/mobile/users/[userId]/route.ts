import { and, count, eq } from "drizzle-orm";
import { connection, type NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { productLike, user, userFollowUser } from "@/db/schema";
import { getMobileSession } from "@/lib/mobile-auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  await connection();

  try {
    const session = await getMobileSession();

    const { userId } = await params;

    const targetUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
      columns: {
        id: true,
        name: true,
        image: true,
        createdAt: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [followerCountResult] = await db
      .select({ count: count() })
      .from(userFollowUser)
      .where(eq(userFollowUser.followingId, userId));

    const [followingCountResult] = await db
      .select({ count: count() })
      .from(userFollowUser)
      .where(eq(userFollowUser.followerId, userId));

    const [likesCountResult] = await db
      .select({ count: count() })
      .from(productLike)
      .where(eq(productLike.userId, userId));

    let isFollowing = false;
    if (session?.user && session.user.id !== userId) {
      const follow = await db.query.userFollowUser.findFirst({
        where: and(
          eq(userFollowUser.followerId, session.user.id),
          eq(userFollowUser.followingId, userId),
        ),
      });
      isFollowing = !!follow;
    }

    return NextResponse.json({
      id: targetUser.id,
      name: targetUser.name,
      image: targetUser.image,
      createdAt: targetUser.createdAt,
      followerCount: followerCountResult?.count ?? 0,
      followingCount: followingCountResult?.count ?? 0,
      likesCount: likesCountResult?.count ?? 0,
      isFollowing,
      isOwnProfile: session?.user?.id === userId,
    });
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 },
    );
  }
}
