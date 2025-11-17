import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { order } from "@/db/schema";
import { updateStock } from "@/server/inventory";

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

    // Check if order is already confirmed
    if (orderData.status !== "pending") {
      return NextResponse.redirect(
        new URL(
          `/orders/order-status?status=${orderData.status}&orderId=${orderData.id}`,
          _request.url
        )
      );
    }

    // Return confirmation page with order details
    return NextResponse.redirect(
      new URL(`/orders/order-confirm?token=${token}`, _request.url)
    );
  } catch (error) {
    console.error("Order confirmation error:", error);
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

    // Update order status to confirmed
    await db
      .update(order)
      .set({
        status: "confirmed",
        confirmedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(order.id, orderData.id));

    // Deduct stock for confirmed items with inventory tracking
    for (const item of orderData.orderItems) {
      if (item.product.inventoryEnabled) {
        await updateStock({
          productId: item.productId,
          organizationId: orderData.organizationId,
          quantityChange: -item.quantity,
          changeType: "sale",
          reason: `Order ${orderData.id} confirmed via WhatsApp link`,
          revalidateTargetPath: "/inventory",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Order confirmed successfully",
      orderId: orderData.id,
      orderNumber: orderData.orderNumber,
    });
  } catch (error) {
    console.error("Order confirmation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to confirm order" },
      { status: 500 }
    );
  }
}
