import { and, eq } from "drizzle-orm";
import { cache } from "react";
import "server-only";

import { verifySession } from "@/data/user-session";
import { db } from "@/db/drizzle";
import { product } from "@/db/schema";

export const getInStockProducts = cache(async () => {
  const products = await db.query.product.findMany({
    where: eq(product.status, "in_stock"),
    with: {
      organization: {
        columns: {
          id: true,
          name: true,
          logo: true,
          slug: true,
        },
      },
    },
    orderBy: (product, { desc }) => [desc(product.createdAt)],
  });

  return products;
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
          },
        },
      },
      orderBy: (product, { desc }) => [desc(product.createdAt)],
    });
    return products;
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
            },
          },
        },
        orderBy: (product, { desc }) => [desc(product.createdAt)],
      });
      return products;
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
          },
        },
      },
      orderBy: (product, { desc }) => [desc(product.createdAt)],
    });

    return specificProduct;
  } catch (error) {
    console.error("Failed to fetch product by slug:", slug, error);
    return { message: "Failed to fetch product by slug" };
  }
});
