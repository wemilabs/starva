import { and, eq, ilike, inArray, sql } from "drizzle-orm";
import { connection, type NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import {
  type ProductStatus,
  product,
  productLike,
  productTag,
  tag,
} from "@/db/schema";
import { getMobileSession } from "@/lib/mobile-auth";

type ProductFilters = {
  search?: string;
  tagSlugs?: string[];
  status?: ProductStatus;
  sortBy?: "newest" | "oldest" | "price_low" | "price_high" | "popular";
  limit?: number;
  offset?: number;
};

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

    const { searchParams } = new URL(request.url);
    const filters: ProductFilters = {
      search: searchParams.get("search") ?? undefined,
      tagSlugs:
        searchParams.get("tags")?.split(",").filter(Boolean) ?? undefined,
      status: (searchParams.get("status") as ProductStatus) ?? "in_stock",
      sortBy:
        (searchParams.get("sortBy") as ProductFilters["sortBy"]) ?? "newest",
      limit: parseInt(searchParams.get("limit") ?? "20", 10),
      offset: parseInt(searchParams.get("offset") ?? "0", 10),
    };

    const {
      search,
      tagSlugs,
      status = "in_stock",
      sortBy = "newest",
      limit = 20,
      offset = 0,
    } = filters;

    let query = db
      .select({
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        likesCount: product.likesCount,
        status: product.status,
        category: product.category,
        organizationId: product.organizationId,
        calories: product.calories,
        imageUrls: product.imageUrls,
        brand: product.brand,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        organization: {
          id: sql<string>`org.id`,
          name: sql<string>`org.name`,
          logo: sql<string>`org.logo`,
          slug: sql<string>`org.slug`,
          metadata: sql<string>`org.metadata`,
        },
      })
      .from(product)
      .leftJoin(sql`organization org`, sql`org.id = ${product.organizationId}`)
      .$dynamic();

    const conditions = [eq(product.status, status)];

    if (search) {
      conditions.push(
        sql`(
          ${ilike(product.name, `%${search}%`)} OR 
          ${ilike(product.description, `%${search}%`)}
        )`,
      );
    }

    if (tagSlugs && tagSlugs.length > 0) {
      const tagIds = await db
        .select({ id: tag.id })
        .from(tag)
        .where(inArray(tag.slug, tagSlugs));

      if (tagIds.length > 0) {
        const productIds = await db
          .selectDistinct({ productId: productTag.productId })
          .from(productTag)
          .where(
            inArray(
              productTag.tagId,
              tagIds.map((t) => t.id),
            ),
          );

        if (productIds.length > 0) {
          conditions.push(
            inArray(
              product.id,
              productIds.map((p) => p.productId),
            ),
          );
        } else {
          return NextResponse.json({ products: [], total: 0 });
        }
      }
    }

    query = query.where(and(...conditions));

    switch (sortBy) {
      case "oldest":
        query = query.orderBy(product.createdAt);
        break;
      case "price_low":
        query = query.orderBy(product.price);
        break;
      case "price_high":
        query = query.orderBy(sql`${product.price} DESC`);
        break;
      case "popular":
        query = query.orderBy(sql`${product.likesCount} DESC`);
        break;
      default:
        query = query.orderBy(sql`${product.createdAt} DESC`);
    }

    query = query.limit(limit).offset(offset);

    const products = await query;

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
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
