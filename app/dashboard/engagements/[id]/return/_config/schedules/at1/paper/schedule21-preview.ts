/**
 * Live preview of the lines AT1 Schedule 21 derives.
 *
 * MIRRORS the engine, never replaces it — the same rule `_lib/calc.ts` follows
 * for every other schedule. These are the numbers a preparer sees while typing;
 * only the server's computed return is ever filed.
 *
 * Without this, a derived line read its value out of the LAST computed return's
 * filed payload, so it sat at "—" until a compute had run and never moved while
 * the preparer entered the figures directly above it.
 *
 * Every formula here is the form's own, quoted from TRA11741 Rev. 2026-03 and
 * recorded as `formula` on the matching field in `forms/definitions/at1sch21.ts`:
 *
 *   013  Subtotal of lines 002 to 012
 *   015  Line 001 - line 013: (if positive, enter "0")
 *   021  Line 015 - 017 + 019 (if positive, enter "0")
 *   310  Line 200 + line 210 - line 220
 *   340  Line 320 plus line 330
 *   350  Lesser of line 310 and line 340
 *
 * Line 250 (closing RIFE balance) is deliberately absent: the form prints no
 * formula for it, and inferring one would render as authoritative while being
 * nobody's stated rule.
 *
 * The two floors keep only a LOSS — those lines carry a negative number, and a
 * positive result means income rather than a loss, so the form has you write
 * zero. That is `Math.min(0, x)`, not `Math.max`.
 */
import type { AlbertaContinuityValues } from "../../../../_lib/return-input";

const n = (v: unknown): number => (v == null || v === "" ? 0 : Number(v) || 0);

/**
 * @param values the live `albertaContinuity` slice, straight from form state
 * @param filed reads a line's figure from the last computed return. Only line
 *   001 needs it now: it is carried in from AT1 Schedule 12, which this system
 *   computes, so it is never entered by hand. `undefined` leaves 015 and 021
 *   undefined rather than defaulting to nil — treating unknown net income as
 *   zero would show a fabricated loss equal to the deductions entered so far.
 */
export function previewDerivedLines(
	values: AlbertaContinuityValues | undefined,
	filed: (line: string) => number | undefined,
): Record<string, number | undefined> {
	const v = values ?? {};

	// ── Part 1 ────────────────────────────────────────────────────────────────
	const line013 =
		n(v.rifeDeducted) +
		n(v.netCapitalLossesDeducted) +
		n(v.taxableDividendsDeductible) +
		n(v.partVI1TaxDeductible) +
		n(v.prospectorAndGrubstakerShares) +
		n(v.nonQualifiedSecuritiesDeduction);

	const netIncome = filed("001");
	const line015 =
		netIncome === undefined ? undefined : Math.min(0, netIncome - line013);

	const line021 =
		line015 === undefined
			? undefined
			: Math.min(
					0,
					line015 - n(v.foreignTaxCreditAdditions) + n(v.currentYearFarmLossAddBack),
				);

	// ── Page 5, RIFE ──────────────────────────────────────────────────────────
	const line310 =
		n(v.rifeClosingPreviousYear) +
		n(v.rifeTransferredOnAmalgamation) -
		n(v.rifeAcquisitionOfControlAdjustment);

	// 320 and 330 are transcribed off federal Schedule 130 by the preparer — this
	// engine has no federal EIFEL module to derive them from — so they are read
	// from live form state like any other entry, and 340/350 resolve immediately.
	const line340 = n(v.excessCapacityForYear) + n(v.receivedCapacityForYear);
	const line350 = Math.min(line310, line340);

	return {
		"013": line013,
		"015": line015,
		"021": line021,
		"310": line310,
		"340": line340,
		"350": line350,
	};
}
