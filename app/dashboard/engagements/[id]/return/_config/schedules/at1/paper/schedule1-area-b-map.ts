/**
 * AT1 Schedule 1 Area B — which engine amount fills which lettered box.
 *
 * Data, not UI, and kept out of `schedule1-form-view.tsx` so it can be checked
 * without pulling in the React tree (the view imports fluid's tooltip, which
 * needs the app's path aliases). `tests/at1-schedule1-area-b.test.ts` asserts
 * that every letter the page prints appears in exactly one of these two maps.
 *
 * Area B is the working behind line 015, the base amount the whole small
 * business deduction is scaled by. Every box used to render empty: the engine
 * computed the cascade and discarded each intermediate, so line 015 showed a
 * "Computed" badge over a blank cell with nothing to explain it.
 */

/**
 * Keyed by the letter the page prints, because that is the only identifier
 * these rows have — none of them is a numbered line, and §3.2.3.2 defines no
 * row for any of them. The engine's side is `AlbertaSbdResult.areaB`, surfaced
 * on the computed return as `sbdAreaB.*` by the server's `at1-compute.ts`.
 */
export const AREA_B_AMOUNT: Record<string, string> = {
	"(a)": "baseAmount",
	// Absent on a full year — the form routes around this box ("If adjustments
	// are not required, enter Amount (a) on line 015"), so a blank here is the
	// page's own answer rather than a missing figure.
	"(b)": "proratedBaseAmount",
	/*
	 * A and B are NOT boxes on TRA11723.
	 *
	 * Every lettered row from (a) to (k) carries an amount rule on the page;
	 * A, B and the three (1)/(2)/(3) variants carry none — they define the
	 * symbols the (c) formula uses. (Another product renders them as fillable
	 * boxes; that is its own addition, not the form.)
	 *
	 * Shown as derived read-only values anyway, because "(c) = A x (B / 90000)"
	 * is unreadable without them, and labelled on the page as not being boxes.
	 */
	A: "thresholdForReduction",
	B: "taxableCapitalFactor",
	"(c)": "reductionTaxableCapital",
	"(d)": "aaiiOverThreshold",
	"(e)": "reductionPassiveIncome",
	"(f)": "reductionApplied",
	"(h)": "reducedBusinessLimit",
};

/**
 * Why a lettered box stays blank, in the box's own terms.
 *
 * Stated rather than left empty: an unexplained blank is what made Area B
 * unreadable in the first place, and it is indistinguishable from a computed
 * nil. (g)/(j)/(k) are the pre-2019 branches and the federal line 515
 * assignment, which this engine does not model.
 */
export const AREA_B_BLANK_REASON: Record<string, string> = {
	"(g)":
		"Pre-2019 branch — this return is computed on the post-2018 rule at (h).",
	"(i)":
		"Not modelled: the federal T2 line 515 business limit assignment has no field on either side of this engine. Left blank rather than reported as nil, because a nil here would assert that nothing was assigned.",
	"(j)": "Pre-2019 branch, and depends on (i), which is not modelled.",
	"(k)": "Depends on (i), which is not modelled. The return uses (h).",
};

/**
 * The two "(c)" rows are the same amount under two different divisors, one per
 * era, and only one applies to any given return. The engine computes the
 * post-2022-04-06 rule, so the pre-April-2022 row is left blank and says so
 * rather than repeating the figure under a divisor that did not produce it.
 */
export const isSupersededPre2022C = (step: {
	letter: string;
	heading?: string;
}): boolean =>
	step.letter === "(c)" &&
	step.heading?.includes("before April 7, 2022") === true;
