"use client";

import { type Control, useWatch } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type { PreferredSharesValues } from "../../../../_lib/return-input";
import {
	PaperLeaderRow,
	PaperSection,
} from "../../at1/paper/components/paper-primitives";
import type { LineValue, NavigateToLine } from "../../at1/paper/resolve-line";
import {
	T2_SCHEDULE_43_FIELDS,
	T2_SCHEDULE_43_SECTIONS,
} from "./generated/schedule43.layout";
import { PaperFormSections } from "./paper-form-sections";

/**
 * Part 4 (Part IV.1 tax on dividends RECEIVED) is rendered by the hand-written
 * disclosure panel below instead of from the layout, because this app has no
 * receiver-side field for any of its lines and the panel says so in one
 * sentence rather than a dozen empty rows.
 */
const FORM_SECTIONS = T2_SCHEDULE_43_SECTIONS.filter(
	(s) => s.id !== "part-iv-1",
);

/**
 * Federal T2 Schedule 43 — Parts IV.1 and VI.1 taxes. Line numbers and
 * captions come from `generated/schedule43.layout.ts`.
 *
 * Two amounts this app collects have no leader row in that layout, and cannot
 * get one: amount 1B is a worksheet letter rather than a numbered line, and
 * line 140 is a COLUMN HEADING inside Part 2's per-corporation allocation
 * grid. 140 is nonetheless certain — line 210's own generated caption names it
 * ("...or, if associated, the total amount allocated on line 140 (from Part
 * 2)"). Both are therefore rendered by hand, in their own section, captioned
 * as this app describes them and not as the form prints them.
 *
 * The guided editor's existing citations — 220 (short-term), "230 / 240"
 * (other, split by the election), 140 (allocated allowance) — were all
 * already correct, including the deliberately-plural "230 / 240": the election
 * decides which one line 210's whole amount actually lands on, so only the
 * elected line is bound here and the other stays read-only, matching a printed
 * form where exactly one of the pair is filled in.
 *
 * `isAssociated` and `electedUnder191_2` are both UI-only gates, like
 * `isFirstReturn` elsewhere in this app — the printed form has no yes/no
 * checkbox for either; which lines get filled (140 vs nothing, 230 vs 240)
 * IS the answer.
 *
 * Line 115 (the allowance) and line 270 (the tax payable) are genuinely
 * computed by the engine (`computeSchedule43`) from year-dependent rates
 * ($500,000 / $1,000,000 today, but passed in as a `Schedule43Rates`
 * parameter, not hardcoded there either) through a multi-band "lesser of"
 * calculation — not duplicated here to avoid drifting from it.
 *
 * This used to record a gap that no longer exists. The s.110(1)(k) deduction
 * against taxable income — a statutory multiple of the Part VI.1 tax paid — was
 * once earned but not applied, and `computeSchedule43`'s own doc comment said
 * the multiple had not been transcribed from the Act. It has been:
 * `part-vi-1-deduction.ts` carries the three bands with the Act quoted beside
 * each, and `computeFederalT2` applies the result on jacket line 325.
 *
 * The note is kept, corrected, rather than deleted, because the direction of
 * the error matters. Anyone acting on the old text would claim the deduction by
 * hand on top of the one the engine already took, and a double deduction reads
 * as a smaller tax bill rather than as a mistake.
 *
 * Part 2's administrative header (116/117/118), the allocation grid's name
 * and BN columns (120/130), the s.191.3 transfers (250/260), and the ENTIRE
 * Part 4 (lines 310-400) are not collected by this app at all —
 * `PreferredSharesValues` only has payer-side (Part VI.1) fields.
 */
export function PreferredSharesFormView({
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
	const psControl = control as unknown as Control<PreferredSharesValues>;
	const electedUnder191_2 = useWatch({
		control: psControl,
		name: "electedUnder191_2",
	});
	const isAssociated = useWatch({ control: psControl, name: "isAssociated" });

	const otherLine = electedUnder191_2 ? "230" : "240";

	const boundFields: Record<string, string | undefined> = {
		"220": "shortTermPreferredDividends",
		[otherLine]: "otherPreferredDividends",
	};

	return (
		<div className="space-y-4">
			<PaperSection
				title="Collected outside the printed leader rows"
				description="Amount 1B is a worksheet letter, line 140 is a column heading in Part 2's allocation grid, and the two questions are gates this app asks rather than boxes the form prints. They sit here because the generated layout has no row to render them in."
				formId="T2SCH43"
			>
				<PaperLeaderRow
					line="1B"
					caption="Preferred dividends paid the PRECEDING calendar year (non-excluded)"
					kind="money"
					role="input"
					note="A worksheet letter, not a numbered line. The excess over $1,000,000 lands on line 110; line 115 is then the $500,000 basic allowance less that excess."
					onNavigate={onNavigate}
					highlightLine={highlightLine}
					control={psControl}
					resolveLine={(): LineValue => ({
						editable: true,
						name: "priorYearPreferredDividends",
					})}
					disabled={disabled}
				/>
				<PaperLeaderRow
					line="—"
					caption="Associated with one or more other corporations?"
					kind="bool-flag"
					role="input"
					note="UI-only gate — the printed form has no such checkbox; a filed Part 2 agreement (or its absence) is the answer. Without one, the statute gives an associated corporation NIL allowance, not the full $500,000 — the engine enforces this."
					onNavigate={onNavigate}
					highlightLine={highlightLine}
					control={psControl}
					resolveLine={(): LineValue => ({
						editable: true,
						name: "isAssociated",
					})}
					disabled={disabled}
				/>
				{isAssociated && (
					<PaperLeaderRow
						line="140"
						caption="Dividend allowance allocated to this corporation"
						kind="money"
						role="input"
						note="From the group's filed allocation agreement. Cannot exceed the group's total line 115."
						onNavigate={onNavigate}
						highlightLine={highlightLine}
						control={psControl}
						resolveLine={(): LineValue => ({
							editable: true,
							name: "allocatedAllowance",
						})}
						disabled={disabled}
					/>
				)}
				<PaperLeaderRow
					line="—"
					caption="Elected under s.191.2(1) (raises the 'other' rate below to 40%)?"
					kind="bool-flag"
					role="input"
					note="UI-only gate — no checkbox of its own on the printed form; which of Part 3's line 230 (elected) or 240 (not elected) takes the amount IS the answer. Only the one this gate selects is editable there."
					onNavigate={onNavigate}
					highlightLine={highlightLine}
					control={psControl}
					resolveLine={(): LineValue => ({
						editable: true,
						name: "electedUnder191_2",
					})}
					disabled={disabled}
				/>
			</PaperSection>

			<PaperFormSections
				sections={FORM_SECTIONS}
				fields={T2_SCHEDULE_43_FIELDS}
				control={control}
				boundFields={boundFields}
				computed={computed}
				scheduleId="T2SCH43"
				disabled={disabled}
				onNavigate={onNavigate}
				highlightLine={highlightLine}
			/>

			<PaperSection
				title="Part 4 — Part IV.1 tax payable — not modelled"
				description="The tax on the corporation RECEIVING a taxable preferred share dividend (lines 310-400). This app's PreferredSharesValues has no receiver-side fields at all."
			>
				<p className="p-4 text-xs text-muted-foreground">
					Not modelled — no fields collected for this Part.
				</p>
			</PaperSection>
		</div>
	);
}
