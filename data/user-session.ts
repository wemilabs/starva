import { headers } from "next/headers";
import { connection } from "next/server";
import "server-only";
import { auth } from "@/lib/auth";

export async function verifySession() {
  await connection();
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id)
    return { success: false, message: "User not found. Unauthorized access." };

  return { success: true, session } as const;
}
