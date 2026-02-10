import { connection, type NextRequest } from "next/server";
import { z } from "zod";

import { getOrdersByUserForMobile } from "@/data/orders";
import {
  errorResponse,
  getMobileSession,
  successResponse,
  unauthorizedResponse,
} from "@/lib/mobile-auth";
import { createOrderForUser } from "@/server/orders";

const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().min(1),
  notes: z.string().optional(),
});

const placeOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  notes: z.string().optional(),
  deliveryLocation: z.string().min(1).optional(),
});

export async function GET(_request: NextRequest) {
  await connection();

  try {
    const session = await getMobileSession();
    if (!session?.user) return unauthorizedResponse();

    const orders = await getOrdersByUserForMobile(session.user.id);

    return successResponse({
      orders,
      total: orders.length,
    });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return errorResponse("Failed to fetch orders", 500);
  }
}

export async function POST(request: NextRequest) {
  await connection();

  try {
    const session = await getMobileSession();
    if (!session?.user) return unauthorizedResponse();

    const body = await request.json();
    const parsed = placeOrderSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Invalid order data", 400);
    }

    const { items, notes, deliveryLocation } = parsed.data;

    const result = await createOrderForUser({
      items,
      notes,
      deliveryLocation,
      userId: session.user.id,
      userEmail: session.user.email,
      userName: session.user.name,
    });

    if (!result.ok) {
      const errorMessage =
        typeof result.error === "string" ? result.error : "Validation failed";
      return errorResponse(errorMessage, 400);
    }

    return successResponse(
      {
        orderId: result.orderId,
        orderNumber: result.orderNumber,
        totalPrice: result.totalPrice,
        deliveryLocation: result.deliveryLocation,
        stockWarnings: result.stockWarnings,
      },
      201,
    );
  } catch (error) {
    console.error("Failed to place order:", error);
    return errorResponse("Failed to place order", 500);
  }
}
