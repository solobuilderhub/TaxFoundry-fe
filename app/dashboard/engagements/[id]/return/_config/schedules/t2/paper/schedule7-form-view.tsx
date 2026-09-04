"use client";

import type { Control } from "react-hook-form";
import type { SbdValues } from "../../../../_lib/return-input";
import { PaperLeaderRow, PaperSection } from "../../at1/paper/components/paper-primitives";
import type { LineValue, NavigateToLine, ResolveLine } from "../../at1/paper/resolve-line";

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
		note: "This app's field is labelled \"adjusted\" AAII, but line 440 is the PLAIN aggregate investment income (Schedule 7 Part 1) — the ADJUSTED figure (Part 2, real line 745) is a genuinely different number under s.125(7) whenever net capital losses or foreign tax were applied within it. This app collects only one figure and uses it for both the refundable-tax calculation (correct use of 440) and the business-limit grind (which really wants 745) — see research/findings/federal/S7-aaii-vs-aggregate-investment-income-conflation.md.",
	},
];

/**
 * Federal T2 "Small Business Deduction" guided-editor page — in reality a
 * blend of THREE different CRA forms' worth of figures (T2 jacket
 * 400/410/440, Schedule 27 ZETM, Schedule 23 associated corporations), none
 * of which this app builds as its own full Form View. This paper view shows
 * only the jacket-line figures it genuinely, directly collects; ZETM and
 * the associated-corporations list are disclosed as belonging to their own
 * (unbuilt) forms rather than rendered here under a borrowed form id.
 */
export function Schedule7FormView({
	control,
	disabled,
	onNavigate,
	highlightLine,
}: {
	control: Control<Record<string, unknown>>;
	disabled?: boolean;
	onNavigate?: NavigateToLine;
	highlightLine?: string;
}) {
	const sbdControl = control as unknown as Control<SbdValues>;

	const resolveLine: ResolveLine = (line): LineValue => {
		const field = FIELDS.find((f) => f.line === line);
		return field ? { editable: true, name: field.fieldName } : { editable: false, value: undefined };
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
				<p className="p-4 text-xs text-muted-foreground">See Schedule 33's own Form View.</p>
			</PaperSection>
			<PaperSection
				title="Zero-emission technology manufacturing (Schedule 27) and Associated Corporations (Schedule 23)"
				description="Neither is modelled as its own form in this app yet. ZETM income and the associated-corporations list are collected on this same guided-editor page for convenience, but have no numbered-line paper facsimile here — see the Guided view for what's actually collected."
			>
				<p className="p-4 text-xs text-muted-foreground">Not modelled as a separate paper Form View.</p>
			</PaperSection>
		</div>
	);
}
