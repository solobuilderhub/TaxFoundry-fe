/**
 * Alberta Other Tax Deductions and Credits (AT1SCH03) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/sources/tra-forms/pdf/AT1SCH03-other-tax-deductions-credits-TRA11725.pdf, retrieved 2026-09-14.
 *
 * Carries EVERY field, not just `input` ones — a paper view shows the whole
 * form. The paper renderer, not this file, is responsible for keeping
 * computed/carried-in lines read-only.
 */
export type PaperFieldRole = "input" | "computed" | "total" | "carried-in" | "not-collected";
export type PaperFieldKind = "money" | "date" | "text" | "rate" | "flag" | "code" | "count";

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
  /** Text the form prints inside this box AFTER its last numbered line, verbatim. */
  printedAfter?: string;
}

export const AT1_SCHEDULE_3_SECTIONS: readonly PaperSectionDef[] = [
  { id: "itc", title: "Investor Tax Credit", printedBefore: "In order to be eligible for any deduction listed on this form, a corporation must have Investor Tax Credit Certificates or Capital Investment Tax Credit Certificates or an Agri-processing Investment Tax Credit Certificate issued by appropriate ministry." },
  { id: "citc", title: "Capital Investment Tax Credit" },
  { id: "apitc", title: "Agri-processing Investment Tax Credit", description: "Per-vintage caps: 20% current year, 30% 1st preceding, 50% 2nd preceding, uncapped 3rd-10th. Each cap is on that vintage’s OWN receipt, and the page states every one of them in the line’s own caption." },
  { id: "mad", title: "Maximum Allowable Deduction", description: "The shared ceiling across all three credits — ITC has first call on it." },
  { id: "itc-vintage", title: "Investor Tax Credit Calculation - Investor Tax Credit carry forward year of origin", description: "Five rows: the current year and four preceding ones." },
  { id: "citc-vintage", title: "Capital Investment Tax Credit Calculation - Capital Investment Tax Credit carry forward year of origin", description: "Eleven rows: the current year and ten preceding ones." },
  { id: "apitc-vintage", title: "Agri-processing Investment Tax Credit Calculation - Agri-processing Investment Tax Credit carry forward year of origin", description: "Eleven rows. Note the column order differs from the other two tables — received (334) comes before the opening balance (335)." },
];

