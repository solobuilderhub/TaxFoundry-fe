"use client";

import type { ComputedReturn } from "@/api/computed-returns";
import { AT1_SCHEDULE_12_FIELDS, AT1_SCHEDULE_12_SECTIONS } from "./generated/schedule12.layout";
import { ReadOnlyScheduleView } from "./read-only-schedule-view";
import type { NavigateToLine } from "./resolve-line";

/**
 * AT1 Schedule 12 — read-only, always. There is no editable side because
 * there's no `ScheduleDef`/nav entry of its own at all today: it's fully
 * computed by the engine from the OTHER schedules' Alberta-override fields
 * (`cca.ts`, `reserves.ts`, `capital-gains.ts`, `alberta-continuity.ts`).
 * Wired directly into `return-editor.tsx` as a special-cased nav entry (the
 * same pattern already used for "Tax Summary (jacket)"), not the registry.
 *
 * `emitOnlyWhenDifferent` (see `schedule12.ts`'s own doc comment): a
 * reconciling pair whose federal and Alberta figures agree is correctly
 * OMITTED from the filed payload, not a gap — shown blank without flagging
 * it, same as any other genuinely-nil line.
 */
export function Schedule12View({
	computed,
	stale,
	onNavigate,
	highlightLine,
}: {
	computed?: ComputedReturn;
	stale?: boolean;
	onNavigate?: NavigateToLine;
	highlightLine?: string;
}) {
	return (
		<ReadOnlyScheduleView
			scheduleId="012"
			formId="AT1SCH12"
			sections={AT1_SCHEDULE_12_SECTIONS}
			fields={AT1_SCHEDULE_12_FIELDS}
			computed={computed}
			stale={stale}
			onNavigate={onNavigate}
			highlightLine={highlightLine}
			notComputedMessage="Not yet computed. Compute the return to see Schedule 12."
			nothingToReportMessage="Computed, and Schedule 12 has nothing to reconcile — Alberta and federal figures agree on Schedules 13, 17, 18 and 21 this filing. That's a real result, not a gap: the form itself says only to report a pair where the amounts differ."
		/>
	);
}
