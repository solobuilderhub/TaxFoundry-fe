/**
 * Alberta Small Business Deduction (AT1SCH1) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/sources/tra-forms/pdf/AT1SCH01-small-business-deduction-TRA11723.pdf, retrieved 2026-09-13.
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

export const AT1_SCHEDULE_1_SECTIONS: readonly PaperSectionDef[] = [
  { id: "association", title: "Association for Purposes of the Alberta Small Business Deduction", description: "One question, and the whole reason Area A exists. The answer transmits on the AT1 JACKET, not on this schedule — see line 001’s own note.", printedBefore: "For corporations which were Canadian-controlled private corporations throughout the taxation year and which had income from active businesses carried on in Canada. Report all monetary values in dollars; DO NOT include cents.", printedAfter: "If \"Yes\", complete AREA A on page 2." },
  { id: "deduction", title: "Alberta Small Business Deduction", description: "Two income bases (active business income and taxable income, each less the royalty tax deduction) floored at nil, plus the base amount at line 015 that Area B on page 2 determines." },
  { id: "eligible", title: "Income Eligible for the Alberta Small Business Deduction", description: "The Alberta Small Business Allocation Factor, and the two federal Schedule 5 figures that decide whether Schedule 2’s factor can be used as-is. A corporation with permanent establishments only in Alberta skips all three — see the instruction the page prints at the top of this box." },
  { id: "calculation", title: "Calculation of the Alberta Small Business Deduction", description: "Seven columns across six rate periods, day-weighted. Computed and shown, not transmitted — the specification gives none of these cells, nor 031, a line to file on. The total equals jacket line 070." },
  { id: "agreement", title: "AREA A - Agreement Among Associated Corporations", description: "Filed only when line 001 above is Yes. One occurrence per associated corporation, the corporation filing this return first. The allocation at 045 must use the SAME percentage split as federal Schedule 23 (fed 023350), applied against the $200,000 BASE AMOUNT — not against the $500,000 threshold, which is that base amount after column B’s 250%." },
];

export const AT1_SCHEDULE_1_FIELDS: readonly PaperField[] = [
  { line: "001001001", caption: "Is the corporation associated with one or more Canadian-controlled private corporations?", kind: "flag", role: "input", section: "association", requirement: "mandatory", note: "Filed on this schedule at 001001001 whenever Schedule 1 is filed. The answer is kept once, with the other Alberta yes/no questions. A \"Yes\" is what makes Area A on page 2 mandatory." },
  { line: "001003001", caption: "Income from active businesses carried on in Canada as reported on the T2 line 400 OR on Schedule 12, line 106", kind: "money", role: "carried-in", section: "deduction", requirement: "mandatory", note: "The page hangs its partnership asterisk on \"line 400\" specifically: a corporation with partnership income has to RECALCULATE this figure for Alberta purposes before entering it, because Alberta raised the partnership business limit on dates federal did not. Neither this engine nor the caption does that recalculation — see footnote 1 for what the page requires.", sourceText: "the T2 line 400 OR on Schedule 12, line 106", from: { form: "T2", line: "400" }, footnoteMarks: [0] },
  { line: "001005001", caption: "Deduct: Royalty Tax Deduction for the year (Schedule 5, line 021)", kind: "money", role: "input", section: "deduction", requirement: "optional", note: "Oil and gas only. The same figure filed again at 011, against the second income base." },
  { line: "001007001", caption: "Balance line 003 minus line 005 (if negative, enter \"0\")", kind: "money", role: "computed", section: "deduction", requirement: "mandatory" },
  { line: "001009001", caption: "Taxable Income (less adjustments for foreign tax credits and amounts included in Amount Taxable in Alberta not subject to Alberta corporate income tax. See Guide for calculation details)", kind: "money", role: "carried-in", section: "deduction", requirement: "mandatory", from: { form: "AT1", line: "000062001", note: "Alberta taxable income, adjusted per the Guide." } },
  { line: "001011001", caption: "Deduct: Royalty Tax Deduction for the year (Schedule 5, line 021)", kind: "money", role: "input", section: "deduction", requirement: "optional", note: "The same figure as line 005, filed against this second income base." },
  { line: "001013001", caption: "Balance line 009 minus line 011 (if negative, enter \"0\")", kind: "money", role: "computed", section: "deduction", requirement: "mandatory" },
  { line: "001015001", caption: "Complete AREA B on page 2 to determine the base amount used to calculate the Alberta Small Business Threshold", kind: "money", role: "computed", section: "deduction", requirement: "mandatory", note: "The base amount the whole deduction is scaled by, and MANDATORY — §3.2.3.2 marks 015 `M`. An earlier revision of this note recorded it as having no row in the specification and therefore not being filed at all; that was wrong twice over, and the line was absent from every Schedule 1 this product transmitted. Reported on the $200,000 BASE-AMOUNT scale, which is what the spec states it on (\"A = $200,000 X No. of days in tax year (Max 365)/365\"), NOT the $500,000 threshold this engine computes on — page 1 column B is the 250% between them. `schedule1Values` converts, and the conversion is exact rather than approximate: see its own note for the algebra. Area B on page 2 is the working, amounts (a) through (k). None of it is individually numbered so none of it transmits, but it IS computed — `computeAlbertaSbd` returns it as `AlbertaSbdResult.areaB` and the Form View renders it under this line. Amounts (i)/(j)/(k), the federal line 515 business limit assignment, are the one part still unmodelled and are omitted rather than reported nil." },
  { line: "001019001", caption: "Amount reported on federal Schedule 5, line 127", kind: "money", role: "not-collected", section: "eligible", note: "Skipped entirely by a corporation with permanent establishments only in Alberta. NOT COLLECTED OR FILED: this product has no field for it, and its only purpose is to decide whether Schedule 2’s allocation factor can be entered at 021 as-is or must first be recalculated to reduce Amount B — a recalculation the Schedule 2 engine does not implement either.", sourceText: "federal Schedule 5, line 127" },
  { line: "001020001", caption: "Amount reported on federal Schedule 5, line 167", kind: "money", role: "not-collected", section: "eligible", note: "The Amount D counterpart of line 019. NOT COLLECTED OR FILED either, and stated here rather than deferred to 019’s note: a gap that only the neighbouring line records is a gap nobody reading THIS line finds.", sourceText: "federal Schedule 5, line 167" },
  { line: "001021001", caption: "If both line 019 and line 020 are \"0\", enter the Alberta Allocation Factor from Alberta Schedule 2. If either line 019 or line 020 have a value greater than zero and the corporation is filing under ITA Regulation 402, 403, 404, 405, 408, 409 or 411, then the Alberta Allocation Factor from Schedule 2 must be calculated to reduce Amount B by the amount at line 019 and to reduce Amount D by the amount at line 020. If the corporation is filing under any other ITA Regulation, then enter the Allocation Factor calculated on Schedule 2 directly onto line 021", kind: "rate", role: "not-collected", section: "eligible", note: "The whole three-branch instruction is the caption because the page prints it as the line, not as a footnote. Only the FIRST branch is modelled: the engine reports Schedule 2’s factor unadjusted, and it reaches the return at jacket line 000065001. The other two branches need a factor recalculated to reduce Amount B by line 019 and Amount D by line 020, which the Schedule 2 engine does not implement and no line on any schedule holds. A corporation whose only permanent establishment is in Alberta uses \"1\" here — the page’s own asterisk on column E, footnote 1. NOT COLLECTED OR FILED at this line: `schedule1Values` has no put for 021, and the factor reaches the return at jacket 000065001 instead.", sourceText: "the Alberta Allocation Factor from Alberta Schedule 2" },
  { line: "001031001", caption: "Total of column G", kind: "money", role: "total", section: "calculation", note: "The schedule’s answer — labelled \"Alberta Small Business Deduction:\" on the page. Computed from the table above and shown, but not transmitted: §3.2.3.2 gives Schedule 1 no field 031. The figure reaches the return at jacket line 070, which the engine computes independently (as the residual of the day-weighted general rate); a test holds the two equal.", to: { form: "AT1", line: "000070001", note: "Enter this amount on AT1 page 2, line 070" } },
  { line: "001041001", caption: "Name of the Associated Canadian-controlled Private Corporations", kind: "text", role: "input", section: "agreement", requirement: "mandatory", note: "One occurrence per associated corp, this corporation first. Required whenever the AT1 jacket's line 001 is Yes." },
  { line: "001043001", caption: "Alberta Corporate Account Number (CAN), if applicable", kind: "code", role: "input", section: "agreement", requirement: "optional", note: "Must equal the same corporation's fed 023100 (federal Schedule 23) — not enforced here." },
  { line: "001044001", caption: "Percentage of the Business Limit", kind: "rate", role: "computed", section: "agreement", note: "DERIVED from the allocated amounts at line 045, and NOT FILED — §3.2.3.2 gives it no row. The page runs the other way (\"$200,000 X % in Col 044\"), but the percentage and the dollars are one fact, and collecting both would be two boxes for it, free to disagree. Federal Schedule 23 takes the same view — it holds allocated dollars and derives `shareOfAllocated` — and this page's own footnote requires the two percentages to match, which deriving makes true by construction rather than by the preparer typing one split twice. This was `not-collected` and rendered as a permanent dash, which cost the check the page prints beside it: the column totals 100%, and that is what catches an over-allocated group.", footnoteMarks: [3] },
  { line: "001045001", caption: "Allocation of the Base Amount ($200,000 X % in Col 044)", kind: "money", role: "input", section: "agreement", requirement: "mandatory", note: "Required whenever 041 has a value. Total across all occurrences is capped by the group's base amount.", footnoteMarks: [4] },
];

export const AT1_SCHEDULE_1_FOOTNOTES: readonly string[] = [
  "If the corporation has income (loss) from partnership(s) with fiscal period(s) ending after March 31, 2001, then the Income from active businesses must be recalculated for Alberta purposes by increasing the business limit at column G on page 2 of federal Schedule 7 to $300,000 on April 1, 2001, $350,000 on April 1, 2002, $400,000 on April 1, 2003, $430,000 on April 1, 2007, $460,000 on April 1, 2008 and $500,000 on April 1, 2009, prorating the increase by the number of days in the partnership's fiscal period straddling March 31, 2001, March 31, 2002, March 31, 2003, March 31, 2007, March 31, 2008 and March 31, 2009.",
  "If the corporation only has a permanent establishment in Alberta, use \"1\" as the value for line 021 in the calculation of column E.",
  "The percentage in Column B in the Calculation of the Alberta Small Business Deduction on page 1, adjusts the base amount for changes to the Alberta Small Business Threshold. The Alberta Small Business Thresholds are as follows: Before April 1, 2001: $200,000; After March 31, 2001 and before April 1, 2002: $300,000; After March 31, 2002 and before April 1, 2003: $350,000; After March 31, 2003 and before April 1, 2007: $400,000; After March 31, 2007 and before April 1, 2008: $430,000; After March 31, 2008 and before April 1, 2009: $460,000 and after March 31, 2009: $500,000.",
  "This percentage must be the same as that used to determine the business limit on the federal Schedule 23, form T2 SCH23 for all taxation years ending after December 4, 2002. The total of all percentages cannot exceed 100%.",
  "The amount in column 045 must be rounded to the nearest dollar; rounding up at $.50 and over.",
];

export interface PaperFootnotePlacement {
  /** Index into the footnote list above. */
  footnote: number;
  /** The section id at whose foot the page prints it. */
  section: string;
  /** The glyph the page prints. Absent where the page anchors the note by naming a line instead. */
  mark?: string;
}

