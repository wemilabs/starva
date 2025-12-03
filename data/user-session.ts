import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import "server-only";

type SessionResult =
  | { success: false; message: string; session?: never }
  | {
      success: true;
      session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;
    };

export async function verifySession(): Promise<SessionResult> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return {
      success: false,
      message: "User not found. Unauthorized access.",
    };
  }

  return { success: true, session };
}
