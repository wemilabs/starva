"use server";

import { verifySession } from "@/data/user-session";
import { db } from "@/db/drizzle";
import { productLike, product as productTable, tag, productTag } from "@/db/schema";
import { PRODUCT_STATUS_VALUES } from "@/lib/constants";
import { extractFileKeyFromUrl, utapi } from "@/lib/uploadthing-server";
import { slugify } from "@/lib/utils";
import { and, eq, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";

const productSchema = z.object({
  organizationId: z.string().min(1),
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(120),
  price: z.string().min(1),
  description: z.string().optional().default(""),
  imageUrl: z.url().optional().or(z.literal("")),
  status: z.enum(PRODUCT_STATUS_VALUES),
  tagNames: z.array(z.string()).optional().default([]),
  revalidateTargetPath: z.string().min(1),
});

export async function createProduct(input: z.infer<typeof productSchema>) {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: z.treeifyError(parsed.error) };
  }

  try {
    const {
      organizationId,
      name,
      slug,
      price,
      description,
      imageUrl,
      status,
      tagNames,
      revalidateTargetPath,
    } = parsed.data;

    const [newProduct] = await db.insert(productTable).values({
      name,
      slug,
      description: description || "",
      price,
      organizationId,
      imageUrl: imageUrl || null,
      status,
    }).returning();

    if (tagNames && tagNames.length > 0) {
      const tagIds: string[] = [];
      
      for (const tagName of tagNames) {
        const tagSlug = slugify(tagName);
        
        const existingTag = await db
          .select()
          .from(tag)
          .where(eq(tag.slug, tagSlug))
          .limit(1);

        if (existingTag.length > 0) {
          tagIds.push(existingTag[0].id);
        } else {
          const [newTag] = await db.insert(tag).values({
            id: randomUUID(),
            name: tagName,
            slug: tagSlug,
          }).returning();
          tagIds.push(newTag.id);
        }
      }

      if (tagIds.length > 0) {
        const productTagValues = tagIds.map((tagId) => ({
          id: randomUUID(),
          productId: newProduct.id,
          tagId,
        }));
        await db.insert(productTag).values(productTagValues);
      }
    }

    revalidatePath(revalidateTargetPath);
    return { ok: true } as const;
  } catch (error: unknown) {
    const e = error as Error;
    console.error(e);
    return { ok: false, error: e.message } as const;
  }
}

const updateProductSchema = productSchema.extend({
  productId: z.string().min(1),
});

export async function updateProduct(
  input: z.infer<typeof updateProductSchema>,
) {
  const parsed = updateProductSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: z.treeifyError(parsed.error) } as const;
  }

  try {
    const {
      productId,
      organizationId,
      name,
      slug,
      price,
      description,
      imageUrl,
      status,
      tagNames,
      revalidateTargetPath,
    } = parsed.data;

    const existingProduct = await db
      .select({ imageUrl: productTable.imageUrl })
      .from(productTable)
      .where(
        and(
          eq(productTable.id, productId),
          eq(productTable.organizationId, organizationId),
        ),
      )
      .limit(1);

    if (existingProduct.length === 0) {
      return { ok: false, error: "Product not found" } as const;
    }

    const oldImageUrl = existingProduct[0].imageUrl;
    const newImageUrl = imageUrl || null;

    await db
      .update(productTable)
      .set({
        name,
        slug,
        description: description || "",
        price,
        imageUrl: newImageUrl,
        status,
      })
      .where(
        and(
          eq(productTable.id, productId),
          eq(productTable.organizationId, organizationId),
        ),
      );

    if (tagNames) {
      await db.delete(productTag).where(eq(productTag.productId, productId));

      if (tagNames.length > 0) {
        const tagIds: string[] = [];
        
        for (const tagName of tagNames) {
          const tagSlug = slugify(tagName);
          
          const existingTag = await db
            .select()
            .from(tag)
            .where(eq(tag.slug, tagSlug))
            .limit(1);

          if (existingTag.length > 0) {
            tagIds.push(existingTag[0].id);
          } else {
            const [newTag] = await db.insert(tag).values({
              id: randomUUID(),
              name: tagName,
              slug: tagSlug,
            }).returning();
            tagIds.push(newTag.id);
          }
        }

        if (tagIds.length > 0) {
          const productTagValues = tagIds.map((tagId) => ({
            id: randomUUID(),
            productId,
            tagId,
          }));
          await db.insert(productTag).values(productTagValues);
        }
      }
    }

    after(async () => {
      if (oldImageUrl && oldImageUrl !== newImageUrl) {
        try {
          const fileKey = extractFileKeyFromUrl(oldImageUrl);
          if (fileKey) {
            await utapi.deleteFiles(fileKey);
            console.log(`Successfully deleted old image: ${fileKey}`);
          }
        } catch (error: unknown) {
          const e = error as Error;
          console.error(
            `Failed to delete old image from UploadThing: ${e.message}`,
          );
        }
      }
    });

    revalidatePath(revalidateTargetPath);
    return { ok: true } as const;
  } catch (error: unknown) {
    const e = error as Error;
    console.error(e);
    return { ok: false, error: e.message } as const;
  }
}

