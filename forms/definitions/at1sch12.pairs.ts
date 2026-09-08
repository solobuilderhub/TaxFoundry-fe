/**
 * AT1 Schedule 12's reconciling pairs — which federal line faces which Alberta
 * line on the same printed row.
 *
 * HAND-MAINTAINED, and deliberately NOT produced by `scripts/vendor-form.ts`:
 * a `FormDefinition` is a flat list of fields, and this is the pairing that flat
 * list can't express. Areas A and B print two money columns against one row
 * caption, and the whole schedule is the comparison between them.
 *
 * ── Corrections against TRA11732 Rev. 2026-03 ───────────────────────────────
 *
 * The upstream table had 27 pairs. Three the form prints were missing, all in
 * Area B's back half — the same stretch of the form the field list itself was
 * missing:
 *
 *   079 | 078   Prospector's and grubstaker's shares
 *   141 | 140   Employer deduction for non-qualified securities
 *   083 | 082   Add: ITA section 110.5 and/or subparagraph 115(1)(a)(vii) additions
 *
 * The dividends label also cited ITA section 186(6); the form says 138(6).
 *
 * ── What is NOT a pair ──────────────────────────────────────────────────────
 *
 * Column totals (050/052, 080/081) and the results they feed (054, 090, 091)
 * face each other on the page but are not reconciling ITEMS — they are derived,
 * and they carry a `formula` on the field instead. Line 042 (capital tax
 * liability in other provinces) is Alberta-only; the form shades its federal
 * side. Those, plus 002/048 and the ABI block, are the 14 unpaired lines.
 */

export interface Schedule12Pair {
	/** The row caption as printed, without the column suffix the fields carry. */
	label: string;
	/** 3-digit line in the Federal Dollar Amount column. */
	federal: string;
	/** 3-digit line in the Alberta Dollar Amount column. */
	alberta: string;
	/** The `section` id both lines belong to in `at1sch12.ts`. */
	section: string;
	/**
	 * Area A only: the form says to specify an item ONLY where the federal and
	 * Alberta amounts differ, so a pair that agrees is correctly absent from the
	 * filed payload rather than reported as nil.
	 *
	 * Area B is the opposite — "all of the following items must be specified" —
	 * so those pairs are always emitted, carrying the federal figure on both
	 * sides where Alberta does not diverge.
	 */
	emitOnlyWhenDifferent: boolean;
}

export const AT1_SCHEDULE_12_PAIRS: readonly Schedule12Pair[] = [
	// ── Area A — reported only where Alberta diverges ─────────────────────────
	{ label: "Capital Cost Allowance", federal: "005", alberta: "004", section: "area-a", emitOnlyWhenDifferent: true },
	{ label: "Recapture of CCA", federal: "007", alberta: "006", section: "area-a", emitOnlyWhenDifferent: true },
	{ label: "Terminal Loss", federal: "009", alberta: "008", section: "area-a", emitOnlyWhenDifferent: true },
	{ label: "Farming Inventory: Mandatory inventory adjustment included in current year", federal: "015", alberta: "014", section: "area-a", emitOnlyWhenDifferent: true },
	{ label: "Farming Inventory: Mandatory inventory adjustment included in prior year", federal: "017", alberta: "016", section: "area-a", emitOnlyWhenDifferent: true },
	{ label: "Farming Inventory: Optional value of inventory included in current year", federal: "019", alberta: "018", section: "area-a", emitOnlyWhenDifferent: true },
	{ label: "Farming Inventory: Optional value of inventory included in prior year", federal: "021", alberta: "020", section: "area-a", emitOnlyWhenDifferent: true },
	{ label: "Depletion", federal: "023", alberta: "022", section: "area-a", emitOnlyWhenDifferent: true },
	{ label: "Canadian Exploration Expenses (CEE)", federal: "027", alberta: "026", section: "area-a", emitOnlyWhenDifferent: true },
	{ label: "Canadian Development Expenses (CDE)", federal: "029", alberta: "028", section: "area-a", emitOnlyWhenDifferent: true },
	{ label: "Foreign Exploration and Development Expenses", federal: "031", alberta: "030", section: "area-a", emitOnlyWhenDifferent: true },
	{ label: "Canadian Oil and gas Property Expenses (COGPE)", federal: "033", alberta: "032", section: "area-a", emitOnlyWhenDifferent: true },
	{ label: "Scientific Research Expenses claimed in year", federal: "035", alberta: "034", section: "area-a", emitOnlyWhenDifferent: true },
	{ label: "Tax reserves deducted in prior year", federal: "037", alberta: "036", section: "area-a", emitOnlyWhenDifferent: true },
	{ label: "Tax reserves claimed in current year", federal: "039", alberta: "038", section: "area-a", emitOnlyWhenDifferent: true },
	{ label: "Other - Attach supporting schedule", federal: "041", alberta: "040", section: "area-a", emitOnlyWhenDifferent: true },

	// ── Area B — every item specified, in the form's printed order ────────────
	{ label: "Charitable Donations", federal: "057", alberta: "056", section: "area-b", emitOnlyWhenDifferent: false },
	{ label: "Gifts to Canada or a province, cultural gifts and ecological gifts", federal: "059", alberta: "058", section: "area-b", emitOnlyWhenDifferent: false },
	{ label: "Taxable dividends deductible under ITA section 112, 113 or 138(6)", federal: "061", alberta: "060", section: "area-b", emitOnlyWhenDifferent: false },
	{ label: "Part VI.1 tax deduction", federal: "063", alberta: "062", section: "area-b", emitOnlyWhenDifferent: false },
	{ label: "Non-capital losses of preceding taxation years", federal: "065", alberta: "064", section: "area-b", emitOnlyWhenDifferent: false },
	{ label: "Net-capital losses of preceding taxation years", federal: "067", alberta: "066", section: "area-b", emitOnlyWhenDifferent: false },
	{ label: "Restricted farm losses of preceding taxation years", federal: "069", alberta: "068", section: "area-b", emitOnlyWhenDifferent: false },
	{ label: "Farm losses of preceding taxation years", federal: "071", alberta: "070", section: "area-b", emitOnlyWhenDifferent: false },
	{ label: "Limited partnership losses of preceding taxation years", federal: "073", alberta: "072", section: "area-b", emitOnlyWhenDifferent: false },
	{ label: "Restricted interest and financing expenses", federal: "131", alberta: "130", section: "area-b", emitOnlyWhenDifferent: false },
	{ label: "Taxable capital gains or taxable dividends allocated from a central credit union", federal: "075", alberta: "074", section: "area-b", emitOnlyWhenDifferent: false },
	{ label: "Prospector's and grubstaker's shares", federal: "079", alberta: "078", section: "area-b", emitOnlyWhenDifferent: false },
	{ label: "Employer deduction for non-qualified securities", federal: "141", alberta: "140", section: "area-b", emitOnlyWhenDifferent: false },
	{ label: "Add: ITA section 110.5 and/or subparagraph 115(1)(a)(vii) additions", federal: "083", alberta: "082", section: "area-b", emitOnlyWhenDifferent: false },
];
