import { and, eq } from "drizzle-orm";
import { cache } from "react";
import "server-only";

import { verifySession } from "@/data/user-session";
import { db } from "@/db/drizzle";
import { product, productLike } from "@/db/schema";

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
    },
    orderBy: (product, { desc }) => [desc(product.createdAt)],
  });

  if (!success || !session) {
    return products.map((p) => ({ ...p, isLiked: false }));
  }

  const likedProductIds = await getUserLikedProductIds(session.user.id);
  return products.map((p) => ({ ...p, isLiked: likedProductIds.has(p.id) }));
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
      error,
    );
    return { message: "Failed to fetch products for organization" };
  }
});

export const getProductsPerBusinessWithoutAuth = cache(
  async (organizationId: string) => {
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
        error,
      );
      return { message: "Failed to fetch products for organization" };
    }
  },
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
