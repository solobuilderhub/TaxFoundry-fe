/**
 * Dividends received, taxable dividends paid, and Part IV tax calculation (T2SCH3) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/sources/cra-forms/pdf/T2SCH03-dividends-part-iv.pdf, retrieved 2026-08-19.
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

export const T2_SCHEDULE_3_SECTIONS: readonly PaperSectionDef[] = [
  { id: "received", title: "Part 1 — Dividends received in the tax year", description: "One row per payer. Columns B, C, D, I and J are completed only when the payer is connected." },
  { id: "paid", title: "Part 3 — Taxable dividends paid that qualify for a dividend refund", description: "One row per connected recipient, then the totals." },
];

export const T2_SCHEDULE_3_FIELDS: readonly PaperField[] = [
  { line: "200", caption: "Name of payer corporation from which the corporation received the dividend", kind: "text", role: "input", section: "received" },
  { line: "205", caption: "Enter 1 if the payer corporation is connected", kind: "code", role: "input", section: "received", note: "The whole Part IV treatment turns on this: a connected payer attracts Part IV tax only to the extent it received a dividend refund." },
  { line: "210", caption: "Business number of the connected corporation", kind: "text", role: "input", section: "received" },
  { line: "220", caption: "Tax year-end of the payer corporation in which the dividends were paid", kind: "date", role: "input", section: "received" },
  { line: "230", caption: "Taxable dividends received", kind: "money", role: "input", section: "received" },
  { line: "235", caption: "Taxable dividends deductible from taxable income under section 112", kind: "money", role: "input", section: "received", note: "The inter-corporate dividend deduction — what stops the same profit being taxed at each tier." },
  { line: "240", caption: "Taxable dividends deductible under subsections 113(1) and 138(6)", kind: "money", role: "input", section: "received", note: "Dividends out of a foreign affiliate’s surplus." },
  { line: "242", caption: "Eligible dividends included in column 240", kind: "money", role: "input", section: "received" },
  { line: "400", caption: "Name of recipient corporation with which you are connected", kind: "text", role: "input", section: "paid" },
  { line: "410", caption: "Business number of the recipient corporation", kind: "text", role: "input", section: "paid" },
  { line: "420", caption: "Tax year-end of the recipient corporation in which the dividends were received", kind: "date", role: "input", section: "paid" },
  { line: "430", caption: "Taxable dividends paid to connected recipient corporations", kind: "money", role: "input", section: "paid" },
  { line: "440", caption: "Eligible dividends included in column 430", kind: "money", role: "input", section: "paid" },
  { line: "450", caption: "Total taxable dividends paid in the tax year to other than connected corporations", kind: "money", role: "input", section: "paid" },
  { line: "455", caption: "Eligible dividends included in line 450", kind: "money", role: "input", section: "paid" },
  { line: "460", caption: "Total taxable dividends paid in the tax year that qualify for a dividend refund", kind: "money", role: "total", section: "paid", note: "Total of column Q plus line 450. This is the figure the dividend refund is computed on." },
  { line: "465", caption: "Total eligible dividends paid in the tax year", kind: "money", role: "total", section: "paid", note: "Total of column R plus line 455. Feeds the GRIP continuity on Schedule 53 and, if over-designated, Part III.1 tax on Schedule 55.", to: { form: "T2SCH53", line: "", note: "Eligible dividends designated" } },
];
