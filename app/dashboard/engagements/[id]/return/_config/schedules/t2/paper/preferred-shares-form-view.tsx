"use client";

import { useWatch, type Control } from "react-hook-form";
import type { PreferredSharesValues } from "../../../../_lib/return-input";
import { PaperLeaderRow, PaperSection } from "../../at1/paper/components/paper-primitives";
import type { LineValue, NavigateToLine } from "../../at1/paper/resolve-line";

/**
 * Federal T2 Schedule 43 — Parts IV.1 and VI.1 taxes. Verified against
 * `packages/ca-tax/src/t2/forms/generated/schedule43.captions.ts` (generated
 * from the rendered form) and the raw `pdftotext -layout` text for the parts
 * the generator didn't reach (Part 1's own 100-115 grid, Part 2's per-
 * corporation allocation grid) — confirmed reliable enough to read line 140
 * off line 210's own caption text ("...the total amount allocated on line
 * 140 (from Part 2)"), even though 140 itself is a column heading, not a
 * standalone leader row.
 *
 * The guided editor's existing citations — 220 (short-term), "230 / 240"
 * (other, split by the election), 140 (allocated allowance) — were all
 * already correct, including the deliberately-plural "230 / 240" (see that
 * field's own description: the election decides which one line 210's whole
 * amount actually lands on).
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
 * The engine's own doc comment on `computeSchedule43` flags a real,
 * pre-existing gap worth surfacing to a preparer: the s.110(1)(k) deduction
 * against taxable income (a multiple of the Part VI.1 tax paid) is NOT YET
 * applied — `deductionPending` is returned true instead. Not a paper-view
 * scoping issue; disclosed because it changes what "line 270 is computed"
 * actually means for this return.
 *
 * Part 2's administrative header (116/117/118) and the allocation grid's
 * name/BN columns (120/130), and the ENTIRE Part 4 (Part IV.1 tax on
 * dividends RECEIVED, lines 310-400) are not collected by this app at all
 * — `PreferredSharesValues` only has payer-side (Part VI.1) fields.
 */
