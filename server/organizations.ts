"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const getOrganizationDetails = async (organizationId: string) =>
  await auth.api.getFullOrganization({
    query: { organizationId },
    headers: await headers(),
  });

export const getCurrentMetadata = async (organizationId: string) => {
  const currentBusiness = await getOrganizationDetails(organizationId);

  return currentBusiness?.metadata
    ? typeof currentBusiness.metadata === "string"
      ? JSON.parse(currentBusiness.metadata)
      : currentBusiness.metadata
    : {};
};
