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
  formData: FormData,
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
  name: string,
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
  description: string,
) {
  const trimmedDescription = description.trim();

  await auth.api.updateOrganization({
    body: {
      organizationId: businessId,
      data: {
        metadata: {
          description: trimmedDescription,
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
