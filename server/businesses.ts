"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { organization } from "@/db/schema";

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
