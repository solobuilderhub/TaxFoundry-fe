import { createCrudApi } from "@classytic/arc-next/api";
import type { EngagementProgram } from "@/api/engagements";

export type FieldProvenance = "engine" | "imported" | "human";

export interface ComputedField {
	line: string;
	value: unknown;
	provenance: FieldProvenance;
}

/**
 * One `Value` element the AT1 (or T2/CO17) engine would transmit — nine-digit
 * `SSSFFFOOO` (schedule + field + occurrence) for AT1, program-specific for
 * others. Persisted on the computed return rather than rebuilt at filing
 * time — see `computed-return.model.ts`'s own comment: the `fields` array
 * only carries jacket totals and knows nothing about the schedules behind
 * them.
 */
export interface ComputedScheduleValue {
	lineItemId: string;
	value: string | number;
}

export interface ComputedSchedulePayload {
	scheduleId: string;
	values: ComputedScheduleValue[];
}

/** Immutable fold of the fact-log through the engine (a cache, never authoritative). */
export interface ComputedReturn {
	_id: string;
	engagementYearId: string;
	program: EngagementProgram;
	engineVersion: string;
	fields: ComputedField[];
	/**
	 * Per-schedule filed line items.
	 *
	 * Alberta keys these by a nine-digit TRA line item id (`SSSFFFOOO`); federal
	 * T2 keys them by six digits, the three-digit CRA line then an occurrence.
	 * A reader must therefore parse with the right helper for the program —
	 * `parseAt1LineItemId` rejects a federal id and `parseT2LineItemId` rejects
	 * an Alberta one, both deliberately, because reading either as the other
	 * displays a real figure against the wrong line.
	 */
	schedulePayloads?: ComputedSchedulePayload[] | null;
	/**
	 * Validation notes the engine's own schedules raised while computing this
	 * return — a fail-closed default, a capped claim, a missing input the
	 * engine could not derive (AT1 only, for now). Absent/empty means no
	 * schedule had anything to flag, not that nothing was checked.
	 */
	issues?: string[] | null;
	totals?: Record<string, unknown> | null;
	inputHash?: string | null;
	createdAt?: string;
}

/** Computed-returns → server `computed-return` resource at `/api/computed-returns`. */
export const computedReturnsApi = createCrudApi<ComputedReturn>(
	"computed-returns",
	{ basePath: "/api" },
);
