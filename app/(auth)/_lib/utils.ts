/** localStorage key for persisting the active organization across sessions */
export const ACTIVE_ORG_KEY = "fajr:active-org";

/**
 * Validate a redirect target — must be a relative URL to prevent open redirects.
 * Returns `/dashboard` for missing/invalid values.
 */
export function getSafeRedirect(value?: string): string {
  if (!value || !value.startsWith("/")) return "/dashboard";
  return value;
}
