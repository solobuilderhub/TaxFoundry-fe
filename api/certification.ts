import { createCrudApi } from "@classytic/arc-next/api";

export type ExpectedSource = "hand-computed" | "cra-official";

export interface LineCheck {
  line: string;
  label: string;
  craRef: string;
  expected: number;
  actual: number;
  pass: boolean;
}

export interface ConformanceResult {
  id: string;
  name: string;
  scenario: string;
  source: ExpectedSource;
  pass: boolean;
  checks: LineCheck[];
}

/** The T2 certification-readiness report from the engine's CRA-style battery. */
export interface ConformanceSummary {
  total: number;
  passed: number;
  failed: number;
  /** True only when every case passes AND every case is CRA-official. */
  certificationReady: boolean;
  results: ConformanceResult[];
  /** Pre-formatted plain-text report. */
  report: string;
}

/**
 * Certification → server `certification` service resource. No CRUD; the readiness
 * report is a custom route hit via `invokeRoute`. It stays `certificationReady:
 * false` until the expected values are CRA-official — the UI can't overstate it.
 */
const certificationApi = createCrudApi("certification", { basePath: "/api" });

export function fetchT2Readiness(): Promise<ConformanceSummary> {
  return certificationApi.invokeRoute<ConformanceSummary>({
    method: "GET",
    path: "/t2/readiness",
  });
}
