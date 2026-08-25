"use client";

import { Suspense, type ReactNode } from "react";
import { DashboardLayout } from "@classytic/fluid/dashboard/client";
import { ModeToggle } from "@classytic/fluid/client/theme";
import { OrganizationProvider, useOrganization } from "@/contexts/OrganizationContext";
import { useSidebarConfig } from "../_nav/sidebar-config";
import { NoOrganization } from "./no-organization";

// A raw 24-hex Mongo id makes an ugly breadcrumb crumb; label it by its parent
// segment ("engagements/<id>" → "Engagement") instead of showing the hex.
const OBJECT_ID = /^[a-f0-9]{24}$/i;
const SEGMENT_LABEL: Record<string, string> = {
  engagements: "Engagement",
  clients: "Client",
  reviews: "Review",
};

function resolveSegment(
  segment: string,
  { index, segments }: { index: number; segments: string[]; pathname: string },
): string | undefined {
  if (OBJECT_ID.test(segment)) {
    return SEGMENT_LABEL[segments[index - 1] ?? ""] ?? "Detail";
  }
  return undefined; // fall back to the default title-cased label
}

/**
 * Gate the dashboard on the user belonging to a firm.
 *
 * Only once the org list has actually loaded — `organizations` is `[]` while it
 * is still in flight, so gating on the array alone would flash "set up your
 * firm" at every user on every load.
 */
function OrgGate({ children }: { children: ReactNode }) {
  const { organizations, isLoading } = useOrganization();

  if (isLoading) return <div className="min-h-dvh" />;
  if (organizations.length === 0) return <NoOrganization />;
  return <>{children}</>;
}

function Shell({ children }: { children: ReactNode }) {
  const sidebar = useSidebarConfig();

  return (
    // DashboardLayout reads URL state via useSearchParams — wrap in Suspense so
    // the shell prerenders and the search-param parts hydrate on the client.
    <Suspense fallback={<div className="min-h-dvh" />}>
      <DashboardLayout
        sidebar={sidebar}
        breadcrumbs={{ basePath: "/dashboard", baseLabel: "Dashboard", resolveSegment }}
        headerRight={<ModeToggle />}
      >
        {children}
      </DashboardLayout>
    </Suspense>
  );
}

/**
 * Client shell for the authenticated dashboard. `serverSession` (from the async
 * server layout) seeds OrganizationProvider so user/org data is available on the
 * first paint; better-auth's `useSession` keeps it live thereafter. The active
 * org id it tracks is what arc-next's `configureAuth({ getOrgId })` reads.
 */
export function DashboardShell({
  children,
  // boundary between the async Server Component layout and client context —
  // the session shape is better-auth's; passed straight through to the provider.
  serverSession,
}: {
  children: ReactNode;
  serverSession: React.ComponentProps<typeof OrganizationProvider>["serverSession"];
}) {
  return (
    <OrganizationProvider serverSession={serverSession}>
      <OrgGate>
        <Shell>{children}</Shell>
      </OrgGate>
    </OrganizationProvider>
  );
}
