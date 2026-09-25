/**
 * The steps that turn a form's values into what the working-return contract
 * accepts. Plain functions, apart from the views, so they are testable.
 */

/**
 * A cleared box is `null` in the form (see `PaperMoney`) and absent in the
 * return. `undefined` cannot stand in for it: react-hook-form treats an
 * undefined field as never set and shows the value the form opened with, so
 * clearing a saved figure silently restored it.
 *
 * Only object properties are dropped — an array keeps its positions, because
 * a row's index is its meaning (Schedule 10's and Schedule 4's i-th preceding
 * year). A hole such a row leaves behind — typing into the second year first —
 * becomes an empty row, which is what it is; `null` is not a row the contract
 * accepts.
 *
 * Only in a list of ROWS, though. An array of plain values keeps its holes as
 * `null`: Schedule 1's digit-keyed lines can arrive as a sparse array whose
 * index is the line number, and the server turns exactly that shape — numbers
 * and nulls — back into its record. An `{}` there is refused.
 */
export function withoutNulls(v: unknown): unknown {
	if (Array.isArray(v)) {
		const rows = v.some((x) => x != null && typeof x === "object");
		return Array.from(v, (x) =>
			x == null ? (rows ? {} : null) : withoutNulls(x),
		);
	}
	if (v && typeof v === "object") {
		return Object.fromEntries(
			Object.entries(v as Record<string, unknown>)
				.filter(([, x]) => x !== null)
				.map(([k, x]) => [k, withoutNulls(x)]),
		);
	}
	return v;
}

/**
 * Schedule 2, bound to the jacket's `alberta` slice: a blank formula choice is
 * "No" — absent, not an empty string the contract's enum would refuse — and a
 * cleared Area B box is removed.
 */
export function normalizeSchedule2(
	values: Record<string, unknown>,
): Record<string, unknown> {
	const out = { ...values };
	if (!out.specialAllocationFormula) delete out.specialAllocationFormula;
	const areaB = out.allocationAreaB as Record<string, unknown> | undefined;
	if (areaB) {
		const kept = Object.fromEntries(
			Object.entries(areaB).filter(
				([, v]) => typeof v === "number" && Number.isFinite(v),
			),
		);
		if (Object.keys(kept).length) out.allocationAreaB = kept;
		else delete out.allocationAreaB;
	}
	return out;
}

const CARRYBACK_KEYS = [
	"nonCapitalCarrybacks",
	"farmCarrybacks",
	"otherLossCarrybacks",
	"capitalCarrybacks",
] as const;

/**
 * Schedule 10, bound to `albertaContinuity`: typing into the 2nd preceding
 * year of an empty column leaves a hole at index 0, which serializes as
 * `null` — not a row the contract accepts. A hole is an untouched row.
 */
export function normalizeSchedule10(
	values: Record<string, unknown>,
): Record<string, unknown> {
	const out = { ...values };
	for (const key of CARRYBACK_KEYS) {
		const rows = out[key];
		if (Array.isArray(rows)) out[key] = Array.from(rows, (r) => r ?? {});
	}
	return out;
}
