import { createCrudApi } from "@classytic/arc-next/api";
import type { EngagementProgram } from "@/api/engagements";

export type FieldProvenance = "engine" | "imported" | "human";

export interface ComputedField {
  line: string;
  value: unknown;
  provenance: FieldProvenance;
}

/** Immutable fold of the fact-log through the engine (a cache, never authoritative). */
export interface ComputedReturn {
  _id: string;
  engagementYearId: string;
  program: EngagementProgram;
  engineVersion: string;
  fields: ComputedField[];
  totals?: Record<string, unknown> | null;
  inputHash?: string | null;
  createdAt?: string;
}

/** Computed-returns → server `computed-return` resource at `/api/computed-returns`. */
export const computedReturnsApi = createCrudApi<ComputedReturn>(
  "computed-returns",
  { basePath: "/api" },
);
