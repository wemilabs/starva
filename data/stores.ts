import { eq, inArray } from "drizzle-orm";
import { cacheLife } from "next/cache";
import { cache } from "react";
import { db } from "@/db/drizzle";
import { member, organization } from "@/db/schema";
import { getCurrentUser } from "@/server/users";
import "server-only";

export const getAllStores = cache(async () => {
  "use cache";
  cacheLife("minutes");

  try {
    const stores = await db.query.organization.findMany({
      orderBy: (organization, { desc }) => [desc(organization.createdAt)],
    });
    return stores;
  } catch (error: unknown) {
    const e = error as Error;
    console.error(e.message);
    return null;
  }
});

export async function getStoresPerUser() {
  const { currentUser } = await getCurrentUser();

  const members = await db.query.member.findMany({
    where: eq(member.userId, currentUser.id),
  });

  const stores = await db.query.organization.findMany({
    where: inArray(
      organization.id,
      members.map((member) => member.organizationId)
    ),
    orderBy: (organization, { desc }) => [desc(organization.createdAt)],
  });

  return stores;
}

export async function getActiveStore(userId: string) {
  const memberUser = await db.query.member.findFirst({
    where: eq(member.userId, userId),
  });

  if (!memberUser) {
    return null;
  }

  const activeStore = await db.query.organization.findFirst({
    where: eq(organization.id, memberUser.organizationId),
  });

  return activeStore;
}

export async function getStoreBySlug(slug: string) {
  "use cache";
  cacheLife("minutes");

  try {
    const storeBySlug = await db.query.organization.findFirst({
      where: eq(organization.slug, slug),
      with: {
        members: {
          with: {
            user: true,
          },
        },
      },
    });

    return storeBySlug;
  } catch (error) {
    console.error(error);
    return null;
  }
}
