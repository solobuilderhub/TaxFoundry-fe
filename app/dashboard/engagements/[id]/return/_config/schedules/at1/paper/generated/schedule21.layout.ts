/**
 * Alberta Calculation of Current Year Loss and Continuity of Losses (AT1SCH21) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from AT1SCH21-loss-continuity-TRA11741.pdf, retrieved 2026-09-07.
 *
 * Not in AT1_SCHEDULE_21, and so not here: the per-partnership
 * limited-partnership grid (lines 131-141) and the two by-year-of-origin
 * ledgers (151-169, 181-187) — repeating tables keyed by occurrence, which
 * FormField has no shape for. Page 5 (RIFE, lines 200-350) IS carried.
 *
 * Carries EVERY field, not just `input` ones — a paper view shows the whole
 * form. The paper renderer, not this file, is responsible for keeping
 * computed/carried-in lines read-only.
 */
export type PaperFieldRole = "input" | "computed" | "total" | "carried-in";
export type PaperFieldKind = "money" | "date" | "text" | "rate" | "flag" | "code";

export interface PaperField {
  line: string;
  caption: string;
  kind: PaperFieldKind;
  role: PaperFieldRole;
  section: string;
  requirement?: "mandatory" | "optional" | "conditional";
  /** How the form itself says this line is calculated, where it prints the arithmetic. */
  formula?: { expression: string; inputs: readonly string[] };
  note?: string;
  from?: { form: string; line: string; note?: string };
  to?: { form: string; line: string; note?: string };
  footnoteMarks?: readonly number[];
}

export interface PaperSectionDef {
  id: string;
  title: string;
  description?: string;
}

export const AT1_SCHEDULE_21_SECTIONS: readonly PaperSectionDef[] = [
<<<<<<< Updated upstream
  { id: "current-year", title: "Part 1 — Calculating the current-year non-capital loss", description: "Starts from Alberta net income on Schedule 12 line 054 and works down through the Division C deductions to the loss for the year." },
  { id: "continuity", title: "Part 2 — Continuity of losses", description: "Five pools, each a full continuity. Every closing balance carries to a specific Alberta loss line on Schedule 12." },
  { id: "rife", title: "Continuity of restricted interest and financing expenses (RIFE)", description: "Page 5. None of these lines is in the NetFile schema — the section is never transmitted — but line 240 feeds Schedule 12 line 130, which is." },
=======
  { id: "current-year", title: "Calculation of current year non-capital loss", description: "Starts from Alberta net income on Schedule 12 line 054. Lines 002 to 012 are deducted, 017 is deducted and 019 is added." },
  { id: "non-capital", title: "Continuity of losses — Non-capital losses" },
  { id: "capital", title: "Continuity of losses — Capital losses (gross amount)", description: "Tracked at the GROSS amount. Schedule 12 wants the allowable portion, so line 061 is multiplied by the inclusion rate on its way across." },
  { id: "farm", title: "Continuity of losses — Farm losses" },
  { id: "restricted-farm", title: "Continuity of losses — Restricted farm losses" },
  { id: "listed-personal", title: "Continuity of losses — Listed personal property losses" },
  { id: "limited-partnership", title: "Continuity of limited partnership losses", description: "A repeating table, one row per partnership. Each line below is a COLUMN; the row is carried in the line id's occurrence triplet." },
  { id: "non-capital-vintage", title: "Analysis of balance of non-capital losses by year of origin", description: "One row per vintage — the current year, then the 1st through 20th preceding taxation years. Each line below is a column; the vintage is the occurrence." },
  { id: "other-vintage", title: "Analysis of balance of losses by year of origin", description: "The same vintage ledger for the farm, restricted farm and listed personal property pools." },
  { id: "rife-continuity", title: "Continuity of Restricted interest and financing expenses (RIFE)", description: "The running RIFE pool. Line 240 is the deduction this schedule's own line 002 restates, and it is capped by line 350 below." },
  { id: "rife-deductible", title: "Restricted interest and financing expenses (RIFE) under paragraph 111(1)(a.1) of ITA", description: "Works out the ceiling on line 240: the pool carried in from previous years, against the corporation's own excess capacity plus capacity received from others." },
>>>>>>> Stashed changes
];

