/**
 * Shareholder information (T2SCH50) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/sources/cra-forms/pdf/T2SCH50-shareholders.pdf, retrieved 2026-08-12.
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

export const T2_SCHEDULE_50_SECTIONS: readonly PaperSectionDef[] = [
  { id: "shareholders", title: "Shareholder information", description: "One row per shareholder holding 10% or more of the common or preferred shares. The numbers head columns; every row repeats them." },
];

export const T2_SCHEDULE_50_FIELDS: readonly PaperField[] = [
  { line: "100", caption: "Name of shareholder", kind: "text", role: "input", section: "shareholders", note: "Indicate in brackets whether the holder is a corporation, partnership, individual or trust." },
  { line: "200", caption: "Business number or partnership account number", kind: "code", role: "input", section: "shareholders", note: "Nine digits, two letters, four digits. Enter \"NR\" where the holder is not registered." },
  { line: "300", caption: "Social insurance number", kind: "code", role: "input", section: "shareholders", note: "An individual holder. Mutually exclusive with lines 200 and 350." },
  { line: "350", caption: "Trust number", kind: "code", role: "input", section: "shareholders", note: "T followed by eight digits." },
  { line: "400", caption: "Percentage of common shares", kind: "rate", role: "input", section: "shareholders", note: "The figure that establishes control, and so whether the corporation is a CCPC." },
  { line: "500", caption: "Percentage of preferred shares", kind: "rate", role: "input", section: "shareholders" },
];
