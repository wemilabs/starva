import { eq, inArray } from "drizzle-orm";
import { cacheLife } from "next/cache";
import { cache } from "react";
import { db } from "@/db/drizzle";
import { member, organization } from "@/db/schema";
import { getCurrentUser } from "@/server/users";
import "server-only";

export const getAllBusinesses = cache(async () => {
  "use cache";
  cacheLife("minutes");

  try {
    const businesses = await db.query.organization.findMany({
      orderBy: (organization, { desc }) => [desc(organization.createdAt)],
    });
    return businesses;
  } catch (error: unknown) {
    const e = error as Error;
    console.error(e.message);
    return null;
  }
});

export async function getBusinessesPerUser() {
  const { currentUser } = await getCurrentUser();

  const members = await db.query.member.findMany({
    where: eq(member.userId, currentUser.id),
  });

  const businesses = await db.query.organization.findMany({
    where: inArray(
      organization.id,
      members.map((member) => member.organizationId)
    ),
    orderBy: (organization, { desc }) => [desc(organization.createdAt)],
  });

  return businesses;
}

export async function getActiveBusiness(userId: string) {
  const memberUser = await db.query.member.findFirst({
    where: eq(member.userId, userId),
  });

  if (!memberUser) {
    return null;
  }

  const activeBusiness = await db.query.organization.findFirst({
    where: eq(organization.id, memberUser.organizationId),
  });

  return activeBusiness;
}

export async function getBusinessBySlug(slug: string) {
  "use cache";
  cacheLife("minutes");

  try {
    const businessBySlug = await db.query.organization.findFirst({
      where: eq(organization.slug, slug),
      with: {
        members: {
          with: {
            user: true,
          },
        },
      },
    });

    return businessBySlug;
  } catch (error) {
    console.error(error);
    return null;
  }
}
