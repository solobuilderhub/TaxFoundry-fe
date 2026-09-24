"use client";

import { type Control, useWatch } from "react-hook-form";
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
 * Area A's four boxes, typed here. They live on the jacket's `alberta` slice
 * (the form this view is bound to) because Schedule 2 has no slice of its own
 * and the factor it produces is filed on the jacket at 065.
 *
 * Blank = rolled up from the federal Schedule 5 establishments, shown as each
 * box's placeholder. Any one typed replaces that roll-up as a set — the server
 * never builds a factor half from each source.
 */
const AREA_A_FIELDS = {
	"002": "allocationAlbertaSalaries",
	"004": "allocationTotalSalaries",
	"006": "allocationAlbertaRevenue",
	"008": "allocationTotalRevenue",
} as const;

/** The Area B formulas, in page order — each section after Area A. */
const AREA_B_SECTIONS = AT1_SCHEDULE_2_SECTIONS.filter(
	(s) => s.id !== "gate" && s.id !== "general",
);

/**
 * Line 001, asked as WHICH formula rather than yes/no: the answer the page
 * wants next ("complete the one line in Area B for its own type of operation")
 * is the formula, and a bare Yes would leave it unsaid. Blank is "No" — Area A.
 */
const FORMULA_OPTIONS = AREA_B_SECTIONS.map((s) => ({
	code: s.id,
	label: s.title.replace(/^Area B — /, ""),
}));

/**
 * Every Area B input line → its box, `allocationAreaB.l<line>`. The `l`
 * prefix keeps react-hook-form from reading "012" as an array index.
 */
const AREA_B_FIELDS = Object.fromEntries(
	AT1_SCHEDULE_2_FIELDS.filter(
		(f) =>
			f.role === "input" && AREA_B_SECTIONS.some((s) => s.id === f.section),
	).map((f) => {
		const line = f.line.slice(3, 6);
		return [line, `allocationAreaB.l${line}`];
	}),
);

const OWN_FIELDS = {
	"001": {
		name: "specialAllocationFormula",
		options: FORMULA_OPTIONS,
		blank: "No: general formula, Area A",
	},
	...AREA_A_FIELDS,
	...AREA_B_FIELDS,
};

// 001 is filed as a flag (1/2) but asked as a choice of formula — see above.
const FIELDS = AT1_SCHEDULE_2_FIELDS.map((f) =>
	f.line === "002001001" ? { ...f, kind: "code" as const } : f,
);

/**
 * AT1 Schedule 2. Line 001 picks the formula; the form then shows the one
 * area that applies — Area A (typed here, or carried in from the federal
 * Schedule 5 when blank) or the chosen Area B formula. Every formula is
 * computed, and its factor is shown in column I and filed on the jacket at 065.
 */
export function Schedule2View({
	control,
	computed,
	stale,
	onNavigate,
	highlightLine,
}: {
	control?: Control<Record<string, unknown>>;
	computed?: ComputedReturn;
	stale?: boolean;
	onNavigate?: NavigateToLine;
	highlightLine?: string;
}) {
	const formula = useWatch({
		control: control as Control<Record<string, unknown>>,
		name: "specialAllocationFormula",
	}) as string | undefined;
	const activeSection = formula || "general";
	const sections = AT1_SCHEDULE_2_SECTIONS.filter(
		(s) => s.id === "gate" || s.id === activeSection,
	);
	const factor = computed?.fields?.find(
		(f) => f.line === "allocationFactor",
	)?.value;
	return (
		<ReadOnlyScheduleView
			scheduleId="002"
			formId="AT1SCH2"
			control={control}
			ownFields={OWN_FIELDS}
			sections={sections}
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
				const f = AT1_SCHEDULE_2_FORMULAS.find((x) => x.section === sectionId);
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
					...(factor != null && sectionId === activeSection
						? { value: Number(factor).toFixed(6) }
						: {}),
				};
			}}
			fields={FIELDS}
			computed={computed}
			stale={stale}
			onNavigate={onNavigate}
			highlightLine={highlightLine}
			notComputedMessage="Schedule 2 files only when the corporation has permanent establishments outside Alberta. Type Area A's four figures below, or leave them blank to take them from the federal Schedule 5. A corporation in one of the special industries picks its formula at line 001 instead."
			nothingToReportMessage="Nothing to report yet — no permanent establishment outside Alberta. If there is one, type Area A's four figures below (or enter the establishments on the federal Schedule 5)."
		/>
	);
}
