"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { createSubscription } from "@/server/subscription";

export async function signInUser(email: string, password: string) {
  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    // Get the session after signin to check subscription
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session?.user?.id) {
      // Check if user already has a subscription
      const { getUserSubscription } = await import("@/server/subscription");
      const existingSubscription = await getUserSubscription(session.user.id);

      if (!existingSubscription) {
        // Automatically create free subscription for users without one
        await createSubscription(session.user.id, "Free");
      }
    }

    return { success: true, message: "User signed in successfully" };
  } catch (error: unknown) {
    console.error("signInUser failed", { error });
    return { success: false, message: "User sign in failed" };
  }
}

export async function signUpUser(
  email: string,
  password: string,
  name: string
) {
  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    // Get the session after signup to get user ID
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session?.user?.id) {
      // Automatically create free subscription
      await createSubscription(session.user.id, "Free");
    }

    return { success: true, message: "User signed up successfully" };
  } catch (error: unknown) {
    console.error("signUpUser failed", { error });
    return { success: false, message: "User sign up failed" };
  }
}

export async function ensureUserHasFreeSubscription(userId: string) {
  const { getUserSubscription } = await import("@/server/subscription");
  const existingSubscription = await getUserSubscription(userId);

  if (!existingSubscription) {
    await createSubscription(userId, "Free");
  }

  return existingSubscription;
}

export const getCurrentUser = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const currentUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });

  if (!currentUser) {
    redirect("/sign-in");
  }

  // Ensure user has a free subscription
  await ensureUserHasFreeSubscription(session.user.id);

  return {
    ...session,
    currentUser,
  };
};