export const AT1_SCHEDULE_21_FIELDS: readonly PaperField[] = [
  { line: "021001001", caption: "Net Income (loss) per Alberta Schedule 12 line 054", kind: "money", role: "carried-in", section: "current-year", requirement: "mandatory", from: { form: "AT1SCH12", line: "012054001", note: "Alberta net income" } },
  { line: "021002001", caption: "RIFE deducted in the year under paragraph 111(1)(a.1) of ITA (enter as a positive amount)", kind: "money", role: "input", section: "current-year", note: "The page-5 RIFE continuity that produces this figure (lines 200-350) is not modelled, so line 240's cap against line 350 is not enforced." },
  { line: "021003001", caption: "Net capital losses deducted in the year (enter as a positive amount)", kind: "money", role: "input", section: "current-year" },
  { line: "021005001", caption: "Taxable dividends deductible", kind: "money", role: "input", section: "current-year" },
<<<<<<< Updated upstream
  { line: "021007001", caption: "Part VI.1 tax deductible", kind: "money", role: "input", section: "current-year" },
  { line: "021011001", caption: "Prospector's and grubstaker's shares", kind: "money", role: "input", section: "current-year" },
  { line: "021012001", caption: "Employer deduction for non-qualified securities under ITA paragraph 110(1)(e)", kind: "money", role: "input", section: "current-year" },
  { line: "021013001", caption: "Subtotal of lines 002 to 012", kind: "money", role: "total", section: "current-year" },
  { line: "021015001", caption: "Line 001 minus line 013", kind: "money", role: "computed", section: "current-year" },
  { line: "021017001", caption: "Additions under ITA section 110.5 or subparagraph 115(1)(a)(vii) for foreign tax credits", kind: "money", role: "input", section: "current-year" },
  { line: "021019001", caption: "Current-year farm loss", kind: "money", role: "input", section: "current-year" },
  { line: "021021001", caption: "Non-capital loss for the current year", kind: "money", role: "computed", section: "current-year", note: "Line 015 minus line 017 plus line 019." },
  { line: "021031001", caption: "Non-capital losses — Carried forward from the preceding year", kind: "money", role: "input", section: "continuity" },
  { line: "021032001", caption: "Non-capital losses — Losses expired", kind: "money", role: "input", section: "continuity" },
  { line: "021033001", caption: "Non-capital losses — Balance at the beginning of the taxation year", kind: "money", role: "computed", section: "continuity" },
  { line: "021035001", caption: "Non-capital losses — Transfer on a wind-up or amalgamation", kind: "money", role: "input", section: "continuity" },
  { line: "021037001", caption: "Non-capital losses — Current-year loss", kind: "money", role: "computed", section: "continuity" },
  { line: "021041001", caption: "Non-capital losses — Applied against income", kind: "money", role: "input", section: "continuity", to: { form: "AT1SCH12", line: "012064001", note: "Printed on the form directly beside this line." } },
  { line: "021043001", caption: "Non-capital losses — Adjustment under ITA section 80", kind: "money", role: "input", section: "continuity" },
  { line: "021045001", caption: "Non-capital losses — Other adjustments", kind: "money", role: "input", section: "continuity" },
  { line: "021047001", caption: "Non-capital losses — Total carried back to prior years", kind: "money", role: "computed", section: "continuity", note: "The sum of the per-year amounts entered on this schedule’s own \"carry back to prior years\" section — a carry-back also requires Schedule 10 to be completed." },
  { line: "021049001", caption: "Non-capital losses — Closing balance", kind: "money", role: "computed", section: "continuity", footnoteMarks: [2] },
  { line: "021051001", caption: "Net capital losses — Carried forward from the preceding year", kind: "money", role: "input", section: "continuity" },
  { line: "021055001", caption: "Net capital losses — Transfer on a wind-up or amalgamation", kind: "money", role: "input", section: "continuity" },
  { line: "021057001", caption: "Net capital losses — Current-year loss", kind: "money", role: "carried-in", section: "continuity", from: { form: "T2SCH4", line: "210", note: "Current-year capital loss — Alberta has no override for this pool; it always equals federal." } },
  { line: "021061001", caption: "Net capital losses — Applied against income", kind: "money", role: "input", section: "continuity", to: { form: "AT1SCH12", line: "012066001", note: "Carry forward this amount × the inclusion rate. Schedule 21 tracks capital losses at their full amount; Schedule 12 wants the allowable portion — carrying the raw figure over-deducts by roughly two." } },
  { line: "021063001", caption: "Net capital losses — Adjustment under ITA section 80", kind: "money", role: "input", section: "continuity" },
  { line: "021065001", caption: "Net capital losses — Other adjustments", kind: "money", role: "input", section: "continuity" },
  { line: "021067001", caption: "Net capital losses — Total carried back to prior years", kind: "money", role: "computed", section: "continuity", note: "The sum of the per-year amounts entered on this schedule’s own \"carry back to prior years\" section — a carry-back also requires Schedule 10 to be completed." },
  { line: "021069001", caption: "Net capital losses — Closing balance", kind: "money", role: "computed", section: "continuity", footnoteMarks: [3] },
  { line: "021071001", caption: "Farm losses — Carried forward from the preceding year", kind: "money", role: "input", section: "continuity" },
  { line: "021072001", caption: "Farm losses — Losses expired", kind: "money", role: "input", section: "continuity" },
  { line: "021073001", caption: "Farm losses — Balance at the beginning of the taxation year", kind: "money", role: "computed", section: "continuity" },
  { line: "021075001", caption: "Farm losses — Transfer on a wind-up or amalgamation", kind: "money", role: "input", section: "continuity" },
  { line: "021077001", caption: "Farm losses — Current-year loss", kind: "money", role: "input", section: "continuity", from: { form: "T2SCH4", line: "310", note: "Defaults to this federal figure — override only where Alberta genuinely diverges." } },
  { line: "021079001", caption: "Farm losses — Applied against income", kind: "money", role: "input", section: "continuity", to: { form: "AT1SCH12", line: "012070001", note: "Printed on the form directly beside this line." } },
  { line: "021081001", caption: "Farm losses — Adjustment under ITA section 80", kind: "money", role: "input", section: "continuity" },
  { line: "021083001", caption: "Farm losses — Other adjustments", kind: "money", role: "input", section: "continuity" },
  { line: "021085001", caption: "Farm losses — Total carried back to prior years", kind: "money", role: "computed", section: "continuity", note: "The sum of the per-year amounts entered on this schedule’s own \"carry back to prior years\" section — a carry-back also requires Schedule 10 to be completed." },
  { line: "021087001", caption: "Farm losses — Closing balance", kind: "money", role: "computed", section: "continuity", footnoteMarks: [4] },
  { line: "021091001", caption: "Restricted farm losses — Carried forward from the preceding year", kind: "money", role: "input", section: "continuity" },
  { line: "021092001", caption: "Restricted farm losses — Losses expired", kind: "money", role: "input", section: "continuity" },
  { line: "021093001", caption: "Restricted farm losses — Balance at the beginning of the taxation year", kind: "money", role: "computed", section: "continuity" },
  { line: "021095001", caption: "Restricted farm losses — Transfer on a wind-up or amalgamation", kind: "money", role: "input", section: "continuity" },
  { line: "021097001", caption: "Restricted farm losses — Current-year loss", kind: "money", role: "input", section: "continuity", from: { form: "T2SCH4", line: "410", note: "Defaults to this federal figure — override only where Alberta genuinely diverges." } },
  { line: "021099001", caption: "Restricted farm losses — Applied against income", kind: "money", role: "input", section: "continuity", to: { form: "AT1SCH12", line: "012068001", note: "Printed on the form directly beside this line." } },
  { line: "021101001", caption: "Restricted farm losses — Adjustment under ITA section 80", kind: "money", role: "input", section: "continuity" },
  { line: "021103001", caption: "Restricted farm losses — Other adjustments", kind: "money", role: "input", section: "continuity" },
  { line: "021105001", caption: "Restricted farm losses — Total carried back to prior years", kind: "money", role: "computed", section: "continuity", note: "The sum of the per-year amounts entered on this schedule’s own \"carry back to prior years\" section — a carry-back also requires Schedule 10 to be completed." },
  { line: "021107001", caption: "Restricted farm losses — Closing balance", kind: "money", role: "computed", section: "continuity", footnoteMarks: [4] },
  { line: "021111001", caption: "Listed personal property losses — Carried forward from the preceding year", kind: "money", role: "input", section: "continuity" },
  { line: "021113001", caption: "Listed personal property losses — Losses expired", kind: "money", role: "input", section: "continuity" },
  { line: "021115001", caption: "Listed personal property losses — Balance at the beginning of the taxation year", kind: "money", role: "computed", section: "continuity" },
  { line: "021117001", caption: "Listed personal property losses — Current-year loss", kind: "money", role: "input", section: "continuity" },
  { line: "021119001", caption: "Listed personal property losses — Applied against income", kind: "money", role: "input", section: "continuity", note: "If Schedule 18 exists, carry forward the amount from Schedule 18 line 060. Otherwise, carry forward the amount from federal Schedule 6 line 655." },
  { line: "021121001", caption: "Listed personal property losses — Other adjustments", kind: "money", role: "input", section: "continuity" },
  { line: "021123001", caption: "Listed personal property losses — Total carried back to prior years", kind: "money", role: "computed", section: "continuity", note: "The sum of the per-year amounts entered on this schedule’s own \"carry back to prior years\" section — a carry-back also requires Schedule 10 to be completed." },
  { line: "021125001", caption: "Listed personal property losses — Closing balance", kind: "money", role: "computed", section: "continuity" },
  { line: "021200001", caption: "RIFE at the end of the previous tax year", kind: "money", role: "input", section: "rife" },
  { line: "021210001", caption: "RIFE transferred on an amalgamation or on the wind-up of a subsidiary corporation", kind: "money", role: "input", section: "rife" },
  { line: "021220001", caption: "RIFE adjustment for an acquisition of control", kind: "money", role: "input", section: "rife" },
  { line: "021230001", caption: "Current-year restricted interest and financing expenses determined under subsection 111(8) of ITA", kind: "money", role: "carried-in", section: "rife", from: { form: "T2SCH4", line: "710", note: "Printed on the form: \"(line 710 from the T2 Schedule 4)\". Schedule 130 Part 2O amount A." } },
  { line: "021240001", caption: "RIFE deducted for the tax year", kind: "money", role: "input", section: "rife", note: "Line 240 must not exceed line 350.", to: { form: "AT1SCH12", line: "012130001", note: "Printed on the form: \"(Enter amount on line 130 of the Schedule 12)\"." } },
  { line: "021250001", caption: "Closing balance of RIFE", kind: "money", role: "computed", section: "rife", note: "Line 200 plus 210 minus 220 plus 230 minus 240." },
  { line: "021310001", caption: "RIFE from previous tax years", kind: "money", role: "computed", section: "rife", note: "Line 200 plus line 210 minus line 220." },
  { line: "021320001", caption: "Corporation's excess capacity for the year", kind: "money", role: "carried-in", section: "rife", from: { form: "T2SCH130", line: "129", note: "Printed on the form: \"(line 129 from T2 Schedule 130)\". Part 2G amount F." } },
  { line: "021330001", caption: "Total of all amounts of the corporation's received capacity for the year", kind: "money", role: "carried-in", section: "rife", from: { form: "T2SCH130", line: "130", note: "Printed on the form: \"(line 130 from T2 Schedule 130)\". Part 1A amount A." } },
  { line: "021340001", caption: "Line 320 plus line 330", kind: "money", role: "computed", section: "rife" },
  { line: "021350001", caption: "RIFE deductible under paragraph 111(1)(a.1) of ITA for the year", kind: "money", role: "computed", section: "rife", note: "The lesser of line 310 and line 340 — the ceiling line 240 must not exceed." },
=======
  { line: "021007001", caption: "Amount of Part VI.1 tax deductible", kind: "money", role: "input", section: "current-year" },
  { line: "021011001", caption: "Amount deductible as prospector's and grubstaker's shares", kind: "money", role: "input", section: "current-year" },
  { line: "021012001", caption: "Employer deduction for non-qualified securities - Paragraph 110(1)(e) of ITA", kind: "money", role: "input", section: "current-year" },
  { line: "021013001", caption: "Subtotal of lines 002 to 012", kind: "money", role: "total", section: "current-year", formula: { expression: "Subtotal of lines 002 to 012", inputs: ["021002001", "021003001", "021005001", "021007001", "021011001", "021012001"] } },
  { line: "021015001", caption: "Line 001 - line 013: (if positive, enter \"0\")", kind: "money", role: "computed", section: "current-year", formula: { expression: "Line 001 - line 013 (if positive, enter \"0\")", inputs: ["021001001", "021013001"] } },
  { line: "021017001", caption: "Deduct: ITA section 110.5 or subparagraph 115(1)(a)(vii) additions for foreign tax credits", kind: "money", role: "input", section: "current-year", to: { form: "AT1SCH12", line: "012082001" } },
  { line: "021019001", caption: "Add: Current year farm loss", kind: "money", role: "input", section: "current-year" },
  { line: "021021001", caption: "Non-capital loss for the current year: Line 015 - 017 + 019 (if positive, enter \"0\")", kind: "money", role: "computed", section: "current-year", formula: { expression: "Line 015 - 017 + 019 (if positive, enter \"0\")", inputs: ["021015001", "021017001", "021019001"] }, note: "If negative, enter this amount into line 037 as a positive." },
  { line: "021031001", caption: "Losses carried forward from preceding taxation year", kind: "money", role: "input", section: "non-capital" },
  { line: "021032001", caption: "Deduct: losses expired", kind: "money", role: "input", section: "non-capital", footnoteMarks: [2] },
  { line: "021033001", caption: "Losses - beginning of taxation year", kind: "money", role: "computed", section: "non-capital" },
  { line: "021035001", caption: "Losses transfer from wind-up of a wholly-owned subsidiary or amalgamation", kind: "money", role: "input", section: "non-capital" },
  { line: "021037001", caption: "Current year loss", kind: "money", role: "computed", section: "non-capital", note: "Line 021, entered here as a positive." },
  { line: "021041001", caption: "Amount applied against taxable income", kind: "money", role: "input", section: "non-capital", to: { form: "AT1SCH12", line: "012064001" } },
  { line: "021043001", caption: "ITA section 80 adjustment", kind: "money", role: "input", section: "non-capital" },
  { line: "021045001", caption: "Other adjustments (enter as a positive amount)", kind: "money", role: "input", section: "non-capital" },
  { line: "021047001", caption: "Total loss carry back to prior taxation years (Schedule 10 must also be completed)", kind: "money", role: "computed", section: "non-capital", note: "The sum of the per-year amounts entered on this schedule's own \"carry back to prior years\" section — a carry-back also requires Schedule 10 to be completed." },
  { line: "021049001", caption: "Losses - closing balance", kind: "money", role: "computed", section: "non-capital" },
  { line: "021051001", caption: "Losses carried forward from preceding taxation year", kind: "money", role: "input", section: "capital" },
  { line: "021055001", caption: "Losses transfer from wind-up of a wholly-owned subsidiary or amalgamation", kind: "money", role: "input", section: "capital" },
  { line: "021057001", caption: "Current year loss", kind: "money", role: "carried-in", section: "capital", from: { form: "T2SCH4", line: "210", note: "Current-year capital loss — Alberta has no override for this pool; it always equals federal." } },
  { line: "021059001", caption: "Allowable business investment loss expired as reported on Federal Schedule 4 line 220", kind: "money", role: "input", section: "capital", from: { form: "T2SCH4", line: "220" }, footnoteMarks: [3] },
  { line: "021061001", caption: "Amount applied against current year capital gain", kind: "money", role: "input", section: "capital", to: { form: "AT1SCH12", line: "012066001", note: "Carry forward this amount × the inclusion rate. Schedule 21 tracks capital losses at their full amount; Schedule 12 wants the allowable portion — carrying the raw figure over-deducts by roughly two." } },
  { line: "021063001", caption: "ITA section 80 adjustment", kind: "money", role: "input", section: "capital" },
  { line: "021065001", caption: "Other adjustments (enter as a positive amount)", kind: "money", role: "input", section: "capital" },
  { line: "021067001", caption: "Total loss carry back to prior taxation years (Schedule 10 must also be completed)", kind: "money", role: "computed", section: "capital", note: "The sum of the per-year amounts entered on this schedule's own \"carry back to prior years\" section — a carry-back also requires Schedule 10 to be completed." },
  { line: "021069001", caption: "Losses - closing balance", kind: "money", role: "computed", section: "capital" },
  { line: "021071001", caption: "Losses carried forward from preceding taxation year", kind: "money", role: "input", section: "farm" },
  { line: "021072001", caption: "Deduct: losses expired (see note on page 4)", kind: "money", role: "input", section: "farm", footnoteMarks: [4] },
  { line: "021073001", caption: "Losses - beginning of taxation year", kind: "money", role: "computed", section: "farm" },
  { line: "021075001", caption: "Losses transfer from wind-up of a wholly-owned subsidiary and amalgamation", kind: "money", role: "input", section: "farm" },
  { line: "021077001", caption: "Current year loss", kind: "money", role: "input", section: "farm", from: { form: "T2SCH4", line: "310", note: "Defaults to this federal figure — override only where Alberta genuinely diverges." } },
  { line: "021079001", caption: "Amount applied against taxable income", kind: "money", role: "input", section: "farm", to: { form: "AT1SCH12", line: "012070001" } },
  { line: "021081001", caption: "ITA section 80 adjustment", kind: "money", role: "input", section: "farm" },
  { line: "021083001", caption: "Other adjustments", kind: "money", role: "input", section: "farm" },
  { line: "021085001", caption: "Total loss carry back to prior taxation years (Schedule 10 must also be completed)", kind: "money", role: "computed", section: "farm", note: "The sum of the per-year amounts entered on this schedule's own \"carry back to prior years\" section — a carry-back also requires Schedule 10 to be completed." },
  { line: "021087001", caption: "Losses - closing balance", kind: "money", role: "computed", section: "farm" },
  { line: "021091001", caption: "Losses carried forward from preceding taxation year", kind: "money", role: "input", section: "restricted-farm" },
  { line: "021092001", caption: "Deduct: losses expired (see note on page 4)", kind: "money", role: "input", section: "restricted-farm", footnoteMarks: [4] },
  { line: "021093001", caption: "Losses - beginning of taxation year", kind: "money", role: "computed", section: "restricted-farm" },
  { line: "021095001", caption: "Losses transfer from wind-up of a wholly-owned subsidiary and amalgamation", kind: "money", role: "input", section: "restricted-farm" },
  { line: "021097001", caption: "Current year loss", kind: "money", role: "input", section: "restricted-farm", from: { form: "T2SCH4", line: "410", note: "Defaults to this federal figure — override only where Alberta genuinely diverges." } },
  { line: "021099001", caption: "Amount applied against farming income", kind: "money", role: "input", section: "restricted-farm", to: { form: "AT1SCH12", line: "012068001" } },
  { line: "021101001", caption: "ITA section 80 adjustment", kind: "money", role: "input", section: "restricted-farm" },
  { line: "021103001", caption: "Other adjustments", kind: "money", role: "input", section: "restricted-farm" },
  { line: "021105001", caption: "Total loss carry back to prior taxation years (Schedule 10 must also be completed)", kind: "money", role: "computed", section: "restricted-farm", note: "The sum of the per-year amounts entered on this schedule's own \"carry back to prior years\" section — a carry-back also requires Schedule 10 to be completed." },
  { line: "021107001", caption: "Losses - closing balance", kind: "money", role: "computed", section: "restricted-farm" },
  { line: "021111001", caption: "Losses carried forward from preceding taxation year", kind: "money", role: "input", section: "listed-personal" },
  { line: "021113001", caption: "Deduct: losses expired after seven taxation years", kind: "money", role: "input", section: "listed-personal" },
  { line: "021115001", caption: "Losses - beginning of taxation year", kind: "money", role: "computed", section: "listed-personal" },
  { line: "021117001", caption: "Current year loss", kind: "money", role: "input", section: "listed-personal" },
  { line: "021119001", caption: "Amount applied against listed personal property gain (If Schedule 18 exists, enter amount from line 060. Otherwise, enter amount from federal Schedule 6, line 655).", kind: "money", role: "input", section: "listed-personal" },
  { line: "021121001", caption: "Adjustments", kind: "money", role: "input", section: "listed-personal" },
  { line: "021123001", caption: "Total loss carry back to prior taxation years (Schedule 10 must also be completed)", kind: "money", role: "computed", section: "listed-personal", note: "The sum of the per-year amounts entered on this schedule's own \"carry back to prior years\" section — a carry-back also requires Schedule 10 to be completed." },
  { line: "021125001", caption: "Losses - closing balance", kind: "money", role: "computed", section: "listed-personal" },
  { line: "021131001", caption: "Partnership Identifier (if known)", kind: "text", role: "input", section: "limited-partnership" },
  { line: "021133001", caption: "Limited partnership losses at end of preceding taxation year", kind: "money", role: "input", section: "limited-partnership" },
  { line: "021135001", caption: "Limited partnership losses transferred from amalgamation or wind-up of subsidiary", kind: "money", role: "input", section: "limited-partnership" },
  { line: "021137001", caption: "Current year limited partnership loss", kind: "money", role: "input", section: "limited-partnership" },
  { line: "021139001", caption: "Limited partnership loss applied", kind: "money", role: "input", section: "limited-partnership", to: { form: "AT1SCH12", line: "012072001", note: "Carry forward the TOTAL of this column to Schedule 12, line 072 — not any single row." } },
  { line: "021141001", caption: "Limited partnership losses closing balance (133 + 135 + 137 - 139)", kind: "money", role: "computed", section: "limited-partnership", formula: { expression: "133 + 135 + 137 - 139", inputs: ["021133001", "021135001", "021137001", "021139001"] } },
  { line: "021151001", caption: "Year of origin", kind: "code", role: "input", section: "non-capital-vintage", note: "0 is the current year; 1 to 20 are the preceding taxation years." },
  { line: "021153001", caption: "Tax year end", kind: "date", role: "input", section: "non-capital-vintage" },
  { line: "021155001", caption: "Balance at the beginning of year", kind: "money", role: "input", section: "non-capital-vintage", note: "Shaded on the current-year row — a loss arising this year has no opening balance." },
  { line: "021157001", caption: "Loss incurred in current year", kind: "money", role: "input", section: "non-capital-vintage", note: "The current-year row only; shaded for every preceding vintage." },
  { line: "021159001", caption: "Adjustments and transfers", kind: "money", role: "input", section: "non-capital-vintage" },
  { line: "021165001", caption: "Loss carried back", kind: "money", role: "input", section: "non-capital-vintage", note: "The current-year row only; shaded for every preceding vintage. A carry-back also requires Schedule 10." },
  { line: "021167001", caption: "Applied to reduce taxable income", kind: "money", role: "input", section: "non-capital-vintage", note: "Shaded on the current-year row." },
  { line: "021169001", caption: "Balance at end of year 155 + 157 + 159 - 165 - 167", kind: "money", role: "computed", section: "non-capital-vintage", formula: { expression: "155 + 157 + 159 - 165 - 167", inputs: ["021155001", "021157001", "021159001", "021165001", "021167001"] } },
  { line: "021181001", caption: "Year of origin", kind: "code", role: "input", section: "other-vintage", note: "0 is the current year; 1 to 20 are the preceding taxation years." },
  { line: "021183001", caption: "Farm losses", kind: "money", role: "input", section: "other-vintage", footnoteMarks: [4] },
  { line: "021185001", caption: "Restricted farm losses", kind: "money", role: "input", section: "other-vintage", footnoteMarks: [4] },
  { line: "021187001", caption: "Listed personal property losses", kind: "money", role: "input", section: "other-vintage", note: "Shaded beyond the 7th preceding year — a listed personal property loss expires after seven taxation years, not twenty." },
  { line: "021200001", caption: "RIFE at the end of the previous tax year", kind: "money", role: "input", section: "rife-continuity" },
  { line: "021210001", caption: "RIFE transferred on an amalgamation or on the wind-up of a subsidiary corporation", kind: "money", role: "input", section: "rife-continuity" },
  { line: "021220001", caption: "RIFE adjustment for an acquisition of control", kind: "money", role: "input", section: "rife-continuity" },
  { line: "021230001", caption: "Current-year restricted interest and financing expenses determined under subsection 111(8) of ITA (line 710 from the T2 Schedule 4)", kind: "money", role: "carried-in", section: "rife-continuity", from: { form: "T2SCH4", line: "710" } },
  { line: "021240001", caption: "RIFE deducted for the tax year. Line 240 must not exceed line 350 (Enter amount on line 130 of the Schedule 12)", kind: "money", role: "input", section: "rife-continuity", note: "The same deduction this schedule restates at line 002. The cap against line 350 is stated on the form but is not enforced by the engine, which does not model this page.", to: { form: "AT1SCH12", line: "012130001" } },
  { line: "021250001", caption: "Closing Balance of RIFE", kind: "money", role: "computed", section: "rife-continuity", note: "The form prints no formula for this line. It is the pool after the year's addition and deduction — lines 200 + 210 - 220 + 230 - 240 — but that is inference, not a stated rule, so it is not recorded as a formula." },
  { line: "021310001", caption: "RIFE from previous tax years (Line 200 + line 210 - line 220)", kind: "money", role: "computed", section: "rife-deductible", formula: { expression: "Line 200 + line 210 - line 220", inputs: ["021200001", "021210001", "021220001"] } },
  { line: "021320001", caption: "Corporation's excess capacity for the year (line 129 from T2 Schedule 130)", kind: "money", role: "carried-in", section: "rife-deductible", from: { form: "T2SCH130", line: "129" } },
  { line: "021330001", caption: "Total of all amounts of the corporation's received capacity for the year (line 130 from T2 Schedule 130)", kind: "money", role: "carried-in", section: "rife-deductible", from: { form: "T2SCH130", line: "130" } },
  { line: "021340001", caption: "Line 320 plus line 330", kind: "money", role: "computed", section: "rife-deductible", formula: { expression: "Line 320 plus line 330", inputs: ["021320001", "021330001"] } },
  { line: "021350001", caption: "RIFE deductible under paragraph 111(1)(a.1) of ITA for the year. (Lesser of line 310 and line 340)", kind: "money", role: "computed", section: "rife-deductible", formula: { expression: "Lesser of line 310 and line 340", inputs: ["021310001", "021340001"] } },
>>>>>>> Stashed changes
];

