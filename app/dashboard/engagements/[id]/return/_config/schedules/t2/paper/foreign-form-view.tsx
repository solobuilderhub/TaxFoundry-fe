"use client";

import type { Control } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type { ForeignValues } from "../../../../_lib/return-input";
import { PaperSection } from "../../at1/paper/components/paper-primitives";
import type { NavigateToLine } from "../../at1/paper/resolve-line";
import {
	T2_SCHEDULE_21_FIELDS,
	T2_SCHEDULE_21_SECTIONS,
} from "./generated/schedule21.layout";
import { PaperFormSections } from "./paper-form-sections";

/**
 * The boxes this app actually collects, by printed line. Lines 110/120
 * (non-business), 210/220 (business) and 348 (the opening business FTC pool)
 * were the guided editor's own citations and were all already correct when
 * checked against the form.
 *
 * Every other line renders read-only from the generated layout, which is the
 * honest result rather than a gap to paper over: the per-country name columns
 * (100 / 200 / 345) have no field because this app aggregates countries; line
 * 130 is the subsection 20(12) deduction, the alternative taken when the
 * credit cannot be used, and this app always claims the credit; line 230
 * (unused foreign income tax) and Part 3's expiry (350) and amalgamation or
 * wind-up transfer (360) adjustments are not collected as separate figures at
 * all.
 */
const BOUND_FIELDS: Partial<Record<string, keyof ForeignValues>> = {
	"110": "foreignNonBusinessIncome",
	"120": "foreignNonBusinessTaxPaid",
	"210": "foreignBusinessIncome",
	"220": "foreignBusinessTaxPaid",
	"348": "openingBusinessFtcPool",
};

/**
 * Federal T2 Schedule 21 — Federal foreign income tax credits. NOT to be
 * confused with AT1's own Schedule 21 (loss continuity) — same number,
 * different program, different form entirely.
 *
 * Line numbers and captions come from `generated/schedule21.layout.ts`, which
 * is emitted from `packages/ca-tax`'s own hand-authored `schedule21.ts` (that
 * module's doc comment warns the raw `pdftotext -layout` extraction only
 * reaches 5 of the form's real rows, which is why the definition is
 * hand-authored upstream rather than extracted).
 *
 * Both real forms are PER-COUNTRY grids (Part 1 line 100, Part 2 line 200,
 * Part 3 line 345); this app collects one aggregate figure per box, not a
 * country breakdown — disclosed rather than fabricated.
 *
 * Lines 180 and 280 (the two credit TOTALS, each landing on a different T2
 * jacket line — 632 for non-business, 636 for business, per the upstream
 * form's own doc comment warning "getting 632 and 636 the wrong way round is
 * not cosmetic") are a real s.126 limitation computed by the engine
 * (`computeSchedule21` — capped at the Canadian tax on the same foreign
 * income), not a trivial sum. Unlike the client-side "computed" displays
 * elsewhere in this app (which only ever replicate genuinely trivial
 * arithmetic), duplicating that formula here would risk drifting from the
 * engine, so both stay read-only and the disclosure below points at the
 * computed return instead.
 */
export function ForeignFormView({
	control,
	computed,
	disabled,
	onNavigate,
	highlightLine,
}: {
	control: Control<Record<string, unknown>>;
	computed?: ComputedReturn;
	disabled?: boolean;
	onNavigate?: NavigateToLine;
	highlightLine?: string;
}) {
	return (
		<div className="space-y-4">
			<PaperFormSections
				sections={T2_SCHEDULE_21_SECTIONS}
				fields={T2_SCHEDULE_21_FIELDS}
				control={control}
				boundFields={BOUND_FIELDS}
				computed={computed}
				scheduleId="T2SCH21"
				disabled={disabled}
				onNavigate={onNavigate}
				highlightLine={highlightLine}
				formId="T2SCH21"
			/>

			<PaperSection
				title="How this app models Schedule 21"
				description="Parts 1, 2 and 3 are per-country grids on the printed form (lines 100, 200 and 345). This app collects one aggregate figure per box instead of a country breakdown, so those name columns show as not collected rather than carrying a fabricated value."
			>
				<p className="p-4 text-xs text-muted-foreground">
					Lines 180 and 280 are a real section 126 limitation computed by the
					engine, capped at the Canadian tax on the same foreign income — not a
					sum of the boxes above them, and not duplicated here where it could
					drift from what actually gets filed. The figures shown against them
					are read back from the last computed return, not re-derived on this
					screen. The two land on different jacket lines, 632 for the
					non-business credit and 636 for the business one, and swapping them is
					not cosmetic.
				</p>
			</PaperSection>
		</div>
	);
}
