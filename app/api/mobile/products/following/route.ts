import { and, desc, eq, inArray } from "drizzle-orm";
import { connection, type NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import {
  product,
  productLike,
  userFollowOrganization,
  userFollowUser,
} from "@/db/schema";
import { getMobileSession } from "@/lib/mobile-auth";

const getUserLikedProductIds = async (userId: string): Promise<Set<string>> => {
  const likes = await db
    .select({ productId: productLike.productId })
    .from(productLike)
    .where(eq(productLike.userId, userId));
  return new Set(likes.map((like) => like.productId));
};

export async function GET(request: NextRequest) {
  await connection();

  try {
    const session = await getMobileSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 50);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    const followedOrgs = await db
      .select({ organizationId: userFollowOrganization.organizationId })
      .from(userFollowOrganization)
      .where(eq(userFollowOrganization.userId, session.user.id));

    const followedUsers = await db
      .select({ followingId: userFollowUser.followingId })
      .from(userFollowUser)
      .where(eq(userFollowUser.followerId, session.user.id));

    const followedOrgIds = followedOrgs.map((f) => f.organizationId);
    const followedUserIds = followedUsers.map((f) => f.followingId);

    if (followedOrgIds.length === 0 && followedUserIds.length === 0) {
      return NextResponse.json({
        products: [],
        total: 0,
        hasMore: false,
        message: "Follow some merchants or users to see products here",
      });
    }

    let likedProductIds: string[] = [];
    if (followedUserIds.length > 0) {
      const likedByFollowed = await db
        .select({ productId: productLike.productId })
        .from(productLike)
        .where(inArray(productLike.userId, followedUserIds));
      likedProductIds = likedByFollowed.map((l) => l.productId);
    }

    const allProductIds = new Set<string>();

    const productsFromOrgs =
      followedOrgIds.length > 0
        ? await db.query.product.findMany({
            where: and(
              inArray(product.organizationId, followedOrgIds),
              eq(product.status, "in_stock"),
            ),
            with: {
              organization: {
                columns: { id: true, name: true, logo: true, slug: true },
              },
              productTags: {
                with: {
                  tag: { columns: { id: true, name: true, slug: true } },
                },
              },
            },
            orderBy: [desc(product.createdAt)],
          })
        : [];

    for (const p of productsFromOrgs) {
      allProductIds.add(p.id);
    }

    const uniqueLikedIds = likedProductIds.filter(
      (id) => !allProductIds.has(id),
    );

    const productsLikedByFollowed =
      uniqueLikedIds.length > 0
        ? await db.query.product.findMany({
            where: and(
              inArray(product.id, uniqueLikedIds),
              eq(product.status, "in_stock"),
            ),
            with: {
              organization: {
                columns: { id: true, name: true, logo: true, slug: true },
              },
              productTags: {
                with: {
                  tag: { columns: { id: true, name: true, slug: true } },
                },
              },
            },
            orderBy: [desc(product.createdAt)],
          })
        : [];

    const allProducts = [...productsFromOrgs, ...productsLikedByFollowed];

    allProducts.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const paginatedProducts = allProducts.slice(offset, offset + limit);

    const userLikedIds = await getUserLikedProductIds(session.user.id);

    const productsWithMeta = paginatedProducts.map((p) => ({
      ...p,
      tags: p.productTags.map((pt) => pt.tag),
      isLiked: userLikedIds.has(p.id),
      source: followedOrgIds.includes(p.organizationId)
        ? "followed_merchant"
        : "liked_by_followed",
    }));

    return NextResponse.json({
      products: productsWithMeta,
      total: allProducts.length,
      hasMore: offset + limit < allProducts.length,
    });
  } catch (error) {
    console.error("Failed to fetch following feed:", error);
    return NextResponse.json(
      { error: "Failed to fetch following feed" },
      { status: 500 },
    );
  }
}
