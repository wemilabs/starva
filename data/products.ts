import "server-only";
import { and, eq } from "drizzle-orm";
// import { verifySession } from "@/data/user-session";
import { cache } from "react";

import { db } from "@/db/drizzle";
import { product } from "@/db/schema";
// import { getCurrentUser } from "@/server/users";

export const getProducts = cache(async () => {
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
  });

  return products;
});

export async function getProductsPerBusiness(organizationId: string) {
  try {
    const products = await db.query.product.findMany({
      where: and(
        eq(product.organizationId, organizationId),
        eq(product.status, "in_stock")
      ),
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
    });
    return products;
  } catch (error) {
    console.error(error);
    return [] as (typeof product.$inferSelect)[];
  }
}
