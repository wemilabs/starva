"use server";

import { auth } from "@/lib/auth";

export async function signInUser(email: string, password: string) {
  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

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

    return { success: true, message: "User signed up successfully" };
  } catch (error: unknown) {
    console.error("signUpUser failed", { error });
    return { success: false, message: "User sign up failed" };
  }
}
