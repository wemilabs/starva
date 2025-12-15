import {
  lastLoginMethodClient,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
  baseURL:
    (process.env.NEXT_PUBLIC_APP_URL as string) ?? "http://localhost:3000",
  plugins: [lastLoginMethodClient(), organizationClient()],
});

export const {
  signIn,
  signOut,
  requestPasswordReset,
  resetPassword,
  getSession,
  useSession,
  getLastUsedLoginMethod,
  useActiveOrganization,
  useListOrganizations,
  organization,
  deleteUser,
} = authClient;