export const AT1_SCHEDULE_21_FOOTNOTES: readonly string[] = [
  "This schedule is required if the opening balance or the claim for Alberta purposes differs from that for federal purposes.",
  "The corporation may choose whether or not to deduct an available loss from income in a taxation year. It can deduct losses in any order. However, for each type of loss, ensure that the oldest loss is deducted first. See Guide for further information.",
  "A non capital loss expires after 7 taxation years if it arose in a taxation year ending before March 23, 2004 or after 10 taxation years if it arose in a taxation year ending after March 22, 2004, and before 2006 or after 20 years if it arose in a taxation year after 2005.",
  "An allowable business investment loss becomes a net capital loss after 7 taxation years if it arose in a taxation year ending before March 23, 2004 or after 10 taxation years if it arose in a taxation year ending after March 22, 2004.",
  "A farm loss or restricted farm loss expires as follows: after 10 tax years if it arose in a tax year ending before 2006; and after 20 tax years if it arose in a tax year ending after 2005.",
];

export interface Schedule21PoolRow {
  kind: string;
  caption: string;
  line: string;
  role: PaperFieldRole;
  /** Where this row's figure arrives from, when the form names another schedule. */
  from?: { form: string; line: string; note?: string };
  /** Where this row carries to on another schedule — the form prints this beside the row. */
  to?: { form: string; line: string; note?: string };
  note?: string;
  footnoteMarks?: readonly number[];
}

