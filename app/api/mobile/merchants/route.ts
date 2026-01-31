import { count, ilike, or, sql } from "drizzle-orm";
import { connection, type NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { organization } from "@/db/schema";
import { getMobileSession } from "@/lib/mobile-auth";

export async function GET(request: NextRequest) {
  await connection();

  try {
    const session = await getMobileSession();
    const userId = session?.user?.id;
    // console.log("[merchants] session userId:", userId);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10)),
    );
    const search = searchParams.get("search")?.trim();
    const sanitizedSearch = search
      ? search.replace(/[%_]/g, "\\$&")
      : undefined;
    const offset = (page - 1) * limit;

    const whereClause = sanitizedSearch
      ? or(
          ilike(organization.name, `%${sanitizedSearch}%`),
          ilike(organization.slug, `%${sanitizedSearch}%`),
        )
      : undefined;

    const [merchants, totalResult] = await Promise.all([
      db
        .select({
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          logo: organization.logo,
          metadata: organization.metadata,
          createdAt: organization.createdAt,
          followerCount: sql<number>`(
            SELECT COUNT(*)::int 
            FROM user_follow_organization 
            WHERE organization_id = ${organization.id}
          )`.as("followerCount"),
          productCount: sql<number>`(
            SELECT COUNT(*)::int 
            FROM product 
            WHERE organization_id = ${organization.id} AND status = 'in_stock'
          )`.as("productCount"),
          isFollowing: userId
            ? sql<boolean>`EXISTS (
                SELECT 1 FROM user_follow_organization 
                WHERE organization_id = ${organization.id} 
                AND user_id = ${userId}
              )`
            : sql<boolean>`false`,
        })
        .from(organization)
        .where(whereClause)
        .orderBy(organization.name)
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(organization).where(whereClause),
    ]);

    const total = totalResult[0]?.count ?? 0;

    return NextResponse.json({
      merchants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: offset + merchants.length < total,
      },
    });
  } catch (error) {
    console.error("Failed to fetch merchants:", error);
    return NextResponse.json(
      { error: "Failed to fetch merchants" },
      { status: 500 },
    );
  }
}
