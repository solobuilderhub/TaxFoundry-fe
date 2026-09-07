"use client";

import type { Control } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type { SbdValues } from "../../../../_lib/return-input";
import {
	PaperLeaderRow,
	PaperSection,
} from "../../at1/paper/components/paper-primitives";
import type {
	LineValue,
	NavigateToLine,
	ResolveLine,
} from "../../at1/paper/resolve-line";
import {
	T2_SCHEDULE_7_FIELDS,
	T2_SCHEDULE_7_SECTIONS,
} from "./generated/schedule7.layout";
import {
	T2_SCHEDULE_23_FIELDS,
	T2_SCHEDULE_23_SECTIONS,
} from "./generated/schedule23.layout";
import { PaperFormSections } from "./paper-form-sections";

interface JacketSbdField {
	line: string;
	caption: string;
	fieldName: keyof SbdValues;
	note?: string;
}

/**
 * These are JACKET lines (`packages/ca-tax/src/t2/forms/jacket.ts`), not
 * Schedule 7's own numbering — confirmed directly against that
 * FormDefinition, not assumed from the guided editor's own "(line NNN)"
 * captions (one of which, 440, turned out to be citing the wrong CONCEPT
 * even though the number itself is real — see the note below). Schedule 7's
 * own internal calculation (12 pages, 25 parts across 5 credits — see
 * `schedule7.ts`'s doc comment) is not modelled anywhere in this app; these
 * three jacket lines are simply CARRIED-IN-from-S7 in the jacket's own
 * FormDefinition, but since this app never builds S7's internal detail,
 * they are real editable inputs here instead — the honest reflection of how
 * this app actually works, not a fabricated Schedule 7 facsimile.
 */
const FIELDS: readonly JacketSbdField[] = [
	{
		line: "400",
		caption: "Income eligible for the small business deduction",
		fieldName: "activeBusinessIncome",
	},
	{
		line: "410",
		caption: "Business limit",
		fieldName: "businessLimit",
		note: "$500,000, shared across an associated group (Schedule 23) — see the Associated Corporations section below for this corporation's allocation.",
	},
	{
		line: "440",
		caption: "Aggregate investment income",
		fieldName: "aaii",
		note: 'This app\'s field is labelled "adjusted" AAII, but line 440 is the PLAIN aggregate investment income (Schedule 7 Part 1) — the ADJUSTED figure (Part 2, real line 745) is a genuinely different number under s.125(7) whenever net capital losses or foreign tax were applied within it. This app collects only one figure and uses it for both the refundable-tax calculation (correct use of 440) and the business-limit grind (which really wants 745) — see research/findings/federal/S7-aaii-vs-aggregate-investment-income-conflation.md.',
	},
];

/**
 * Federal T2 "Small Business Deduction" guided-editor page — in reality a
 * blend of THREE different CRA forms' worth of figures (T2 jacket
 * 400/410/440, Schedule 27 ZETM, Schedule 23 associated corporations), none
 * of which this app builds as its own full Form View. The sections it collects
 * are the jacket-line figures it genuinely, directly collects; ZETM is
 * disclosed as belonging to its own (unbuilt) form rather than rendered under a
 * borrowed form id. Schedules 7 and 23 are both printed below those, read-only
 * and under their own form ids, so a preparer can read what each form asks for
 * against what this app actually collects.
 */
export function Schedule7FormView({
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
	const sbdControl = control as unknown as Control<SbdValues>;

	const resolveLine: ResolveLine = (line): LineValue => {
		const field = FIELDS.find((f) => f.line === line);
		return field
			? { editable: true, name: field.fieldName }
			: { editable: false, value: undefined };
	};

	return (
		<div className="space-y-4">
			<PaperSection
				title="Small business deduction — jacket lines"
				description="This app's SBD inputs feed the T2 jacket directly (see jacket.ts); Schedule 7's own 12-page, 25-part calculation is not built. Line numbers below are the JACKET's, not Schedule 7's own numbering."
				formId="T2"
			>
				{FIELDS.map((f) => (
					<PaperLeaderRow
						key={f.line}
						line={f.line}
						caption={f.caption}
						kind="money"
						role="input"
						note={f.note}
						onNavigate={onNavigate}
						highlightLine={highlightLine}
						control={sbdControl}
						resolveLine={resolveLine}
						disabled={disabled}
					/>
				))}
			</PaperSection>
			<PaperSection
				title="Taxable capital, prior year"
				description="This belongs to Schedule 33 (Taxable Capital Employed in Canada), which has its own full paper Form View — see the 'Taxable Capital (S33)' schedule. Folded into this page's guided editor for convenience only; not re-shown here to avoid two different boxes for the same figure."
				formId="T2SCH33"
			>
				<p className="p-4 text-xs text-muted-foreground">
					See Schedule 33's own Form View.
				</p>
			</PaperSection>
			<PaperSection
				title="Zero-emission technology manufacturing (Schedule 27)"
				description="Not modelled as its own form in this app yet. ZETM income is collected on this same guided-editor page for convenience, but has no numbered-line paper facsimile here — see the Guided view for what's actually collected."
			>
				<p className="p-4 text-xs text-muted-foreground">
					Not modelled as a separate paper Form View.
				</p>
			</PaperSection>

			{/*
			 * Schedule 23 — the associated group's allocation of the business
			 * limit, read-only from the generated layout.
			 *
			 * The associated-corporations list is collected on this same
			 * guided-editor page, and this section used to say the form had no
			 * paper facsimile here. It has one now: the printed lines below are
			 * what the agreement itself asks for — the calendar year it covers,
			 * whether it amends or replaces one already filed, and the per-
			 * corporation percentage that must total 100% — none of which this
			 * app collects as numbered boxes.
			 */}
			<PaperFormSections
				sections={T2_SCHEDULE_23_SECTIONS}
				fields={T2_SCHEDULE_23_FIELDS}
				control={control}
				computed={computed}
				scheduleId="T2SCH23"
				disabled={disabled}
				onNavigate={onNavigate}
				highlightLine={highlightLine}
				formId="T2SCH23"
				titleSuffix=" — as printed"
			/>

			{/*
			 * Schedule 7 itself, read-only, from the generated layout.
			 *
			 * The sections above are the three JACKET lines this app collects, and
			 * they stay: this app does not build Schedule 7's own calculation, so
			 * presenting its lines as fillable would be a facsimile of work that is
			 * not happening. Showing the form below them is different — a preparer
			 * can see what Schedule 7 actually asks for, and that this app does not
			 * yet ask it. That is the gap stated rather than hidden. A line the
			 * engine does report (line 745, the adjusted aggregate investment
			 * income) carries the figure the last compute filed for it.
			 */}
			<PaperFormSections
				sections={T2_SCHEDULE_7_SECTIONS}
				fields={T2_SCHEDULE_7_FIELDS}
				control={control}
				computed={computed}
				scheduleId="T2SCH7"
				disabled={disabled}
				onNavigate={onNavigate}
				highlightLine={highlightLine}
				titleSuffix=" — as printed, not collected here"
			/>
		</div>
	);
}
