"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchT2Readiness, type ConformanceSummary } from "@/api/certification";

/** T2 certification-readiness report (engine self-test against the CRA-style battery). */
export function useT2Readiness() {
  return useQuery<ConformanceSummary>({
    queryKey: ["certification", "t2", "readiness"],
    queryFn: fetchT2Readiness,
  });
}
