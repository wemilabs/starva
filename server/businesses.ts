"use server";

import { eq, inArray } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { member, organization } from "@/db/schema";
import { getCurrentUser } from "./users";

export async function getBusinesses() {
  const { currentUser } = await getCurrentUser();

  const members = await db.query.member.findMany({
    where: eq(member.userId, currentUser.id),
  });

  const businesses = await db.query.organization.findMany({
    where: inArray(
      organization.id,
      members.map((member) => member.organizationId)
    ),
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
