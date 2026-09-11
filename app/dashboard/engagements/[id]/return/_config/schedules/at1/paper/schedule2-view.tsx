"use client";

import type { ComputedReturn } from "@/api/computed-returns";
import {
	AT1_SCHEDULE_2_FACTOR_DESTINATION,
	AT1_SCHEDULE_2_FIELDS,
	AT1_SCHEDULE_2_FOOTNOTES,
	AT1_SCHEDULE_2_FORMULAS,
	AT1_SCHEDULE_2_SECTIONS,
} from "./generated/schedule2.layout";
import { ReadOnlyScheduleView } from "./read-only-schedule-view";
import type { NavigateToLine } from "./resolve-line";

/**
 * AT1 Schedule 2 — read-only. No dedicated editor exists (Area A's 4 lines
 * are carried in from the federal Schedule 5 establishments allocation);
 * Area B's seven industry-specific formulas are not modelled at all — see
 * `schedule2.ts`'s own doc comment. Special-cased nav entry like Schedule 12.
 */
export function Schedule2View({
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
			scheduleId="002"
			formId="AT1SCH2"
			sections={AT1_SCHEDULE_2_SECTIONS}
			footnotes={AT1_SCHEDULE_2_FOOTNOTES}
			/*
			 * Column I. Every formula on this form has one and none of them
			 * numbers it — there is a single factor per return whichever
			 * formula produced it, filed once on the jacket at 065. So it is
			 * rendered from the schedule's own formula table rather than as a
			 * field, and each section ends on the arithmetic it performs.
			 */
			/*
			 * Lines 102 and 104 are captioned with their own arithmetic —
			 * "(E/F) x (AT1 lines 062)" — in the page's column letters. Same
			 * substitution as the factor row below, for the same reason.
			 *
			 * A letter only counts as a column reference when no letter sits
			 * either side of it; without that guard the "A" in "Alberta" and
			 * in "AT1" would be rewritten too. Checked against all 43 captions
			 * on this schedule: exactly these two change.
			 */
			captionFor={(field) => {
				const f = AT1_SCHEDULE_2_FORMULAS.find(
					(x) => x.section === field.section,
				);
				if (!f) return undefined;
				const out = field.caption.replace(
					/(?<![A-Za-z])(\d*)([A-H])(?![A-Za-z])/g,
					(whole, mult: string, letter: string) => {
						const line = f.columns[letter];
						if (!line) return whole;
						return mult ? `${mult} × ${line}` : line;
					},
				);
				return out === field.caption ? undefined : out;
			}}
			sectionResult={(sectionId) => {
				const f = AT1_SCHEDULE_2_FORMULAS.find(
					(x) => x.section === sectionId,
				);
				if (!f) return undefined;
				/*
				 * Shown in LINE NUMBERS, not the page's A/B/C/D. The letters
				 * are what the form prints, but they appear nowhere in this
				 * view — every row here is labelled by its printed line — so
				 * "(A/B + C/D) x 1/2" would name nothing the reader can see.
				 *
				 * A digit before a letter is a multiplier the page sets
				 * against the column ("2C/D" for banks, "3C/D" for airlines);
				 * substituting naively would run it into the line number and
				 * turn 2C into "2056", so it becomes an explicit "2 × 056".
				 * Lower-case "x" in "x 1/2" is the page's own multiplication
				 * sign and is left alone.
				 */
				const byLine = f.factor.replace(
					/(\d*)([A-H])/g,
					(whole, mult: string, letter: string) => {
						const line = f.columns[letter];
						if (!line) return whole;
						return mult ? `${mult} × ${line}` : line;
					},
				);
				return {
					label: "I — Alberta Allocation Factor",
					formula: byLine,
					// The page's own notation, kept for anyone checking against paper.
					formulaAsPrinted: f.factor,
					note: f.note,
					to: AT1_SCHEDULE_2_FACTOR_DESTINATION,
				};
			}}
			fields={AT1_SCHEDULE_2_FIELDS}
			computed={computed}
			stale={stale}
			onNavigate={onNavigate}
			highlightLine={highlightLine}
			notComputedMessage="Not yet computed — Schedule 2 only files when the corporation has permanent establishments outside Alberta. Area A's four figures appear once you compute the return; Area B's industry formulas are shown as the form prints them, but this product does not calculate them."
			nothingToReportMessage="Computed, and Schedule 2 has nothing to report — the corporation has no permanent establishments outside Alberta this filing."
		/>
	);
}