export const AT1_SCHEDULE_3_FIELDS: readonly PaperField[] = [
  { line: "003100001", caption: "Total amounts shown on all Investor Tax Credit certificates issued to the corporation during the year", kind: "money", role: "input", section: "itc" },
  { line: "003102001", caption: "Total Investor Tax Credit amount carried forward from prior year(s)", kind: "money", role: "input", section: "itc", note: "= prior year’s line 108. Analysed by year of origin on page 2, lines 120-130." },
  { line: "003104001", caption: "Amount applied to current taxation year [maximum credit is equal to AT1 page 2 line 068 - (lines 070 + 072)]", kind: "money", role: "input", section: "itc", note: "Blank claims the maximum the shared room (604) and the pool (100+102) both allow. The bracketed room formula is the page’s own — see the module doc comment on the 070+072 vs 070+071+072+074 discrepancy." },
  { line: "003106001", caption: "Total Investor Tax Credit Expired", kind: "money", role: "input", section: "itc" },
  { line: "003108001", caption: "Amount available for carry forward (line 100 + line 102 - line 104 - line 106)", kind: "money", role: "computed", section: "itc" },
  { line: "003120001", caption: "Year of origin", kind: "code", role: "computed", section: "itc-vintage", note: "One occurrence per year of origin, 5 rows: occurrence 1 is the current year and occurrence 5 the 4th preceding taxation year. NOT COMPUTED — see `computeSchedule3`, which produces the aggregates on page 1 and leaves this per-vintage split to the preparer." },
  { line: "003122001", caption: "Tax Year End YYYY/MM/DD", kind: "date", role: "input", section: "itc-vintage", note: "One occurrence per year of origin, 5 rows: occurrence 1 is the current year and occurrence 5 the 4th preceding taxation year. NOT COMPUTED — see `computeSchedule3`, which produces the aggregates on page 1 and leaves this per-vintage split to the preparer." },
  { line: "003124001", caption: "Investor Tax Credit balance at beginning of the year and transfers", kind: "money", role: "input", section: "itc-vintage", note: "One occurrence per year of origin, 5 rows: occurrence 1 is the current year and occurrence 5 the 4th preceding taxation year. NOT COMPUTED — see `computeSchedule3`, which produces the aggregates on page 1 and leaves this per-vintage split to the preparer.", footnoteMarks: [0] },
  { line: "003125001", caption: "Investor Tax Credit received during the year", kind: "money", role: "input", section: "itc-vintage", note: "One occurrence per year of origin, 5 rows: occurrence 1 is the current year and occurrence 5 the 4th preceding taxation year. NOT COMPUTED — see `computeSchedule3`, which produces the aggregates on page 1 and leaves this per-vintage split to the preparer." },
  { line: "003126001", caption: "Investor Tax Credit applied to reduce tax payable", kind: "money", role: "input", section: "itc-vintage", note: "One occurrence per year of origin, 5 rows: occurrence 1 is the current year and occurrence 5 the 4th preceding taxation year. NOT COMPUTED — see `computeSchedule3`, which produces the aggregates on page 1 and leaves this per-vintage split to the preparer." },
  { line: "003128001", caption: "Investor Tax Credit expired during the year", kind: "money", role: "input", section: "itc-vintage", note: "One occurrence per year of origin, 5 rows: occurrence 1 is the current year and occurrence 5 the 4th preceding taxation year. NOT COMPUTED — see `computeSchedule3`, which produces the aggregates on page 1 and leaves this per-vintage split to the preparer." },
  { line: "003130001", caption: "Investor Tax Credit available for carry forward 124 + 125 - 126 - 128", kind: "money", role: "computed", section: "itc-vintage", note: "One occurrence per year of origin, 5 rows: occurrence 1 is the current year and occurrence 5 the 4th preceding taxation year. NOT COMPUTED — see `computeSchedule3`, which produces the aggregates on page 1 and leaves this per-vintage split to the preparer." },
  { line: "003200001", caption: "Total amounts shown on all Capital Investment Tax Credit certificates issued to the corporation during the year", kind: "money", role: "input", section: "citc" },
  { line: "003202001", caption: "Total Capital Investment Tax Credit amount carried forward from prior year(s)", kind: "money", role: "input", section: "citc", note: "= prior year’s line 208. Analysed by year of origin on page 2, lines 220-230." },
  { line: "003204001", caption: "Amount applied to current taxation year (note: Investor Tax Credit must be fully utilized including any carry forward amounts before Capital Investment Tax Credit can be claimed) [maximum credit is equal to AT1 page 2 line 068 - (lines 070 + 072) - Schedule 3 line 104]", kind: "money", role: "input", section: "citc", note: "Forced to nil while ITC (line 108) still has an unused carryforward balance — the page states that ordering in the caption itself, which is why the caption is this long." },
  { line: "003206001", caption: "Total Capital Investment Tax Credit Expired", kind: "money", role: "input", section: "citc" },
  { line: "003208001", caption: "Amount available for carry forward (line 200 + line 202 - line 204 - line 206)", kind: "money", role: "computed", section: "citc" },
  { line: "003220001", caption: "Year of origin", kind: "code", role: "computed", section: "citc-vintage", note: "One occurrence per year of origin, 11 rows: occurrence 1 is the current year and occurrence 11 the 10th preceding taxation year. NOT COMPUTED — see `computeSchedule3`, which produces the aggregates on page 1 and leaves this per-vintage split to the preparer." },
  { line: "003222001", caption: "Tax Year End YYYY/MM/DD", kind: "date", role: "input", section: "citc-vintage", note: "One occurrence per year of origin, 11 rows: occurrence 1 is the current year and occurrence 11 the 10th preceding taxation year. NOT COMPUTED — see `computeSchedule3`, which produces the aggregates on page 1 and leaves this per-vintage split to the preparer." },
  { line: "003224001", caption: "Capital Investment Tax Credit balance at beginning of the year and transfers", kind: "money", role: "input", section: "citc-vintage", note: "One occurrence per year of origin, 11 rows: occurrence 1 is the current year and occurrence 11 the 10th preceding taxation year. NOT COMPUTED — see `computeSchedule3`, which produces the aggregates on page 1 and leaves this per-vintage split to the preparer.", footnoteMarks: [1] },
  { line: "003225001", caption: "Capital Investment Tax Credit received during the year", kind: "money", role: "input", section: "citc-vintage", note: "One occurrence per year of origin, 11 rows: occurrence 1 is the current year and occurrence 11 the 10th preceding taxation year. NOT COMPUTED — see `computeSchedule3`, which produces the aggregates on page 1 and leaves this per-vintage split to the preparer." },
  { line: "003226001", caption: "Capital Investment Tax Credit applied to reduce tax payable", kind: "money", role: "input", section: "citc-vintage", note: "One occurrence per year of origin, 11 rows: occurrence 1 is the current year and occurrence 11 the 10th preceding taxation year. NOT COMPUTED — see `computeSchedule3`, which produces the aggregates on page 1 and leaves this per-vintage split to the preparer." },
  { line: "003228001", caption: "Capital Investment Tax Credit expired in the current year", kind: "money", role: "input", section: "citc-vintage", note: "One occurrence per year of origin, 11 rows: occurrence 1 is the current year and occurrence 11 the 10th preceding taxation year. NOT COMPUTED — see `computeSchedule3`, which produces the aggregates on page 1 and leaves this per-vintage split to the preparer." },
  { line: "003230001", caption: "Capital Investment Tax Credit available for carry forward 224 + 225 - 226 - 228", kind: "money", role: "computed", section: "citc-vintage", note: "One occurrence per year of origin, 11 rows: occurrence 1 is the current year and occurrence 11 the 10th preceding taxation year. NOT COMPUTED — see `computeSchedule3`, which produces the aggregates on page 1 and leaves this per-vintage split to the preparer." },
  { line: "003300001", caption: "Total amounts shown on all Agri-processing Investment Tax Credit Certificates issued to the corporation during the year", kind: "money", role: "input", section: "apitc" },
  { line: "003302001", caption: "Total Agri-processing Investment Tax Credit amount carried forward from prior year(s)", kind: "money", role: "input", section: "apitc", note: "Analysed by year of origin on page 3, lines 330-340." },
  { line: "003304001", caption: "Agri-processing Investment Tax Credit applied from current taxation year Maximum allowed is lesser of [line 300*20%] or [AT1 page 2 line 068-(lines 070+072)-(schedule 3 lines 104+204+306+308+310)]", kind: "money", role: "input", section: "apitc", note: "The 20% cap is on THIS vintage’s own receipt, not on the pool. Note the room term subtracts the other three APITC vintages too: each of 304/306/308/310 is capped by what the others have already taken." },
  { line: "003306001", caption: "Agri-processing Investment Tax Credit applied from 1st preceding taxation year Maximum allowed is lesser of [1st preceding tax year end's issued APITC*30%] or [AT1 page 2 line 068-(lines 070+072)-(schedule 3 lines 104+204+308+310)]", kind: "money", role: "input", section: "apitc" },
  { line: "003308001", caption: "Agri-processing Investment Tax Credit applied from 2nd preceding taxation year Maximum allowed is lesser of [2nd preceding tax year end's issued APITC*50%] or [AT1 page 2 line 068-(lines 070+072)-(schedule 3 lines 104+204+310)]", kind: "money", role: "input", section: "apitc" },
  { line: "003310001", caption: "Agri-processing Investment Tax Credit applied from 3rd to 10th preceding taxation year(s) Maximum allowed is lesser of [prior years' carry forward available] or [AT1 page 2 line 068-(lines 070+072)-(schedule 3 lines 104+ 204)]", kind: "money", role: "input", section: "apitc", note: "No percentage cap on these vintages — only their own remaining balance. The page prints \"104+ 204\" with the stray space; kept." },
  { line: "003312001", caption: "Total Amount Applied to current taxation year (lines 304+306+308+310) [maximum credit is equal to AT1 page 2 line 068-(lines 070+072)-(schedule 3 lines 104+204)]", kind: "money", role: "computed", section: "apitc" },
  { line: "003314001", caption: "Total Agri-processing Investment Tax Credit expired", kind: "money", role: "input", section: "apitc" },
  { line: "003316001", caption: "Amount available for carry forward (line 300 + line 302 - line 312 - line 314)", kind: "money", role: "computed", section: "apitc" },
  { line: "003330001", caption: "Year of origin", kind: "code", role: "computed", section: "apitc-vintage", note: "One occurrence per year of origin, 11 rows: occurrence 1 is the current year and occurrence 11 the 10th preceding taxation year. NOT COMPUTED — see `computeSchedule3`, which produces the aggregates on page 1 and leaves this per-vintage split to the preparer." },
  { line: "003332001", caption: "Tax Year End YYYY/MM/DD", kind: "date", role: "input", section: "apitc-vintage", note: "One occurrence per year of origin, 11 rows: occurrence 1 is the current year and occurrence 11 the 10th preceding taxation year. NOT COMPUTED — see `computeSchedule3`, which produces the aggregates on page 1 and leaves this per-vintage split to the preparer." },
  { line: "003334001", caption: "Agri-processing Investment Tax Credit received in the taxation year", kind: "money", role: "input", section: "apitc-vintage", note: "One occurrence per year of origin, 11 rows: occurrence 1 is the current year and occurrence 11 the 10th preceding taxation year. NOT COMPUTED — see `computeSchedule3`, which produces the aggregates on page 1 and leaves this per-vintage split to the preparer." },
  { line: "003335001", caption: "Agri-processing Investment Tax Credit available for carry forward at beginning of the year and transfers", kind: "money", role: "input", section: "apitc-vintage", note: "One occurrence per year of origin, 11 rows: occurrence 1 is the current year and occurrence 11 the 10th preceding taxation year. NOT COMPUTED — see `computeSchedule3`, which produces the aggregates on page 1 and leaves this per-vintage split to the preparer.", footnoteMarks: [2] },
  { line: "003336001", caption: "Agri-processing Investment Tax Credit applied to reduce tax payable", kind: "money", role: "input", section: "apitc-vintage", note: "One occurrence per year of origin, 11 rows: occurrence 1 is the current year and occurrence 11 the 10th preceding taxation year. NOT COMPUTED — see `computeSchedule3`, which produces the aggregates on page 1 and leaves this per-vintage split to the preparer.", footnoteMarks: [3] },
  { line: "003338001", caption: "Agri-processing Investment Tax Credit expired in the current year", kind: "money", role: "input", section: "apitc-vintage", note: "One occurrence per year of origin, 11 rows: occurrence 1 is the current year and occurrence 11 the 10th preceding taxation year. NOT COMPUTED — see `computeSchedule3`, which produces the aggregates on page 1 and leaves this per-vintage split to the preparer." },
  { line: "003340001", caption: "Agri-processing Investment Tax Credit available for carry forward at the end of the year", kind: "money", role: "computed", section: "apitc-vintage", note: "One occurrence per year of origin, 11 rows: occurrence 1 is the current year and occurrence 11 the 10th preceding taxation year. NOT COMPUTED — see `computeSchedule3`, which produces the aggregates on page 1 and leaves this per-vintage split to the preparer.", footnoteMarks: [4] },
  { line: "003600001", caption: "Investor Tax Credit, Capital Investment Tax Credit and Agri-processing Investment Tax Credit (line 104+line 204+line 312)", kind: "money", role: "computed", section: "mad" },
  { line: "003602001", caption: "From AT1 page 2, line 068 - (lines 070 + 072)", kind: "money", role: "computed", section: "mad", note: "The page says 070 + 072; this engine computes 070 + 071 + 072 + 074. Not reconciled — see the module doc comment, which now records how many times the page states its version.", sourceText: "AT1 page 2, line 068 - (lines 070 + 072)", from: { form: "AT1", line: "000068001", note: "Alberta tax payable before this deduction, less the credits the page names." } },
  { line: "003604001", caption: "Total Deduction (Alberta Other Tax Deductions and Credits) the lesser of line 600 and 602", kind: "money", role: "computed", section: "mad", note: "Floored at nil.", to: { form: "AT1", line: "000076001", note: "Enter this amount on AT1 page 2, line 076" } },
];

