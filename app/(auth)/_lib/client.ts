import { createAuthClient } from "better-auth/react";
import { organizationClient, adminClient } from "better-auth/client/plugins";
import { ac, admin, staff, member } from "./access-control";

/**
 * Better Auth client — calls the backend directly.
 *
 * In production both domains share `.fajr.capital` so cross-subdomain
 * cookies work natively (COOKIE_DOMAIN=.fajr.capital on the backend).
 * No proxy needed.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8040",
  fetchOptions: {
    credentials: "include",
  },
  plugins: [
    adminClient(),
    organizationClient({
      ac,
      roles: { admin, staff, member },
    }),
  ],
});

export const {
  useSession,
  signIn,
  signUp,
  signOut,
  useActiveOrganization,
  useListOrganizations,
  useActiveMember,
} = authClient;