export interface Schedule21Pool {
  key: string;
  label: string;
  rows: readonly Schedule21PoolRow[];
}

export const AT1_SCHEDULE_21_POOL_TABLE: readonly Schedule21Pool[] = [
  {
    key: "non-capital",
    label: "Non-capital losses",
    rows: [
      { kind: "carriedForward", caption: "Losses carried forward from preceding taxation year", line: "021031001", role: "input" },
      { kind: "expired", caption: "Deduct: losses expired", line: "021032001", role: "input", footnoteMarks: [2] },
      { kind: "opening", caption: "Losses - beginning of taxation year", line: "021033001", role: "computed" },
      { kind: "windUpTransfer", caption: "Losses transfer from wind-up of a wholly-owned subsidiary or amalgamation", line: "021035001", role: "input" },
      { kind: "currentYearLoss", caption: "Current year loss", line: "021037001", role: "computed", note: "Line 021, entered here as a positive." },
      { kind: "appliedAgainstTaxableIncome", caption: "Amount applied against taxable income", line: "021041001", role: "input", to: { form: "AT1SCH12", line: "012064001" } },
      { kind: "section80Adjustment", caption: "ITA section 80 adjustment", line: "021043001", role: "input" },
      { kind: "otherAdjustments", caption: "Other adjustments (enter as a positive amount)", line: "021045001", role: "input" },
      { kind: "carryBack", caption: "Total loss carry back to prior taxation years (Schedule 10 must also be completed)", line: "021047001", role: "computed", note: "The sum of the per-year amounts entered on this schedule's own \"carry back to prior years\" section — a carry-back also requires Schedule 10 to be completed." },
      { kind: "closing", caption: "Losses - closing balance", line: "021049001", role: "computed" },
    ],
  },
  {
    key: "capital",
    label: "Capital losses (gross amount)",
    rows: [
      { kind: "carriedForward", caption: "Losses carried forward from preceding taxation year", line: "021051001", role: "input" },
      { kind: "windUpTransfer", caption: "Losses transfer from wind-up of a wholly-owned subsidiary or amalgamation", line: "021055001", role: "input" },
      { kind: "currentYearLoss", caption: "Current year loss", line: "021057001", role: "carried-in", from: { form: "T2SCH4", line: "210", note: "Current-year capital loss — Alberta has no override for this pool; it always equals federal." } },
      { kind: "abilExpired", caption: "Allowable business investment loss expired as reported on Federal Schedule 4 line 220", line: "021059001", role: "input", from: { form: "T2SCH4", line: "220" }, footnoteMarks: [3] },
      { kind: "appliedAgainstCapitalGain", caption: "Amount applied against current year capital gain", line: "021061001", role: "input", to: { form: "AT1SCH12", line: "012066001", note: "Carry forward this amount × the inclusion rate. Schedule 21 tracks capital losses at their full amount; Schedule 12 wants the allowable portion — carrying the raw figure over-deducts by roughly two." } },
      { kind: "section80Adjustment", caption: "ITA section 80 adjustment", line: "021063001", role: "input" },
      { kind: "otherAdjustments", caption: "Other adjustments (enter as a positive amount)", line: "021065001", role: "input" },
      { kind: "carryBack", caption: "Total loss carry back to prior taxation years (Schedule 10 must also be completed)", line: "021067001", role: "computed", note: "The sum of the per-year amounts entered on this schedule's own \"carry back to prior years\" section — a carry-back also requires Schedule 10 to be completed." },
      { kind: "closing", caption: "Losses - closing balance", line: "021069001", role: "computed" },
    ],
  },
  {
    key: "farm",
    label: "Farm losses",
    rows: [
      { kind: "carriedForward", caption: "Losses carried forward from preceding taxation year", line: "021071001", role: "input" },
      { kind: "expired", caption: "Deduct: losses expired (see note on page 4)", line: "021072001", role: "input", footnoteMarks: [4] },
      { kind: "opening", caption: "Losses - beginning of taxation year", line: "021073001", role: "computed" },
      { kind: "windUpTransfer", caption: "Losses transfer from wind-up of a wholly-owned subsidiary and amalgamation", line: "021075001", role: "input" },
      { kind: "currentYearLoss", caption: "Current year loss", line: "021077001", role: "input", from: { form: "T2SCH4", line: "310", note: "Defaults to this federal figure — override only where Alberta genuinely diverges." } },
      { kind: "appliedAgainstTaxableIncome", caption: "Amount applied against taxable income", line: "021079001", role: "input", to: { form: "AT1SCH12", line: "012070001" } },
      { kind: "section80Adjustment", caption: "ITA section 80 adjustment", line: "021081001", role: "input" },
      { kind: "otherAdjustments", caption: "Other adjustments", line: "021083001", role: "input" },
      { kind: "carryBack", caption: "Total loss carry back to prior taxation years (Schedule 10 must also be completed)", line: "021085001", role: "computed", note: "The sum of the per-year amounts entered on this schedule's own \"carry back to prior years\" section — a carry-back also requires Schedule 10 to be completed." },
      { kind: "closing", caption: "Losses - closing balance", line: "021087001", role: "computed" },
    ],
  },
  {
    key: "restricted-farm",
    label: "Restricted farm losses",
    rows: [
      { kind: "carriedForward", caption: "Losses carried forward from preceding taxation year", line: "021091001", role: "input" },
      { kind: "expired", caption: "Deduct: losses expired (see note on page 4)", line: "021092001", role: "input", footnoteMarks: [4] },
      { kind: "opening", caption: "Losses - beginning of taxation year", line: "021093001", role: "computed" },
      { kind: "windUpTransfer", caption: "Losses transfer from wind-up of a wholly-owned subsidiary and amalgamation", line: "021095001", role: "input" },
      { kind: "currentYearLoss", caption: "Current year loss", line: "021097001", role: "input", from: { form: "T2SCH4", line: "410", note: "Defaults to this federal figure — override only where Alberta genuinely diverges." } },
      { kind: "appliedAgainstFarmingIncome", caption: "Amount applied against farming income", line: "021099001", role: "input", to: { form: "AT1SCH12", line: "012068001" } },
      { kind: "section80Adjustment", caption: "ITA section 80 adjustment", line: "021101001", role: "input" },
      { kind: "otherAdjustments", caption: "Other adjustments", line: "021103001", role: "input" },
      { kind: "carryBack", caption: "Total loss carry back to prior taxation years (Schedule 10 must also be completed)", line: "021105001", role: "computed", note: "The sum of the per-year amounts entered on this schedule's own \"carry back to prior years\" section — a carry-back also requires Schedule 10 to be completed." },
      { kind: "closing", caption: "Losses - closing balance", line: "021107001", role: "computed" },
    ],
  },
  {
    key: "listed-personal",
    label: "Listed personal property losses",
    rows: [
      { kind: "carriedForward", caption: "Losses carried forward from preceding taxation year", line: "021111001", role: "input" },
      { kind: "expired", caption: "Deduct: losses expired after seven taxation years", line: "021113001", role: "input" },
      { kind: "opening", caption: "Losses - beginning of taxation year", line: "021115001", role: "computed" },
      { kind: "currentYearLoss", caption: "Current year loss", line: "021117001", role: "input" },
      { kind: "appliedAgainstLppGain", caption: "Amount applied against listed personal property gain (If Schedule 18 exists, enter amount from line 060. Otherwise, enter amount from federal Schedule 6, line 655).", line: "021119001", role: "input" },
      { kind: "otherAdjustments", caption: "Adjustments", line: "021121001", role: "input" },
      { kind: "carryBack", caption: "Total loss carry back to prior taxation years (Schedule 10 must also be completed)", line: "021123001", role: "computed", note: "The sum of the per-year amounts entered on this schedule's own \"carry back to prior years\" section — a carry-back also requires Schedule 10 to be completed." },
      { kind: "closing", caption: "Losses - closing balance", line: "021125001", role: "computed" },
    ],
  },
];