export const AT1_SCHEDULE_3_FOOTNOTES: readonly string[] = [
  "On eligible amalgamation under section 25.01(7) or eligible winding-up of a subsidiary under section 25.01(8) of the Alberta Corporate Tax Act",
  "On eligible amalgamation under section 25.02(7) or eligible winding-up of a subsidiary under section 25.02(8) of the Alberta Corporate Tax Act",
  "Tax credit available for carry forward at beginning of the year: the original Agri-processing Investment Tax Credit (APITC) amount received for the taxation year less the amount applied in prior year(s); Transfers: on eligible amalgamation under section 25.04(5) or eligible winding-up of a subsidiary under section 25.04(6) of the Alberta Corporate Tax Act.",
  "The maximum amount that may be claimed in the first three years is limited as follows: up to 20 per cent of the APITC received in the current taxation year, up to 30 per cent of the APITC received in the first preceding taxation year, and up to 50 per cent of the APITC received in the second preceding taxation year. Any remaining APITC may be carried forward up to 10 taxation years.",
  "For the current year: Line 334 less Line 336. For subsequent years: Line 335 less Line 336 less Line 338",
];

export interface PaperFootnotePlacement {
  /** Index into the footnote list above. */
  footnote: number;
  /** The section id at whose foot the page prints it. */
  section: string;
  /** The glyph the page prints. Absent where the page anchors the note by naming a line instead. */
  mark?: string;
}

