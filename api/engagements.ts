import { createCrudApi } from "@classytic/arc-next/api";

export const ENGAGEMENT_PROGRAMS = ["T2", "AT1", "CO17"] as const;
export const ENGAGEMENT_STATUSES = [
  "draft",
  "in_progress",
  "ready",
  "filed",
] as const;

export type EngagementProgram = (typeof ENGAGEMENT_PROGRAMS)[number];
export type EngagementStatus = (typeof ENGAGEMENT_STATUSES)[number];

/** One filing engagement: a client + tax year + program (mirrors the server model). */
export interface EngagementYear {
  _id: string;
  clientId: string;
  program: EngagementProgram;
  taxYearStart: string;
  taxYearEnd: string;
  firstReturn?: boolean;
  status: EngagementStatus;
  engineVersion?: string | null;
  /** The working return the preparer edits in the schedule editor. */
  returnInput?: Record<string, unknown> | null;
  /**
   * The engagement this one amends (TRA AT1 Net File EDI071/EDI073), or null
   * for an ordinary filing. Presence IS the amendment flag — validated at
   * Net File preparation time against the same client/program/tax-year-end.
   */
  amendsEngagementYearId?: string | null;
  /** EDI073 — mandatory once amendsEngagementYearId is set. */
  amendmentDescription?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface EngagementInput {
  clientId: string;
  program: EngagementProgram;
  taxYearStart: string;
  taxYearEnd: string;
  firstReturn?: boolean;
  amendsEngagementYearId?: string | null;
  amendmentDescription?: string | null;
}

/** Authorized-signer block required by prepare-netfile / transmit. */
export interface Certification {
  firstName: string;
  lastName: string;
  position: string;
}

/** How the officer authorized. Only the first two permit transmission. */
export const T183_METHODS = [
  { value: "electronic_signature", label: "Electronic signature" },
  { value: "wet_signature", label: "Wet signature" },
  { value: "verbal", label: "Verbal (recorded as a note — does NOT permit filing)" },
  { value: "other", label: "Other (recorded as a note — does NOT permit filing)" },
] as const;

export type T183Method = (typeof T183_METHODS)[number]["value"];

/**
 * Form T183CORP — the corporate officer's authorization to e-file.
 *
 * CRA requires an authorized signing officer of the corporation to sign this
 * **before** the return is transmitted, an e-signature to report the date and
 * time it was signed, and the transmitter to keep the signed original for six
 * years. Nothing here is defaulted server-side: a signing moment nobody observed
 * is a fabricated attestation, so an omission is refused rather than filled in.
 */
export interface T183AuthorizationInput {
  /** The authorized signing officer of the CLIENT corporation. */
  officerName: string;
  officerPosition: string;
  /** When the officer actually signed — not when this form was submitted. */
  signedAt: string;
  authorizationMethod: T183Method;
  /** Where the signed T183 is retained. Required for a wet/electronic signature. */
  evidenceRef?: string;
  formVersion?: string;
}

/**
 * Engagement-years CRUD → server `engagement-year` resource at
 * `/api/engagement-years`. Governed actions (compute / prepare-netfile /
 * transmit) run via `dispatchAction({ id, action })` → `POST /:id/action`.
 */
export const engagementsApi = createCrudApi<
  EngagementYear,
  Partial<EngagementInput>,
  Partial<EngagementInput>
>("engagement-years", { basePath: "/api" });
