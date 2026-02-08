import { connection, type NextRequest } from "next/server";
import { z } from "zod";

import { getFilteredProducts } from "@/data/products";
import {
  errorResponse,
  getMobileSession,
  successResponse,
  unauthorizedResponse,
} from "@/lib/mobile-auth";

const productFiltersSchema = z.object({
  search: z.string().optional(),
  tags: z.string().optional(),
  status: z.enum(["in_stock", "out_of_stock", "draft"]).optional(),
  sortBy: z
    .enum(["newest", "oldest", "price_low", "price_high", "popular"])
    .optional(),
});

export async function GET(request: NextRequest) {
  await connection();

  try {
    const session = await getMobileSession();
    if (!session?.user) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const parsed = productFiltersSchema.safeParse({
      search: searchParams.get("search") ?? undefined,
      tags: searchParams.get("tags") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      sortBy: searchParams.get("sortBy") ?? undefined,
    });

    if (!parsed.success) return errorResponse("Invalid filter parameters", 400);

    const { search, tags, status, sortBy } = parsed.data;

    const filters = {
      search,
      tagSlugs: tags?.split(",").filter(Boolean),
      status,
      sortBy,
    };

    const products = await getFilteredProducts(filters);

    return successResponse({
      products,
      total: products.length,
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return errorResponse("Failed to fetch products", 500);
  }
}
