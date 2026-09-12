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
  /** Text the form prints immediately BEFORE this heading, verbatim. */
  printedBefore?: string;
}

export const AT1_SCHEDULE_4_SECTIONS: readonly PaperSectionDef[] = [
  { id: "countries", title: "Foreign Investment Credits", description: "One occurrence per country the corporation earned foreign non-business income in, sorted in the same order as federal Schedule 21. AB form 004 exists only if federal Schedule 21 exists." },
  { id: "total", title: "Total and Alberta Foreign Investment Income Tax Credit", description: "Summed across every country, then capped by the AT1 jacket room." },
];

export const AT1_SCHEDULE_4_FIELDS: readonly PaperField[] = [
  { line: "004002001", caption: "Country in which foreign non-business income was earned from federal sch 21 line 100", kind: "code", role: "input", section: "countries", requirement: "mandatory", note: "Two-letter code. Must equal the matching occurrence of federal Schedule 21, line 100.", sourceText: "federal sch 21 line 100" },
  { line: "004004001", caption: "Net foreign investment income from federal schedule 21 line 110", kind: "money", role: "input", section: "countries", requirement: "mandatory", note: "Must equal federal Schedule 21, line 110.", sourceText: "federal schedule 21 line 110" },
  { line: "004006001", caption: "Foreign investment income tax paid (federal sch 21 line 120) minus greater of amount deducted under ACTA 8(2.2) or ITA 20(12) (federal sch 21 line 130)", kind: "money", role: "computed", section: "countries", note: "Derived from the gross federal tax paid and the deduction — neither is itself an AT1 line. The GREATER of the two deductions is subtracted, not either one.", sourceText: "federal sch 21 line 120, minus the greater of the ACTA 8(2.2) or ITA 20(12) deduction (federal sch 21 line 130)", footnoteMarks: [1] },
  { line: "004008001", caption: "Federal non-business foreign tax credit from federal schedule 21 line 180", kind: "money", role: "input", section: "countries", requirement: "mandatory", note: "Must equal federal Schedule 21, line 180.", sourceText: "federal schedule 21 line 180" },
  { line: "004012001", caption: "Allowable Credit Lesser of D or G", kind: "money", role: "computed", section: "countries", note: "Lesser of D (income prorated by the allocation factor and the jacket 068/066 ratio) and G ((E - F) X C) — neither of which the page numbers. See AT1_SCHEDULE_4_COLUMNS." },
  { line: "004014001", caption: "Total Allowable Credits: sum of amounts in column H", kind: "money", role: "total", section: "total", note: "Sum of line 012 (column H) across every country occurrence — `computeSchedule4`'s own `totalAllowableCredit`." },
  { line: "004018001", caption: "From AT1, page 2: line 068 - (lines 070 + 071)", kind: "money", role: "computed", section: "total", note: "Line 068 minus the SUM of 070 and 071, as the page brackets it. Arithmetically that equals 068 - 070, because jacket line 071 (Alberta Manufacturing and Processing Profits Deduction, the old AT1 Schedule 11) is ALWAYS NIL — pre-2001-04-01 only, absent from the printed jacket, and retained solely because the specification still marks it mandatory. Other products print the shortened \"068 - 070\" for exactly that reason; this caption stays as TRA prints it, so the day 071 is ever non-nil the form does not silently drop it. And it is NOT the same pair as Schedule 3's room at line 602 (070 + 072) — the two schedules' rooms are genuinely different, confirmed by reading both printed forms directly." },
  { line: "004020001", caption: "Alberta Foreign Investment Income Tax Credit: Lesser of amounts on lines 014 and 018", kind: "money", role: "computed", section: "total", note: "Lesser of line 014 and line 018.", to: { form: "AT1", line: "000072001", note: "Printed on the form: \"Enter this amount on AT1 page 2, line 072.\"" } },
];

export const AT1_SCHEDULE_4_FOOTNOTES: readonly string[] = [
  "If the corporation has permanent establishments in Alberta only, enter \"1\" in column C.",
  "If the corporation's deduction from income under subsection 8(2.2) of the Alberta Corporate Tax Act (ACTA) is different from the deduction under subsection 20(12) of the Income Tax Act (ITA) for any country, then Alberta Schedule 12 is required to be completed. The total of these amounts for each country for Alberta purposes is to be included in the amount at line 040 on Alberta Schedule 12.",
  "For corporations which have included in income any foreign investment income and which are entitled to a Federal Non-Business Foreign Tax Credit.",
  "Report all monetary values in dollars; DO NOT include cents.",
];


export interface Schedule4Column {
  column: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";
  heading: string;
  /** Absent on C, D and G, which the page does not number. */
  line?: string;
  footnoteMarks?: readonly number[];
}

export const AT1_SCHEDULE_4_COLUMNS: readonly Schedule4Column[] = [
  { column: "A", heading: "Country in which foreign non-business income was earned from federal sch 21 line 100", line: "002" },
  { column: "B", heading: "Net foreign investment income from federal schedule 21 line 110", line: "004" },
  { column: "C", heading: "Alberta allocation factor from AT1 Schedule 2", footnoteMarks: [0] },
  { column: "D", heading: "B X C X (AT1 line 068 / AT1 line 066)" },
  { column: "E", heading: "Foreign investment income tax paid (federal sch 21 line 120) minus greater of amount deducted under ACTA 8(2.2) or ITA 20(12) (federal sch 21 line 130)", line: "006", footnoteMarks: [1] },
  { column: "F", heading: "Federal non-business foreign tax credit from federal schedule 21 line 180", line: "008" },
  { column: "G", heading: "(E - F) X C" },
  { column: "H", heading: "Allowable Credit Lesser of D or G", line: "012" },
];