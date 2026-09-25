import type { PaperFieldKind } from "../../at1/paper/resolve-line";

/**
 * A T2 line's kind as its box must render it.
 *
 * Every yes/no on the federal contract is a real boolean (the T2 slices have
 * no "yes"/"no" strings at all), while the generated layouts call them `flag`
 * — the AT1's kind, whose box stores the literal "yes"/"no". Rendered as such,
 * a T2 answer saved a string into a boolean field and the API refused the
 * save. `bool-flag` is the same radio pair storing `true`/`false`.
 */
export const federalKind = (kind: PaperFieldKind): PaperFieldKind =>
	kind === "flag" ? "bool-flag" : kind;
