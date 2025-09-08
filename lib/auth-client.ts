import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
  baseURL:
    (process.env.NEXT_PUBLIC_BASE_URL as string) ?? "http://localhost:3000",
});

export const {
  signIn,
  signOut,
  forgetPassword,
  resetPassword,
  getSession,
  useSession,
} = authClient;
