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

/** One filing channel's live availability on the running deployment. */
export interface FilingChannel {
	/** True when a real gateway is installed and transmission will be attempted. */
	transmit: boolean;
	/** The tax authority, e.g. "Alberta TRA". */
	authority: string;
	/** The channel name, e.g. "Net File". */
	channel: string;
}

export type FilingChannels = Record<"T2" | "AT1" | "CO17", FilingChannel>;

/**
 * Which channels this deployment can actually transmit on.
 *
 * Asked rather than assumed: the export screen used to state that live e-file
 * "isn't enabled yet" for every program while the same build transmitted AT1
 * returns to TRA and received real response codes. Availability is server
 * configuration, so the server is the only thing that can answer.
 */
export function fetchFilingChannels(): Promise<FilingChannels> {
	return certificationApi.invokeRoute<FilingChannels>({
		method: "GET",
		path: "/filing-channels",
	});
}

export function fetchT2Readiness(): Promise<ConformanceSummary> {
	return certificationApi.invokeRoute<ConformanceSummary>({
		method: "GET",
		path: "/t2/readiness",
	});
}
