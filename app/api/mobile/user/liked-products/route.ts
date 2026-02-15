import { connection } from "next/server";

import { getMyLikedProductsForMobile } from "@/data/users";
import {
  errorResponse,
  getMobileSession,
  successResponse,
  unauthorizedResponse,
} from "@/lib/mobile-auth";

export async function GET() {
  await connection();

  try {
    const session = await getMobileSession();
    if (!session?.user) return unauthorizedResponse();

    const products = await getMyLikedProductsForMobile(session.user.id);

    return successResponse({
      products,
      total: products.length,
    });
  } catch (error) {
    console.error("Failed to fetch liked products:", error);
    return errorResponse("Failed to fetch liked products", 500);
  }
}
