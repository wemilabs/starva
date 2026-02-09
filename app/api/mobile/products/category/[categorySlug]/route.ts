import { connection, type NextRequest } from "next/server";
import { z } from "zod";

import { getProductsByCategorySlug } from "@/data/products";
import type { ProductCategory } from "@/db/schema";
import {
  errorResponse,
  getMobileSession,
  successResponse,
  unauthorizedResponse,
} from "@/lib/mobile-auth";

const categoryParamsSchema = z.object({
  categorySlug: z.custom<ProductCategory>(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ categorySlug: string }> },
) {
  await connection();

  try {
    const session = await getMobileSession();
    if (!session?.user) return unauthorizedResponse();

    const { categorySlug } = await params;
    const parsed = categoryParamsSchema.safeParse({ categorySlug });

    if (!parsed.success) {
      return errorResponse("Invalid category slug", 400);
    }

    const products = await getProductsByCategorySlug(parsed.data.categorySlug);

    return successResponse({
      products,
      total: products.length,
    });
  } catch (error) {
    console.error("Failed to fetch products by category:", error);
    return errorResponse("Failed to fetch products", 500);
  }
}
