import { connection, type NextRequest } from "next/server";
import {
  errorResponse,
  getMobileSession,
  successResponse,
  unauthorizedResponse,
} from "@/lib/mobile-auth";
import { getProductsStock } from "@/server/inventory";

export async function GET(request: NextRequest) {
  await connection();

  try {
    const session = await getMobileSession();
    if (!session?.user) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const ids = searchParams.get("ids");
    const organizationId = searchParams.get("organizationId");

    if (!ids || !organizationId) {
      return errorResponse("Product IDs and organization ID are required", 400);
    }

    const productIds = ids.split(",").filter(Boolean);

    if (productIds.length === 0) {
      return errorResponse("At least one product ID is required", 400);
    }

    const result = await getProductsStock({
      productIds,
      organizationId,
    });

    if (!result.ok) {
      return errorResponse(
        typeof result.error === "string"
          ? result.error
          : "Failed to fetch stock",
        500,
      );
    }

    return successResponse(result);
  } catch (error) {
    console.error("Failed to fetch product stock:", error);
    return errorResponse("Failed to fetch product stock", 500);
  }
}
