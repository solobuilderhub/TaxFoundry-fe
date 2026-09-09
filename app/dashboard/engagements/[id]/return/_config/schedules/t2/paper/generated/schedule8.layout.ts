/**
 * Capital cost allowance (T2SCH8) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/sources/cra-forms/T2SCH08-cca.pdf, retrieved 2026-08-11.
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

export const T2_SCHEDULE_8_SECTIONS: readonly PaperSectionDef[] = [
  { id: "cca-grid", title: "Capital cost allowance by class", description: "One row per class. The numbered columns are what a return transmits; the unnumbered ones are arithmetic the form shows on the way." },
];

export const T2_SCHEDULE_8_FIELDS: readonly PaperField[] = [
  { line: "200", caption: "Class number", kind: "code", role: "input", section: "cca-grid" },
  { line: "201", caption: "Undepreciated capital cost (UCC) at the beginning of the year", kind: "money", role: "input", section: "cca-grid" },
  { line: "203", caption: "Cost of acquisitions during the year", kind: "money", role: "input", section: "cca-grid", note: "New property must be available for use. AIIP and RIIP go in columns 4 and 5." },
  { line: "225", caption: "Accelerated investment incentive property (AIIP) acquired before 2025 that is included in Classes 54 to 56", kind: "money", role: "computed", section: "cca-grid", note: "Earns an enhanced first-year allowance; the half-year rule is suspended." },
  { line: "226", caption: "Property (RIIP) acquired after 2024 that is included in Classes 54 to 56", kind: "money", role: "input", section: "cca-grid" },
  { line: "205", caption: "Adjustments and transfers", kind: "money", role: "input", section: "cca-grid", note: "Signed — amounts that REDUCE the undepreciated capital cost are shown in brackets." },
  { line: "221", caption: "Assistance received or receivable during the year for a property, subsequent to its disposition", kind: "money", role: "input", section: "cca-grid" },
  { line: "222", caption: "Assistance repaid during a year for a property, subsequent to its disposition", kind: "money", role: "input", section: "cca-grid" },
  { line: "207", caption: "Proceeds of dispositions", kind: "money", role: "input", section: "cca-grid" },
  { line: "224", caption: "UCC adjustment for property acquired during the year other than AIIP, RIIP and property included in Classes 54 to 56", kind: "money", role: "computed", section: "cca-grid", note: "The half-year rule: half of net additions is held back from this year’s base." },
  { line: "212", caption: "CCA rate %", kind: "rate", role: "computed", section: "cca-grid" },
  { line: "213", caption: "Recapture of CCA", kind: "money", role: "computed", section: "cca-grid", to: { form: "T2SCH1", line: "107", note: "Recaptured allowance is income — an ADDITION" } },
  { line: "215", caption: "Terminal loss", kind: "money", role: "computed", section: "cca-grid", to: { form: "T2SCH1", line: "404", note: "A deduction" } },
  { line: "217", caption: "CCA (for declining balance method, or a lower amount)", kind: "money", role: "input", section: "cca-grid", note: "A claim is optional and may be reduced — a loss year often claims nil to preserve the pool.", to: { form: "T2SCH1", line: "403", note: "A deduction" } },
  { line: "220", caption: "UCC at the end of the year", kind: "money", role: "computed", section: "cca-grid" },
];

export interface Schedule8GridColumn {
  column: number;
  line: string;
  caption: string;
  kind: PaperFieldKind;
  note?: string;
}

export const T2_SCHEDULE_8_GRID_COLUMNS: readonly Schedule8GridColumn[] = [
  { column: 1, line: "200", caption: "Class number", kind: "code" },
  { column: 2, line: "201", caption: "Undepreciated capital cost (UCC) at the beginning of the year", kind: "money" },
  { column: 3, line: "203", caption: "Cost of acquisitions during the year", kind: "money", note: "New property must be available for use. AIIP and RIIP go in columns 4 and 5." },
  { column: 4, line: "225", caption: "Accelerated investment incentive property (AIIP) acquired before 2025 that is included in Classes 54 to 56", kind: "money", note: "Earns an enhanced first-year allowance; the half-year rule is suspended." },
  { column: 5, line: "226", caption: "Property (RIIP) acquired after 2024 that is included in Classes 54 to 56", kind: "money" },
  { column: 6, line: "205", caption: "Adjustments and transfers", kind: "money", note: "Signed — amounts that REDUCE the undepreciated capital cost are shown in brackets." },
  { column: 7, line: "221", caption: "Assistance received or receivable during the year for a property, subsequent to its disposition", kind: "money" },
  { column: 8, line: "222", caption: "Assistance repaid during a year for a property, subsequent to its disposition", kind: "money" },
  { column: 9, line: "207", caption: "Proceeds of dispositions", kind: "money" },
  { column: 17, line: "224", caption: "UCC adjustment for property acquired during the year other than AIIP, RIIP and property included in Classes 54 to 56", kind: "money", note: "The half-year rule: half of net additions is held back from this year’s base." },
  { column: 18, line: "212", caption: "CCA rate %", kind: "rate" },
  { column: 19, line: "213", caption: "Recapture of CCA", kind: "money" },
  { column: 20, line: "215", caption: "Terminal loss", kind: "money" },
  { column: 21, line: "217", caption: "CCA (for declining balance method, or a lower amount)", kind: "money", note: "A claim is optional and may be reduced — a loss year often claims nil to preserve the pool." },
  { column: 22, line: "220", caption: "UCC at the end of the year", kind: "money" },
];
