"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { product as productTable } from "@/db/schema";
import { STATUS_VALUES } from "@/lib/constants";

const createProductSchema = z.object({
  organizationId: z.string().min(1),
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(120),
  price: z.string().min(1),
  description: z.string().optional().default(""),
  imageUrl: z.url().optional().or(z.literal("")),
  status: z.enum(STATUS_VALUES),
  revalidateTargetPath: z.string().min(1),
});

export async function createProductAction(
  input: z.infer<typeof createProductSchema>
) {
  const parsed = createProductSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().fieldErrors };
  }

  const {
    organizationId,
    name,
    slug,
    price,
    description,
    imageUrl,
    status,
    revalidateTargetPath,
  } = parsed.data;

  await db.insert(productTable).values({
    name,
    slug,
    description: description || "",
    price: price as unknown as any,
    organizationId,
    imageUrl: imageUrl || null,
    status,
  });

  revalidatePath(revalidateTargetPath);
  return { ok: true };
}