export const AT1_SCHEDULE_1_FOOTNOTE_PLACEMENT: readonly PaperFootnotePlacement[] = [
  { footnote: 0, section: "deduction", mark: "*" },
  { footnote: 1, section: "calculation", mark: "*" },
  { footnote: 2, section: "agreement", mark: "*" },
  { footnote: 3, section: "agreement", mark: "**" },
  { footnote: 4, section: "agreement", mark: "***" },
];


export interface Schedule1BlockHeading {
  /** The printed line the heading stands immediately above. */
  aboveLine: string;
  text: string;
  /** Which footnote the page marks INSIDE this text — Area A's asterisk sits in its opening paragraph, not on a numbered box. */
  footnoteMarks?: readonly number[];
}

/** Two may share an `aboveLine` — the page stacks two over line 041. Print every match, in order. */
export const AT1_SCHEDULE_1_BLOCK_HEADINGS: readonly Schedule1BlockHeading[] = [
  { aboveLine: "019", text: "Corporations with permanent establishments only in Alberta, ignore lines 019, 020 and 021 and go directly to the table below." },
  { aboveLine: "019", text: "Other corporations complete the following:" },
  { aboveLine: "021", text: "Alberta Small Business Allocation Factor:" },
  { aboveLine: "031", text: "Alberta Small Business Deduction:" },
  { aboveLine: "041", text: "Allocation Agreement:" },
  { aboveLine: "041", text: "To arrive at the Alberta Small Business Threshold, the \"base amount\" of $200,000 is used to determine the allocation among associated corporations. It is hereby agreed that the $200,000 base amount for the year is to be allocated as shown below for the taxation year ___________.", footnoteMarks: [2] },
];

