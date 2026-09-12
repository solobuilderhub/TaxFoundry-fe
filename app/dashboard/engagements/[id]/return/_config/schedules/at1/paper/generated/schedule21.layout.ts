/**
 * Current-year loss and continuity of losses (AT1SCH21) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/sources/tra-forms/pdf/AT1SCH21-loss-continuity-TRA11741.pdf, retrieved 2026-09-08.
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
  note?: string;
  /** What the form prints over the box to say where the figure comes from, verbatim. Present even where `from` is not — a sum or a conditional has no single line to link to. */
  sourceText?: string;
  from?: { form: string; line: string; note?: string };
  to?: { form: string; line: string; note?: string };
  footnoteMarks?: readonly number[];
}

export interface PaperSectionDef {
  id: string;
  title: string;
  description?: string;
  /** Text the form prints immediately BEFORE this heading, verbatim. */
  printedBefore?: string;
}

export const AT1_SCHEDULE_21_SECTIONS: readonly PaperSectionDef[] = [
  { id: "current-year", title: "Part 1 — Calculating the current-year non-capital loss", description: "Starts from Alberta net income on Schedule 12 line 054 and works down through the Division C deductions to the loss for the year." },
  { id: "continuity", title: "Part 2 — Continuity of losses", description: "Five pools, each a full continuity. Every closing balance carries to a specific Alberta loss line on Schedule 12." },
  { id: "rife", title: "Continuity of restricted interest and financing expenses (RIFE)", description: "Page 5. None of these lines is in the NetFile schema — the section is never transmitted — but line 240 feeds Schedule 12 line 130, which is." },
];

