"use server";

import { and, eq, lt, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { orderItem, order as orderTable, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { ORDER_STATUS_VALUES } from "@/lib/constants";
import { formatPriceInRWF } from "@/lib/utils";

const orderItemSchema = z.object({
	productId: z.string().min(1),
	quantity: z.number().min(1),
	notes: z.string().optional(),
});

const orderSchema = z.object({
	items: z.array(orderItemSchema).min(1),
	notes: z.string().optional(),
});

export async function placeOrder(input: z.infer<typeof orderSchema>) {
	const parsed = orderSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: z.treeifyError(parsed.error) };
	}

	const session = await auth.api.getSession({
		headers: await (async () => {
			const { headers } = await import("next/headers");
			return headers();
		})(),
	});

	if (!session?.user) {
		return { ok: false, error: "Unauthorized" };
	}

	const { items, notes } = parsed.data;

	try {
		const productIds = items.map((item) => item.productId);
		const products = await db.query.product.findMany({
			where: (product, { inArray }) => inArray(product.id, productIds),
			with: {
				organization: true,
			},
		});

		if (products.length !== items.length) {
			return { ok: false, error: "One or more products not found" };
		}

		// Ensure all products belong to the same organization
		const organizationIds = [...new Set(products.map((p) => p.organizationId))];
		if (organizationIds.length > 1) {
			return {
				ok: false,
				error: "All products must belong to the same organization",
			};
		}

		const organizationId = organizationIds[0];
		const organization = products[0].organization;

		let totalPrice = 0;
		const orderItems = items.map((item) => {
			const productData = products.find((p) => p.id === item.productId);
			if (!productData) throw new Error("Product not found");

			const priceAtOrder = productData.price;
			const subtotal = Number(priceAtOrder) * item.quantity;
			totalPrice += subtotal;

			return {
				productId: item.productId,
				productName: productData.name,
				quantity: item.quantity,
				priceAtOrder,
				subtotal: subtotal.toFixed(2),
				notes: item.notes,
			};
		});

		const [newOrder] = await db
			.insert(orderTable)
			.values({
				userId: session.user.id,
				organizationId,
				notes: notes || null,
				totalPrice: totalPrice.toFixed(2),
			})
			.returning();

		await db.insert(orderItem).values(
			orderItems.map((item) => ({
				orderId: newOrder.id,
				productId: item.productId,
				quantity: item.quantity,
				priceAtOrder: item.priceAtOrder,
				subtotal: item.subtotal,
			})),
		);

		const merchantOrderNumberResult = await db
			.select({ count: sql<number>`count(*)::int` })
			.from(orderTable)
			.where(
				and(
					eq(orderTable.organizationId, organizationId),
					or(
						lt(orderTable.createdAt, newOrder.createdAt),
						eq(orderTable.createdAt, newOrder.createdAt),
					),
				),
			);
		const merchantOrderNumber = merchantOrderNumberResult[0]?.count || 1;

		const userData = await db.query.user.findFirst({
			where: eq(user.id, session.user.id),
		});

		const metadata = organization.metadata
			? typeof organization.metadata === "string"
				? JSON.parse(organization.metadata)
				: organization.metadata
			: {};

		const whatsappPhone = metadata.phone;

		if (!whatsappPhone) {
			return {
				ok: true,
				orderId: newOrder.id,
				error: "Merchant WhatsApp number not configured",
			};
		}

		const itemsList = orderItems
			.map(
				(item) =>
					`📦 *${item.productName}*\n` +
					`   Qty: ${item.quantity} × ${formatPriceInRWF(Number(item.priceAtOrder))} = ${formatPriceInRWF(Number(item.subtotal))}` +
					(item.notes ? `\n   _Note: ${item.notes}_` : ""),
			)
			.join("\n\n");

		const orgTimezone = metadata.timezone ?? "Africa/Kigali";
		const orderDate = new Intl.DateTimeFormat("en-US", {
			dateStyle: "medium",
			timeStyle: "short",
			timeZone: orgTimezone,
		}).format(newOrder.createdAt);

		const message =
			`🛒 *New Order #${merchantOrderNumber}*\n` +
			`📅 ${orderDate}\n\n` +
			`Hello! I'd like to place an order:\n\n` +
			itemsList +
			`\n\n💵 *Total: ${formatPriceInRWF(totalPrice)}*\n` +
			(notes ? `\n📝 *Order Note: ${notes}*\n` : "") +
			`\n👤 *Customer: ${userData?.name || session.user.name}*\n\n` +
			"_*Powered by Starva*_";

		const whatsappUrl = `https://wa.me/${whatsappPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`;

		revalidatePath("/");

		return {
			ok: true,
			orderId: newOrder.id,
			whatsappUrl,
		};
	} catch (error) {
		console.error("Order placement error:", error);
		return { ok: false, error: "Failed to place order" };
	}
}

