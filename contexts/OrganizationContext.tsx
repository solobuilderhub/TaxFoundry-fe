"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  authClient,
  useSession,
  useListOrganizations,
  useActiveMember,
} from "@/app/(auth)/_lib/client";
import { ACTIVE_ORG_KEY as STORAGE_KEY } from "@/app/(auth)/_lib/utils";

// ============================================================================
// Types
// ============================================================================

interface Organization {
  organizationId: string;
  organizationName: string;
  roles?: string[];
  status?: string;
}

interface SessionUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  roles?: string[];
}

interface OrganizationContextValue {
  /** Current user — available immediately from server session (no loading) */
  user: SessionUser | null;
  organizations: Organization[];
  activeOrg: Organization | undefined;
  /** Current user's primary role in the active org (first role — for display) */
  currentRole: string | undefined;
  /** All roles the user has in the active org (supports multi-role) */
  roles: string[];
  /** Whether the user has admin role in the active org */
  isAdmin: boolean;
  /** Active org's status (pending, active, suspended) */
  orgStatus: string | undefined;
  /** Whether the active org has 'active' status */
  isOrgActive: boolean;
  isLoading: boolean;
  switchOrganization: (orgId: string) => void;
}

// ============================================================================
// Context
// ============================================================================

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

// Module-level bridge: allows configureAuth to read the active org ID
// without being inside a React component tree.
let _activeOrgId: string | null = null;

/** Getter for configureAuth — returns the current active org ID */
export function getActiveOrgId(): string | null {
  return _activeOrgId;
}

// ============================================================================
// Provider
// ============================================================================

interface ServerSession {
  session: Record<string, unknown>;
  user: SessionUser;
  updatedAt?: number;
}

/**
 * OrganizationProvider — manages org context + session.
 *
 * Accepts `serverSession` from the async Server Component layout, so user data
 * is available immediately on first render (no loading spinner for session).
 *
 * BA's `useSession()` still fires in the background for reactivity — when it
 * resolves, it takes over. This means:
 * - First render: `user` comes from serverSession (instant)
 * - After hydration: `user` comes from BA signal (reactive, auto-refreshes)
 *
 * Org data (list, active org) always comes from BA client signals —
 * this data isn't in the cookie cache and must be fetched from the backend.
 */