export const AT1_SCHEDULE_3_FOOTNOTE_PLACEMENT: readonly PaperFootnotePlacement[] = [
  { footnote: 0, section: "itc-vintage", mark: "*" },
  { footnote: 1, section: "citc-vintage", mark: "**" },
  { footnote: 2, section: "apitc-vintage", mark: "***" },
  { footnote: 3, section: "apitc-vintage", mark: "****" },
  { footnote: 4, section: "apitc-vintage", mark: "*****" },
];


export interface Schedule3VintageColumn {
  /** The printed line. Each row of the table is one OCCURRENCE of it. */
  line: string;
  /** The column heading, verbatim, including any arithmetic it states. */
  heading: string;
  kind: "code" | "date" | "money";
  role: "input" | "computed";
  /** Year-of-origin indexes the page SHADES OUT for this column — 0 is the current year. A shaded cell says the quantity does not exist for that vintage, which is not an empty box. */
  shadedYears?: readonly number[];
  /** True where the page prints a cell for this column in its Totals row. */
  totalled?: boolean;
  footnoteMarks?: readonly number[];
}

export interface Schedule3VintageTable {
  /** Matches the section id its columns belong to. */
  section: "itc-vintage" | "citc-vintage" | "apitc-vintage";
  title: string;
  /** The deepest preceding-year row the page prints — FOUR for the Investor Tax Credit, TEN for the other two. Rendering all three alike invents rows the form has no boxes for. */
  maxPrecedingYear: number;
  columns: readonly Schedule3VintageColumn[];
}

