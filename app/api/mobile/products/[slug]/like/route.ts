import { and, eq, sql } from "drizzle-orm";
import { connection, type NextRequest, NextResponse } from "next/server";

import { db } from "@/db/drizzle";
import { product, productLike } from "@/db/schema";
import { getMobileSession } from "@/lib/mobile-auth";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  await connection();

  try {
    const session = await getMobileSession();

    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slug } = await params;

    const foundProduct = await db.query.product.findFirst({
      where: eq(product.slug, slug),
    });

    if (!foundProduct)
      return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const existingLike = await db.query.productLike.findFirst({
      where: and(
        eq(productLike.userId, session.user.id),
        eq(productLike.productId, foundProduct.id),
      ),
    });

    if (existingLike) {
      return NextResponse.json(
        { error: "Already liked this product" },
        { status: 400 },
      );
    }

    await db.insert(productLike).values({
      userId: session.user.id,
      productId: foundProduct.id,
    });

    await db
      .update(product)
      .set({
        likesCount: sql`${product.likesCount} + 1`,
      })
      .where(eq(product.id, foundProduct.id));

    const updatedProduct = await db.query.product.findFirst({
      where: eq(product.id, foundProduct.id),
      columns: { likesCount: true },
    });

    return NextResponse.json({
      success: true,
      liked: true,
      likesCount: updatedProduct?.likesCount ?? 0,
    });
  } catch (error) {
    console.error("Failed to like product:", error);
    return NextResponse.json(
      { error: "Failed to like product" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  await connection();

  try {
    const session = await getMobileSession();

    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slug } = await params;

    const foundProduct = await db.query.product.findFirst({
      where: eq(product.slug, slug),
    });

    if (!foundProduct)
      return NextResponse.json({ error: "Product not found" }, { status: 404 });

    await db
      .delete(productLike)
      .where(
        and(
          eq(productLike.userId, session.user.id),
          eq(productLike.productId, foundProduct.id),
        ),
      );

    await db
      .update(product)
      .set({
        likesCount: sql`GREATEST(0, ${product.likesCount} - 1)`,
      })
      .where(eq(product.id, foundProduct.id));

    const updatedProduct = await db.query.product.findFirst({
      where: eq(product.id, foundProduct.id),
      columns: { likesCount: true },
    });

    return NextResponse.json({
      success: true,
      liked: false,
      likesCount: updatedProduct?.likesCount ?? 0,
    });
  } catch (error) {
    console.error("Failed to unlike product:", error);
    return NextResponse.json(
      { error: "Failed to unlike product" },
      { status: 500 },
    );
  }
}
