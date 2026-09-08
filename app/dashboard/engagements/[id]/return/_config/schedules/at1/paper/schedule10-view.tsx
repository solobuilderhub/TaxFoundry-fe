"use client";

import type { ComputedReturn } from "@/api/computed-returns";
import {
	AT1_SCHEDULE_10_FIELDS,
	AT1_SCHEDULE_10_SECTIONS,
} from "./generated/schedule10.layout";
import { ReadOnlyScheduleView } from "./read-only-schedule-view";
import type { NavigateToLine } from "./resolve-line";

/**
 * AT1 Schedule 10 — read-only. No dedicated editor of its own: every loss
 * type's carry-back request is entered on the schedule that already owns
 * that pool — non-capital on `losses.ts` (federal Schedule 4), farm/other
 * loss/capital on `alberta-continuity.ts` (AT1 Schedule 21's carry-back
 * sections) — this view just shows what actually got filed. Special-cased
 * nav entry like Schedule 12.
 */
export function Schedule10View({
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
			scheduleId="010"
			formId="AT1SCH10"
			sections={AT1_SCHEDULE_10_SECTIONS}
			fields={AT1_SCHEDULE_10_FIELDS}
			computed={computed}
			stale={stale}
			onNavigate={onNavigate}
			highlightLine={highlightLine}
			notComputedMessage="Not yet computed — the carry-back figures appear once you compute the return."
			nothingToReportMessage="Computed, and no loss carry-back was requested this filing."
		/>
	);
}
