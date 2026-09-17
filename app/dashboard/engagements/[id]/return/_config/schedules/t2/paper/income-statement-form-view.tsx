"use client";

import { type Control, useWatch } from "react-hook-form";
import type { IncomeStatementValues } from "../../../../_lib/return-input";
import {
	PaperLeaderRow,
	PaperSection,
} from "../../at1/paper/components/paper-primitives";
import type { LineValue, NavigateToLine } from "../../at1/paper/resolve-line";

/**
 * Federal T2 Schedule 125 — Income Statement Information (GIFI). Confirmed
 * by rendering `research/sources/cra-forms/pdf/T2SCH125-income-statement.pdf`
 * directly: like Schedule 100, this is a BLANK fillable grid (non-farming
 * revenue / cost of sales / operating expenses) — only 3 codes are
 * pre-printed at all (8299, 9368, 9369, all conditional-mandatory totals).
 * This app collects only the non-farming, combined-total boxes — the
 * printed form's own farming-revenue/farming-expense sections (a full
 * second set of ~25 field codes, per the form's own page 4 reference table)
 * are not modelled at all.
 *
 * The codes shown are this app's own FILING-TIME mapping
 * (`buildGifiFromReturn` in `apps/server/src/filing/t2-cif.service.ts`).
 * Found and fixed a real bug while building this: `costOfSales` was being
 * filed under code **8320** ("Purchases / Cost of Materials" per
 * `@classytic/ledger-ca`'s own account database — a single component of
 * cost of sales, not this app's combined total); corrected to **8518**
 * ("Total Cost of Sales"), confirmed both against ledger-ca's own table and
 * CRA's own "Commonly used field codes" reference printed on page 3 of the
 * rendered PDF. Full writeup:
 * research/findings/federal/gifi-capital-assets-cost-of-sales-code-fix.md.
 */
export function IncomeStatementFormView({
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
	const isControl = control as unknown as Control<IncomeStatementValues>;

	const FIELDS: readonly {
		line: string;
		caption: string;
		fieldName: keyof IncomeStatementValues;
	}[] = [
		{ line: "8299", caption: "Total revenue", fieldName: "revenue" },
		{ line: "8518", caption: "Cost of sales", fieldName: "costOfSales" },
		{
			line: "9060",
			caption: "Salaries & wages",
			fieldName: "salariesAndWages",
		},
		{
			line: "8670",
			caption: "Amortization of tangible assets",
			fieldName: "amortization",
		},
		{
			line: "9270",
			caption: "Other operating expenses",
			fieldName: "otherExpenses",
		},
	];

	const resolveLine =
		(fieldName: keyof IncomeStatementValues) => (): LineValue => ({
			editable: true,
			name: fieldName,
		});

	/*
	 * GIFI 9999, computed LIVE from the boxes above.
	 *
	 * This row rendered an empty `—` on every return, for every corporation,
	 * while wearing a "Computed" badge and a caption promising "total revenue
	 * minus every expense above" — it resolved to a hardcoded `undefined` and
	 * nothing ever filled it in. The figure it should show was on screen the
	 * whole time, in the footer a few lines below, which made the two disagree
	 * openly: the footer read the SAVED return and this row read nothing.
	 *
	 * `useWatch` rather than the saved slice, because this is the schedule's own
	 * arithmetic on boxes the preparer is editing right now. A total that only
	 * catches up on "Save schedule" is worse than no total: it states a figure
	 * that contradicts the numbers directly above it, and the preparer cannot
	 * tell which one the return will use.
	 *
	 * Deliberately NOT read from `computed`: net income for tax purposes goes on
	 * through Schedule 1, so the engine's figure is a different number that
	 * would silently disagree with this sum. 9999 is the accounting result.
	 */
	const entered = useWatch({ control: isControl });
	const n = (v: unknown) =>
		typeof v === "number" && Number.isFinite(v) ? v : 0;
	const netIncome =
		n(entered?.revenue) -
		n(entered?.costOfSales) -
		n(entered?.salariesAndWages) -
		n(entered?.amortization) -
		n(entered?.otherExpenses);
	// Nothing typed at all reads as a blank rather than a confident 0 — the same
	// distinction the rest of this app keeps between an absent figure and a nil
	// one. Any single box filled makes the arithmetic real, including a genuine 0.
	const anyEntered = [
		entered?.revenue,
		entered?.costOfSales,
		entered?.salariesAndWages,
		entered?.amortization,
		entered?.otherExpenses,
	].some((v) => typeof v === "number" && Number.isFinite(v));

	return (
		<div className="space-y-4">
			<PaperSection
				title="GIFI field codes this app collects (non-farming revenue & expenses)"
				description="The printed form is a blank grid, same as Schedule 100 — these codes are what this app writes into it. Farming revenue/expenses (a separate ~25-code section) are not modelled by this app."
				formId="T2SCH125"
			>
				{FIELDS.map((f) => (
					<PaperLeaderRow
						key={f.line}
						line={f.line}
						caption={f.caption}
						kind="money"
						role="input"
						onNavigate={onNavigate}
						highlightLine={highlightLine}
						control={isControl}
						resolveLine={resolveLine(f.fieldName)}
						disabled={disabled}
					/>
				))}
			</PaperSection>
			<PaperSection
				title="Net income/loss — computed, no separate field"
				description="Total revenue minus every expense above. Filed under GIFI 9999, the same code the T2 jacket's net income for tax purposes calculation starts from."
			>
				<PaperLeaderRow
					line="9999"
					caption="Net income/loss after taxes and extraordinary items"
					kind="money"
					role="computed"
					control={isControl}
					resolveLine={(): LineValue => ({
						editable: false,
						value: anyEntered ? netIncome : undefined,
					})}
					disabled={disabled}
				/>
			</PaperSection>
		</div>
	);
}