export const AT1_SCHEDULE_3_VINTAGE_TABLES: readonly Schedule3VintageTable[] = [
  {
    section: "itc-vintage",
    title: "Investor Tax Credit Calculation - Investor Tax Credit carry forward year of origin",
    maxPrecedingYear: 4,
    columns: [
      { line: "120", heading: "Year of origin", kind: "code", role: "computed" },
      { line: "122", heading: "Tax Year End YYYY/MM/DD", kind: "date", role: "input" },
      { line: "124", heading: "Investor Tax Credit balance at beginning of the year and transfers", kind: "money", role: "input", shadedYears: [0], footnoteMarks: [0] },
      { line: "125", heading: "Investor Tax Credit received during the year", kind: "money", role: "input", shadedYears: [1, 2, 3, 4] },
      { line: "126", heading: "Investor Tax Credit applied to reduce tax payable", kind: "money", role: "input", totalled: true },
      { line: "128", heading: "Investor Tax Credit expired during the year", kind: "money", role: "input", shadedYears: [0], totalled: true },
      { line: "130", heading: "Investor Tax Credit available for carry forward 124 + 125 - 126 - 128", kind: "money", role: "computed", totalled: true },
    ],
  },
  {
    section: "citc-vintage",
    title: "Capital Investment Tax Credit Calculation - Capital Investment Tax Credit carry forward year of origin",
    maxPrecedingYear: 10,
    columns: [
      { line: "220", heading: "Year of origin", kind: "code", role: "computed" },
      { line: "222", heading: "Tax Year End YYYY/MM/DD", kind: "date", role: "input" },
      { line: "224", heading: "Capital Investment Tax Credit balance at beginning of the year and transfers", kind: "money", role: "input", shadedYears: [0], footnoteMarks: [1] },
      { line: "225", heading: "Capital Investment Tax Credit received during the year", kind: "money", role: "input", shadedYears: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
      { line: "226", heading: "Capital Investment Tax Credit applied to reduce tax payable", kind: "money", role: "input", totalled: true },
      { line: "228", heading: "Capital Investment Tax Credit expired in the current year", kind: "money", role: "input", shadedYears: [0], totalled: true },
      { line: "230", heading: "Capital Investment Tax Credit available for carry forward 224 + 225 - 226 - 228", kind: "money", role: "computed", totalled: true },
    ],
  },
  {
    section: "apitc-vintage",
    title: "Agri-processing Investment Tax Credit Calculation - Agri-processing Investment Tax Credit carry forward year of origin",
    maxPrecedingYear: 10,
    columns: [
      { line: "330", heading: "Year of origin", kind: "code", role: "computed" },
      { line: "332", heading: "Tax Year End YYYY/MM/DD", kind: "date", role: "input" },
      { line: "334", heading: "Agri-processing Investment Tax Credit received in the taxation year", kind: "money", role: "input" },
      { line: "335", heading: "Agri-processing Investment Tax Credit available for carry forward at beginning of the year and transfers", kind: "money", role: "input", shadedYears: [0], footnoteMarks: [2] },
      { line: "336", heading: "Agri-processing Investment Tax Credit applied to reduce tax payable", kind: "money", role: "input", totalled: true, footnoteMarks: [3] },
      { line: "338", heading: "Agri-processing Investment Tax Credit expired in the current year", kind: "money", role: "input", shadedYears: [0], totalled: true },
      { line: "340", heading: "Agri-processing Investment Tax Credit available for carry forward at the end of the year", kind: "money", role: "computed", totalled: true, footnoteMarks: [4] },
    ],
  },
];

export const AT1_SCHEDULE_3_VINTAGE_TOTALS_LABEL = "Totals:";

/** The row label for one year-of-origin index, as the page prints it. */
export function albertaVintageRowLabel(yearIndex: number): string {
  if (yearIndex === 0) return "Current";
  const suffix =
    yearIndex % 10 === 1 && yearIndex !== 11
      ? "st"
      : yearIndex % 10 === 2 && yearIndex !== 12
        ? "nd"
        : yearIndex % 10 === 3 && yearIndex !== 13
          ? "rd"
          : "th";
  return `${yearIndex}${suffix} preceding taxation year`;
}
