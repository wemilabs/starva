import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import "server-only";

export async function verifySession() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id)
      return {
        success: false,
        message: "User not found. Unauthorized access.",
      };

    return { success: true, session } as const;
  } catch (err) {
    console.error("verifySession failed:", err);
    return { success: false, message: "Session check failed." } as const;
  }
}
