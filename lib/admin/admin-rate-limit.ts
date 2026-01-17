"use server";

import { headers } from "next/headers";
import { redis } from "@/lib/redis";

type RateLimitConfig = {
  maxRequests: number;
  windowMs: number;
};

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 60 * 1000,
};

const DESTRUCTIVE_CONFIG: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60 * 1000,
};

export async function checkAdminRateLimit(
  adminId: string,
  action: string,
  config: RateLimitConfig = DEFAULT_CONFIG,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const key = `admin_rate_limit:${adminId}:${action}`;
  const windowSeconds = Math.ceil(config.windowMs / 1000);

  const current = await redis.incr(key);

  if (current === 1) await redis.expire(key, windowSeconds);

  const ttl = await redis.ttl(key);
  const resetAt = Date.now() + ttl * 1000;

  return {
    allowed: current <= config.maxRequests,
    remaining: Math.max(0, config.maxRequests - current),
    resetAt,
  };
}

export async function requireAdminRateLimit(
  adminId: string,
  action: string,
  isDestructive = false,
) {
  const config = isDestructive ? DESTRUCTIVE_CONFIG : DEFAULT_CONFIG;
  const result = await checkAdminRateLimit(adminId, action, config);

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
    throw new Error(`Rate limit exceeded. Try again in ${retryAfter} seconds.`);
  }

  return result;
}

export async function getClientIdentifier(): Promise<string> {
  const headersList = await headers();
  return (
    headersList.get("x-forwarded-for")?.split(",")[0] ||
    headersList.get("x-real-ip") ||
    "unknown"
  );
}
