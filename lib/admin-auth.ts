import { redirect } from "next/navigation";
import { verifySession } from "@/data/user-session";

export async function requireAdmin() {
  const result = await verifySession();

  if (!result.success) {
    redirect("/sign-in");
  }

  const { session } = result;
  const userRole = (session.user as { role?: string }).role;

  if (userRole !== "admin") {
    redirect("/unauthorized");
  }

  return session;
}
