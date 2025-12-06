"use server";

import { and, count, gte, lte } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { session } from "@/db/schema";

export type UserMetricsData = {
  visitors: {
    current: number;
    previous: number;
    change: number;
  };
  pageViews: {
    current: number;
    previous: number;
    change: number;
  };
  bounceRate: {
    current: number;
    previous: number;
    change: number;
  };
  hourlyActivity: Array<{
    hour: string;
    visitors: number;
  }>;
};

export async function getUserMetrics(): Promise<UserMetricsData> {
  const now = new Date();
  const currentPeriodStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const previousPeriodStart = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const previousPeriodEnd = currentPeriodStart;

  // Get current period visitors (unique users)
  const currentVisitors = await db
    .select({ count: count() })
    .from(session)
    .where(
      and(
        gte(session.createdAt, currentPeriodStart),
        lte(session.createdAt, now)
      )
    )
    .then((result) => result[0]?.count || 0);

  // Get previous period visitors
  const previousVisitors = await db
    .select({ count: count() })
    .from(session)
    .where(
      and(
        gte(session.createdAt, previousPeriodStart),
        lte(session.createdAt, previousPeriodEnd)
      )
    )
    .then((result) => result[0]?.count || 0);

  // Calculate visitor change
  const visitorsChange =
    previousVisitors > 0
      ? Math.round(
          ((currentVisitors - previousVisitors) / previousVisitors) * 100
        )
      : 0;

  // Get current period page views (sessions as proxy)
  const currentPageViews = await db
    .select({ count: count() })
    .from(session)
    .where(
      and(
        gte(session.createdAt, currentPeriodStart),
        lte(session.createdAt, now)
      )
    )
    .then((result) => result[0]?.count || 0);

  // Get previous period page views
  const previousPageViews = await db
    .select({ count: count() })
    .from(session)
    .where(
      and(
        gte(session.createdAt, previousPeriodStart),
        lte(session.createdAt, previousPeriodEnd)
      )
    )
    .then((result) => result[0]?.count || 0);

  // Calculate page views change
  const pageViewsChange =
    previousPageViews > 0
      ? Math.round(
          ((currentPageViews - previousPageViews) / previousPageViews) * 100
        )
      : 0;

  // Calculate bounce rate (sessions with duration < 10 seconds)
  // A "bounce" is when a user leaves quickly without meaningful interaction
  const BOUNCE_THRESHOLD_MS = 10 * 1000; // 10 seconds

  // Get current period sessions with their durations
  const currentSessions = await db
    .select({
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    })
    .from(session)
    .where(
      and(
        gte(session.createdAt, currentPeriodStart),
        lte(session.createdAt, now)
      )
    );

  const currentBounces = currentSessions.filter((s) => {
    const duration =
      new Date(s.expiresAt).getTime() - new Date(s.createdAt).getTime();
    return duration < BOUNCE_THRESHOLD_MS;
  }).length;

  const currentBounceRate =
    currentSessions.length > 0
      ? Math.round((currentBounces / currentSessions.length) * 100)
      : 0;

  // Get previous period sessions
  const previousSessions = await db
    .select({
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    })
    .from(session)
    .where(
      and(
        gte(session.createdAt, previousPeriodStart),
        lte(session.createdAt, previousPeriodEnd)
      )
    );

  const previousBounces = previousSessions.filter((s) => {
    const duration =
      new Date(s.expiresAt).getTime() - new Date(s.createdAt).getTime();
    return duration < BOUNCE_THRESHOLD_MS;
  }).length;

  const previousBounceRate =
    previousSessions.length > 0
      ? Math.round((previousBounces / previousSessions.length) * 100)
      : 0;

  const bounceRateChange =
    previousBounceRate > 0
      ? Math.round(
          ((currentBounceRate - previousBounceRate) / previousBounceRate) * 100
        )
      : 0;

  // Get hourly activity for the last 24 hours (midnight to midnight)
  const hourlyActivity = [];
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  for (let i = 0; i < 24; i++) {
    const hourStart = new Date(startOfDay.getTime() + i * 60 * 60 * 1000);
    const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);

    const visitorsInHour = await db
      .select({ count: count() })
      .from(session)
      .where(
        and(gte(session.createdAt, hourStart), lte(session.createdAt, hourEnd))
      )
      .then((result) => result[0]?.count || 0);

    hourlyActivity.push({
      hour: hourStart
        .toLocaleTimeString("en-US", {
          hour: "numeric",
          hour12: true,
        })
        .replace(" ", ""),
      visitors: visitorsInHour,
    });
  }

  return {
    visitors: {
      current: currentVisitors,
      previous: previousVisitors,
      change: visitorsChange,
    },
    pageViews: {
      current: currentPageViews,
      previous: previousPageViews,
      change: pageViewsChange,
    },
    bounceRate: {
      current: currentBounceRate,
      previous: previousBounceRate,
      change: bounceRateChange,
    },
    hourlyActivity,
  };
}
