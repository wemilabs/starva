import type { NextRequest } from "next/server";
import { z } from "zod";
import { getProductsPerStoreWithoutAuth } from "@/data/products";
import {
  errorResponse,
  getMobileSession,
  successResponse,
  unauthorizedResponse,
} from "@/lib/mobile-auth";

const storeParamsSchema = z.object({
  organizationId: z.string().min(1),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> },
) {
  try {
    const session = await getMobileSession();
    if (!session?.user) return unauthorizedResponse();

    const { organizationId } = await params;
    const parsed = storeParamsSchema.safeParse({ organizationId });

    if (!parsed.success) {
      return errorResponse("Invalid organization ID", 400);
    }

    const products = await getProductsPerStoreWithoutAuth(
      parsed.data.organizationId,
    );

    // Handle error case from server action
    if (!Array.isArray(products)) {
      return errorResponse("Failed to fetch products for store", 500);
    }

    return successResponse({
      products,
      total: products.length,
    });
  } catch (error) {
    console.error("Failed to fetch products for store:", error);
    return errorResponse("Failed to fetch products", 500);
  }
}
