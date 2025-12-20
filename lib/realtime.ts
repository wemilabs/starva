import { type InferRealtimeEvents, Realtime } from "@upstash/realtime";
import z from "zod/v4";
import { redis } from "./redis";

const schema = {
  orders: {
    new: z.object({
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
