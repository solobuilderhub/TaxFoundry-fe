"use client";

import { useWatch, type Control } from "react-hook-form";
import type { FirstReturnValues } from "../../../../_lib/return-input";
import { PaperLeaderRow, PaperSection } from "../../at1/paper/components/paper-primitives";
import type { LineValue, NavigateToLine } from "../../at1/paper/resolve-line";

/**
 * Federal T2 Schedule 24 (event) + Schedule 101 (opening balance sheet).
 * Verified against `research/sources/cra-forms/extracted/T2SCH24-first-return.layout.txt`
 * (the raw `pdftotext -layout` text — trustworthy for this form, a genuine
 * caption-then-number leader-row layout throughout). No FormDefinition or
 * vendored PDF exists for Schedule 101 (confirmed: no file anywhere under
 * `packages/ca-tax/src/t2/forms/` or `research/sources/cra-forms/` for
 * "101") — it is GIFI-coded (opening balance sheet totals), which this
 * app's citation scheme does not carry line numbers for, same as the
 * balance-sheet/income-statement GIFI forms flagged separately.
 *
 * `isFirstReturn` is a UI-only gate this app uses to decide whether to file
 * S24/S101 at all — the printed forms have no yes/no checkbox of their own;
 * their EXISTENCE in a filing is the signal.
 *
 * `event` was cited in the guided editor as "(line 100)" — checked against
 * the extraction and that is WRONG. Line 100 asks "identify the type of
 * operation that applies to your corporation" against a 01-17/99 industry
 * classification list (Crown corporation, life insurer, co-op, bank, …) —
 * a corporation-type code, not a record of WHICH of incorporation /
 * amalgamation / wind-up triggered the filing. That fact is instead
 * signalled on the T2 jacket itself, at lines 070 / 071 / 072 (see
 * `identification-form-view.tsx`, fixed earlier this pass) — a wrong
 * citation is worse than none, so `event` is shown here with no S24 line
 * reference at all, pointing at the jacket instead.
 *
 * `predecessorBusinessNumbers` genuinely has real, event-dependent lines —
 * 300 (predecessor, amalgamation) or 500 (subsidiary, wind-up) — computed
 * here from the watched `event` value. The guided editor's own "(lines
 * 300 / 500)" citation was already correct, just static; this view makes
 * it event-specific.
 *
 * The predecessor/subsidiary NAME columns (lines 200 / 400) and the
 * wind-up's own commencement date (line 600, distinct from its completion
 * date at line 700) are not collected by this app at all — disclosed
 * below rather than silently dropped.
 */

const EVENT_BN_LINE: Record<NonNullable<FirstReturnValues["event"]>, string | undefined> = {
	incorporation: undefined,
	amalgamation: "300",
	windUpOfSubsidiary: "500",
};

const EVENT_DATE_LINE: Record<NonNullable<FirstReturnValues["event"]>, string | undefined> = {
	incorporation: undefined,
	amalgamation: undefined,
	windUpOfSubsidiary: "700",
};

