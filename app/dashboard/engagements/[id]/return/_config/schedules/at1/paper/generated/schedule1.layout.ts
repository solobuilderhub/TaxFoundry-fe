/**
 * Alberta Small Business Deduction (AT1SCH1) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/sources/tra-forms/pdf/AT1SCH01-small-business-deduction-TRA11723.pdf, retrieved 2026-08-30.
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
}

export const AT1_SCHEDULE_1_SECTIONS: readonly PaperSectionDef[] = [
  { id: "deduction", title: "Alberta Small Business Deduction", description: "Two income bases (active business income and taxable income, each less the royalty tax deduction) floored at nil. Line 015 (the base amount and the calculation table that arrives at the deduction itself) is not modelled; see this module's own doc comment." },
  { id: "agreement", title: "Area A — Agreement Among Associated Corporations", description: "Filed only when the AT1 jacket's own line 001 (000001001) is Yes. One occurrence per associated corporation, the corporation filing this return first. The allocation at 045 must use the SAME percentage split as federal Schedule 23 (fed 023350), applied against Alberta's own base amount — see this module's doc comment on the $200,000 vs $500,000 discrepancy this engine has not resolved." },
];

export const AT1_SCHEDULE_1_FIELDS: readonly PaperField[] = [
  { line: "001003001", caption: "Income from active businesses carried on in Canada, as reported on the T2 line 400 or Schedule 12, line 106", kind: "money", role: "carried-in", section: "deduction", requirement: "mandatory", from: { form: "T2", line: "400" } },
  { line: "001005001", caption: "Deduct: Royalty Tax Deduction for the year (Schedule 5, line 021)", kind: "money", role: "input", section: "deduction", requirement: "optional", note: "Oil and gas only. The same figure filed again at 011, against the second income base." },
  { line: "001007001", caption: "Balance — line 003 minus line 005 (if negative, enter \"0\")", kind: "money", role: "computed", section: "deduction", requirement: "mandatory" },
  { line: "001009001", caption: "Taxable Income (less adjustments for foreign tax credits and amounts included in Amount Taxable in Alberta not subject to Alberta corporate income tax)", kind: "money", role: "carried-in", section: "deduction", requirement: "mandatory", from: { form: "AT1", line: "000062001", note: "Alberta taxable income, adjusted per the Guide." } },
  { line: "001011001", caption: "Deduct: Royalty Tax Deduction for the year (Schedule 5, line 021)", kind: "money", role: "input", section: "deduction", requirement: "optional", note: "The same figure as line 005, filed against this second income base." },
  { line: "001013001", caption: "Balance — line 009 minus line 011 (if negative, enter \"0\")", kind: "money", role: "computed", section: "deduction", requirement: "mandatory" },
  { line: "001041001", caption: "Name of the Associated Canadian-controlled Private Corporation", kind: "text", role: "input", section: "agreement", requirement: "mandatory", note: "One occurrence per associated corp, this corporation first. Required whenever the AT1 jacket's line 001 is Yes." },
  { line: "001043001", caption: "Corporate Account Number", kind: "code", role: "input", section: "agreement", requirement: "optional", note: "Alberta CAN. Must equal the same corporation's fed 023100 (federal Schedule 23) — not enforced here." },
  { line: "001045001", caption: "Allocation of the Base Amount", kind: "money", role: "input", section: "agreement", requirement: "mandatory", note: "Required whenever 041 has a value. Total across all occurrences is capped by the group's base amount." },
];

export const AT1_SCHEDULE_1_FOOTNOTES: readonly string[] = [
  "For corporations which were Canadian-controlled private corporations throughout the taxation year and which had income from active businesses carried on in Canada.",
  "If the corporation has income (loss) from a partnership with a fiscal period ending after March 31, 2001, the income from active businesses must be recalculated for Alberta purposes by increasing the partnership's business limit for the period straddling that date — see the Guide for the full calculation.",
  "Area A: the percentage allocated in column 044 must be the same percentage used to determine the business limit on federal Schedule 23 for all taxation years ending after December 4, 2002. The total of all percentages cannot exceed 100%.",
  "Area A: the amount in column 045 must be rounded to the nearest dollar, rounding up at $.50 and over.",
];
