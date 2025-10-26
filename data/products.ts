import { and, eq, ilike, inArray, sql } from "drizzle-orm";
import { cache } from "react";
import "server-only";

import { verifySession } from "@/data/user-session";
import { db } from "@/db/drizzle";
import {
  product,
  productLike,
  ProductStatus,
  productTag,
  tag,
} from "@/db/schema";

const getUserLikedProductIds = async (userId: string): Promise<Set<string>> => {
  const likes = await db
    .select({ productId: productLike.productId })
    .from(productLike)
    .where(eq(productLike.userId, userId));
  return new Set(likes.map((like) => like.productId));
};

export const getInStockProducts = cache(async () => {
  const { success, session } = await verifySession();

  const products = await db.query.product.findMany({
    where: eq(product.status, "in_stock"),
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
      productTags: {
        with: {
          tag: {
            columns: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
    orderBy: (product, { desc }) => [desc(product.createdAt)],
  });

  const productsWithTags = products.map((p) => ({
    ...p,
    tags: p.productTags.map((pt) => pt.tag),
  }));

  if (!success || !session) {
    return productsWithTags.map((p) => ({ ...p, isLiked: false }));
  }

  const likedProductIds = await getUserLikedProductIds(session.user.id);
  return productsWithTags.map((p) => ({
    ...p,
    isLiked: likedProductIds.has(p.id),
  }));
});

export const getProductsPerBusiness = cache(async (organizationId: string) => {
  const { success, session } = await verifySession();
  if (!success || !session)
    return { message: "Please sign in to access this page" };

  try {
    const products = await db.query.product.findMany({
      where: and(eq(product.organizationId, organizationId)),
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
    });
    const likedProductIds = await getUserLikedProductIds(session.user.id);
    return products.map((p) => ({ ...p, isLiked: likedProductIds.has(p.id) }));
  } catch (error) {
    console.error(
      "Failed to fetch products for organization:",
      organizationId,
      error
    );
    return { message: "Failed to fetch products for organization" };
  }
});

export const getProductsPerBusinessWithoutAuth = cache(
  async (organizationId: string) => {
    "use cache";
    try {
      const products = await db.query.product.findMany({
        where: and(eq(product.organizationId, organizationId)),
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
      });
      return products.map((p) => ({ ...p, isLiked: false }));
    } catch (error) {
      console.error(
        "Failed to fetch products for organization:",
        organizationId,
        error
      );
      return { message: "Failed to fetch products for organization" };
    }
  }
);

export const getProductBySlug = cache(async (slug: string) => {
  const { success, session } = await verifySession();
  if (!success || !session)
    return { message: "Please sign in to purchase this product" };

  try {
    const specificProduct = await db.query.product.findFirst({
      where: eq(product.slug, slug),
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
    });

    if (!specificProduct) return undefined;

    const likedProductIds = await getUserLikedProductIds(session.user.id);
    return {
      ...specificProduct,
      isLiked: likedProductIds.has(specificProduct.id),
    };
  } catch (error) {
    console.error("Failed to fetch product by slug:", slug, error);
    return { message: "Failed to fetch product by slug" };
  }
});

type ProductFilters = {
  search?: string;
  tagSlugs?: string[];
  status?: ProductStatus;
  sortBy?: "newest" | "oldest" | "price_low" | "price_high" | "popular";
};

async function getFilteredCachedProductsBase(filters: ProductFilters = {}) {
  "use cache";
  const { search, tagSlugs, status = "in_stock", sortBy = "newest" } = filters;

  try {
    let query = db
      .select({
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        likesCount: product.likesCount,
        status: product.status,
        organizationId: product.organizationId,
        calories: product.calories,
        imageUrl: product.imageUrl,
        brand: product.brand,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        organization: {
          id: sql<string>`${product.organizationId}`,
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
        )`
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
              tagIds.map((t) => t.id)
            )
          );

        if (productIds.length > 0) {
          conditions.push(
            inArray(
              product.id,
              productIds.map((p) => p.productId)
            )
          );
        } else {
          return [];
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
      case "newest":
      default:
        query = query.orderBy(sql`${product.createdAt} DESC`);
    }

    const products = await query;
    return products;
  } catch (error) {
    console.error("Failed to fetch filtered products:", error);
    return [];
  }
}

export const getFilteredProducts = cache(
  async (filters: ProductFilters = {}) => {
    const { success, session } = await verifySession();

    const products = await getFilteredCachedProductsBase(filters);

    if (!success || !session) {
      return products.map((p) => ({ ...p, isLiked: false }));
    }

    const likedProductIds = await getUserLikedProductIds(session.user.id);
    return products.map((p) => ({ ...p, isLiked: likedProductIds.has(p.id) }));
  }
);
