import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { order } from "@/db/schema";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.redirect(
        new URL("/orders/order-status?error=missing-token", _request.url)
      );
    }

    // Find order by confirmation token
    const orderData = await db.query.order.findFirst({
      where: eq(order.confirmationToken, token),
      with: {
        orderItems: {
          with: {
            product: true,
          },
        },
      },
    });

    if (!orderData) {
      return NextResponse.redirect(
        new URL("/orders/order-status?error=invalid-token", _request.url)
      );
    }

    // Check if token has expired
    if (orderData.tokenExpiresAt && new Date() > orderData.tokenExpiresAt) {
      return NextResponse.redirect(
        new URL("/orders/order-status?error=expired-token", _request.url)
      );
    }

    // Check if order is already processed
    if (orderData.status !== "pending") {
      return NextResponse.redirect(
        new URL(
          `/orders/order-status?status=${orderData.status}&orderId=${orderData.id}`,
          _request.url
        )
      );
    }

    // Return rejection page with order details
    return NextResponse.redirect(
      new URL(`/orders/order-reject?token=${token}`, _request.url)
    );
  } catch (error) {
    console.error("Order rejection error:", error);
    return NextResponse.redirect(
      new URL("/orders/order-status?error=server-error", _request.url)
    );
  }
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Missing confirmation token" },
        { status: 400 }
      );
    }

    // Find order by confirmation token
    const orderData = await db.query.order.findFirst({
      where: eq(order.confirmationToken, token),
      with: {
        organization: true,
        orderItems: {
          with: {
            product: true,
          },
        },
      },
    });

    if (!orderData) {
      return NextResponse.json(
        { success: false, error: "Invalid confirmation token" },
        { status: 404 }
      );
    }

    // Check if token has expired
    if (orderData.tokenExpiresAt && new Date() > orderData.tokenExpiresAt) {
      return NextResponse.json(
        { success: false, error: "Confirmation token has expired" },
        { status: 410 }
      );
    }

    // Check if order is still pending
    if (orderData.status !== "pending") {
      return NextResponse.json(
        { success: false, error: `Order is already ${orderData.status}` },
        { status: 400 }
      );
    }

    // Update order status to cancelled
    await db
      .update(order)
      .set({
        status: "cancelled",
        confirmedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(order.id, orderData.id));

    return NextResponse.json({
      success: true,
      message: "Order rejected successfully",
      orderId: orderData.id,
      orderNumber: orderData.orderNumber,
    });
  } catch (error) {
    console.error("Order rejection error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reject order" },
      { status: 500 }
    );
  }
}