/** Grid rows in print order, with the caption the form prints beside each. */
export const AT1_SCHEDULE_21_ROW_ORDER: readonly { kind: string; caption: string }[] = [
  { kind: "carriedForward", caption: "Losses carried forward from preceding taxation year" },
  { kind: "expired", caption: "Deduct: losses expired" },
  { kind: "opening", caption: "Losses - beginning of taxation year" },
  { kind: "windUpTransfer", caption: "Losses transfer from wind-up of a wholly-owned subsidiary or amalgamation" },
  { kind: "currentYearLoss", caption: "Current year loss" },
  { kind: "abilExpired", caption: "Allowable business investment loss expired as reported on Federal Schedule 4 line 220" },
  { kind: "appliedAgainstTaxableIncome", caption: "Amount applied against taxable income" },
  { kind: "appliedAgainstCapitalGain", caption: "Amount applied against current year capital gain" },
  { kind: "appliedAgainstFarmingIncome", caption: "Amount applied against farming income" },
  { kind: "appliedAgainstLppGain", caption: "Amount applied against listed personal property gain (If Schedule 18 exists, enter amount from line 060. Otherwise, enter amount from federal Schedule 6, line 655)." },
  { kind: "section80Adjustment", caption: "ITA section 80 adjustment" },
  { kind: "otherAdjustments", caption: "Other adjustments (enter as a positive amount)" },
  { kind: "carryBack", caption: "Total loss carry back to prior taxation years (Schedule 10 must also be completed)" },
  { kind: "closing", caption: "Losses - closing balance" },
];