const updateOrderStatusSchema = z.object({
	orderId: z.string().min(1),
	status: z.enum(ORDER_STATUS_VALUES),
});

export async function updateOrderStatus(
	input: z.infer<typeof updateOrderStatusSchema>,
) {
	const parsed = updateOrderStatusSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: "Invalid input" };
	}

	const session = await auth.api.getSession({
		headers: await (async () => {
			const { headers } = await import("next/headers");
			return headers();
		})(),
	});

	if (!session?.user) {
		return { ok: false, error: "Unauthorized" };
	}

	const { orderId, status } = parsed.data;

	try {
		const existingOrder = await db.query.order.findFirst({
			where: eq(orderTable.id, orderId),
			with: {
				organization: {
					with: {
						members: {
							where: (member, { eq }) => eq(member.userId, session.user.id),
						},
					},
				},
			},
		});

		if (!existingOrder) {
			return { ok: false, error: "Order not found" };
		}

		const member = existingOrder.organization.members[0];
		if (!member || (member.role !== "admin" && member.role !== "owner")) {
			return { ok: false, error: "Unauthorized to update this order" };
		}

		await db
			.update(orderTable)
			.set({
				status,
				updatedAt: new Date(),
			})
			.where(eq(orderTable.id, orderId));

		revalidatePath("/orders");
		revalidatePath(`/orders/${orderId}`);

		return { ok: true };
	} catch (error) {
		console.error("Order status update error:", error);
		return { ok: false, error: "Failed to update order status" };
	}
}

export async function cancelOrder(orderId: string) {
	const session = await auth.api.getSession({
		headers: await (async () => {
			const { headers } = await import("next/headers");
			return headers();
		})(),
	});

	if (!session?.user) {
		return { ok: false, error: "Unauthorized" };
	}

	try {
		const existingOrder = await db.query.order.findFirst({
			where: eq(orderTable.id, orderId),
		});

		if (!existingOrder) {
			return { ok: false, error: "Order not found" };
		}

		if (existingOrder.userId !== session.user.id) {
			const organizationMember = await db.query.member.findFirst({
				where: (member, { and, eq }) =>
					and(
						eq(member.organizationId, existingOrder.organizationId),
						eq(member.userId, session.user.id),
					),
			});

			if (
				!organizationMember ||
				(organizationMember.role !== "admin" &&
					organizationMember.role !== "owner")
			) {
				return { ok: false, error: "Unauthorized to cancel this order" };
			}
		}

		if (existingOrder.status === "delivered") {
			return { ok: false, error: "Cannot cancel a delivered order" };
		}

		if (existingOrder.status === "cancelled") {
			return { ok: false, error: "Order is already cancelled" };
		}

		await db
			.update(orderTable)
			.set({
				status: "cancelled",
				updatedAt: new Date(),
			})
			.where(eq(orderTable.id, orderId));

		revalidatePath("/orders");
		revalidatePath(`/orders/${orderId}`);

		return { ok: true };
	} catch (error) {
		console.error("Order cancellation error:", error);
		return { ok: false, error: "Failed to cancel order" };
	}
}
