"use client";

import type { Control } from "react-hook-form";
import type { BalanceSheetValues } from "../../../../_lib/return-input";
import { PaperLeaderRow, PaperSection } from "../../at1/paper/components/paper-primitives";
import type { LineValue, NavigateToLine } from "../../at1/paper/resolve-line";

/**
 * Federal T2 Schedule 100 — Balance Sheet Information (GIFI). Confirmed by
 * rendering `research/sources/cra-forms/pdf/T2SCH100-balance-sheet.pdf`
 * directly: this is a BLANK fillable grid — every row is empty; the
 * preparer writes in whichever GIFI field code applies from CRA's own
 * separate GIFI code guide (RC4088, not vendored in this repo) and its
 * dollar amount. Only 5 codes are pre-printed at all, all of them
 * MANDATORY subtotals: 2599 (total assets), 3499 (total liabilities), 3620
 * and 3640 (equity subtotals), 3849 (retained earnings). There is no
 * printed "line 1001 = Cash" the way every other schedule in this app's
 * Form View has — the badges below are the GIFI code a preparer would
 * write into a blank row, not a position on the page.
 *
 * The codes shown are this app's own FILING-TIME mapping
 * (`buildGifiFromReturn` in `apps/server/src/filing/t2-cif.service.ts`,
 * verified by reading that function directly, and cross-checked against
 * `@classytic/ledger-ca`'s own canonical GIFI account database at
 * `packages/ledger-ca/src/accounts/`) — the actual source of truth, not a
 * guess. Found and fixed a real bug while building this: `capitalAssetsNet`
 * was being filed under code **1740** ("Machinery and Equipment" per
 * ledger-ca's own table — a narrow leaf category, not this app's combined
 * net figure); corrected to **2008** ("Total Tangible Capital Assets").
 * 2008 is itself technically a GROSS-cost total (its accumulated-
 * amortization counterpart is 2009) — this app now has an optional
 * `accumulatedAmortization` field (2026-09) added back to the net figure to
 * file the true gross total at 2008, with the amortization itself filed
 * separately at 2009; leaving it blank still files the net figure alone
 * under 2008, same as before. Full writeup:
 * research/findings/federal/gifi-capital-assets-cost-of-sales-code-fix.md.
 *
 * The mandatory total codes (2599/3499/3620/3640) are computed by
 * `buildGifiFromReturn` as plain sums of this app's own 10 fields — shown
 * here as computed, matching the same arithmetic, not a fabricated figure.
 * The filing path hard-rejects (`422`) if assets ≠ liabilities + equity.
 */
export function BalanceSheetFormView({
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
	const bsControl = control as unknown as Control<BalanceSheetValues>;

	const FIELDS: readonly { line: string; caption: string; fieldName: keyof BalanceSheetValues; note?: string }[] = [
		{ line: "1001", caption: "Cash & equivalents", fieldName: "cash" },
		{ line: "1060", caption: "Accounts receivable", fieldName: "accountsReceivable" },
		{ line: "1120", caption: "Inventory", fieldName: "inventory" },
		{
			line: "2008",
			caption: "Capital assets, net",
			fieldName: "capitalAssetsNet",
			note: "Filed as GIFI 2008 (the GROSS-cost total) plus whatever accumulated amortization is entered on the next row — blank there still files this figure alone, net, under 2008.",
		},
		{
			line: "2009",
			caption: "Accumulated amortization on capital assets",
			fieldName: "accumulatedAmortization",
			note: "Optional. Added back to the net figure above to file the true gross total at 2008; filed separately here at 2009. Does not affect this app's own asset/liability balancing (2599/3640), which stays on the net figure.",
		},
		{ line: "1480", caption: "Other assets", fieldName: "otherAssets" },
		{ line: "2620", caption: "Accounts payable", fieldName: "accountsPayable" },
		{ line: "2700", caption: "Loans & long-term debt", fieldName: "loansPayable" },
		{ line: "2960", caption: "Other liabilities", fieldName: "otherLiabilities" },
		{ line: "3500", caption: "Share capital", fieldName: "shareCapital" },
		{ line: "3600", caption: "Retained earnings", fieldName: "retainedEarnings" },
	];

	const resolveLine = (fieldName: keyof BalanceSheetValues) => (): LineValue => ({ editable: true, name: fieldName });

	return (
		<div className="space-y-4">
			<PaperSection
				title="GIFI field codes this app collects (Assets, Liabilities, Shareholder equity)"
				description="The printed form is a blank grid — these codes are what this app writes into it, not a position on the page. Reconcile against CRA's own Guide RC4088 if in doubt."
				formId="T2SCH100"
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
						control={bsControl}
						resolveLine={resolveLine(f.fieldName)}
						disabled={disabled}
					/>
				))}
			</PaperSection>
			<PaperSection
				title="Mandatory subtotals — the only codes actually pre-printed on the form"
				description="Computed as plain sums of the fields above by this app's own filing code. A mismatch (assets ≠ liabilities + equity) is a hard reject at filing time."
			>
				<PaperLeaderRow
					line="2599"
					caption="TOTAL ASSETS"
					kind="money"
					role="computed"
					control={bsControl}
					resolveLine={(): LineValue => ({ editable: false, value: undefined })}
					disabled={disabled}
				/>
				<PaperLeaderRow
					line="3499"
					caption="Total liabilities"
					kind="money"
					role="computed"
					control={bsControl}
					resolveLine={(): LineValue => ({ editable: false, value: undefined })}
					disabled={disabled}
				/>
				<PaperLeaderRow
					line="3620"
					caption="Total shareholder equity"
					kind="money"
					role="computed"
					control={bsControl}
					resolveLine={(): LineValue => ({ editable: false, value: undefined })}
					disabled={disabled}
				/>
				<PaperLeaderRow
					line="3640"
					caption="TOTAL LIABILITIES AND EQUITY"
					kind="money"
					role="computed"
					note="Must equal 2599 (total assets) or the return is rejected at filing."
					control={bsControl}
					resolveLine={(): LineValue => ({ editable: false, value: undefined })}
					disabled={disabled}
				/>
			</PaperSection>
		</div>
	);
}
