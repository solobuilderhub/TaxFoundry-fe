import { getCookieCache } from "better-auth/cookies";
import { headers } from "next/headers";

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
export async function getServerSession(): Promise<SessionResult> {
	try {
		const requestHeaders = await headers();
		const cached = await getCookieCache(requestHeaders, {
			secret: AUTH_SECRET,
		});
		// The cookie cache revives dates as `Date`; the backend serves them as
		// strings. Both are the same session — only the wire format differs.
		if (cached) return cached as unknown as Session;
	} catch {
		// Cache decryption failed — fall through to backend validation
	}

	return getSession();
}

/**
 * "We could not ask" — distinct from "there is no session".
 *
 * The session check used to collapse every failure into `null`: a 500 from the
 * API, a deploy, a cold start, a timeout, a DNS blip between the Next server
 * and the backend all produced the same answer as a genuinely signed-out user.
 * `DashboardLayout` redirects on `null`, so any of those signed the preparer
 * out mid-return.
 *
 * That matches what a benchmark session reported precisely: dropped to
 * /sign-in nine or more times over 5.5 hours, no "session expired" notice, and
 * **saved work always still there** — because the session had never actually
 * expired. Only the check had failed, and it happened after the 5-minute
 * cookie cache lapsed, which is why it recurred rather than happening once.
 *
 * Signing someone out is a destructive act and it should need evidence. A 401
 * is evidence. A network error is the absence of evidence.
 */
export const SESSION_UNAVAILABLE = Symbol("session-unavailable");
export type SessionResult = Session | null | typeof SESSION_UNAVAILABLE;

/**
 * Get fully validated session from the backend — slower but authoritative.
 * Use in Server Actions where you need guaranteed-fresh session data.
 *
 * Returns `null` only when the backend AUTHORITATIVELY says there is no
 * session; `SESSION_UNAVAILABLE` when it could not be reached or answered with
 * a server error. One retry first, because the common case is a single cold
 * start or a redeploy rather than a sustained outage.
 */
export async function getSession(): Promise<SessionResult> {
	const reqHeaders = await headers();
	const cookie = reqHeaders.get("cookie");
	// No cookie at all IS authoritative — there is nothing to validate.
	if (!cookie) return null;

	for (let attempt = 0; attempt < 2; attempt += 1) {
		try {
			const res = await fetch(`${BACKEND_URL}/api/auth/get-session`, {
				headers: { cookie },
				cache: "no-store",
			});

			// The backend answered about the session itself.
			if (res.status === 401 || res.status === 403) return null;
			if (res.ok) {
				// A 200 with an empty body is better-auth's "no session".
				const text = await res.text();
				if (!text) return null;
				try {
					return JSON.parse(text) as Session;
				} catch {
					// A 200 that is not a session is the backend malfunctioning, not a
					// signed-out user.
					return SESSION_UNAVAILABLE;
				}
			}
			// 5xx and anything else: the backend did not answer the question.
			if (attempt === 1) return SESSION_UNAVAILABLE;
		} catch {
			// Network-level failure — same reasoning.
			if (attempt === 1) return SESSION_UNAVAILABLE;
		}
	}
	return SESSION_UNAVAILABLE;
}
