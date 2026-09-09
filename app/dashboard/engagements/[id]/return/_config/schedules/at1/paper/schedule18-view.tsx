"use client";

import type { ComputedReturn } from "@/api/computed-returns";
import {
	AT1_SCHEDULE_18_FIELDS,
	AT1_SCHEDULE_18_SECTIONS,
} from "./generated/schedule18.layout";
import { ReadOnlyScheduleView } from "./read-only-schedule-view";
import type { NavigateToLine } from "./resolve-line";

/**
 * AT1 Schedule 18 — Alberta dispositions of capital property, as TRA prints
 * it: the six-category grid and its adjustments under the page-1 heading
 * "CAPITAL PROPERTY DISPOSITIONS", then the ABIL block on page 2.
 *
 * Read-only, like Schedule 12's. Most of this schedule is built from the SAME
 * rows the federal Capital Gains (S6) schedule already collects, tagged with
 * an Alberta category so nothing is typed twice — there is nothing here for a
 * preparer to edit. The one exception is the ABIL section, which has no
 * federal counterpart in this engine and is entered on its own guided
 * schedule (`alberta-schedule18.ts`); this view is where those entries are
 * checked against the printed form before filing.
 *
 * ── Why the source PDF cannot be rendered beside this ───────────────────────
 *
 * `AT1SCH18-dispositions-TRA15156.pdf` is a DYNAMIC XFA form: its PDF pages
 * carry only Adobe's "requires Adobe Reader 8 or higher" placeholder, so the
 * "View official PDF" link opens that placeholder rather than the form. The
 * captions below come from the XFA template stream instead — extracted, and
 * checked in with the command to reproduce it, at
 * `research/sources/tra-forms/xfa/`. This view is therefore the closest thing
 * to the printed page a preparer can actually see.
 */
export function Schedule18View({
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
			scheduleId="018"
			formId="AT1SCH18"
			sections={AT1_SCHEDULE_18_SECTIONS}
			fields={AT1_SCHEDULE_18_FIELDS}
			computed={computed}
			stale={stale}
			onNavigate={onNavigate}
			highlightLine={highlightLine}
			notComputedMessage="Not yet computed — the form below is Schedule 18 as TRA prints it; its figures appear once you compute the return."
			nothingToReportMessage="Computed, and Schedule 18 was not filed. TRA permits it only when the AT1 jacket declares a federal/Alberta difference (line 060 or 061), and the return declares none — so there are no Alberta dispositions to reconcile."
		/>
	);
}
