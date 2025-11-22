import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { order } from "@/db/schema";
import { getProductsStock, updateStock } from "@/server/inventory";

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

    // Validate stock availability before confirming order
    const productIds = orderData.orderItems.map((item) => item.productId);
    const stockCheck = await getProductsStock({
      productIds,
      organizationId: orderData.organizationId,
    });

    if (!stockCheck.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to check product availability" },
        { status: 500 }
      );
    }

    // Check each item against current stock
    for (const item of orderData.orderItems) {
      const productStock = stockCheck.stocks.find(
        (s) => s.id === item.productId
      );
      if (productStock?.inventoryEnabled) {
        const availableStock = productStock.currentStock || 0;
        if (item.quantity > availableStock) {
          return NextResponse.json(
            {
              success: false,
              error: `Insufficient stock for ${item.product.name}. Only ${availableStock} units available, but ${item.quantity} requested.`,
            },
            { status: 400 }
          );
        }
      }
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
        const stockUpdate = await updateStock({
          productId: item.productId,
          organizationId: orderData.organizationId,
          quantityChange: -item.quantity,
          changeType: "sale",
          reason: `Order ${orderData.id} confirmed via WhatsApp link`,
          revalidateTargetPath: "/inventory",
        });

        if (!stockUpdate.ok) {
          // Rollback order status if stock deduction fails
          await db
            .update(order)
            .set({
              status: "pending",
              updatedAt: new Date(),
            })
            .where(eq(order.id, orderData.id));

          return NextResponse.json(
            {
              success: false,
              error: `Failed to deduct stock for ${item.product.name}: ${stockUpdate.error}`,
            },
            { status: 400 }
          );
        }
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
