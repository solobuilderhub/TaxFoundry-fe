/**
 * Alberta Calculation of Current Year Loss and Continuity of Losses (AT1SCH21).
 *
 * HAND-MAINTAINED. Extracted from @classytic/ca-tax@0.0.15 by
 * `npx tsx scripts/vendor-form.ts AT1SCH21`, then corrected against the
 * published form. Do not re-run the extractor over this file — it would restore
 * the upstream text and undo the corrections below.
 *
 * Source: TRA11741 (AT173) Rev. 2026-03, the form as published.
 *
 * ── What changed from the extracted version ─────────────────────────────────
 *
 * The upstream definition was built from a summary field map rather than the
 * form, and every caption had been paraphrased. Paraphrasing lost the
 * instructions the form states INSIDE its captions, which are not decoration —
 * they are how the form specifies its own arithmetic:
 *
 *   · line 015 and 021 both floor at zero — `(if positive, enter "0")`
 *   · line 021 feeds line 037 as a positive when negative
 *   · line 017 carries forward to Schedule 12, line 082
 *   · lines 002 and 003 are entered as positive amounts
 *
 * Line 059 (allowable business investment loss expired) was missing entirely.
 *
 * The continuity was one flat `continuity` section, which forced all five pools
 * to share a single caption per row. The form does not: line 041 applies against
 * TAXABLE INCOME, 061 against a CAPITAL GAIN, 099 against FARMING INCOME and 119
 * against a LISTED PERSONAL PROPERTY GAIN. One section per pool lets each line
 * carry the caption actually printed beside it.
 *
 * Footnote markers were on the closing-balance rows. The form prints them on the
 * expiry rows — `*` on 032, `**` on 059, and the page-4 note on 072/092.
 *
 * Page 5 (the RIFE continuity, lines 200-350) was absent entirely and is now
 * modelled. Note what that does NOT yet buy: `AlbertaContinuityValues` has no
 * RIFE fields and the engine has no RIFE calculation, so these lines render but
 * are not collected, and the form's rule that line 240 must not exceed line 350
 * is stated here without being enforced anywhere.
 *
 * ── Still not modelled ──────────────────────────────────────────────────────
 *
 * The limited-partnership table (131-141) and the two by-year-of-origin ledgers
 * (151-169, 181-187), which are rendered by hand in
 * `alberta-loss-vintage-tables.tsx` without being registry fields.
 */
import type { FormDefinition } from "../types";