export function OrganizationProvider({
  children,
  serverSession,
}: {
  children: React.ReactNode;
  serverSession?: ServerSession | null;
}) {
  const { data: clientSession } = useSession();
  const { data: orgList, isPending: listLoading } = useListOrganizations();
  // Standard better-auth reactive hook — fires when activeOrganizationId on
  // the session changes, shares cache across components, and cancels in-flight
  // requests on session invalidation. Replaces a hand-rolled useEffect that
  // ran getActiveMember() manually and leaked retries on auth failures.
  const { data: activeMemberData, isPending: memberLoading } = useActiveMember();
  const [restored, setRestored] = useState(false);

  // Merge session: client (reactive) takes priority, server (instant) is fallback
  const effectiveSession = clientSession || serverSession;

  const user = useMemo<SessionUser | null>(() => {
    if (!effectiveSession?.user) return null;
    const u = effectiveSession.user as SessionUser;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      emailVerified: u.emailVerified,
      image: u.image,
      roles: u.roles,
    };
  }, [effectiveSession]);

  // Active org ID from session — available immediately
  const activeOrgId = useMemo(() => {
    const session = effectiveSession?.session as { activeOrganizationId?: string } | undefined;
    return session?.activeOrganizationId;
  }, [effectiveSession]);

  // Keep module-level bridge in sync with active org
  useEffect(() => {
    _activeOrgId = activeOrgId ?? null;
  }, [activeOrgId]);

  // Extract current user's roles from activeMember data.
  // BA stores multiple roles as comma-separated string: "admin,member"
  const memberRoles = useMemo(() => {
    if (!activeMemberData) return undefined;
    const m = activeMemberData as { role?: string };
    if (!m.role) return undefined;
    return m.role.split(",").map((r) => r.trim()).filter(Boolean);
  }, [activeMemberData]);

  const organizations: Organization[] = useMemo(() => {
    if (!orgList) return [];
    return (orgList as { id: string; name: string; status?: string }[]).map((org) => ({
      organizationId: org.id,
      organizationName: org.name,
      status: (org as any).status || 'active',
      ...(org.id === activeOrgId && memberRoles ? { roles: memberRoles } : {}),
    }));
  }, [orgList, activeOrgId, memberRoles]);

  // Derive active org from session + org list
  const activeOrg = useMemo(() => {
    if (!activeOrgId) return undefined;
    const org = organizations.find((o) => o.organizationId === activeOrgId);
    if (!org) return undefined;
    return {
      organizationId: org.organizationId,
      organizationName: org.organizationName,
      status: org.status,
      roles: memberRoles,
    };
  }, [activeOrgId, organizations, memberRoles]);

  const switchOrganization = useCallback((orgId: string) => {
    authClient.organization.setActive({ organizationId: orgId });
    try {
      localStorage.setItem(STORAGE_KEY, orgId);
    } catch {}
  }, []);

  // Only wait on member data when there's actually an active org to fetch
  // for — otherwise useActiveMember can stay `isPending: true` indefinitely
  // and gate the UI forever.
  const effectiveMemberLoading = activeOrgId ? memberLoading : false;

  // Restore last active org on mount.
  useEffect(() => {
    if (restored || listLoading || effectiveMemberLoading) return;
    setRestored(true);

    // The org list has loaded (listLoading is false here). With no orgs there's
    // nothing to validate/select — leave whatever the session has.
    if (organizations.length === 0) return;

    // (a) Trust the session's active org ONLY if the user is actually a member
    // of it (it's in their loaded list). A DANGLING `activeOrganizationId` — the
    // user left the org, the org was deleted, or the signed 5-min session cookie
    // cache is serving an org pointer that outlived the membership — makes
    // `get-active-member` 404 with MEMBER_NOT_FOUND and hangs the app on a
    // half-loaded org. When it's stale, treat it as unset and fall through to
    // re-selection so the UI self-heals instead of getting stuck.
    const activeIsMemberOrg =
      !!activeOrgId &&
      organizations.some((o) => o.organizationId === activeOrgId);

    if (activeIsMemberOrg) {
      try {
        localStorage.setItem(STORAGE_KEY, activeOrgId as string);
      } catch {}
      return;
    }

    // Stale/dangling active org → drop the dead localStorage hint before falling
    // through (so we don't immediately re-select the same invalid org below).
    if (activeOrgId) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }

    // (b) Restore from localStorage if the saved org is still a membership.
    try {
      const savedId = localStorage.getItem(STORAGE_KEY);
      if (savedId && organizations.find((o) => o.organizationId === savedId)) {
        authClient.organization.setActive({ organizationId: savedId });
        return;
      }
    } catch {}

    // (c) Single org — auto-select without asking. This also overwrites a stale
    // session pointer with the one valid org, clearing the MEMBER_NOT_FOUND.
    if (organizations.length === 1) {
      authClient.organization.setActive({
        organizationId: organizations[0].organizationId,
      });
      return;
    }

    // Multiple orgs, no valid preference — leave activeOrg unresolved so
    // AuthGate shows the org selector (picking one calls setActive, which
    // overwrites the stale pointer).
  }, [restored, listLoading, effectiveMemberLoading, activeOrgId, organizations]);

  const roles = activeOrg?.roles ?? [];
  const currentRole = roles[0];
  const isAdmin = roles.includes("admin");
  const orgStatus = activeOrg?.status;
  const isOrgActive = !orgStatus || orgStatus === "active";

  const value = useMemo<OrganizationContextValue>(
    () => ({
      user,
      organizations,
      activeOrg,
      currentRole,
      roles,
      isAdmin,
      orgStatus,
      isOrgActive,
      isLoading: listLoading || effectiveMemberLoading,
      switchOrganization,
    }),
    [user, organizations, activeOrg, currentRole, roles, isAdmin, orgStatus, isOrgActive, listLoading, effectiveMemberLoading, switchOrganization],
  );

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

// ============================================================================
// Hooks
// ============================================================================

export function useOrganization() {
  const ctx = useContext(OrganizationContext);
  if (!ctx) {
    throw new Error(
      "useOrganization must be used within an OrganizationProvider",
    );
  }
  return ctx;
}

/** Convenience hook — returns just the active org ID */
export function useOrganizationId(): string | undefined {
  const { activeOrg } = useOrganization();
  return activeOrg?.organizationId;
}
