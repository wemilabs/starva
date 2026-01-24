import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { connection, type NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { product, productLike } from "@/db/schema";
import { auth } from "@/lib/auth";

const getUserLikedProductIds = async (userId: string): Promise<Set<string>> => {
  const likes = await db
    .select({ productId: productLike.productId })
    .from(productLike)
    .where(eq(productLike.userId, userId));
  return new Set(likes.map((like) => like.productId));
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> },
) {
  await connection();

  try {
    const { organizationId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    const products = await db.query.product.findMany({
      where: eq(product.organizationId, organizationId),
      with: {
        organization: {
          columns: {
            id: true,
            name: true,
            logo: true,
            slug: true,
            metadata: true,
          },
        },
      },
      orderBy: (product, { desc }) => [desc(product.createdAt)],
      limit,
      offset,
    });

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({
        products: products.map((p) => ({ ...p, isLiked: false })),
        total: products.length,
      });
    }

    const likedProductIds = await getUserLikedProductIds(session.user.id);
    return NextResponse.json({
      products: products.map((p) => ({
        ...p,
        isLiked: likedProductIds.has(p.id),
      })),
      total: products.length,
    });
  } catch (error) {
    console.error("Failed to fetch products for store:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