export const AT1_SCHEDULE_21: FormDefinition = {
	id: "AT1SCH21",
	program: "AT1",
	schedule: "021",
	title: "Alberta Calculation of Current Year Loss and Continuity of Losses",
	scheme: "tra-line-item-id",
	taxYears: { from: 2024 },
	provenance: {
		document: "AT1SCH21-loss-continuity-TRA11741.pdf",
		retrieved: "2026-09-07",
		revision: "TRA11741 (AT173) Rev. 2026-03 — captions transcribed from the published form",
	},
	sections: [
		{
			id: "current-year",
			title: "Calculation of current year non-capital loss",
			description:
				"Starts from Alberta net income on Schedule 12 line 054. Lines 002 to 012 are deducted, 017 is deducted and 019 is added.",
			page: 1,
		},
		{
			id: "non-capital",
			title: "Continuity of losses — Non-capital losses",
			page: 1,
		},
		{
			id: "capital",
			title: "Continuity of losses — Capital losses (gross amount)",
			description:
				"Tracked at the GROSS amount. Schedule 12 wants the allowable portion, so line 061 is multiplied by the inclusion rate on its way across.",
			page: 1,
			secondary: true,
		},
		{
			id: "farm",
			title: "Continuity of losses — Farm losses",
			page: 2,
		},
		{
			id: "restricted-farm",
			title: "Continuity of losses — Restricted farm losses",
			page: 2,
			secondary: true,
		},
		{
			id: "listed-personal",
			title: "Continuity of losses — Listed personal property losses",
			page: 2,
			secondary: true,
		},
		{
			id: "limited-partnership",
			title: "Continuity of limited partnership losses",
			description:
				"A repeating table, one row per partnership. Each line below is a COLUMN; the row is carried in the line id's occurrence triplet.",
			page: 2,
		},
		{
			id: "non-capital-vintage",
			title: "Analysis of balance of non-capital losses by year of origin",
			description:
				"One row per vintage — the current year, then the 1st through 20th preceding taxation years. Each line below is a column; the vintage is the occurrence.",
			page: 3,
		},
		{
			id: "other-vintage",
			title: "Analysis of balance of losses by year of origin",
			description:
				"The same vintage ledger for the farm, restricted farm and listed personal property pools.",
			page: 4,
		},
		{
			id: "rife-continuity",
			title: "Continuity of Restricted interest and financing expenses (RIFE)",
			description:
				"The running RIFE pool. Line 240 is the deduction this schedule's own line 002 restates, and it is capped by line 350 below.",
			page: 5,
		},
		{
			id: "rife-deductible",
			title:
				"Restricted interest and financing expenses (RIFE) under paragraph 111(1)(a.1) of ITA",
			description:
				"Works out the ceiling on line 240: the pool carried in from previous years, against the corporation's own excess capacity plus capacity received from others.",
			page: 5,
			secondary: true,
		},
	],
	fields: [
		{
			line: "021001001",
			caption: "Net Income (loss) per Alberta Schedule 12 line 054",
			kind: "money",
			role: "carried-in",
			section: "current-year",
			requirement: "mandatory",
			page: 1,
			from: { form: "AT1SCH12", line: "012054001", note: "Alberta net income" },
		},
		{
			line: "021002001",
			caption:
				"RIFE deducted in the year under paragraph 111(1)(a.1) of ITA (enter as a positive amount)",
			kind: "money",
			role: "input",
			section: "current-year",
			page: 1,
			note: "The page-5 RIFE continuity that produces this figure (lines 200-350) is not modelled, so line 240's cap against line 350 is not enforced.",
		},
		{
			line: "021003001",
			caption: "Net capital losses deducted in the year (enter as a positive amount)",
			kind: "money",
			role: "input",
			section: "current-year",
			page: 1,
		},
		{
			line: "021005001",
			caption: "Taxable dividends deductible",
			kind: "money",
			role: "input",
			section: "current-year",
			page: 1,
		},
		{
			line: "021007001",
			caption: "Amount of Part VI.1 tax deductible",
			kind: "money",
			role: "input",
			section: "current-year",
			page: 1,
		},
		{
			line: "021011001",
			caption: "Amount deductible as prospector's and grubstaker's shares",
			kind: "money",
			role: "input",
			section: "current-year",
			page: 1,
		},
		{
			line: "021012001",
			caption:
				"Employer deduction for non-qualified securities - Paragraph 110(1)(e) of ITA",
			kind: "money",
			role: "input",
			section: "current-year",
			page: 1,
		},
		{
			line: "021013001",
			caption: "Subtotal of lines 002 to 012",
			kind: "money",
			role: "total",
			section: "current-year",
			page: 1,
			formula: {
				expression: "Subtotal of lines 002 to 012",
				inputs: [
					"021002001",
					"021003001",
					"021005001",
					"021007001",
					"021011001",
					"021012001",
				],
			},
		},
		{
			line: "021015001",
			caption: "Line 001 - line 013: (if positive, enter \"0\")",
			kind: "money",
			role: "computed",
			section: "current-year",
			page: 1,
			formula: {
				expression: 'Line 001 - line 013 (if positive, enter "0")',
				inputs: ["021001001", "021013001"],
			},
		},
		{
			line: "021017001",
			caption:
				"Deduct: ITA section 110.5 or subparagraph 115(1)(a)(vii) additions for foreign tax credits",
			kind: "money",
			role: "input",
			section: "current-year",
			page: 1,
			to: { form: "AT1SCH12", line: "012082001" },
		},
		{
			line: "021019001",
			caption: "Add: Current year farm loss",
			kind: "money",
			role: "input",
			section: "current-year",
			page: 1,
		},
		{
			line: "021021001",
			caption:
				"Non-capital loss for the current year: Line 015 - 017 + 019 (if positive, enter \"0\")",
			kind: "money",
			role: "computed",
			section: "current-year",
			page: 1,
			formula: {
				expression: 'Line 015 - 017 + 019 (if positive, enter "0")',
				inputs: ["021015001", "021017001", "021019001"],
			},
			note: "If negative, enter this amount into line 037 as a positive.",
		},
		{
			line: "021031001",
			caption: "Losses carried forward from preceding taxation year",
			kind: "money",
			role: "input",
			section: "non-capital",
			page: 1,
		},
		{
			line: "021032001",
			caption: "Deduct: losses expired",
			kind: "money",
			role: "input",
			section: "non-capital",
			page: 1,
			footnoteMarks: [2],
		},
		{
			line: "021033001",
			caption: "Losses - beginning of taxation year",
			kind: "money",
			role: "computed",
			section: "non-capital",
			page: 1,
		},
		{
			line: "021035001",
			caption:
				"Losses transfer from wind-up of a wholly-owned subsidiary or amalgamation",
			kind: "money",
			role: "input",
			section: "non-capital",
			page: 1,
		},
		{
			line: "021037001",
			caption: "Current year loss",
			kind: "money",
			role: "computed",
			section: "non-capital",
			page: 1,
			note: "Line 021, entered here as a positive.",
		},
		{
			line: "021041001",
			caption: "Amount applied against taxable income",
			kind: "money",
			role: "input",
			section: "non-capital",
			page: 1,
			to: { form: "AT1SCH12", line: "012064001" },
		},
		{
			line: "021043001",
			caption: "ITA section 80 adjustment",
			kind: "money",
			role: "input",
			section: "non-capital",
			page: 1,
		},
		{
			line: "021045001",
			caption: "Other adjustments (enter as a positive amount)",
			kind: "money",
			role: "input",
			section: "non-capital",
			page: 1,
		},
		{
			line: "021047001",
			caption:
				"Total loss carry back to prior taxation years (Schedule 10 must also be completed)",
			kind: "money",
			role: "computed",
			section: "non-capital",
			page: 1,
			note: "The sum of the per-year amounts entered on this schedule's own \"carry back to prior years\" section — a carry-back also requires Schedule 10 to be completed.",
		},
		{
			line: "021049001",
			caption: "Losses - closing balance",
			kind: "money",
			role: "computed",
			section: "non-capital",
			page: 1,
		},
		{
			line: "021051001",
			caption: "Losses carried forward from preceding taxation year",
			kind: "money",
			role: "input",
			section: "capital",
			page: 1,
		},
		{
			line: "021055001",
			caption:
				"Losses transfer from wind-up of a wholly-owned subsidiary or amalgamation",
			kind: "money",
			role: "input",
			section: "capital",
			page: 1,
		},
		{
			line: "021057001",
			caption: "Current year loss",
			kind: "money",
			role: "carried-in",
			section: "capital",
			page: 1,
			from: {
				form: "T2SCH4",
				line: "210",
				note: "Current-year capital loss — Alberta has no override for this pool; it always equals federal.",
			},
		},
		{
			line: "021059001",
			caption:
				"Allowable business investment loss expired as reported on Federal Schedule 4 line 220",
			kind: "money",
			role: "input",
			section: "capital",
			page: 1,
			from: { form: "T2SCH4", line: "220" },
			footnoteMarks: [3],
		},
		{
			line: "021061001",
			caption: "Amount applied against current year capital gain",
			kind: "money",
			role: "input",
			section: "capital",
			page: 1,
			to: {
				form: "AT1SCH12",
				line: "012066001",
				note: "Carry forward this amount × the inclusion rate. Schedule 21 tracks capital losses at their full amount; Schedule 12 wants the allowable portion — carrying the raw figure over-deducts by roughly two.",
			},
		},
		{
			line: "021063001",
			caption: "ITA section 80 adjustment",
			kind: "money",
			role: "input",
			section: "capital",
			page: 1,
		},
		{
			line: "021065001",
			caption: "Other adjustments (enter as a positive amount)",
			kind: "money",
			role: "input",
			section: "capital",
			page: 1,
		},
		{
			line: "021067001",
			caption:
				"Total loss carry back to prior taxation years (Schedule 10 must also be completed)",
			kind: "money",
			role: "computed",
			section: "capital",
			page: 1,
			note: "The sum of the per-year amounts entered on this schedule's own \"carry back to prior years\" section — a carry-back also requires Schedule 10 to be completed.",
		},
		{
			line: "021069001",
			caption: "Losses - closing balance",
			kind: "money",
			role: "computed",
			section: "capital",
			page: 1,
		},
		{
			line: "021071001",
			caption: "Losses carried forward from preceding taxation year",
			kind: "money",
			role: "input",
			section: "farm",
			page: 2,
		},
		{
			line: "021072001",
			caption: "Deduct: losses expired (see note on page 4)",
			kind: "money",
			role: "input",
			section: "farm",
			page: 2,
			footnoteMarks: [4],
		},
		{
			line: "021073001",
			caption: "Losses - beginning of taxation year",
			kind: "money",
			role: "computed",
			section: "farm",
			page: 2,
		},
		{
			line: "021075001",
			caption:
				"Losses transfer from wind-up of a wholly-owned subsidiary and amalgamation",
			kind: "money",
			role: "input",
			section: "farm",
			page: 2,
		},
		{
			line: "021077001",
			caption: "Current year loss",
			kind: "money",
			role: "input",
			section: "farm",
			page: 2,
			from: {
				form: "T2SCH4",
				line: "310",
				note: "Defaults to this federal figure — override only where Alberta genuinely diverges.",
			},
		},
		{
			line: "021079001",
			caption: "Amount applied against taxable income",
			kind: "money",
			role: "input",
			section: "farm",
			page: 2,
			to: { form: "AT1SCH12", line: "012070001" },
		},
		{
			line: "021081001",
			caption: "ITA section 80 adjustment",
			kind: "money",
			role: "input",
			section: "farm",
			page: 2,
		},
		{
			line: "021083001",
			caption: "Other adjustments",
			kind: "money",
			role: "input",
			section: "farm",
			page: 2,
		},
		{
			line: "021085001",
			caption:
				"Total loss carry back to prior taxation years (Schedule 10 must also be completed)",
			kind: "money",
			role: "computed",
			section: "farm",
			page: 2,
			note: "The sum of the per-year amounts entered on this schedule's own \"carry back to prior years\" section — a carry-back also requires Schedule 10 to be completed.",
		},
		{
			line: "021087001",
			caption: "Losses - closing balance",
			kind: "money",
			role: "computed",
			section: "farm",
			page: 2,
		},
		{
			line: "021091001",
			caption: "Losses carried forward from preceding taxation year",
			kind: "money",
			role: "input",
			section: "restricted-farm",
			page: 2,
		},
		{
			line: "021092001",
			caption: "Deduct: losses expired (see note on page 4)",
			kind: "money",
			role: "input",
			section: "restricted-farm",
			page: 2,
			footnoteMarks: [4],
		},
		{
			line: "021093001",
			caption: "Losses - beginning of taxation year",
			kind: "money",
			role: "computed",
			section: "restricted-farm",
			page: 2,
		},
		{
			line: "021095001",
			caption:
				"Losses transfer from wind-up of a wholly-owned subsidiary and amalgamation",
			kind: "money",
			role: "input",
			section: "restricted-farm",
			page: 2,
		},
		{
			line: "021097001",
			caption: "Current year loss",
			kind: "money",
			role: "input",
			section: "restricted-farm",
			page: 2,
			from: {
				form: "T2SCH4",
				line: "410",
				note: "Defaults to this federal figure — override only where Alberta genuinely diverges.",
			},
		},
		{
			line: "021099001",
			caption: "Amount applied against farming income",
			kind: "money",
			role: "input",
			section: "restricted-farm",
			page: 2,
			to: { form: "AT1SCH12", line: "012068001" },
		},
		{
			line: "021101001",
			caption: "ITA section 80 adjustment",
			kind: "money",
			role: "input",
			section: "restricted-farm",
			page: 2,
		},
		{
			line: "021103001",
			caption: "Other adjustments",
			kind: "money",
			role: "input",
			section: "restricted-farm",
			page: 2,
		},
		{
			line: "021105001",
			caption:
				"Total loss carry back to prior taxation years (Schedule 10 must also be completed)",
			kind: "money",
			role: "computed",
			section: "restricted-farm",
			page: 2,
			note: "The sum of the per-year amounts entered on this schedule's own \"carry back to prior years\" section — a carry-back also requires Schedule 10 to be completed.",
		},
		{
			line: "021107001",
			caption: "Losses - closing balance",
			kind: "money",
			role: "computed",
			section: "restricted-farm",
			page: 2,
		},
		{
			line: "021111001",
			caption: "Losses carried forward from preceding taxation year",
			kind: "money",
			role: "input",
			section: "listed-personal",
			page: 2,
		},
		{
			line: "021113001",
			caption: "Deduct: losses expired after seven taxation years",
			kind: "money",
			role: "input",
			section: "listed-personal",
			page: 2,
		},
		{
			line: "021115001",
			caption: "Losses - beginning of taxation year",
			kind: "money",
			role: "computed",
			section: "listed-personal",
			page: 2,
		},
		{
			line: "021117001",
			caption: "Current year loss",
			kind: "money",
			role: "input",
			section: "listed-personal",
			page: 2,
		},
		{
			line: "021119001",
			caption:
				"Amount applied against listed personal property gain (If Schedule 18 exists, enter amount from line 060. Otherwise, enter amount from federal Schedule 6, line 655).",
			kind: "money",
			role: "input",
			section: "listed-personal",
			page: 2,
		},
		{
			line: "021121001",
			caption: "Adjustments",
			kind: "money",
			role: "input",
			section: "listed-personal",
			page: 2,
		},
		{
			line: "021123001",
			caption:
				"Total loss carry back to prior taxation years (Schedule 10 must also be completed)",
			kind: "money",
			role: "computed",
			section: "listed-personal",
			page: 2,
			note: "The sum of the per-year amounts entered on this schedule's own \"carry back to prior years\" section — a carry-back also requires Schedule 10 to be completed.",
		},
		{
			line: "021125001",
			caption: "Losses - closing balance",
			kind: "money",
			role: "computed",
			section: "listed-personal",
			page: 2,
		},
		{
			line: "021131001",
			caption: "Partnership Identifier (if known)",
			kind: "text",
			role: "input",
			section: "limited-partnership",
			page: 2,
		},
		{
			line: "021133001",
			caption: "Limited partnership losses at end of preceding taxation year",
			kind: "money",
			role: "input",
			section: "limited-partnership",
			page: 2,
		},
		{
			line: "021135001",
			caption:
				"Limited partnership losses transferred from amalgamation or wind-up of subsidiary",
			kind: "money",
			role: "input",
			section: "limited-partnership",
			page: 2,
		},
		{
			line: "021137001",
			caption: "Current year limited partnership loss",
			kind: "money",
			role: "input",
			section: "limited-partnership",
			page: 2,
		},
		{
			line: "021139001",
			caption: "Limited partnership loss applied",
			kind: "money",
			role: "input",
			section: "limited-partnership",
			page: 2,
			to: {
				form: "AT1SCH12",
				line: "012072001",
				note: "Carry forward the TOTAL of this column to Schedule 12, line 072 — not any single row.",
			},
		},
		{
			line: "021141001",
			caption: "Limited partnership losses closing balance (133 + 135 + 137 - 139)",
			kind: "money",
			role: "computed",
			section: "limited-partnership",
			page: 2,
			formula: {
				expression: "133 + 135 + 137 - 139",
				inputs: ["021133001", "021135001", "021137001", "021139001"],
			},
		},
		{
			line: "021151001",
			caption: "Year of origin",
			kind: "code",
			role: "input",
			section: "non-capital-vintage",
			page: 3,
			note: "0 is the current year; 1 to 20 are the preceding taxation years.",
		},
		{
			line: "021153001",
			caption: "Tax year end",
			kind: "date",
			role: "input",
			section: "non-capital-vintage",
			page: 3,
		},
		{
			line: "021155001",
			caption: "Balance at the beginning of year",
			kind: "money",
			role: "input",
			section: "non-capital-vintage",
			page: 3,
			note: "Shaded on the current-year row — a loss arising this year has no opening balance.",
		},
		{
			line: "021157001",
			caption: "Loss incurred in current year",
			kind: "money",
			role: "input",
			section: "non-capital-vintage",
			page: 3,
			note: "The current-year row only; shaded for every preceding vintage.",
		},
		{
			line: "021159001",
			caption: "Adjustments and transfers",
			kind: "money",
			role: "input",
			section: "non-capital-vintage",
			page: 3,
		},
		{
			line: "021165001",
			caption: "Loss carried back",
			kind: "money",
			role: "input",
			section: "non-capital-vintage",
			page: 3,
			note: "The current-year row only; shaded for every preceding vintage. A carry-back also requires Schedule 10.",
		},
		{
			line: "021167001",
			caption: "Applied to reduce taxable income",
			kind: "money",
			role: "input",
			section: "non-capital-vintage",
			page: 3,
			note: "Shaded on the current-year row.",
		},
		{
			line: "021169001",
			caption: "Balance at end of year 155 + 157 + 159 - 165 - 167",
			kind: "money",
			role: "computed",
			section: "non-capital-vintage",
			page: 3,
			formula: {
				expression: "155 + 157 + 159 - 165 - 167",
				inputs: [
					"021155001",
					"021157001",
					"021159001",
					"021165001",
					"021167001",
				],
			},
		},
		{
			line: "021181001",
			caption: "Year of origin",
			kind: "code",
			role: "input",
			section: "other-vintage",
			page: 4,
			note: "0 is the current year; 1 to 20 are the preceding taxation years.",
		},
		{
			line: "021183001",
			caption: "Farm losses",
			kind: "money",
			role: "input",
			section: "other-vintage",
			page: 4,
			footnoteMarks: [4],
		},
		{
			line: "021185001",
			caption: "Restricted farm losses",
			kind: "money",
			role: "input",
			section: "other-vintage",
			page: 4,
			footnoteMarks: [4],
		},
		{
			line: "021187001",
			caption: "Listed personal property losses",
			kind: "money",
			role: "input",
			section: "other-vintage",
			page: 4,
			note: "Shaded beyond the 7th preceding year — a listed personal property loss expires after seven taxation years, not twenty.",
		},
		{
			line: "021200001",
			caption: "RIFE at the end of the previous tax year",
			kind: "money",
			role: "input",
			section: "rife-continuity",
			page: 5,
		},
		{
			line: "021210001",
			caption:
				"RIFE transferred on an amalgamation or on the wind-up of a subsidiary corporation",
			kind: "money",
			role: "input",
			section: "rife-continuity",
			page: 5,
		},
		{
			line: "021220001",
			caption: "RIFE adjustment for an acquisition of control",
			kind: "money",
			role: "input",
			section: "rife-continuity",
			page: 5,
		},
		{
			line: "021230001",
			caption:
				"Current-year restricted interest and financing expenses determined under subsection 111(8) of ITA (line 710 from the T2 Schedule 4)",
			kind: "money",
			role: "carried-in",
			section: "rife-continuity",
			page: 5,
			from: { form: "T2SCH4", line: "710" },
		},
		{
			line: "021240001",
			caption:
				"RIFE deducted for the tax year. Line 240 must not exceed line 350 (Enter amount on line 130 of the Schedule 12)",
			kind: "money",
			role: "input",
			section: "rife-continuity",
			page: 5,
			to: { form: "AT1SCH12", line: "012130001" },
			note: "The same deduction this schedule restates at line 002. The cap against line 350 is stated on the form but is not enforced by the engine, which does not model this page.",
		},
		{
			line: "021250001",
			caption: "Closing Balance of RIFE",
			kind: "money",
			role: "computed",
			section: "rife-continuity",
			page: 5,
			note: "The form prints no formula for this line. It is the pool after the year's addition and deduction — lines 200 + 210 - 220 + 230 - 240 — but that is inference, not a stated rule, so it is not recorded as a formula.",
		},
		{
			line: "021310001",
			caption: "RIFE from previous tax years (Line 200 + line 210 - line 220)",
			kind: "money",
			role: "computed",
			section: "rife-deductible",
			page: 5,
			formula: {
				expression: "Line 200 + line 210 - line 220",
				inputs: ["021200001", "021210001", "021220001"],
			},
		},
		{
			line: "021320001",
			caption:
				"Corporation's excess capacity for the year (line 129 from T2 Schedule 130)",
			kind: "money",
			role: "carried-in",
			section: "rife-deductible",
			page: 5,
			from: { form: "T2SCH130", line: "129" },
		},
		{
			line: "021330001",
			caption:
				"Total of all amounts of the corporation's received capacity for the year (line 130 from T2 Schedule 130)",
			kind: "money",
			role: "carried-in",
			section: "rife-deductible",
			page: 5,
			from: { form: "T2SCH130", line: "130" },
		},
		{
			line: "021340001",
			caption: "Line 320 plus line 330",
			kind: "money",
			role: "computed",
			section: "rife-deductible",
			page: 5,
			formula: {
				expression: "Line 320 plus line 330",
				inputs: ["021320001", "021330001"],
			},
		},
		{
			line: "021350001",
			caption:
				"RIFE deductible under paragraph 111(1)(a.1) of ITA for the year. (Lesser of line 310 and line 340)",
			kind: "money",
			role: "computed",
			section: "rife-deductible",
			page: 5,
			formula: {
				expression: "Lesser of line 310 and line 340",
				inputs: ["021310001", "021340001"],
			},
		},
	],
	footnotes: [
		"This schedule is required if the opening balance or the claim for Alberta purposes differs from that for federal purposes.",
		"The corporation may choose whether or not to deduct an available loss from income in a taxation year. It can deduct losses in any order. However, for each type of loss, ensure that the oldest loss is deducted first. See Guide for further information.",
		"A non capital loss expires after 7 taxation years if it arose in a taxation year ending before March 23, 2004 or after 10 taxation years if it arose in a taxation year ending after March 22, 2004, and before 2006 or after 20 years if it arose in a taxation year after 2005.",
		"An allowable business investment loss becomes a net capital loss after 7 taxation years if it arose in a taxation year ending before March 23, 2004 or after 10 taxation years if it arose in a taxation year ending after March 22, 2004.",
		"A farm loss or restricted farm loss expires as follows: after 10 tax years if it arose in a tax year ending before 2006; and after 20 tax years if it arose in a tax year ending after 2005.",
	],
};
