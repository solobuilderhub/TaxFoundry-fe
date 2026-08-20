import { headers } from "next/headers";
import { getCookieCache } from "better-auth/cookies";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8040";

const AUTH_SECRET = process.env.BETTER_AUTH_SECRET!;

export type Session = {
  session: {
    id: string;
    userId: string;
    expiresAt: string;
    token: string;
    createdAt: string;
    updatedAt: string;
    ipAddress?: string;
    userAgent?: string;
    activeOrganizationId?: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
    createdAt: string;
    updatedAt: string;
    roles?: string[];
    role?: string;
    banned?: boolean;
    banReason?: string | null;
    banExpires?: number | null;
  };
};

/**
 * Get session for Server Components — fast with automatic fallback.
 *
 * 1. Tries cookie cache first (instant, no network, 5-min maxAge).
 * 2. Falls back to getSession() if cache expired (7-day actual session).
 */
export async function getServerSession() {
  try {
    const requestHeaders = await headers();
    const cached = await getCookieCache(requestHeaders, {
      secret: AUTH_SECRET,
    });
    if (cached) return cached;
  } catch {
    // Cache decryption failed — fall through to backend validation
  }

  return getSession();
}

/**
 * Get fully validated session from the backend — slower but authoritative.
 * Use in Server Actions where you need guaranteed-fresh session data.
 */
export async function getSession(): Promise<Session | null> {
  try {
    const reqHeaders = await headers();
    const cookie = reqHeaders.get("cookie");
    if (!cookie) return null;

    const res = await fetch(`${BACKEND_URL}/api/auth/get-session`, {
      headers: { cookie },
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