export interface Schedule21Block {
  id: string;
  page: number;
  /** Column keys into `AT1_SCHEDULE_21_POOL_TABLE`, left to right. */
  poolKeys: readonly string[];
  /** Rows this block prints, already filtered to the ones its columns use. */
  rowOrder: readonly { kind: string; caption: string }[];
  /** Row after which the form prints its unnumbered "Subtotal" divider. */
  subtotalAfter: string;
}

/** The continuity as three separate tables, exactly as the form prints it. */
export const AT1_SCHEDULE_21_BLOCK_TABLE: readonly Schedule21Block[] = [
  {
    id: "non-capital-and-capital",
    page: 1,
    poolKeys: ["non-capital", "capital"],
    subtotalAfter: "abilExpired",
    rowOrder: [
      { kind: "carriedForward", caption: "Losses carried forward from preceding taxation year" },
      { kind: "expired", caption: "Deduct: losses expired" },
      { kind: "opening", caption: "Losses - beginning of taxation year" },
      { kind: "windUpTransfer", caption: "Losses transfer from wind-up of a wholly-owned subsidiary or amalgamation" },
      { kind: "currentYearLoss", caption: "Current year loss" },
      { kind: "abilExpired", caption: "Allowable business investment loss expired as reported on Federal Schedule 4 line 220" },
      { kind: "appliedAgainstTaxableIncome", caption: "Amount applied against taxable income" },
      { kind: "appliedAgainstCapitalGain", caption: "Amount applied against current year capital gain" },
      { kind: "section80Adjustment", caption: "ITA section 80 adjustment" },
      { kind: "otherAdjustments", caption: "Other adjustments (enter as a positive amount)" },
      { kind: "carryBack", caption: "Total loss carry back to prior taxation years (Schedule 10 must also be completed)" },
      { kind: "closing", caption: "Losses - closing balance" },
    ],
  },
  {
    id: "farm-and-restricted-farm",
    page: 2,
    poolKeys: ["farm", "restricted-farm"],
    subtotalAfter: "currentYearLoss",
    rowOrder: [
      { kind: "carriedForward", caption: "Losses carried forward from preceding taxation year" },
      { kind: "expired", caption: "Deduct: losses expired (see note on page 4)" },
      { kind: "opening", caption: "Losses - beginning of taxation year" },
      { kind: "windUpTransfer", caption: "Losses transfer from wind-up of a wholly-owned subsidiary and amalgamation" },
      { kind: "currentYearLoss", caption: "Current year loss" },
      { kind: "appliedAgainstTaxableIncome", caption: "Amount applied against taxable income" },
      { kind: "appliedAgainstFarmingIncome", caption: "Amount applied against farming income" },
      { kind: "section80Adjustment", caption: "ITA section 80 adjustment" },
      { kind: "otherAdjustments", caption: "Other adjustments" },
      { kind: "carryBack", caption: "Total loss carry back to prior taxation years (Schedule 10 must also be completed)" },
      { kind: "closing", caption: "Losses - closing balance" },
    ],
  },
  {
    id: "listed-personal",
    page: 2,
    poolKeys: ["listed-personal"],
    subtotalAfter: "currentYearLoss",
    rowOrder: [
      { kind: "carriedForward", caption: "Losses carried forward from preceding taxation year" },
      { kind: "expired", caption: "Deduct: losses expired after seven taxation years" },
      { kind: "opening", caption: "Losses - beginning of taxation year" },
      { kind: "currentYearLoss", caption: "Current year loss" },
      { kind: "appliedAgainstLppGain", caption: "Amount applied against listed personal property gain (If Schedule 18 exists, enter amount from line 060. Otherwise, enter amount from federal Schedule 6, line 655)." },
      { kind: "otherAdjustments", caption: "Adjustments" },
      { kind: "carryBack", caption: "Total loss carry back to prior taxation years (Schedule 10 must also be completed)" },
      { kind: "closing", caption: "Losses - closing balance" },
    ],
  },
];