const deleteProductSchema = z.object({
  productId: z.string().min(1),
  organizationId: z.string().min(1),
  revalidateTargetPath: z.string().min(1),
});

export async function deleteProduct(
  input: z.infer<typeof deleteProductSchema>,
) {
  const parsed = deleteProductSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: z.treeifyError(parsed.error) } as const;
  }

  try {
    const { productId, organizationId, revalidateTargetPath } = parsed.data;

    const productToDelete = await db
      .select({ imageUrl: productTable.imageUrl })
      .from(productTable)
      .where(
        and(
          eq(productTable.id, productId),
          eq(productTable.organizationId, organizationId),
        ),
      )
      .limit(1);

    if (productToDelete.length === 0) {
      return { ok: false, error: "Product not found" } as const;
    }

    const { imageUrl } = productToDelete[0];

    await db
      .delete(productTable)
      .where(
        and(
          eq(productTable.id, productId),
          eq(productTable.organizationId, organizationId),
        ),
      );

    after(async () => {
      if (imageUrl) {
        try {
          const fileKey = extractFileKeyFromUrl(imageUrl);
          if (fileKey) {
            await utapi.deleteFiles(fileKey);
            console.log(`Successfully deleted image: ${fileKey}`);
          }
        } catch (error: unknown) {
          const e = error as Error;
          console.error(
            `Failed to delete image from UploadThing: ${e.message}`,
          );
        }
      }
    });

    revalidatePath(revalidateTargetPath);
    return { ok: true } as const;
  } catch (error: unknown) {
    const e = error as Error;
    console.error(e);
    return { ok: false, error: e.message } as const;
  }
}

const toggleProductLikeSchema = z.object({
  productId: z.string().min(1),
  revalidateTargetPath: z.string().min(1),
});

export async function toggleProductLike(
  input: z.infer<typeof toggleProductLikeSchema>,
) {
  const parsed = toggleProductLikeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: z.treeifyError(parsed.error),
      isLiked: false,
      likesCount: 0,
    } as const;
  }

  try {
    const { success, session } = await verifySession();
    if (!success || !session) {
      return {
        ok: false,
        error: "Unauthorized",
        isLiked: false,
        likesCount: 0,
      } as const;
    }

    const { productId, revalidateTargetPath } = parsed.data;
    const userId = session.user.id;

    const existingLike = await db
      .select()
      .from(productLike)
      .where(
        and(
          eq(productLike.productId, productId),
          eq(productLike.userId, userId),
        ),
      )
      .limit(1);

    const isLiked = existingLike.length === 0;

    if (!isLiked) {
      await db
        .delete(productLike)
        .where(
          and(
            eq(productLike.productId, productId),
            eq(productLike.userId, userId),
          ),
        );

      await db
        .update(productTable)
        .set({
          likesCount: sql`GREATEST(0, ${productTable.likesCount} - 1)`,
        })
        .where(eq(productTable.id, productId));
    } else {
      await db.insert(productLike).values({
        productId,
        userId,
      });

      await db
        .update(productTable)
        .set({
          likesCount: sql`${productTable.likesCount} + 1`,
        })
        .where(eq(productTable.id, productId));
    }

    const updatedProduct = await db
      .select({ likesCount: productTable.likesCount })
      .from(productTable)
      .where(eq(productTable.id, productId))
      .limit(1);

    const likesCount = updatedProduct[0]?.likesCount ?? 0;

    revalidatePath(revalidateTargetPath);
    return { ok: true, isLiked, likesCount } as const;
  } catch (error: unknown) {
    const e = error as Error;
    console.error(e);
    return {
      ok: false,
      error: e.message,
      isLiked: false,
      likesCount: 0,
    } as const;
  }
}
