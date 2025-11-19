"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db/drizzle";
import { organization } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getCurrentMetadata } from "./organizations";

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

  const currentMetadata = await getCurrentMetadata(businessId);

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

  const currentMetadata = await getCurrentMetadata(businessId);

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
  const currentMetadata = await getCurrentMetadata(businessId);

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

export async function updateBusinessTimezone(
  _prevState: { success: boolean; error: string | null },
  formData: FormData
) {
  const businessId = formData.get("businessId") as string;
  const businessSlug = formData.get("businessSlug") as string;
  const timezone = formData.get("timezone") as string;

  if (!businessId || !businessSlug || !timezone) {
    return {
      success: false,
      error: "Missing required fields",
    };
  }

  try {
    const currentMetadata = await getCurrentMetadata(businessId);

    await auth.api.updateOrganization({
      body: {
        organizationId: businessId,
        data: {
          metadata: {
            ...currentMetadata,
            timezone,
          },
        },
      },
      headers: await headers(),
    });

    revalidatePath(`/businesses/${businessSlug}`);
    revalidatePath("/settings");

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error("Failed to update timezone:", error);
    return {
      success: false,
      error: "Failed to update timezone. Please try again.",
    };
  }
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
