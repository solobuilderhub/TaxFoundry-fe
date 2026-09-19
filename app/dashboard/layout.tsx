import { redirect } from "next/navigation";
import type { ComponentProps, ReactNode } from "react";
import {
	getServerSession,
	SESSION_UNAVAILABLE,
} from "@/app/(auth)/_lib/server";
import { DashboardShell } from "./components/dashboard-shell";

/**
 * Authenticated dashboard root. Server-guards the whole subtree: no session →
 * redirect to /sign-in. The validated session is handed to the client shell to
 * seed OrganizationProvider (so the first paint already knows the user + org).
 *
 * "No session" and "could not ask" are handled differently, and the difference
 * is the whole point. This used to redirect on either, so a 500 from the API,
 * a redeploy or a network blip signed the preparer out mid-return — a
 * benchmark session hit it nine or more times in an afternoon, every time with
 * their work still saved, because the session had never actually expired.
 *
 * Signing someone out is destructive and needs evidence. A 401 is evidence; an
 * unreachable backend is the absence of it. The dashboard is still NOT
 * rendered without a session — the unavailable case gets an error instead, so
 * nothing is shown that should not be.
 */
export default async function DashboardLayout({
	children,
}: {
	children: ReactNode;
}) {
	const session = await getServerSession();
	if (session === SESSION_UNAVAILABLE) {
		return (
			<main className="mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center gap-3 p-8 text-center">
				<h1 className="text-lg font-semibold">Can&rsquo;t reach the server</h1>
				<p className="text-sm text-muted-foreground">
					You are still signed in and nothing has been lost. The app could not
					confirm your session just now — refresh in a moment.
				</p>
			</main>
		);
	}
	if (!session) redirect("/sign-in");

	return (
		<DashboardShell
			serverSession={
				session as ComponentProps<typeof DashboardShell>["serverSession"]
			}
		>
			{children}
		</DashboardShell>
	);
}
