"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/data/user-session";
import {
  getAllUsers,
  getUserById,
  getUserStats,
  type UserOptions,
} from "@/data/users";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { auth } from "@/lib/auth";
import { createSubscription, getUserSubscription } from "@/server/subscription";

export async function signInUser(email: string, password: string) {
  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session?.user?.id) {
      const existingSubscription = await getUserSubscription(session.user.id);

      if (!existingSubscription)
        await createSubscription(session.user.id, "Hobby");
    }

    return { success: true, message: "User signed in successfully" };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("signInUser failed", { err });
    return { success: false, message: err.message };
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

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session?.user?.id) await createSubscription(session.user.id, "Hobby");

    return { success: true, message: "User signed up successfully" };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("signUpUser failed", { err });
    return { success: false, message: err.message };
  }
}

export async function ensureUserHasFreeSubscription(userId: string) {
  const existingSubscription = await getUserSubscription(userId);

  if (!existingSubscription) await createSubscription(userId, "Hobby");

  return existingSubscription;
}

export const getCurrentUser = async () => {
  const result = await verifySession();

  if (!result.success) redirect("/sign-in");

  const currentUser = await db.query.user.findFirst({
    where: eq(user.id, result.session.user.id),
  });

  if (!currentUser) redirect("/sign-in");

  await ensureUserHasFreeSubscription(result.session.user.id);

  return {
    ...result.session,
    currentUser,
  };
};

// Admin-only actions
export async function getAllUsersAdmin(options: UserOptions) {
  await requireAdmin();
  return await getAllUsers(options);
}

export async function getUserByIdAdmin(id: string) {
  await requireAdmin();
  return await getUserById(id);
}

export async function getUserStatsAdmin() {
  await requireAdmin();
  return await getUserStats();
}

export async function updateUserAdmin(
  userId: string,
  data: { name?: string; emailVerified?: boolean }
) {
  await requireAdmin();

  try {
    await db
      .update(user)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(user.id, userId));

    return { success: true, message: "User updated successfully" };
  } catch (error) {
    console.error("Failed to update user:", error);
    return { success: false, message: "Failed to update user" };
  }
}

export async function deleteUserAdmin(userId: string) {
  await requireAdmin();

  try {
    await auth.api.removeUser({
      body: { userId },
    });

    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    console.error("Failed to delete user:", error);
    return { success: false, message: "Failed to delete user" };
  }
}

export async function banUserAdmin(userId: string) {
  await requireAdmin();

  try {
    await auth.api.banUser({
      body: { userId },
    });

    return { success: true, message: "User banned successfully" };
  } catch (error) {
    console.error("Failed to ban user:", error);
    return { success: false, message: "Failed to ban user" };
  }
}

export async function unbanUserAdmin(userId: string) {
  await requireAdmin();

  try {
    await auth.api.unbanUser({
      body: { userId },
    });

    return { success: true, message: "User unbanned successfully" };
  } catch (error) {
    console.error("Failed to unban user:", error);
    return { success: false, message: "Failed to unban user" };
  }
}

export async function createUserAdmin(data: {
  email: string;
  name: string;
  password: string;
  emailVerified?: boolean;
}) {
  await requireAdmin();

  try {
    await auth.api.createUser({
      body: {
        email: data.email,
        name: data.name,
        password: data.password,
        data: { emailVerified: data.emailVerified ?? false },
      },
    });

    const newUser = await db.query.user.findFirst({
      where: eq(user.email, data.email),
    });

    if (newUser) await createSubscription(newUser.id, "Hobby");

    return { success: true, message: "User created successfully" };
  } catch (error) {
    console.error("Failed to create user:", error);
    return { success: false, message: "Failed to create user" };
  }
}
