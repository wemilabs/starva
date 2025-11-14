"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db/drizzle";
import { organization } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function updateBusinessLogo(
  businessId: string,
  resolvedSlug: string,
  formData: FormData
) {
  const logoUrl = String(formData.get("logoUrl") || "").trim();
  if (!logoUrl) return;

  await db
    .update(organization)
    .set({ logo: logoUrl })
    .where(eq(organization.id, businessId));

  revalidatePath(`/businesses/${resolvedSlug}`);
}

export async function updateBusinessName(
  businessId: string,
  businessSlug: string,
  name: string
) {
  const trimmedName = name.trim();
  if (!trimmedName) return;

  await auth.api.updateOrganization({
    body: {
      organizationId: businessId,
      data: {
        name: trimmedName,
      },
    },
    headers: await headers(),
  });

  revalidatePath(`/businesses/${businessSlug}`);
}

export async function updateBusinessDescription(
  businessId: string,
  businessSlug: string,
  description: string
) {
  const trimmedDescription = description.trim();

  const currentBusiness = await auth.api.getFullOrganization({
    query: {
      organizationId: businessId,
    },
    headers: await headers(),
  });

  const currentMetadata = currentBusiness?.metadata
    ? typeof currentBusiness.metadata === "string"
      ? JSON.parse(currentBusiness.metadata)
      : currentBusiness.metadata
    : {};

  await auth.api.updateOrganization({
    body: {
      organizationId: businessId,
      data: {
        metadata: {
          ...currentMetadata,
          description: trimmedDescription,
        },
      },
    },
    headers: await headers(),
  });

  revalidatePath(`/businesses/${businessSlug}`);
}

export async function updateBusinessPhone(
  businessId: string,
  businessSlug: string,
  phoneType: "notifications" | "payments",
  phoneNumber: string
) {
  const trimmedPhone = phoneNumber.trim();

  const currentBusiness = await auth.api.getFullOrganization({
    query: {
      organizationId: businessId,
    },
    headers: await headers(),
  });

  const currentMetadata = currentBusiness?.metadata
    ? typeof currentBusiness.metadata === "string"
      ? JSON.parse(currentBusiness.metadata)
      : currentBusiness.metadata
    : {};

  const updatedMetadata = {
    ...currentMetadata,
    ...(phoneType === "notifications"
      ? { phoneForNotifications: trimmedPhone }
      : { phoneForPayments: trimmedPhone }),
  };

  await auth.api.updateOrganization({
    body: {
      organizationId: businessId,
      data: {
        metadata: updatedMetadata,
      },
    },
    headers: await headers(),
  });

  revalidatePath(`/businesses/${businessSlug}`);
}

export async function updateBusinessTimetable(
  businessId: string,
  businessSlug: string,
  timetable: Record<string, { open: string; close: string; closed: boolean }>
) {
  const currentBusiness = await auth.api.getFullOrganization({
    query: {
      organizationId: businessId,
    },
    headers: await headers(),
  });

  const currentMetadata = currentBusiness?.metadata
    ? typeof currentBusiness.metadata === "string"
      ? JSON.parse(currentBusiness.metadata)
      : currentBusiness.metadata
    : {};

  await auth.api.updateOrganization({
    body: {
      organizationId: businessId,
      data: {
        metadata: {
          ...currentMetadata,
          timetable,
        },
      },
    },
    headers: await headers(),
  });

  revalidatePath(`/businesses/${businessSlug}`);
}

export async function deleteBusiness(businessId: string) {
  await auth.api.deleteOrganization({
    body: {
      organizationId: businessId,
    },
    headers: await headers(),
  });

  revalidatePath("/businesses");
}