export interface Schedule1Column {
  column: "A" | "B" | "C" | "D" | "E" | "F" | "G";
  /** Verbatim, arithmetic included. The page numbers none of them. */
  heading: string;
  footnoteMarks?: readonly number[];
}

export const AT1_SCHEDULE_1_COLUMNS: readonly Schedule1Column[] = [
  { column: "A", heading: "Days in Taxation Year" },
  { column: "B", heading: "Percentage" },
  { column: "C", heading: "Alberta Small Business Threshold Line 015 X (B)" },
  { column: "D", heading: "Least of amounts: 007, 013 and C" },
  { column: "E", heading: "D X line 021", footnoteMarks: [1] },
  { column: "F", heading: "SBD Rate" },
  { column: "G", heading: "Alberta Small Business Deduction E X (A/Total A) X F" },
];

export interface Schedule1RatePeriod {
  /** Column A's row label, verbatim. */
  label: string;
  /** Column B, verbatim. */
  percentage: string;
  /** Column F, as printed. */
  sbdRate: number;
}

/** Pre-printed cell content, not preparer input — a view without these draws six blank rows. */
export const AT1_SCHEDULE_1_RATE_PERIODS: readonly Schedule1RatePeriod[] = [
  { label: "After March 31, 2009 & before July 1, 2015:", percentage: "250%", sbdRate: 0.07 },
  { label: "After June 30, 2015 & before January 1, 2017:", percentage: "250%", sbdRate: 0.09 },
  { label: "After December 31, 2016 & before July 1, 2019:", percentage: "250%", sbdRate: 0.1 },
  { label: "After June 30, 2019 & before January 1, 2020:", percentage: "250%", sbdRate: 0.09 },
  { label: "After December 31, 2019 & before July 1, 2020:", percentage: "250%", sbdRate: 0.08 },
  { label: "After June 30, 2020:", percentage: "250%", sbdRate: 0.06 },
];

