import "server-only";
import {
  and,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  or,
  type SQL,
} from "drizzle-orm";
import { db } from "@/db/drizzle";
import { member, organization, user } from "@/db/schema";

export interface UserOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "inactive";
}

export async function getAllUsers(options: UserOptions = {}) {
  const { page = 1, limit = 20, search, status } = options;
  const offset = (page - 1) * limit;

  try {
    let whereCondition: SQL | undefined;

    if (search) {
      // Search by user name OR organization name
      whereCondition = ilike(user.name, `%${search}%`);

      const orgUsers = await db
        .select({ userId: member.userId })
        .from(member)
        .innerJoin(organization, eq(member.organizationId, organization.id))
        .where(ilike(organization.name, `%${search}%`));

      const userIds = orgUsers.map((u) => u.userId);

      if (userIds.length > 0)
        whereCondition = or(whereCondition, inArray(user.id, userIds));
    }

    if (status === "active")
      whereCondition = whereCondition
        ? and(whereCondition, eq(user.emailVerified, true))
        : eq(user.emailVerified, true);
    else if (status === "inactive")
      whereCondition = whereCondition
        ? and(whereCondition, eq(user.emailVerified, false))
        : eq(user.emailVerified, false);

    const users = await db.query.user.findMany({
      where: whereCondition,
      orderBy: desc(user.createdAt),
      limit,
      offset,
    });

    // Get organizations for each user separately
    const usersWithOrgs = await Promise.all(
      users.map(async (userRecord) => {
        const userMembers = await db.query.member.findMany({
          where: eq(member.userId, userRecord.id),
          with: {
            organization: true,
          },
        });

        return {
          ...userRecord,
          members: userMembers,
        };
      })
    );

    const totalCountResult = await db
      .select({ count: count() })
      .from(user)
      .where(whereCondition);

    const totalCount = totalCountResult[0]?.count || 0;

    return {
      users: usersWithOrgs,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      users: [],
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0,
      },
    };
  }
}

export async function getUserById(id: string) {
  try {
    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, id),
    });

    if (!userRecord) return null;

    // Get organizations for this user
    const userMembers = await db.query.member.findMany({
      where: eq(member.userId, id),
      with: {
        organization: true,
      },
    });

    return {
      ...userRecord,
      members: userMembers,
    };
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return null;
  }
}

export async function getUserStats() {
  try {
    const totalUsers = await db.select({ count: count() }).from(user);
    const activeUsers = await db
      .select({ count: count() })
      .from(user)
      .where(eq(user.emailVerified, true));
    const inactiveUsers = await db
      .select({ count: count() })
      .from(user)
      .where(eq(user.emailVerified, false));

    // Get users created in the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const newUsersToday = await db
      .select({ count: count() })
      .from(user)
      .where(gte(user.createdAt, oneDayAgo));

    return {
      total: totalUsers[0]?.count || 0,
      active: activeUsers[0]?.count || 0,
      inactive: inactiveUsers[0]?.count || 0,
      newToday: newUsersToday[0]?.count || 0,
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return {
      total: 0,
      active: 0,
      inactive: 0,
      newToday: 0,
    };
  }
}
