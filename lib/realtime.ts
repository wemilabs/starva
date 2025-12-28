import { type InferRealtimeEvents, Realtime } from "@upstash/realtime";
import z from "zod/v4";
import { redis } from "./redis";

const schema = {
  orders: {
    new: z.object({
      notificationId: z.string(),
      orderId: z.string(),
      orderNumber: z.number(),
      customerName: z.string(),
      customerEmail: z.string(),
      total: z.string(),
      organizationId: z.string(),
      itemCount: z.number(),
      createdAt: z.string(),
    }),
    status: z.object({
      orderId: z.string(),
      orderNumber: z.number(),
      status: z.enum([
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "delivered",
        "cancelled",
      ]),
      organizationId: z.string(),
      userId: z.string(),
    }),
    confirmed: z.object({
      orderId: z.string(),
      orderNumber: z.number(),
      storeName: z.string(),
      total: z.string(),
      itemCount: z.number(),
      confirmedAt: z.string(),
    }),
    paid: z.object({
      orderId: z.string(),
      orderNumber: z.number(),
      customerName: z.string(),
      total: z.string(),
      organizationId: z.string(),
      paidAt: z.string(),
    }),
    cancelled: z.object({
      orderId: z.string(),
      orderNumber: z.number(),
      cancelledBy: z.enum(["customer", "merchant"]),
      storeName: z.string(),
      customerName: z.string(),
      organizationId: z.string(),
      userId: z.string(),
      cancelledAt: z.string(),
    }),
  },
  notifications: {
    badge: z.object({
      count: z.number(),
      organizationId: z.string(),
    }),
  },
};

export const realtime = new Realtime({ schema, redis });
export type RealtimeEvents = InferRealtimeEvents<typeof realtime>;
