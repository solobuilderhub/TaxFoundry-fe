/**
 * Alberta Foreign Investment Income Tax Credit (AT1SCH04) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/sources/tra-forms/pdf/AT1SCH04-foreign-investment-income-tax-credit-TRA11728.pdf, retrieved 2026-09-01.
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

export const AT1_SCHEDULE_4_SECTIONS: readonly PaperSectionDef[] = [
  { id: "countries", title: "Foreign Investment Credits", description: "One occurrence per country the corporation earned foreign non-business income in, sorted in the same order as federal Schedule 21. AB form 004 exists only if federal Schedule 21 exists." },
  { id: "total", title: "Total and Alberta Foreign Investment Income Tax Credit", description: "Summed across every country, then capped by the AT1 jacket room." },
];

export const AT1_SCHEDULE_4_FIELDS: readonly PaperField[] = [
  { line: "004002001", caption: "Country", kind: "code", role: "input", section: "countries", requirement: "mandatory", note: "Two-letter code. Must equal the matching occurrence of federal Schedule 21, line 100." },
  { line: "004004001", caption: "Net Foreign Investment Income", kind: "money", role: "input", section: "countries", requirement: "mandatory", note: "Must equal federal Schedule 21, line 110." },
  { line: "004006001", caption: "Foreign tax paid, net of the ITA 20(12)/ACTA 8(2.2) deduction", kind: "money", role: "computed", section: "countries", note: "Derived from the gross federal tax paid and the deduction — neither is itself an AT1 line." },
  { line: "004008001", caption: "Federal non-business foreign tax credit", kind: "money", role: "input", section: "countries", requirement: "mandatory", note: "Must equal federal Schedule 21, line 180." },
  { line: "004012001", caption: "Allowable Credit", kind: "money", role: "computed", section: "countries", note: "Lesser of D (income proration) and G (tax paid less federal credit), both allocation-factor-scaled — see module doc." },
  { line: "004014001", caption: "Total Allowable Credits", kind: "money", role: "total", section: "total", note: "Sum of line 012 (column H) across every country occurrence — `computeSchedule4`'s own `totalAllowableCredit`." },
  { line: "004018001", caption: "Room — AT1 page 2, line 068 minus (lines 070 + 071)", kind: "money", role: "computed", section: "total", note: "Not the same two jacket lines as Schedule 3's room at line 602 (070+072) — confirmed by reading both printed forms directly." },
  { line: "004020001", caption: "Alberta Foreign Investment Income Tax Credit", kind: "money", role: "computed", section: "total", note: "Lesser of line 014 and line 018.", to: { form: "AT1", line: "000072001", note: "Printed on the form: \"Enter this amount on AT1 page 2, line 072.\"" } },
];

export const AT1_SCHEDULE_4_FOOTNOTES: readonly string[] = [
  "If the corporation has permanent establishments in Alberta only, enter \"1\" in column C (the Alberta allocation factor).",
  "If the corporation's deduction from income under Alberta Corporate Tax Act subsection 8(2.2) differs from the deduction under Income Tax Act subsection 20(12) for any country, Alberta Schedule 12 is required — the total of these amounts for each country is included in the amount at Schedule 12, line 040.",
];
