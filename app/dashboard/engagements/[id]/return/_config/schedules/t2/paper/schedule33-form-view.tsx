"use client";

import { useWatch, type Control } from "react-hook-form";
import type { CapitalValues } from "../../../../_lib/return-input";
import {
	PaperLeaderRow,
	PaperSection,
} from "../../at1/paper/components/paper-primitives";
import type { LineValue, NavigateToLine, ResolveLine } from "../../at1/paper/resolve-line";
import { T2_SCHEDULE_33_FIELDS, T2_SCHEDULE_33_SECTIONS } from "./generated/schedule33.layout";

/**
 * Every field this app actually collects, by printed line. Line 112
 * (partnership membership interest) has a real `CapitalValues.partnershipInterest`
 * type field but no guided-editor input anywhere — a genuine, pre-existing UI
 * gap distinct from this paper view; shown "not collected" honestly rather
 * than silently dropped.
 */
const OWN_FIELD: Partial<Record<string, keyof CapitalValues>> = {
	"101": "reservesNotDeducted",
	"103": "capitalStock",
	"104": "retainedEarnings",
	"105": "contributedSurplus",
	"106": "otherSurpluses",
	"107": "deferredForexGains",
	"108": "loansAndAdvances",
	"109": "bondsAndDebentures",
	"110": "dividendsDeclaredUnpaid",
	"111": "otherLongTermDebt",
	"121": "deferredTaxDebit",
	"122": "deficitInEquity",
	"123": "patronageDeducted",
	"124": "deferredForexLosses",
	"401": "sharesOfOtherCorporations",
	"402": "loansToOtherCorporations",
	"403": "bondsOfOtherCorporations",
	"404": "longTermDebtOfFinancialInstitution",
	"405": "dividendsReceivable",
	"406": "partnershipObligations",
	"407": "partnershipInterestAsset",
};

const num = (v: unknown): number => {
	const n = Number(v);
	return Number.isFinite(n) ? n : 0;
};

/**
 * Federal T2 Schedule 33 — taxable capital employed in Canada (large
 * corporations). Parts 1-2 (lines 101-124, 401-407) map cleanly onto this
 * app's `CapitalValues` and are fully editable here.
 *
 * Lines 190/490/500 are computed here client-side as the SAME plain
 * sum/subtraction (floored at nil) the form itself specifies and
 * `computeSchedule33` performs — safe, since it is arithmetic on the exact
 * values visible above it, not a re-derivation of tax-law judgment (compare
 * `schedule13-form-view.tsx`'s totals, the same reasoning).
 *
 * Part 3 (lines 701/711/712/713 → line 790) is NOT modelled with the
 * printed form's own line-by-line detail: this app's single
 * `taxableIncomeEarnedInCanada` input feeds a RATIO-based shortcut
 * (`taxable capital × income-earned-in-Canada ÷ taxable income`) in
 * `computeSchedule33`, not the form's own asset/debt subtraction across
 * 701/711/712/713. The two are genuinely different methods that happen to
 * estimate the same figure — showing a fabricated 701-713 breakdown would
 * misrepresent how this app actually arrives at line 790, so it's disclosed
 * as an honest gap instead.
 */
export function Schedule33FormView({
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
	const capitalControl = control as unknown as Control<CapitalValues>;
	const values = useWatch({ control: capitalControl }) ?? {};

	const capital =
		num(values.reservesNotDeducted) +
		num(values.capitalStock) +
		num(values.retainedEarnings) +
		num(values.contributedSurplus) +
		num(values.otherSurpluses) +
		num(values.deferredForexGains) +
		num(values.loansAndAdvances) +
		num(values.bondsAndDebentures) +
		num(values.dividendsDeclaredUnpaid) +
		num(values.otherLongTermDebt) +
		num(values.partnershipInterest);
	const deductions =
		num(values.deferredTaxDebit) +
		num(values.deficitInEquity) +
		num(values.patronageDeducted) +
		num(values.deferredForexLosses);
	const line190 = Math.max(0, capital - deductions);
	const line490 =
		num(values.sharesOfOtherCorporations) +
		num(values.loansToOtherCorporations) +
		num(values.bondsOfOtherCorporations) +
		num(values.longTermDebtOfFinancialInstitution) +
		num(values.dividendsReceivable) +
		num(values.partnershipObligations) +
		num(values.partnershipInterestAsset);
	const line500 = Math.max(0, line190 - line490);
	const computedByLine: Record<string, number> = { "190": line190, "490": line490, "500": line500 };

	const resolveLine: ResolveLine = (line): LineValue => {
		const field = OWN_FIELD[line];
		if (field) return { editable: true, name: field };
		if (line in computedByLine) return { editable: false, value: computedByLine[line] };
		return { editable: false, value: undefined };
	};

	const fieldsFor = (sectionId: string) => T2_SCHEDULE_33_FIELDS.filter((f) => f.section === sectionId);

	return (
		<div className="space-y-4">
			{T2_SCHEDULE_33_SECTIONS.filter((s) => s.id !== "canadian").map((section) => (
				<PaperSection key={section.id} title={section.title} description={section.description} formId="T2SCH33">
					{fieldsFor(section.id).map((f) => (
						<PaperLeaderRow
							key={f.line}
							line={f.line}
							caption={f.caption}
							kind={f.kind}
							role={f.role}
							note={f.note}
							to={f.to}
							onNavigate={onNavigate}
							highlightLine={highlightLine}
							control={capitalControl}
							resolveLine={resolveLine}
							disabled={disabled}
						/>
					))}
				</PaperSection>
			))}
			<PaperSection
				title="Part 3 — Taxable capital employed in Canada"
				description="Not modelled to the printed form's own line-by-line detail (701/711/712/713). This app derives line 790 from a taxable-income ratio instead of the form's asset/debt subtraction — see the guided editor's 'Taxable income earned in Canada' field."
				formId="T2SCH33"
			>
				{fieldsFor("canadian").map((f) => (
					<PaperLeaderRow
						key={f.line}
						line={f.line}
						caption={f.caption}
						kind={f.kind}
						role={f.role}
						note={f.note ?? "Not collected at this line-level detail — see this section's own description above."}
						to={f.to}
						onNavigate={onNavigate}
						highlightLine={highlightLine}
						control={capitalControl}
						resolveLine={resolveLine}
						disabled={disabled}
					/>
				))}
			</PaperSection>
		</div>
	);
}
