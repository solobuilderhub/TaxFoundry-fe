"use client";

import { type Control, useWatch } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type { FirstReturnValues } from "../../../../_lib/return-input";
import {
	PaperLeaderRow,
	PaperSection,
} from "../../at1/paper/components/paper-primitives";
import type { LineValue, NavigateToLine } from "../../at1/paper/resolve-line";
import {
	T2_SCHEDULE_24_FIELDS,
	T2_SCHEDULE_24_SECTIONS,
} from "./generated/schedule24.layout";
import { PaperFormSections } from "./paper-form-sections";

/**
 * Federal T2 Schedule 24 (event) + Schedule 101 (opening balance sheet).
 * Schedule 24's line numbers and captions come from
 * `generated/schedule24.layout.ts`. No FormDefinition or vendored PDF exists
 * for Schedule 101 (confirmed: no file anywhere under
 * `packages/ca-tax/src/t2/forms/` or `research/sources/cra-forms/` for "101")
 * — it is GIFI-coded (opening balance sheet totals), which this app's citation
 * scheme does not carry line numbers for, same as the balance-sheet and
 * income-statement GIFI forms flagged separately. Its three fields are
 * therefore still rendered by hand, below.
 *
 * `isFirstReturn` is a UI-only gate this app uses to decide whether to file
 * S24/S101 at all — the printed forms have no yes/no checkbox of their own;
 * their EXISTENCE in a filing is the signal.
 *
 * `event` was cited in the guided editor as "(line 100)" — checked against the
 * form and that is WRONG. Line 100 asks for the type of operation that applies
 * to the corporation, against a 01-17/99 industry classification list (Crown
 * corporation, life insurer, co-op, bank, …) — a corporation-type code, not a
 * record of WHICH of incorporation / amalgamation / wind-up triggered the
 * filing. That fact is instead signalled on the T2 jacket itself, at lines
 * 070 / 071 / 072 (see `identification-form-view.tsx`). A wrong citation is
 * worse than none, so `event` is bound to no S24 line at all and points at the
 * jacket instead; line 100 renders read-only from the layout, uncollected.
 *
 * `predecessorBusinessNumbers` and `eventDate` genuinely have real,
 * event-dependent lines, so they are bound per event rather than statically:
 * business numbers to 300 (predecessor, amalgamation) or 500 (subsidiary,
 * wind-up), and the date to 700 (the wind-up's own completion date). The
 * guided editor's "(lines 300 / 500)" citation was already correct, just
 * static. Where the event provides no line — a plain incorporation has no
 * predecessor at all, and Schedule 24 has no date field for an incorporation
 * or an amalgamation — the field is still collected, by a hand-written row
 * that cites no line, since binding it to a line the form does not have would
 * be inventing one.
 *
 * The predecessor/subsidiary NAME columns (lines 200 / 400) and the wind-up's
 * own commencement date (line 600, distinct from its completion date at line
 * 700) are not collected by this app at all — they render read-only from the
 * layout rather than being silently dropped.
 */

const EVENT_BN_LINE: Record<
	NonNullable<FirstReturnValues["event"]>,
	string | undefined
> = {
	incorporation: undefined,
	amalgamation: "300",
	windUpOfSubsidiary: "500",
};

const EVENT_DATE_LINE: Record<
	NonNullable<FirstReturnValues["event"]>,
	string | undefined
> = {
	incorporation: undefined,
	amalgamation: undefined,
	windUpOfSubsidiary: "700",
};

export function FirstReturnFormView({
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
	const frControl = control as unknown as Control<FirstReturnValues>;
	const event = useWatch({ control: frControl, name: "event" });

	const bnLine = event ? EVENT_BN_LINE[event] : undefined;
	const dateLine = event ? EVENT_DATE_LINE[event] : undefined;

	const boundFields: Record<string, string | undefined> = {};
	if (bnLine) boundFields[bnLine] = "predecessorBusinessNumbers";
	if (dateLine) boundFields[dateLine] = "eventDate";

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
					resolveLine={(): LineValue => ({
						editable: true,
						name: "isFirstReturn",
					})}
					disabled={disabled}
				/>
			</PaperSection>

			<PaperSection
				title="The event — no Schedule 24 line of its own"
				description="Schedule 24 never asks which event triggered the filing; the T2 jacket does, at lines 070/071/072. Part 1's line 100 asks for the corporation's industry-type code instead, and this app has no field for it."
			>
				<PaperLeaderRow
					line="—"
					caption="What made this the first return? (incorporation / amalgamation / wind-up)"
					kind="text"
					role="input"
					note="No S24 line — see the T2 jacket's own lines 070 (after incorporation), 071 (after amalgamation), 072 (wind-up of a subsidiary). Not line 100, which is the industry-type code."
					onNavigate={onNavigate}
					highlightLine={highlightLine}
					control={frControl}
					resolveLine={(): LineValue => ({ editable: true, name: "event" })}
					disabled={disabled}
				/>
				{!dateLine && (
					<PaperLeaderRow
						line="—"
						caption="Date of the event — no S24 line for incorporation or amalgamation"
						kind="date"
						role="input"
						note="Schedule 24 has no date field for a plain incorporation or amalgamation — established by the corporate record, not filed here. A wind-up's own date is collected at line 700 in Part 3 instead."
						onNavigate={onNavigate}
						highlightLine={highlightLine}
						control={frControl}
						resolveLine={(): LineValue => ({
							editable: true,
							name: "eventDate",
						})}
						disabled={disabled}
					/>
				)}
				{!bnLine && (
					<PaperLeaderRow
						line="—"
						caption="Predecessor / subsidiary business number(s) — not applicable to a plain incorporation"
						kind="text"
						role="input"
						note="An amalgamation files these at line 300 and a wind-up at line 500; a plain incorporation has neither, so this row cites no line. Enter NR for a predecessor or subsidiary that was not registered (the form's own instruction)."
						onNavigate={onNavigate}
						highlightLine={highlightLine}
						control={frControl}
						resolveLine={(): LineValue => ({
							editable: true,
							name: "predecessorBusinessNumbers",
						})}
						disabled={disabled}
					/>
				)}
			</PaperSection>

			<PaperFormSections
				sections={T2_SCHEDULE_24_SECTIONS}
				fields={T2_SCHEDULE_24_FIELDS}
				control={control}
				boundFields={boundFields}
				computed={computed}
				scheduleId="T2SCH24"
				disabled={disabled}
				onNavigate={onNavigate}
				highlightLine={highlightLine}
				formId="T2SCH24"
			/>

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
					resolveLine={(): LineValue => ({
						editable: true,
						name: "openingAssets",
					})}
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
					resolveLine={(): LineValue => ({
						editable: true,
						name: "openingLiabilities",
					})}
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
					resolveLine={(): LineValue => ({
						editable: true,
						name: "openingEquity",
					})}
					disabled={disabled}
				/>
			</PaperSection>
		</div>
	);
}
