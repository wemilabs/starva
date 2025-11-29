"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const getOrganizationDetails = async (organizationId: string) =>
  await auth.api.getFullOrganization({
    query: { organizationId },
    headers: await headers(),
  });

export const getCurrentMetadata = async (organizationId: string) => {
  const currentStore = await getOrganizationDetails(organizationId);

  return currentStore?.metadata
    ? typeof currentStore.metadata === "string"
      ? JSON.parse(currentStore.metadata)
      : currentStore.metadata
    : {};
};
