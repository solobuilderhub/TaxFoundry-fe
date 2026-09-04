"use client";

import type { Control } from "react-hook-form";
import type { IncomeStatementValues } from "../../../../_lib/return-input";
import { PaperLeaderRow, PaperSection } from "../../at1/paper/components/paper-primitives";
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

	const FIELDS: readonly { line: string; caption: string; fieldName: keyof IncomeStatementValues }[] = [
		{ line: "8299", caption: "Total revenue", fieldName: "revenue" },
		{ line: "8518", caption: "Cost of sales", fieldName: "costOfSales" },
		{ line: "9060", caption: "Salaries & wages", fieldName: "salariesAndWages" },
		{ line: "8670", caption: "Amortization of tangible assets", fieldName: "amortization" },
		{ line: "9270", caption: "Other operating expenses", fieldName: "otherExpenses" },
	];

	const resolveLine = (fieldName: keyof IncomeStatementValues) => (): LineValue => ({ editable: true, name: fieldName });

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
					resolveLine={(): LineValue => ({ editable: false, value: undefined })}
					disabled={disabled}
				/>
			</PaperSection>
		</div>
	);
}