export function PreferredSharesFormView({
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
	const psControl = control as unknown as Control<PreferredSharesValues>;
	const electedUnder191_2 = useWatch({ control: psControl, name: "electedUnder191_2" });
	const isAssociated = useWatch({ control: psControl, name: "isAssociated" });

	const otherLine = electedUnder191_2 ? "230" : "240";

	return (
		<div className="space-y-4">
			<PaperSection
				title="Part 1 — Dividend allowance"
				description="The $500,000 shelter, reduced dollar-for-dollar where last year's non-excluded preferred dividends exceeded $1,000,000."
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
					resolveLine={(): LineValue => ({ editable: true, name: "priorYearPreferredDividends" })}
					disabled={disabled}
				/>
				<PaperLeaderRow
					line="115"
					caption="Dividend allowance (amount 1A minus line 110)"
					kind="money"
					role="computed"
					note="Computed by the engine from the tax year's rates ($500,000 basic allowance, $1,000,000 grind threshold) — not duplicated here to avoid drift if those rates ever change by year."
					control={psControl}
					resolveLine={(): LineValue => ({ editable: false, value: undefined })}
					disabled={disabled}
				/>
			</PaperSection>

			<PaperSection
				title="Part 2 — Agreement among associated corporations"
				description="An associated group shares ONE allowance and allocates it. This app collects only the allocated amount (line 140) — the agreement's own date/amendment/year fields (116/117/118) and the other associated corporations' names (120) and business numbers (130) are not collected."
				formId="T2SCH43"
			>
				<PaperLeaderRow
					line="—"
					caption="Associated with one or more other corporations?"
					kind="bool-flag"
					role="input"
					note="UI-only gate — the printed form has no such checkbox; a filed Part 2 agreement (or its absence) is the answer. Without one, the statute gives an associated corporation NIL allowance, not the full $500,000 — the engine enforces this."
					onNavigate={onNavigate}
					highlightLine={highlightLine}
					control={psControl}
					resolveLine={(): LineValue => ({ editable: true, name: "isAssociated" })}
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
						resolveLine={(): LineValue => ({ editable: true, name: "allocatedAllowance" })}
						disabled={disabled}
					/>
				)}
			</PaperSection>

			<PaperSection
				title="Part 3 — Part VI.1 tax payable"
				description="The tax on THIS corporation for paying a taxable preferred share dividend."
				formId="T2SCH43"
			>
				<PaperLeaderRow
					line="210"
					caption="Dividend allowance (from line 115, or line 140 if associated)"
					kind="money"
					role="carried-in"
					control={psControl}
					resolveLine={(): LineValue => ({ editable: false, value: undefined })}
					disabled={disabled}
				/>
				<PaperLeaderRow
					line="220"
					caption="Taxable dividends paid on short-term preferred shares"
					kind="money"
					role="input"
					note="Taxed at 40% above the allowance — consumed against this band first."
					onNavigate={onNavigate}
					highlightLine={highlightLine}
					control={psControl}
					resolveLine={(): LineValue => ({ editable: true, name: "shortTermPreferredDividends" })}
					disabled={disabled}
				/>
				<PaperLeaderRow
					line="—"
					caption="Elected under s.191.2(1) (raises the 'other' rate below to 40%)?"
					kind="bool-flag"
					role="input"
					note="UI-only gate — no checkbox of its own on the printed form; which of line 230 (elected) or 240 (not elected) the amount below lands on IS the answer."
					onNavigate={onNavigate}
					highlightLine={highlightLine}
					control={psControl}
					resolveLine={(): LineValue => ({ editable: true, name: "electedUnder191_2" })}
					disabled={disabled}
				/>
				<PaperLeaderRow
					line={otherLine}
					caption={
						electedUnder191_2
							? "Taxable dividends on other taxable preferred shares — election MADE (40% rate)"
							: "Taxable dividends on other taxable preferred shares — election NOT made (25% rate)"
					}
					kind="money"
					role="input"
					onNavigate={onNavigate}
					highlightLine={highlightLine}
					control={psControl}
					resolveLine={(): LineValue => ({ editable: true, name: "otherPreferredDividends" })}
					disabled={disabled}
				/>
				<PaperLeaderRow
					line="250"
					caption="Part VI.1 tax transferred from a related corporation"
					kind="money"
					role="input"
					note="Requires a s.191.3 agreement and Schedule 45 — not collected by this app."
					control={psControl}
					resolveLine={(): LineValue => ({ editable: false, value: undefined })}
					disabled={disabled}
				/>
				<PaperLeaderRow
					line="260"
					caption="Part VI.1 tax transferred to a related corporation"
					kind="money"
					role="input"
					note="Requires a s.191.3 agreement and Schedule 45 — not collected by this app."
					control={psControl}
					resolveLine={(): LineValue => ({ editable: false, value: undefined })}
					disabled={disabled}
				/>
				<PaperLeaderRow
					line="270"
					caption="Part VI.1 tax payable → T2 jacket line 724"
					kind="money"
					role="computed"
					note="Computed by the engine — the multi-band 'lesser of the excess or the remaining allowance' calculation is not duplicated here. The corresponding s.110(1)(k) deduction against taxable income (a multiple of this figure) is a known, separate engine gap — not yet applied when this tax is payable."
					control={psControl}
					resolveLine={(): LineValue => ({ editable: false, value: undefined })}
					disabled={disabled}
				/>
			</PaperSection>

			<PaperSection
				title="Part 4 — Part IV.1 tax payable — not modelled"
				description="The tax on the corporation RECEIVING a taxable preferred share dividend (lines 310-400). This app's PreferredSharesValues has no receiver-side fields at all."
			>
				<p className="p-4 text-xs text-muted-foreground">Not modelled — no fields collected for this Part.</p>
			</PaperSection>
		</div>
	);
}
