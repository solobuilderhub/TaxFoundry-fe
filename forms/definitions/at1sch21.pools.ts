/**
 * AT1 Schedule 21's continuity grid — which line number each pool uses for each
 * row of the continuity.
 *
 * HAND-MAINTAINED, and deliberately NOT produced by `scripts/vendor-form.ts`:
 * a `FormDefinition` is a flat list of fields, and this is the matrix that flat
 * list can't express. The printed form lays the continuity out as columns (one
 * per loss pool) crossed with rows (carried forward, expired, applied, …), and
 * shades the cells that don't apply — net capital losses have no "losses
 * expired" row, listed personal property has no wind-up transfer or section 80
 * adjustment. An absent key here IS that shaded cell.
 *
 * ── This holds line numbers and nothing else ────────────────────────────────
 *
 * Captions, roles, notes, cross-references and footnote markers all live on the
 * field in `at1sch21.ts`, keyed by line. That is the fix for the defect this
 * structure used to carry: it once held its own caption per ROW, shared across
 * every pool, so five different official captions collapsed into one —
 *
 *   041  Amount applied against taxable income
 *   061  Amount applied against current year capital gain
 *   079  Amount applied against taxable income
 *   099  Amount applied against farming income
 *   119  Amount applied against listed personal property gain
 *
 * all rendered as "Applied against income". Two places describing one line is
 * how that happened; one place is how it stays fixed.
 */

/**
 * A row of the continuity, in the order the form prints them.
 *
 * The four `appliedAgainst…` kinds are deliberately separate rather than one
 * shared "applied" row. The form prints them as four distinct rows, each with a
 * different caption and every other pool's cell shaded out — a non-capital loss
 * is applied against TAXABLE INCOME, a capital loss against a CAPITAL GAIN, a
 * restricted farm loss against FARMING INCOME, and a listed personal property
 * loss against an LPP GAIN. Collapsing them into one row is what forced the
 * single misleading caption "Applied against income" onto all five pools.
 */
export type Schedule21RowKind =
	| "carriedForward"
	| "expired"
	| "opening"
	| "windUpTransfer"
	| "currentYearLoss"
	| "abilExpired"
	| "appliedAgainstTaxableIncome"
	| "appliedAgainstCapitalGain"
	| "appliedAgainstFarmingIncome"
	| "appliedAgainstLppGain"
	| "section80Adjustment"
	| "otherAdjustments"
	| "carryBack"
	| "closing";

/**
 * Row order, top to bottom as printed.
 *
 * `abilExpired` sits between the current-year loss and the "Deduct:" block
 * because the form places it there — it is the last of the additions, and it
 * exists only in the capital column.
 */
export const AT1_SCHEDULE_21_CONTINUITY_ORDER: readonly Schedule21RowKind[] = [
	"carriedForward",
	"expired",
	"opening",
	"windUpTransfer",
	"currentYearLoss",
	"abilExpired",
	"appliedAgainstTaxableIncome",
	"appliedAgainstCapitalGain",
	"appliedAgainstFarmingIncome",
	"appliedAgainstLppGain",
	"section80Adjustment",
	"otherAdjustments",
	"carryBack",
	"closing",
];

/**
 * The printed form does NOT lay the continuity out as one wide table. It prints
 * three separate blocks, each with its own column headings:
 *
 *   page 1   NON-CAPITAL LOSSES  |  CAPITAL LOSSES (gross amount)
 *   page 2   FARM LOSSES         |  RESTRICTED FARM LOSSES
 *   page 2   LISTED PERSONAL PROPERTY LOSSES
 *
 * Rendering all five pools as one five-column grid produced a cell for every
 * (pool, row) pair, and most of them don't exist — a farm loss has no
 * "applied against current year capital gain" row, capital losses have no
 * expiry row. Those became a wall of "—" placeholders that made the table
 * unreadable and impossible to check against the paper.
 *
 * Splitting by block drops those cells entirely, because a row is only rendered
 * for the pools in its own block.
 */
export interface Schedule21Block {
	id: string;
	/** Page of the printed form this block appears on. */
	page: number;
	/** Which columns this block prints, left to right. */
	poolKeys: readonly string[];
	/**
	 * The row after which the form prints its unnumbered "Subtotal" divider.
	 * Page 1 carries the ABIL-expired addition (line 059) above it; the other
	 * blocks have no such row, so their subtotal follows the current-year loss.
	 */
	subtotalAfter: Schedule21RowKind;
}

export const AT1_SCHEDULE_21_BLOCKS: readonly Schedule21Block[] = [
	{
		id: "non-capital-and-capital",
		page: 1,
		poolKeys: ["non-capital", "capital"],
		subtotalAfter: "abilExpired",
	},
	{
		id: "farm-and-restricted-farm",
		page: 2,
		poolKeys: ["farm", "restricted-farm"],
		subtotalAfter: "currentYearLoss",
	},
	{
		id: "listed-personal",
		page: 2,
		poolKeys: ["listed-personal"],
		subtotalAfter: "currentYearLoss",
	},
];

export interface Schedule21Pool {
	/** Stable key — also the `section` id these lines belong to in `at1sch21.ts`. */
	key: string;
	/** Column heading on the printed form. */
	label: string;
	/**
	 * Row kind → the 3-digit field number in this pool's column. A missing entry
	 * is a cell the form shades out, and the grid renders nothing for it.
	 */
	lines: Partial<Record<Schedule21RowKind, string>>;
}

export const AT1_SCHEDULE_21_POOLS: readonly Schedule21Pool[] = [
	{
		key: "non-capital",
		label: "Non-capital losses",
		lines: {
			carriedForward: "031",
			expired: "032",
			opening: "033",
			windUpTransfer: "035",
			currentYearLoss: "037",
			appliedAgainstTaxableIncome: "041",
			section80Adjustment: "043",
			otherAdjustments: "045",
			carryBack: "047",
			closing: "049",
		},
	},
	{
		key: "capital",
		label: "Capital losses (gross amount)",
		lines: {
			carriedForward: "051",
			windUpTransfer: "055",
			currentYearLoss: "057",
			abilExpired: "059",
			appliedAgainstCapitalGain: "061",
			section80Adjustment: "063",
			otherAdjustments: "065",
			carryBack: "067",
			closing: "069",
		},
	},
	{
		key: "farm",
		label: "Farm losses",
		lines: {
			carriedForward: "071",
			expired: "072",
			opening: "073",
			windUpTransfer: "075",
			currentYearLoss: "077",
			appliedAgainstTaxableIncome: "079",
			section80Adjustment: "081",
			otherAdjustments: "083",
			carryBack: "085",
			closing: "087",
		},
	},
	{
		key: "restricted-farm",
		label: "Restricted farm losses",
		lines: {
			carriedForward: "091",
			expired: "092",
			opening: "093",
			windUpTransfer: "095",
			currentYearLoss: "097",
			appliedAgainstFarmingIncome: "099",
			section80Adjustment: "101",
			otherAdjustments: "103",
			carryBack: "105",
			closing: "107",
		},
	},
	{
		key: "listed-personal",
		label: "Listed personal property losses",
		lines: {
			carriedForward: "111",
			expired: "113",
			opening: "115",
			currentYearLoss: "117",
			appliedAgainstLppGain: "119",
			otherAdjustments: "121",
			carryBack: "123",
			closing: "125",
		},
	},
];
