import { eq, sql } from "drizzle-orm";
import { cache } from "react";
import "server-only";

import { db } from "@/db/drizzle";
import { product, productTag, tag } from "@/db/schema";

export const getAllTags = cache(async () => {
  "use cache";
  try {
    const tags = await db
      .select({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
        productCount: sql<number>`cast(count(distinct ${productTag.productId}) as int)`,
      })
      .from(tag)
      .leftJoin(productTag, eq(productTag.tagId, tag.id))
      .groupBy(tag.id, tag.name, tag.slug, tag.description)
      .orderBy(tag.name);

    return tags;
  } catch (error) {
    console.error("Failed to fetch all tags:", error);
    return [];
  }
});

export const getProductTags = cache(async (productId: string) => {
  "use cache";
  try {
    const tags = await db
      .select({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
      })
      .from(tag)
      .innerJoin(productTag, eq(productTag.tagId, tag.id))
      .where(eq(productTag.productId, productId))
      .orderBy(tag.name);

    return tags;
  } catch (error) {
    console.error("Failed to fetch product tags:", productId, error);
    return [];
  }
});

export const getAllTagsWithProducts = cache(async () => {
  "use cache";
  try {
    const tags = await db
      .select({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
        createdAt: tag.createdAt,
        updatedAt: tag.updatedAt,
        productCount: sql<number>`cast(count(distinct ${productTag.productId}) as int)`,
      })
      .from(tag)
      .leftJoin(productTag, eq(productTag.tagId, tag.id))
      .leftJoin(product, eq(product.id, productTag.productId))
      .where(eq(product.status, "in_stock"))
      .groupBy(tag.id, tag.name, tag.slug, tag.description, tag.createdAt, tag.updatedAt)
      .orderBy(tag.name);

    return tags;
  } catch (error) {
    console.error("Failed to fetch all tags:", error);
    return [];
  }
});
