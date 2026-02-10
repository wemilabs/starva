import { connection, type NextRequest } from "next/server";

import { getOrderByIdForMobile } from "@/data/orders";
import {
  errorResponse,
  getMobileSession,
  successResponse,
  unauthorizedResponse,
} from "@/lib/mobile-auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await connection();

  try {
    const session = await getMobileSession();
    if (!session?.user) return unauthorizedResponse();

    const { id: orderId } = await params;

    const result = await getOrderByIdForMobile({
      orderId,
      userId: session.user.id,
    });

    if (!result.ok) {
      return errorResponse(result.error, result.status);
    }

    return successResponse(result.order);
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return errorResponse("Failed to fetch order", 500);
  }
}
