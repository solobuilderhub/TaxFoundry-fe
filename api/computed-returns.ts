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
	/** Per-schedule filed line items, when the program files supporting schedules (AT1). */
	schedulePayloads?: ComputedSchedulePayload[] | null;
	totals?: Record<string, unknown> | null;
	inputHash?: string | null;
	createdAt?: string;
}

/** Computed-returns → server `computed-return` resource at `/api/computed-returns`. */
export const computedReturnsApi = createCrudApi<ComputedReturn>(
	"computed-returns",
	{ basePath: "/api" },
);
