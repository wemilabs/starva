import "server-only";
import { eq, inArray, not } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { member, user } from "@/db/schema";

export const getUsers = async (organizationId: string) => {
  try {
    const members = await db.query.member.findMany({
      where: eq(member.organizationId, organizationId),
    });

    const users = await db.query.user.findMany({
      where: not(
        inArray(
          user.id,
          members.map((member) => member.userId)
        )
      ),
    });

    return users;
  } catch (error) {
    console.error(error);
    return [];
  }
};
