"use server";

import { and, desc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifySession } from "@/data/user-session";
import { db } from "@/db/drizzle";
import { inventoryHistory, product as productTable } from "@/db/schema";

const updateStockSchema = z.object({
  productId: z.string().min(1),
  organizationId: z.string().min(1),
  quantityChange: z.number().int(),
  changeType: z.enum(["adjustment", "restock", "sale", "return", "damaged"]),
  reason: z.string().optional(),
  revalidateTargetPath: z.string().min(1),
});

export async function updateStock(input: z.infer<typeof updateStockSchema>) {
  const parsed = updateStockSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: z.treeifyError(parsed.error) } as const;
  }

  const sessionData = await verifySession();
  if (!sessionData.success || !sessionData.session) {
    return { ok: false, error: "Unauthorized" } as const;
  }

  try {
    const {
      productId,
      organizationId,
      quantityChange,
      changeType,
      reason,
      revalidateTargetPath,
    } = parsed.data;

    // Get current product stock
    const [currentProduct] = await db
      .select({
        currentStock: productTable.currentStock,
        inventoryEnabled: productTable.inventoryEnabled,
        status: productTable.status,
      })
      .from(productTable)
      .where(
        and(
          eq(productTable.id, productId),
          eq(productTable.organizationId, organizationId)
        )
      )
      .limit(1);

    if (!currentProduct) {
      return { ok: false, error: "Product not found" } as const;
    }

    if (!currentProduct.inventoryEnabled) {
      return {
        ok: false,
        error: "Inventory tracking is not enabled for this product",
      } as const;
    }

    const previousStock = currentProduct.currentStock || 0;
    const newStock = Math.max(0, previousStock + quantityChange);

    // Determine new status based on stock level
    let newStatus = currentProduct.status;
    if (currentProduct.status === "draft" && newStock > 0) {
      // First time adding stock to a draft product
      newStatus = "in_stock";
    } else if (
      (currentProduct.status === "in_stock" ||
        currentProduct.status === "out_of_stock") &&
      newStock === 0
    ) {
      newStatus = "out_of_stock";
    } else if (currentProduct.status === "out_of_stock" && newStock > 0) {
      newStatus = "in_stock";
    }

    // Update product stock and status
    await db
      .update(productTable)
      .set({
        currentStock: newStock,
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(productTable.id, productId),
          eq(productTable.organizationId, organizationId)
        )
      );

    // Record inventory history
    await db.insert(inventoryHistory).values({
      productId,
      organizationId,
      changeType,
      quantityChange,
      previousStock,
      newStock,
      reason: reason || null,
      userId: sessionData.session.session.userId,
      createdAt: new Date(),
    });

    revalidatePath(revalidateTargetPath);

    return {
      ok: true,
      previousStock,
      newStock,
      statusChanged: newStatus !== currentProduct.status,
      newStatus,
    } as const;
  } catch (error: unknown) {
    const e = error as Error;
    console.error(e);
    return { ok: false, error: e.message } as const;
  }
}

const getInventorySchema = z.object({
  organizationId: z.string().min(1),
});

export async function getInventoryList(
  input: z.infer<typeof getInventorySchema>
) {
  const parsed = getInventorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: z.treeifyError(parsed.error),
      products: [],
    } as const;
  }

  const sessionData = await verifySession();
  if (!sessionData.success || !sessionData.session) {
    return { ok: false, error: "Unauthorized", products: [] } as const;
  }

  try {
    const { organizationId } = parsed.data;

    const products = await db
      .select({
        id: productTable.id,
        name: productTable.name,
        slug: productTable.slug,
        imageUrl: productTable.imageUrl,
        status: productTable.status,
        currentStock: productTable.currentStock,
        lowStockThreshold: productTable.lowStockThreshold,
        inventoryEnabled: productTable.inventoryEnabled,
        unitFormatId: productTable.unitFormatId,
        price: productTable.price,
      })
      .from(productTable)
      .where(
        and(
          eq(productTable.organizationId, organizationId),
          eq(productTable.inventoryEnabled, true)
        )
      )
      .orderBy(productTable.name);

    return { ok: true, products } as const;
  } catch (error: unknown) {
    const e = error as Error;
    console.error(e);
    return { ok: false, error: e.message, products: [] } as const;
  }
}

const getInventoryHistorySchema = z.object({
  productId: z.string().min(1),
  organizationId: z.string().min(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

const getProductsStockSchema = z.object({
  productIds: z.array(z.string().min(1)),
  organizationId: z.string().min(1),
});

export async function getInventoryHistory(
  input: z.infer<typeof getInventoryHistorySchema>
) {
  const parsed = getInventoryHistorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: z.treeifyError(parsed.error),
      history: [],
    } as const;
  }

  const sessionData = await verifySession();
  if (!sessionData.success || !sessionData.session) {
    return { ok: false, error: "Unauthorized", history: [] } as const;
  }

  try {
    const { productId, organizationId, limit } = parsed.data;

    const history = await db
      .select()
      .from(inventoryHistory)
      .where(
        and(
          eq(inventoryHistory.productId, productId),
          eq(inventoryHistory.organizationId, organizationId)
        )
      )
      .orderBy(desc(inventoryHistory.createdAt))
      .limit(limit);

    return { ok: true, history } as const;
  } catch (error: unknown) {
    const e = error as Error;
    console.error(e);
    return { ok: false, error: e.message, history: [] } as const;
  }
}

export async function getProductsStock(
  input: z.infer<typeof getProductsStockSchema>
) {
  const parsed = getProductsStockSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: z.treeifyError(parsed.error),
      stocks: [],
    } as const;
  }

  const sessionData = await verifySession();
  if (!sessionData.success || !sessionData.session) {
    return { ok: false, error: "Unauthorized", stocks: [] } as const;
  }

  try {
    const { productIds, organizationId } = parsed.data;

    if (productIds.length === 0) {
      return { ok: true, stocks: [] } as const;
    }

    const products = await db
      .select({
        id: productTable.id,
        currentStock: productTable.currentStock,
        inventoryEnabled: productTable.inventoryEnabled,
      })
      .from(productTable)
      .where(
        and(
          eq(productTable.organizationId, organizationId),
          inArray(productTable.id, productIds)
        )
      );

    return { ok: true, stocks: products } as const;
  } catch (error: unknown) {
    const e = error as Error;
    console.error(e);
    return { ok: false, error: e.message, stocks: [] } as const;
  }
}
