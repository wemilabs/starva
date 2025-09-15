import {
  inferOrgAdditionalFields,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "@/lib/auth";

const authClient = createAuthClient({
  baseURL:
    (process.env.NEXT_PUBLIC_BASE_URL as string) ?? "http://localhost:3000",
  plugins: [
    organizationClient({
      schema: inferOrgAdditionalFields<typeof auth>(),
    }),
  ],
});

export const {
  signIn,
  signOut,
  forgetPassword,
  resetPassword,
  getSession,
  useSession,
  useActiveOrganization,
  useListOrganizations,
  organization,
} = authClient;
