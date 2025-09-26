"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { product as productTable } from "@/db/schema";
import { STATUS_VALUES } from "@/lib/constants";
import { and, eq } from "drizzle-orm";

const productSchema = z.object({
  organizationId: z.string().min(1),
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(120),
  price: z.string().min(1),
  description: z.string().optional().default(""),
  imageUrl: z.url().optional().or(z.literal("")),
  status: z.enum(STATUS_VALUES),
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
      revalidateTargetPath,
    } = parsed.data;

    await db.insert(productTable).values({
      name,
      slug,
      description: description || "",
      price: price as unknown as any,
      organizationId,
      imageUrl: imageUrl || null,
      status,
    });

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
  input: z.infer<typeof updateProductSchema>
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
      revalidateTargetPath,
    } = parsed.data;

    await db
      .update(productTable)
      .set({
        name,
        slug,
        description: description || "",
        price: price as unknown as any,
        imageUrl: imageUrl || null,
        status,
      })
      .where(
        and(
          eq(productTable.id, productId),
          eq(productTable.organizationId, organizationId)
        )
      );

    revalidatePath(revalidateTargetPath);
    return { ok: true } as const;
  } catch (error: unknown) {
    const e = error as Error;
    console.error(e);
    return { ok: false, error: e.message } as const;
  }
}

// export async function deleteProduct(id: string, revalidateTargetPath: string) {
//   try {
//     await db.delete(productTable).where(eq(productTable.id, id));
//     revalidatePath(revalidateTargetPath);
//     return { ok: true } as const;
//   } catch (error: unknown) {
//     const e = error as Error;
//     console.error(e);
//     return { ok: false, error: e.message } as const;
//   }
// }

const deleteProductSchema = z.object({
  productId: z.string().min(1),
  organizationId: z.string().min(1),
  revalidateTargetPath: z.string().min(1),
});

export async function deleteProduct(
  input: z.infer<typeof deleteProductSchema>
) {
  const parsed = deleteProductSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: z.treeifyError(parsed.error) } as const;
  }

  try {
    const { productId, organizationId, revalidateTargetPath } = parsed.data;
    await db
      .delete(productTable)
      .where(
        and(
          eq(productTable.id, productId),
          eq(productTable.organizationId, organizationId)
        )
      );
    revalidatePath(revalidateTargetPath);
    return { ok: true } as const;
  } catch (error: unknown) {
    const e = error as Error;
    console.error(e);
    return { ok: false, error: e.message } as const;
  }
}
