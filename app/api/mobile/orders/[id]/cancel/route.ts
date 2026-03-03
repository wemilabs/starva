import { connection, type NextRequest } from "next/server";

import {
  errorResponse,
  getMobileSession,
  successResponse,
  unauthorizedResponse,
} from "@/lib/mobile-auth";
import { cancelOrderForUser } from "@/server/orders";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await connection();

  try {
    const session = await getMobileSession();
    if (!session?.user) return unauthorizedResponse();

    const { id: orderId } = await params;

    const result = await cancelOrderForUser(orderId, session.user.id);

    if (!result.ok) {
      return errorResponse(result.error || "Failed to cancel order", 400);
    }

    return successResponse({ message: "Order cancelled successfully" });
  } catch (error) {
    console.error("Failed to cancel order:", error);
    return errorResponse("Failed to cancel order", 500);
  }
}
