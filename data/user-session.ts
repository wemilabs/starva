import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connection } from "next/server";

export async function verifySession() {
  await connection();
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id)
    return { success: false, message: "User not found. Unauthorized access." };

  return { success: true, session } as const;
}
