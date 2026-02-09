import { and, eq } from "drizzle-orm";
import { connection, type NextRequest } from "next/server";

import { db } from "@/db/drizzle";
import { member, order } from "@/db/schema";
import { decrypt } from "@/lib/encryption";
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

    const orderData = await db.query.order.findFirst({
      where: eq(order.id, orderId),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        organization: {
          columns: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        orderItems: {
          with: {
            product: {
              columns: {
                id: true,
                name: true,
                imageUrls: true,
                price: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (!orderData) {
      return errorResponse("Order not found", 404);
    }

    const isCustomer = orderData.userId === session.user.id;

    if (!isCustomer) {
      const membership = await db.query.member.findFirst({
        where: and(
          eq(member.organizationId, orderData.organizationId),
          eq(member.userId, session.user.id),
        ),
      });

      if (!membership) {
        return errorResponse("You can only view your own orders", 403);
      }
    }

    const decryptedOrder = {
      ...orderData,
      totalPrice: decrypt(orderData.totalPrice),
      orderItems: orderData.orderItems.map((item) => ({
        ...item,
        priceAtOrder: decrypt(item.priceAtOrder),
        subtotal: decrypt(item.subtotal),
      })),
    };

    return successResponse(decryptedOrder);
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return errorResponse("Failed to fetch order", 500);
  }
}
