"use client";

import { authClient } from "./client";
import { ACTIVE_ORG_KEY } from "./utils";

/**
 * Creating the firm a user works inside.
 *
 * ── Why this is part of signing up, not a later step ────────────────────────
 *
 * Every resource in the product is org-scoped — the client, engagement and
 * workpaper models all carry `organizationId` and are mounted behind
 * `flexibleMultiTenantPreset({ tenantField: 'organizationId' })`. A signed-in
 * user with no organization therefore has nothing to read and nothing the
 * server will accept a write for: the dashboard renders, and every action on it
 * fails. So an account without a firm is not a partial account, it is an
 * unusable one, and the two are created together.
 *
 * This lives in `_lib` rather than in the sign-up page because the dashboard
 * needs it too — see `no-organization.tsx`. Anyone who ends up without a firm
 * (an account created straight against the API, a firm creation that failed
 * after the account was made) can create one instead of being stuck.
 */

/**
 * A URL-safe slug for a firm name. Better Auth requires one and enforces that
 * it is unique across all organizations, so `createFirm` handles collisions
 * rather than the caller.
 */
export function slugifyFirm(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
  // A name of nothing but punctuation ("&&&") slugifies to an empty string,
  // which Better Auth rejects. Fall back rather than surfacing a validation
  // error for a name the user is entitled to use.
  return slug || "firm";
}

/** Four random characters, to disambiguate a slug someone else already holds. */
const suffix = () => Math.random().toString(36).slice(2, 6);

export interface CreatedFirm {
  id: string;
  name: string;
}

/**
 * Create an organization and make it the active one.
 *
 * Two firms may legitimately share a name — "Smith & Co" in Calgary and in
 * Halifax are different practices — but only one can hold the slug. A taken
 * slug is retried with a random suffix rather than refused, because the name
 * the user typed is not the thing in conflict and asking them to change it
 * would be asking them to solve our uniqueness problem.
 *
 * @throws Error with a message fit to show the user.
 */
export async function createFirm(name: string): Promise<CreatedFirm> {
  const base = slugifyFirm(name);

  let created = await authClient.organization.create({ name, slug: base });
  if (created.error) {
    created = await authClient.organization.create({
      name,
      slug: `${base}-${suffix()}`,
    });
  }
  if (created.error || !created.data) {
    throw new Error(created.error?.message ?? "Could not create the firm");
  }

  const id = (created.data as { id: string }).id;

  // Set it active explicitly. Creation does not reliably leave the new
  // organization selected, and an unselected org is indistinguishable from
  // having none — `getActiveOrgId()` feeds every API call's org scope.
  await authClient.organization.setActive({ organizationId: id });
  try {
    localStorage.setItem(ACTIVE_ORG_KEY, id);
  } catch {}

  return { id, name };
}
