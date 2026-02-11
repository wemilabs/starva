import { connection } from "next/server";

import { getInStockProducts } from "@/data/products";
import { errorResponse, successResponse } from "@/lib/mobile-auth";
import { shuffleArray } from "@/lib/utils";

export async function GET() {
  await connection();

  try {
    const products = await getInStockProducts();
    const shuffledProducts = shuffleArray(products);

    return successResponse({
      products: shuffledProducts,
      total: shuffledProducts.length,
    });
  } catch (error) {
    console.error("Failed to fetch for-you products:", error);
    return errorResponse("Failed to fetch products", 500);
  }
}
