import { redirect } from "next/navigation";
import type { ComponentProps, ReactNode } from "react";
import { getServerSession } from "@/app/(auth)/_lib/server";
import { DashboardShell } from "./components/dashboard-shell";

/**
 * Authenticated dashboard root. Server-guards the whole subtree: no session →
 * redirect to /sign-in. The validated session is handed to the client shell to
 * seed OrganizationProvider (so the first paint already knows the user + org).
 */
export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession();
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