export const AT1_SCHEDULE_1_TOTAL_DAYS_LABEL = "Total Days in the Taxation Year:";

export interface Schedule1AgreementColumn {
  line: string;
  heading: string;
  kind: "text" | "code" | "rate" | "money";
  /** What the page PRE-PRINTS in this column's cell of the totals row — a constant, not a sum of the rows. */
  total?: string;
}

export const AT1_SCHEDULE_1_AGREEMENT_COLUMNS: readonly Schedule1AgreementColumn[] = [
  { line: "041", heading: "Name of the Associated Canadian-controlled Private Corporations", kind: "text" },
  { line: "043", heading: "Alberta Corporate Account Number (CAN), if applicable", kind: "code" },
  { line: "044", heading: "Percentage of the Business Limit", kind: "rate", total: "100%" },
  { line: "045", heading: "Allocation of the Base Amount ($200,000 X % in Col 044)", kind: "money", total: "$200,000" },
];

export const AT1_SCHEDULE_1_AGREEMENT_TOTALS_LABEL = "Totals:";

export interface Schedule1AreaBStep {
  /** The letter the page labels this amount with, parentheses included. */
  letter: string;
  label: string;
  /** The arithmetic printed beside the label, where the page prints any. */
  formula?: string;
  /** A sub-heading printed immediately above this step. */
  heading?: string;
  /** The bold instruction naming this amount as a place the cascade may STOP and line 015 be taken from. */
  exitTo015?: string;
}

