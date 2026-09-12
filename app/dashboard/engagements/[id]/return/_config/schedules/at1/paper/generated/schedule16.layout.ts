/**
 * Alberta scientific research expenditures (AT1SCH16) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/sources/tra-forms/pdf/AT1SCH16-scientific-research-TRA11737.pdf, retrieved 2026-09-08.
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

export const AT1_SCHEDULE_16_SECTIONS: readonly PaperSectionDef[] = [
  { id: "pool", title: "Alberta SR&ED expenditure pool", description: "A deduction pool, not a credit. Most lines must equal their federal counterpart; the carried-forward balance and the transfer are Alberta’s own." },
];

export const AT1_SCHEDULE_16_FIELDS: readonly PaperField[] = [
  { line: "016002001", caption: "Allowable SR&ED expenditures (federal schedule 32 (T661) line 400)", kind: "money", role: "carried-in", section: "pool", from: { form: "T661", line: "400", note: "Must EQUAL the federal figure" } },
  { line: "016004001", caption: "Government and non-government assistance for expenditures included in above line (use federal schedule 32 (T661) line 430 from 2007 and prior versions; use sum of lines 429, 431 and 432 from 2008 and later versions)", kind: "money", role: "carried-in", section: "pool", from: { form: "T661", line: "429", note: "Lines 429 + 431 + 432 for 2008 onward; line 430 for 2007 and earlier" } },
  { line: "016006001", caption: "Previous year's investment tax credit (ITC) claimed for SR&ED (federal schedule 32 (T661) line 435)", kind: "money", role: "carried-in", section: "pool", from: { form: "T661", line: "435" } },
  { line: "016008001", caption: "Sale of SR&ED capital assets and other deductions (federal schedule 32 (T661) line 440)", kind: "money", role: "carried-in", section: "pool", from: { form: "T661", line: "440" } },
  { line: "016010001", caption: "Repayments of government and non-government assistance for SR&ED (federal schedule 32 (T661) line 445)", kind: "money", role: "carried-in", section: "pool", from: { form: "T661", line: "445" } },
  { line: "016012001", caption: "Unclaimed SR&ED expenditure pool balance from the previous year", kind: "money", role: "input", section: "pool", note: "ALBERTA'S OWN figure, not the federal one. A claim taken federally but not provincially leaves the two balances apart from then on." },
  { line: "016014001", caption: "SR&ED expenditure pool transfer from amalgamation or wind-up of a wholly-owned subsidiary", kind: "money", role: "input", section: "pool", note: "Alberta's own figure — see line 012." },
  { line: "016015001", caption: "Amount of ITC recaptured in the previous tax year (federal schedule 32 (T661) line 453)", kind: "money", role: "carried-in", section: "pool", from: { form: "T661", line: "453" } },
  { line: "016016001", caption: "Subtotal: Line 002 - (004 + 006 + 008) + 010 + 012 + 014 + 015", kind: "money", role: "total", section: "pool", note: "If this amount is positive, enter that amount on line 018. If it is NEGATIVE, carry the negative amount forward to Schedule 12, line 034 and enter \"0\" on lines 018, 020 and 022 — a negative pool is an income inclusion, not a nil deduction.", to: { form: "AT1SCH12", line: "012034001", note: "Only when line 016 is negative — carry the negative amount." } },
  { line: "016018001", caption: "SR&ED expenditure pool deduction available", kind: "money", role: "computed", section: "pool" },
  { line: "016020001", caption: "Deduct: SR&ED expenditure pool deduction claimed in the current year", kind: "money", role: "input", section: "pool", note: "DISCRETIONARY, up to the amount available. A loss year should claim less: the pool does not expire, and a deduction against nil income is lost. Printed on the form: if other than \"0\", carry this amount forward to Schedule 12, line 034.", to: { form: "AT1SCH12", line: "012034001", note: "If other than \"0\"." } },
  { line: "016022001", caption: "Unclaimed SR&ED expenditure pool deduction balance (line 018 - 020)", kind: "money", role: "computed", section: "pool", note: "Use this amount as the carry forward amount for next year, line 012." },
];

export const AT1_SCHEDULE_16_FOOTNOTES: readonly string[] = [
  "This schedule is required if the opening balance or the claim for Alberta purposes differs from that for federal purposes.",
  "Report all monetary amounts in dollars; DO NOT include cents. Show negative amounts in brackets ( ).",
];
