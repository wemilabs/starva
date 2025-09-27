import "server-only";
import { and, eq } from "drizzle-orm";
import { cache } from "react";
import { verifySession } from "@/data/user-session";
import { db } from "@/db/drizzle";
import { product } from "@/db/schema";

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
    const { success } = await verifySession();
    if (!success) return [];

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
    });
    return products;
  } catch (error) {
    console.error(error);
    return [] as (typeof product.$inferSelect)[];
  }
}