export const AT1_SCHEDULE_1_AREA_B_TITLE = "Area B - Determination of the Value for Line 015";

/** The rule, then the two adjustments by name — both conditions a preparer has to test against their own year. */
export const AT1_SCHEDULE_1_AREA_B_PREAMBLE: readonly string[] = [
  "The base amount to be used by a corporation for line 015, is $200,000 or its allocated base amount as specified in Area A, adjusted, if required as follows:",
  "(i) Prorated Base Amount for Short Taxation Year: If the taxation year is shorter than 51 weeks, the corporation's base amount is the amount allocated to it multiplied by the ratio that the number of days in the year is to 365.",
  "(ii) Reduction for Large Corporations: If in the preceding year, the associated group (Canadian-controlled private or not) had total taxable capital employed in Canada exceeding $10,000,000 the base amount of each associated corporation is reduced or eliminated.",
];

/** Twelve steps for eleven letters — the page labels TWO amounts (c), one per side of 2022-04-07. */
export const AT1_SCHEDULE_1_AREA_B_STEPS: readonly Schedule1AreaBStep[] = [
  { letter: "(a)", label: "Enter $200,000 or, if associated, the corporation's allocated base amount from AREA A", exitTo015: "If adjustments are not required, enter Amount (a) on line 015 on page 1." },
  { letter: "(b)", label: "Amount (a) multiplied by Number of days in tax year divided by 365 days", heading: "(i) Prorated Base Amount for Short Taxation Year:", exitTo015: "If the corporation has a short tax year but the associated group had total taxable capital employed in Canada less than $10,000,000, enter Amount (b) on line 015." },
  { letter: "(c)", label: "Small business threshold", formula: "A X B / $11,250", heading: "(ii) Business Limit Reduction: Taxable capital business limit reduction for taxation years starting before April 7, 2022" },
  { letter: "(c)", label: "Small business threshold", formula: "A X B / $90,000", heading: "Taxable capital business limit reduction for taxation years starting after April 6, 2022" },
  { letter: "(d)", label: "Adjusted aggregate investment income from line 417 of the T2", formula: "less $50,000 =", heading: "Passive Income Limit Reduction:" },
  { letter: "(e)", label: "Amount (lesser of a or b)", formula: "/ 100,000 X (d) =" },
  { letter: "(f)", label: "Subtotal (greater of c and e):" },
  { letter: "(g)", label: "Reduced business limit for tax years starting before 2019 (lesser of amounts a or b minus amount c)" },
  { letter: "(h)", label: "Reduced business limit for tax years starting after 2018 (lesser of amounts a or b minus amount f)" },
  { letter: "(i)", label: "Business Limit the CCPC assigns per line 515 of the federal T2 divided by 2.5" },
  { letter: "(j)", label: "Reduced business limit after assignment for tax years starting before 2019 (amount g minus amount i)" },
  { letter: "(k)", label: "Reduced business limit after assignment for tax years starting after 2018 (amount h minus amount i)", exitTo015: "Enter Amount (j) or (k) on line 015." },
];

/** What A and B mean in the two (c) formulas. Without it those rows name two letters defined nowhere. */
export const AT1_SCHEDULE_1_AREA_B_LARGE_CORPORATIONS: readonly string[] = [
  "A Is the small business threshold otherwise determined, adjusted if necessary for a short taxation year.",
  "B Is the lesser of $11,250 (taxation years before April 7, 2022) or $90,000 (taxation years after April 6, 2022) and:",
  "(1) If the corporation is not associated with any other corporations in both the current or previous taxation years, B is the (total taxable capital employed in Canada for the prior taxation year minus $10,000,000) X 0.225%",
  "(2) If the corporation is not associated with any other corporations in the current taxation year but was associated in the previous taxation year, B is the (total taxable capital employed in Canada for the current taxation year minus $10,000,000) X 0.225%",
  "(3) If the corporation is associated with another corporation in the current year, B is the (total taxable capital employed in Canada for each corporation in the associated group for its last tax year ending in the preceding calendar year minus $10,000,000) X 0.225%",
];
