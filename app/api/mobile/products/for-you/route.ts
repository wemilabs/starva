import { getInStockProducts } from "@/data/products";
import {
  errorResponse,
  getMobileSession,
  successResponse,
  unauthorizedResponse,
} from "@/lib/mobile-auth";
import { shuffleArray } from "@/lib/utils";

export async function GET() {
  try {
    const session = await getMobileSession();
    if (!session?.user) return unauthorizedResponse();

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