export function FirstReturnFormView({
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
	const frControl = control as unknown as Control<FirstReturnValues>;
	const event = useWatch({ control: frControl, name: "event" });

	const bnLine = event ? EVENT_BN_LINE[event] : undefined;
	const dateLine = event ? EVENT_DATE_LINE[event] : undefined;

	return (
		<div className="space-y-4">
			<PaperSection
				title="First return? (UI-only gate — no CRA line)"
				description="Neither S24 nor S101 exists as a blank optional form — filing either at all is the signal. This switch controls whether this app includes them, not a printed checkbox."
			>
				<PaperLeaderRow
					line="—"
					caption="Is this the corporation's first return (after incorporation, amalgamation, or wind-up)?"
					kind="bool-flag"
					role="input"
					onNavigate={onNavigate}
					highlightLine={highlightLine}
					control={frControl}
					resolveLine={(): LineValue => ({ editable: true, name: "isFirstReturn" })}
					disabled={disabled}
				/>
			</PaperSection>

			<PaperSection
				title="Schedule 24 — the event"
				description="Part 1 (line 100) asks for the corporation's industry-type code, not which event this is — not collected by this app (no equivalent field). The event itself is instead recorded on the T2 jacket, lines 070/071/072."
				formId="T2SCH24"
			>
				<PaperLeaderRow
					line="—"
					caption="What made this the first return? (incorporation / amalgamation / wind-up)"
					kind="text"
					role="input"
					note="No S24 line — see the T2 jacket's own lines 070 (after incorporation), 071 (after amalgamation), 072 (wind-up of a subsidiary)."
					onNavigate={onNavigate}
					highlightLine={highlightLine}
					control={frControl}
					resolveLine={(): LineValue => ({ editable: true, name: "event" })}
					disabled={disabled}
				/>
				<PaperLeaderRow
					line={dateLine ?? "—"}
					caption={
						dateLine
							? "Date of the wind-up (Part 3)"
							: "Date of the event — no S24 line for incorporation or amalgamation"
					}
					kind="date"
					role="input"
					note={
						dateLine
							? "Part 3's own commencement date of the wind-up (line 600) is a separate field this app does not collect."
							: "Schedule 24 has no date field for a plain incorporation or amalgamation — established by the corporate record, not filed here."
					}
					onNavigate={onNavigate}
					highlightLine={highlightLine}
					control={frControl}
					resolveLine={(): LineValue => ({ editable: true, name: "eventDate" })}
					disabled={disabled}
				/>
				<PaperLeaderRow
					line={bnLine ?? "—"}
					caption={
						event === "windUpOfSubsidiary"
							? "Business number(s) of the subsidiary corporation(s) (Part 3)"
							: event === "amalgamation"
								? "Business number(s) of the predecessor corporation(s) (Part 2)"
								: "Predecessor / subsidiary business number(s) — not applicable to a plain incorporation"
					}
					kind="text"
					role="input"
					note="Enter NR for a predecessor/subsidiary that was not registered (the form's own instruction). The corporation NAME(s) that go with these numbers — lines 200 (predecessor) / 400 (subsidiary) — are not collected by this app."
					onNavigate={onNavigate}
					highlightLine={highlightLine}
					control={frControl}
					resolveLine={(): LineValue => ({ editable: true, name: "predecessorBusinessNumbers" })}
					disabled={disabled}
				/>
			</PaperSection>

			<PaperSection
				title="Schedule 101 — opening balance sheet"
				description="GIFI-coded totals at the start of the first tax year, not a numbered leader-row schedule — no line numbers to cite (confirmed: no FormDefinition or vendored PDF exists for S101). The engine blocks filing when assets ≠ liabilities + equity."
			>
				<PaperLeaderRow
					line="—"
					caption="Total assets at the start of the year"
					kind="money"
					role="input"
					onNavigate={onNavigate}
					highlightLine={highlightLine}
					control={frControl}
					resolveLine={(): LineValue => ({ editable: true, name: "openingAssets" })}
					disabled={disabled}
				/>
				<PaperLeaderRow
					line="—"
					caption="Total liabilities"
					kind="money"
					role="input"
					onNavigate={onNavigate}
					highlightLine={highlightLine}
					control={frControl}
					resolveLine={(): LineValue => ({ editable: true, name: "openingLiabilities" })}
					disabled={disabled}
				/>
				<PaperLeaderRow
					line="—"
					caption="Total equity"
					kind="money"
					role="input"
					note="Assets must equal liabilities plus equity — an opening sheet that does not balance blocks filing."
					onNavigate={onNavigate}
					highlightLine={highlightLine}
					control={frControl}
					resolveLine={(): LineValue => ({ editable: true, name: "openingEquity" })}
					disabled={disabled}
				/>
			</PaperSection>
		</div>
	);
}
