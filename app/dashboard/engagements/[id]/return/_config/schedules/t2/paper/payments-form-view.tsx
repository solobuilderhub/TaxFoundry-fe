"use client";

import type { Control } from "react-hook-form";
import type { PaymentsValues } from "../../../../_lib/return-input";
import { PaperLeaderRow, PaperSection } from "../../at1/paper/components/paper-primitives";
import type { LineValue, NavigateToLine } from "../../at1/paper/resolve-line";

/**
 * T2 jacket — Payments & instalments. Not a separate numbered schedule; this
 * is one line (840) from the T2 jacket's own credits section, verified
 * against `packages/ca-tax/src/t2/forms/jacket.ts` — confirmed correct,
 * already cited correctly by the guided editor.
 *
 * Fixed a real citation bug while building this: the guided editor's
 * description read "...gives the balance owing or refund (890/894)" —
 * checked against jacket.ts's OWN FormDefinition and that is wrong on both
 * counts. Line 890 is "Total credits" (Amount B, the SUM of every credit
 * line INCLUDING 840 — not the net balance), and line 894 is a single-digit
 * "Refund code" choosing what happens to an overpayment, never a dollar
 * figure. jacket.ts's own note on line 890 already warns against exactly
 * this mistake ("the form prints [the balance] without a numbered box...
 * must never be filed against 890, which would report it as credits
 * claimed") — the engine's `computeT2Settlement` module
 * (`packages/ca-tax/src/t2/jacket/settlement.ts`) had the identical wrong
 * citation in its own doc comments, fixed alongside this view. The balance
 * owing / refund genuinely has NO printed line number at all.
 *
 * Line 840 feeds this balance for BOTH the federal settlement AND, verified
 * via `apps/server/src/filing/co17-return.service.ts`, Quebec's own CO-17
 * settlement — one pool of instalment payments settles both returns.
 */
export function PaymentsFormView({
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
	const paymentsControl = control as unknown as Control<PaymentsValues>;

	return (
		<div className="space-y-4">
			<PaperSection
				title="T2 jacket — credits section (page 9)"
				description="Total tax payable (line 770) is compared against every credit line, including this one, to arrive at a balance owing or a refund — neither of which prints its own line number."
				formId="T2"
			>
				<PaperLeaderRow
					line="840"
					caption="Tax instalments paid"
					kind="money"
					role="input"
					onNavigate={onNavigate}
					highlightLine={highlightLine}
					control={paymentsControl}
					resolveLine={(): LineValue => ({ editable: true, name: "instalmentsPaid" })}
					disabled={disabled}
				/>
				<PaperLeaderRow
					line="890"
					caption="Total credits (Amount B) — the SUM of every credit line, not the balance"
					kind="money"
					role="computed"
					note="Not this app's balance figure. Lines 780/784/788/792/795/796/797/798/800/801/808/812 all feed into this total too and are not collected by this app — only line 840 is."
					control={paymentsControl}
					resolveLine={(): LineValue => ({ editable: false, value: undefined })}
					disabled={disabled}
				/>
				<PaperLeaderRow
					line="—"
					caption="Balance owing, or refund — computed, no printed line number"
					kind="money"
					role="computed"
					note="max(0, total tax payable − instalments paid), or the negative of that for a refund. Computed by the engine at filing time, not shown here to avoid duplicating a figure that depends on every credit line above, most of which this app does not collect."
					control={paymentsControl}
					resolveLine={(): LineValue => ({ editable: false, value: undefined })}
					disabled={disabled}
				/>
				<PaperLeaderRow
					line="894"
					caption="Refund code — a single digit, never a dollar amount"
					kind="code"
					role="input"
					note="Not collected by this app. Chooses what CRA does with an overpayment (e.g. refund it vs. apply it to next year); not the refund amount itself."
					control={paymentsControl}
					resolveLine={(): LineValue => ({ editable: false, value: undefined })}
					disabled={disabled}
				/>
			</PaperSection>
		</div>
	);
}
