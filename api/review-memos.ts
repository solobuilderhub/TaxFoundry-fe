import { createCrudApi } from "@classytic/arc-next/api";

export const FLAG_SEVERITIES = ["green", "amber", "red"] as const;
export type FlagSeverity = (typeof FLAG_SEVERITIES)[number];

export interface ReviewFlag {
  _id?: string;
  severity: FlagSeverity;
  code: string;
  message: string;
  citation?: string | null;
  line?: string | null;
  resolved?: boolean;
}

/** The human-in-the-loop review artifact; filing is gated on `signed_off`. */
export interface ReviewMemo {
  _id: string;
  engagementYearId: string;
  computedReturnId?: string | null;
  status: "draft" | "signed_off";
  flags?: ReviewFlag[];
  signedOffBy?: string | null;
  signedOffAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Review-memos → server `review-memo` resource at `/api/review-memos`. The
 * `sign-off` action (`dispatchAction`) fails closed (422) if any red flag is
 * unresolved.
 */
export const reviewMemosApi = createCrudApi<
  ReviewMemo,
  Partial<ReviewMemo>,
  Partial<ReviewMemo>
>("review-memos", { basePath: "/api" });