export const AT1_SCHEDULE_21_FIELDS: readonly PaperField[] = [
  { line: "021001001", caption: "Net Income (loss) per Alberta Schedule 12 line 054", kind: "money", role: "carried-in", section: "current-year", requirement: "mandatory", from: { form: "AT1SCH12", line: "012054001", note: "Alberta net income" } },
  { line: "021002001", caption: "RIFE deducted in the year under paragraph 111(1)(a.1) of ITA (enter as a positive amount)", kind: "money", role: "carried-in", section: "current-year", note: "RIFE is restricted interest and financing expenses. §3.2.3.21: \"Must equal 021240\".", from: { form: "AT1SCH21", line: "021240001", note: "RIFE deducted for the tax year" } },
  { line: "021003001", caption: "Net capital losses deducted in the year (enter as a positive amount)", kind: "money", role: "computed", section: "current-year", note: "§3.2.3.21: \"Must equal 021061 x Inclusion Rate. If 021061 is blank, then field must not exist.\" The capital pool's amount applied (line 061) times the inclusion rate — the same figure Schedule 12 line 066 carries." },
  { line: "021005001", caption: "Taxable dividends deductible", kind: "money", role: "carried-in", section: "current-year", note: "§3.2.3.21: \"Value must equal fed 200320.\"", from: { form: "T2", line: "320" } },
  { line: "021007001", caption: "Amount of Part VI.1 tax deductible", kind: "money", role: "carried-in", section: "current-year", note: "§3.2.3.21: \"Value must equal fed 200325.\"", from: { form: "T2", line: "325" } },
  { line: "021011001", caption: "Amount deductible as prospector's and grubstaker's shares", kind: "money", role: "carried-in", section: "current-year", note: "§3.2.3.21: \"Value must equal fed 200350.\"", from: { form: "T2", line: "350" } },
  { line: "021012001", caption: "Employer deduction for non-qualified securities - Paragraph 110(1)(e) of ITA", kind: "money", role: "carried-in", section: "current-year", note: "§3.2.3.21: \"Value must equal fed 200352\".", from: { form: "T2", line: "352" } },
  { line: "021013001", caption: "Subtotal of lines 002 to 012", kind: "money", role: "total", section: "current-year", note: "Print-only: the specification gives this subtotal no line code, so it is computed for display and never transmitted." },
  { line: "021015001", caption: "Line 001 - line 013: (if positive, enter \"0\")", kind: "money", role: "computed", section: "current-year", note: "Print-only: no line code in the specification — computed for display, never transmitted." },
  { line: "021017001", caption: "Deduct: ITA section 110.5 or subparagraph 115(1)(a)(vii) additions for foreign tax credits", kind: "money", role: "input", section: "current-year", requirement: "mandatory", note: "§3.2.3.21: \"Value cannot exceed fed 200355 to the extent that 00070 and/or 000071 would increase as a result.\" Federal T2 line 355 is the ceiling; exceeding it is flagged, not clamped, because the condition depends on the jacket.", to: { form: "AT1SCH12", line: "012082001", note: "Carry forward to Schedule 12, line 082" } },
  { line: "021019001", caption: "Add: Current year farm loss", kind: "money", role: "input", section: "current-year", note: "§3.2.3.21: \"If the current year Alberta farm loss differs from the federal amount, then enter the Alberta amount. Otherwise, value = fed 004310.\" Defaults to federal Schedule 4 line 310; the same figure as the farm pool's current-year loss below." },
  { line: "021021001", caption: "Non-capital loss for the current year: Line 015 - 017 + 019 (if positive, enter \"0\")", kind: "money", role: "computed", section: "current-year", requirement: "mandatory", note: "If negative, enter this amount into line 037 as a positive." },
  { line: "021031001", caption: "Non-capital losses — Losses carried forward from preceding taxation year", kind: "money", role: "input", section: "continuity" },
  { line: "021032001", caption: "Non-capital losses — Deduct: losses expired", kind: "money", role: "input", section: "continuity" },
  { line: "021033001", caption: "Non-capital losses — Losses - beginning of taxation year", kind: "money", role: "computed", section: "continuity" },
  { line: "021035001", caption: "Non-capital losses — Add: Losses transfer from wind-up of a wholly-owned subsidiary or amalgamation", kind: "money", role: "input", section: "continuity" },
  { line: "021037001", caption: "Non-capital losses — Current year loss", kind: "money", role: "computed", section: "continuity" },
  { line: "021041001", caption: "Non-capital losses — Deduct: Amount applied against taxable income", kind: "money", role: "input", section: "continuity", to: { form: "AT1SCH12", line: "012064001", note: "Printed on the form directly beside this line." } },
  { line: "021043001", caption: "Non-capital losses — ITA section 80 adjustment", kind: "money", role: "input", section: "continuity" },
  { line: "021045001", caption: "Non-capital losses — Other adjustments (enter as a positive amount)", kind: "money", role: "input", section: "continuity" },
  { line: "021047001", caption: "Non-capital losses — Total loss carry back to prior taxation years (Schedule 10 must also be completed)", kind: "money", role: "computed", section: "continuity", note: "The sum of the per-year amounts entered on this schedule’s own \"carry back to prior years\" section — a carry-back also requires Schedule 10 to be completed." },
  { line: "021049001", caption: "Non-capital losses — Losses - closing balance", kind: "money", role: "computed", section: "continuity", footnoteMarks: [2] },
  { line: "021051001", caption: "Net capital losses (Gross amount) — Losses carried forward from preceding taxation year", kind: "money", role: "input", section: "continuity" },
  { line: "021055001", caption: "Net capital losses (Gross amount) — Add: Losses transfer from wind-up of a wholly-owned subsidiary or amalgamation", kind: "money", role: "input", section: "continuity" },
  { line: "021057001", caption: "Net capital losses (Gross amount) — Current year loss", kind: "money", role: "carried-in", section: "continuity", from: { form: "T2SCH4", line: "210", note: "Current-year capital loss — Alberta has no override for this pool; it always equals federal." } },
  { line: "021059001", caption: "Net capital losses (Gross amount) — Allowable business investment loss expired as reported on Federal Schedule 4 line 220", kind: "money", role: "input", section: "continuity", from: { form: "T2SCH4", line: "220", note: "Printed on the form: \"as reported on Federal Schedule 4 line 220\" — federal line 220 is \"ABILs expired as non-capital losses (line 215 multiplied by 2)\". An expiring ABIL leaves the non-capital pool and arrives here as a net capital loss." } },
  { line: "021061001", caption: "Net capital losses (Gross amount) — Amount applied against current year capital gain", kind: "money", role: "input", section: "continuity", to: { form: "AT1SCH12", line: "012066001", note: "Carry forward this amount × the inclusion rate. Schedule 21 tracks capital losses at their full amount; Schedule 12 wants the allowable portion — carrying the raw figure over-deducts by roughly two." } },
  { line: "021063001", caption: "Net capital losses (Gross amount) — ITA section 80 adjustment", kind: "money", role: "input", section: "continuity" },
  { line: "021065001", caption: "Net capital losses (Gross amount) — Other adjustments (enter as a positive amount)", kind: "money", role: "input", section: "continuity" },
  { line: "021067001", caption: "Net capital losses (Gross amount) — Total loss carry back to prior taxation years (Schedule 10 must also be completed)", kind: "money", role: "computed", section: "continuity", note: "The sum of the per-year amounts entered on this schedule’s own \"carry back to prior years\" section — a carry-back also requires Schedule 10 to be completed." },
  { line: "021069001", caption: "Net capital losses (Gross amount) — Losses - closing balance", kind: "money", role: "computed", section: "continuity", footnoteMarks: [3] },
  { line: "021071001", caption: "Farm losses — Losses carried forward from preceding taxation year", kind: "money", role: "input", section: "continuity" },
  { line: "021072001", caption: "Farm losses — Deduct: losses expired (see note on page 4)", kind: "money", role: "input", section: "continuity" },
  { line: "021073001", caption: "Farm losses — Losses - beginning of taxation year", kind: "money", role: "computed", section: "continuity" },
  { line: "021075001", caption: "Farm losses — Losses transfer from wind-up of a wholly-owned subsidiary and amalgamation", kind: "money", role: "input", section: "continuity" },
  { line: "021077001", caption: "Farm losses — Current year loss", kind: "money", role: "input", section: "continuity", from: { form: "T2SCH4", line: "310", note: "Defaults to this federal figure — override only where Alberta genuinely diverges." } },
  { line: "021079001", caption: "Farm losses — Deduct: Amount applied against taxable income", kind: "money", role: "input", section: "continuity", to: { form: "AT1SCH12", line: "012070001", note: "Printed on the form directly beside this line." } },
  { line: "021081001", caption: "Farm losses — ITA section 80 adjustment", kind: "money", role: "input", section: "continuity" },
  { line: "021083001", caption: "Farm losses — Other adjustments", kind: "money", role: "input", section: "continuity" },
  { line: "021085001", caption: "Farm losses — Total loss carry back to prior taxation years (Schedule 10 must also be completed)", kind: "money", role: "computed", section: "continuity", note: "The sum of the per-year amounts entered on this schedule’s own \"carry back to prior years\" section — a carry-back also requires Schedule 10 to be completed." },
  { line: "021087001", caption: "Farm losses — Losses - closing balance", kind: "money", role: "computed", section: "continuity", footnoteMarks: [4] },
  { line: "021091001", caption: "Restricted farm losses — Losses carried forward from preceding taxation year", kind: "money", role: "input", section: "continuity" },
  { line: "021092001", caption: "Restricted farm losses — Deduct: losses expired (see note on page 4)", kind: "money", role: "input", section: "continuity" },
  { line: "021093001", caption: "Restricted farm losses — Losses - beginning of taxation year", kind: "money", role: "computed", section: "continuity" },
  { line: "021095001", caption: "Restricted farm losses — Losses transfer from wind-up of a wholly-owned subsidiary and amalgamation", kind: "money", role: "input", section: "continuity" },
  { line: "021097001", caption: "Restricted farm losses — Current year loss", kind: "money", role: "input", section: "continuity", from: { form: "T2SCH4", line: "410", note: "Defaults to this federal figure — override only where Alberta genuinely diverges." } },
  { line: "021099001", caption: "Restricted farm losses — Amount applied against farming income", kind: "money", role: "input", section: "continuity", to: { form: "AT1SCH12", line: "012068001", note: "Printed on the form directly beside this line." } },
  { line: "021101001", caption: "Restricted farm losses — ITA section 80 adjustment", kind: "money", role: "input", section: "continuity" },
  { line: "021103001", caption: "Restricted farm losses — Other adjustments", kind: "money", role: "input", section: "continuity" },
  { line: "021105001", caption: "Restricted farm losses — Total loss carry back to prior taxation years (Schedule 10 must also be completed)", kind: "money", role: "computed", section: "continuity", note: "The sum of the per-year amounts entered on this schedule’s own \"carry back to prior years\" section — a carry-back also requires Schedule 10 to be completed." },
  { line: "021107001", caption: "Restricted farm losses — Losses - closing balance", kind: "money", role: "computed", section: "continuity", footnoteMarks: [4] },
  { line: "021111001", caption: "Listed personal property losses — Losses carried forward from preceding taxation year", kind: "money", role: "input", section: "continuity" },
  { line: "021113001", caption: "Listed personal property losses — Deduct: losses expired after seven taxation years", kind: "money", role: "input", section: "continuity" },
  { line: "021115001", caption: "Listed personal property losses — Losses - beginning of taxation year", kind: "money", role: "computed", section: "continuity" },
  { line: "021117001", caption: "Listed personal property losses — Current year loss", kind: "money", role: "input", section: "continuity" },
  { line: "021119001", caption: "Listed personal property losses — Deduct: Amount applied against listed personal property gain (If Schedule 18 exists, enter amount from line 060. Otherwise, enter amount from federal Schedule 6, line 655).", kind: "money", role: "input", section: "continuity", note: "If Schedule 18 exists, carry forward the amount from Schedule 18 line 060. Otherwise, carry forward the amount from federal Schedule 6 line 655." },
  { line: "021121001", caption: "Listed personal property losses — Adjustments", kind: "money", role: "input", section: "continuity" },
  { line: "021123001", caption: "Listed personal property losses — Total loss carry back to prior taxation years (Schedule 10 must also be completed)", kind: "money", role: "computed", section: "continuity", note: "The sum of the per-year amounts entered on this schedule’s own \"carry back to prior years\" section — a carry-back also requires Schedule 10 to be completed." },
  { line: "021125001", caption: "Listed personal property losses — Losses - closing balance", kind: "money", role: "computed", section: "continuity" },
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
];

