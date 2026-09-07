"use client";

import { useQuery } from "@tanstack/react-query";
import {
	type ConformanceSummary,
	type FilingChannels,
	fetchFilingChannels,
	fetchT2Readiness,
} from "@/api/certification";

/** T2 certification-readiness report (engine self-test against the CRA-style battery). */
export function useT2Readiness() {
	return useQuery<ConformanceSummary>({
		queryKey: ["certification", "t2", "readiness"],
		queryFn: fetchT2Readiness,
	});
}

/**
 * Which filing channels this deployment can actually transmit on.
 *
 * The export screen's banner is written from this instead of from a constant.
 * It previously told every preparer that live e-file "isn't enabled yet" on a
 * build that transmits AT1 returns to TRA and gets real response codes back —
 * the screen contradicted its own transmit button.
 */
export function useFilingChannels() {
	return useQuery<FilingChannels>({
		queryKey: ["certification", "filing-channels"],
		queryFn: fetchFilingChannels,
		staleTime: 5 * 60_000, // deployment config; it does not change mid-session
	});
}