export const AT1_SCHEDULE_21_FOOTNOTES: readonly string[] = [
  "This schedule is required if the opening balance or the claim for Alberta purposes differs from that for federal purposes.",
  "The corporation may choose whether or not to deduct an available loss from income in a taxation year. It can deduct losses in any order. However, for each type of loss, ensure that the oldest loss is deducted first.",
  "A non-capital loss expires after 7 taxation years if it arose in a taxation year ending before March 23, 2004, or after 10 taxation years if it arose in a taxation year ending after March 22, 2004 and before 2006, or after 20 years if it arose in a taxation year after 2005.",
  "An allowable business investment loss becomes a net capital loss after 7 taxation years if it arose in a taxation year ending before March 23, 2004, or after 10 taxation years if it arose in a taxation year ending after March 22, 2004.",
  "A farm loss or restricted farm loss expires after 10 tax years if it arose in a tax year ending before 2006, and after 20 tax years if it arose in a tax year ending after 2005.",
];

export interface Schedule21PoolRow {
  kind: string;
  caption: string;
  line: string;
  role: PaperFieldRole;
  /** Where this row carries to on another schedule, when the form says so. */
  to?: { form: string; line: string; note?: string };
  /** Where this row's figure arrives from, for a `carried-in` row. */
  from?: { form: string; line: string; note?: string };
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
      { kind: "expired", caption: "Deduct: losses expired", line: "021032001", role: "input" },
      { kind: "opening", caption: "Losses - beginning of taxation year", line: "021033001", role: "computed" },
      { kind: "windUpTransfer", caption: "Add: Losses transfer from wind-up of a wholly-owned subsidiary or amalgamation", line: "021035001", role: "input" },
      { kind: "currentYearLoss", caption: "Current year loss", line: "021037001", role: "computed" },
      { kind: "appliedAgainstIncome", caption: "Deduct: Amount applied against taxable income", line: "021041001", role: "input", to: { form: "AT1SCH12", line: "012064001", note: "Printed on the form directly beside this line." } },
      { kind: "section80Adjustment", caption: "ITA section 80 adjustment", line: "021043001", role: "input" },
      { kind: "otherAdjustments", caption: "Other adjustments (enter as a positive amount)", line: "021045001", role: "input" },
      { kind: "carryBack", caption: "Total loss carry back to prior taxation years (Schedule 10 must also be completed)", line: "021047001", role: "computed", note: "The sum of the per-year amounts entered on this schedule’s own \"carry back to prior years\" section — a carry-back also requires Schedule 10 to be completed." },
      { kind: "closing", caption: "Losses - closing balance", line: "021049001", role: "computed", footnoteMarks: [2] },
    ],
  },
  {
    key: "capital",
    label: "Net capital losses (Gross amount)",
    rows: [
      { kind: "carriedForward", caption: "Losses carried forward from preceding taxation year", line: "021051001", role: "input" },
      { kind: "windUpTransfer", caption: "Add: Losses transfer from wind-up of a wholly-owned subsidiary or amalgamation", line: "021055001", role: "input" },
      { kind: "currentYearLoss", caption: "Current year loss", line: "021057001", role: "carried-in", from: { form: "T2SCH4", line: "210", note: "Current-year capital loss — Alberta has no override for this pool; it always equals federal." } },
      { kind: "abilExpired", caption: "Allowable business investment loss expired as reported on Federal Schedule 4 line 220", line: "021059001", role: "input", from: { form: "T2SCH4", line: "220", note: "Printed on the form: \"as reported on Federal Schedule 4 line 220\" — federal line 220 is \"ABILs expired as non-capital losses (line 215 multiplied by 2)\". An expiring ABIL leaves the non-capital pool and arrives here as a net capital loss." } },
      { kind: "appliedAgainstIncome", caption: "Amount applied against current year capital gain", line: "021061001", role: "input", to: { form: "AT1SCH12", line: "012066001", note: "Carry forward this amount × the inclusion rate. Schedule 21 tracks capital losses at their full amount; Schedule 12 wants the allowable portion — carrying the raw figure over-deducts by roughly two." } },
      { kind: "section80Adjustment", caption: "ITA section 80 adjustment", line: "021063001", role: "input" },
      { kind: "otherAdjustments", caption: "Other adjustments (enter as a positive amount)", line: "021065001", role: "input" },
      { kind: "carryBack", caption: "Total loss carry back to prior taxation years (Schedule 10 must also be completed)", line: "021067001", role: "computed", note: "The sum of the per-year amounts entered on this schedule’s own \"carry back to prior years\" section — a carry-back also requires Schedule 10 to be completed." },
      { kind: "closing", caption: "Losses - closing balance", line: "021069001", role: "computed", footnoteMarks: [3] },
    ],
  },
  {
    key: "farm",
    label: "Farm losses",
    rows: [
      { kind: "carriedForward", caption: "Losses carried forward from preceding taxation year", line: "021071001", role: "input" },
      { kind: "expired", caption: "Deduct: losses expired (see note on page 4)", line: "021072001", role: "input" },
      { kind: "opening", caption: "Losses - beginning of taxation year", line: "021073001", role: "computed" },
      { kind: "windUpTransfer", caption: "Losses transfer from wind-up of a wholly-owned subsidiary and amalgamation", line: "021075001", role: "input" },
      { kind: "currentYearLoss", caption: "Current year loss", line: "021077001", role: "input", from: { form: "T2SCH4", line: "310", note: "Defaults to this federal figure — override only where Alberta genuinely diverges." } },
      { kind: "appliedAgainstIncome", caption: "Deduct: Amount applied against taxable income", line: "021079001", role: "input", to: { form: "AT1SCH12", line: "012070001", note: "Printed on the form directly beside this line." } },
      { kind: "section80Adjustment", caption: "ITA section 80 adjustment", line: "021081001", role: "input" },
      { kind: "otherAdjustments", caption: "Other adjustments", line: "021083001", role: "input" },
      { kind: "carryBack", caption: "Total loss carry back to prior taxation years (Schedule 10 must also be completed)", line: "021085001", role: "computed", note: "The sum of the per-year amounts entered on this schedule’s own \"carry back to prior years\" section — a carry-back also requires Schedule 10 to be completed." },
      { kind: "closing", caption: "Losses - closing balance", line: "021087001", role: "computed", footnoteMarks: [4] },
    ],
  },
  {
    key: "restricted-farm",
    label: "Restricted farm losses",
    rows: [
      { kind: "carriedForward", caption: "Losses carried forward from preceding taxation year", line: "021091001", role: "input" },
      { kind: "expired", caption: "Deduct: losses expired (see note on page 4)", line: "021092001", role: "input" },
      { kind: "opening", caption: "Losses - beginning of taxation year", line: "021093001", role: "computed" },
      { kind: "windUpTransfer", caption: "Losses transfer from wind-up of a wholly-owned subsidiary and amalgamation", line: "021095001", role: "input" },
      { kind: "currentYearLoss", caption: "Current year loss", line: "021097001", role: "input", from: { form: "T2SCH4", line: "410", note: "Defaults to this federal figure — override only where Alberta genuinely diverges." } },
      { kind: "appliedAgainstIncome", caption: "Amount applied against farming income", line: "021099001", role: "input", to: { form: "AT1SCH12", line: "012068001", note: "Printed on the form directly beside this line." } },
      { kind: "section80Adjustment", caption: "ITA section 80 adjustment", line: "021101001", role: "input" },
      { kind: "otherAdjustments", caption: "Other adjustments", line: "021103001", role: "input" },
      { kind: "carryBack", caption: "Total loss carry back to prior taxation years (Schedule 10 must also be completed)", line: "021105001", role: "computed", note: "The sum of the per-year amounts entered on this schedule’s own \"carry back to prior years\" section — a carry-back also requires Schedule 10 to be completed." },
      { kind: "closing", caption: "Losses - closing balance", line: "021107001", role: "computed", footnoteMarks: [4] },
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
      { kind: "appliedAgainstIncome", caption: "Deduct: Amount applied against listed personal property gain (If Schedule 18 exists, enter amount from line 060. Otherwise, enter amount from federal Schedule 6, line 655).", line: "021119001", role: "input", note: "If Schedule 18 exists, carry forward the amount from Schedule 18 line 060. Otherwise, carry forward the amount from federal Schedule 6 line 655." },
      { kind: "otherAdjustments", caption: "Adjustments", line: "021121001", role: "input" },
      { kind: "carryBack", caption: "Total loss carry back to prior taxation years (Schedule 10 must also be completed)", line: "021123001", role: "computed", note: "The sum of the per-year amounts entered on this schedule’s own \"carry back to prior years\" section — a carry-back also requires Schedule 10 to be completed." },
      { kind: "closing", caption: "Losses - closing balance", line: "021125001", role: "computed" },
    ],
  },
];
