/**
 * Tax calculation supplementary — corporations (T2SCH5) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/sources/cra-forms/pdf/T2SCH05-provincial-tax.pdf, retrieved 2026-08-20.
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

export const T2_SCHEDULE_5_SECTIONS: readonly PaperSectionDef[] = [
  { id: "allocation", title: "Part 1 — Allocation of taxable income", description: "One row per jurisdiction with a permanent establishment. Taxable income is split by the AVERAGE of the payroll share and the revenue share." },
];

export const T2_SCHEDULE_5_FIELDS: readonly PaperField[] = [
  { line: "100", caption: "Enter the regulation that applies (402 to 413)", kind: "code", role: "input", section: "allocation", note: "Reg 402 is the general rule. Banks, railways, airlines, grain and trucking each allocate on their own measures." },
  { line: "003", caption: "Newfoundland and Labrador — permanent establishment in the jurisdiction", kind: "flag", role: "input", section: "allocation" },
  { line: "103", caption: "Newfoundland and Labrador — total salaries and wages paid in the jurisdiction", kind: "money", role: "input", section: "allocation" },
  { line: "143", caption: "Newfoundland and Labrador — gross revenue attributable to the jurisdiction", kind: "money", role: "input", section: "allocation" },
  { line: "004", caption: "Newfoundland and Labrador Offshore — permanent establishment in the jurisdiction", kind: "flag", role: "input", section: "allocation" },
  { line: "104", caption: "Newfoundland and Labrador Offshore — total salaries and wages paid in the jurisdiction", kind: "money", role: "input", section: "allocation" },
  { line: "144", caption: "Newfoundland and Labrador Offshore — gross revenue attributable to the jurisdiction", kind: "money", role: "input", section: "allocation" },
  { line: "005", caption: "Prince Edward Island — permanent establishment in the jurisdiction", kind: "flag", role: "input", section: "allocation" },
  { line: "105", caption: "Prince Edward Island — total salaries and wages paid in the jurisdiction", kind: "money", role: "input", section: "allocation" },
  { line: "145", caption: "Prince Edward Island — gross revenue attributable to the jurisdiction", kind: "money", role: "input", section: "allocation" },
  { line: "007", caption: "Nova Scotia — permanent establishment in the jurisdiction", kind: "flag", role: "input", section: "allocation" },
  { line: "107", caption: "Nova Scotia — total salaries and wages paid in the jurisdiction", kind: "money", role: "input", section: "allocation" },
  { line: "147", caption: "Nova Scotia — gross revenue attributable to the jurisdiction", kind: "money", role: "input", section: "allocation" },
  { line: "008", caption: "Nova Scotia Offshore — permanent establishment in the jurisdiction", kind: "flag", role: "input", section: "allocation" },
  { line: "108", caption: "Nova Scotia Offshore — total salaries and wages paid in the jurisdiction", kind: "money", role: "input", section: "allocation" },
  { line: "148", caption: "Nova Scotia Offshore — gross revenue attributable to the jurisdiction", kind: "money", role: "input", section: "allocation" },
  { line: "009", caption: "New Brunswick — permanent establishment in the jurisdiction", kind: "flag", role: "input", section: "allocation" },
  { line: "109", caption: "New Brunswick — total salaries and wages paid in the jurisdiction", kind: "money", role: "input", section: "allocation" },
  { line: "149", caption: "New Brunswick — gross revenue attributable to the jurisdiction", kind: "money", role: "input", section: "allocation" },
  { line: "011", caption: "Quebec — permanent establishment in the jurisdiction", kind: "flag", role: "input", section: "allocation" },
  { line: "111", caption: "Quebec — total salaries and wages paid in the jurisdiction", kind: "money", role: "input", section: "allocation" },
  { line: "151", caption: "Quebec — gross revenue attributable to the jurisdiction", kind: "money", role: "input", section: "allocation" },
  { line: "013", caption: "Ontario — permanent establishment in the jurisdiction", kind: "flag", role: "input", section: "allocation" },
  { line: "113", caption: "Ontario — total salaries and wages paid in the jurisdiction", kind: "money", role: "input", section: "allocation" },
  { line: "153", caption: "Ontario — gross revenue attributable to the jurisdiction", kind: "money", role: "input", section: "allocation" },
  { line: "015", caption: "Manitoba — permanent establishment in the jurisdiction", kind: "flag", role: "input", section: "allocation" },
  { line: "115", caption: "Manitoba — total salaries and wages paid in the jurisdiction", kind: "money", role: "input", section: "allocation" },
  { line: "155", caption: "Manitoba — gross revenue attributable to the jurisdiction", kind: "money", role: "input", section: "allocation" },
  { line: "017", caption: "Saskatchewan — permanent establishment in the jurisdiction", kind: "flag", role: "input", section: "allocation" },
  { line: "117", caption: "Saskatchewan — total salaries and wages paid in the jurisdiction", kind: "money", role: "input", section: "allocation" },
  { line: "157", caption: "Saskatchewan — gross revenue attributable to the jurisdiction", kind: "money", role: "input", section: "allocation" },
  { line: "019", caption: "Alberta — permanent establishment in the jurisdiction", kind: "flag", role: "input", section: "allocation" },
  { line: "119", caption: "Alberta — total salaries and wages paid in the jurisdiction", kind: "money", role: "input", section: "allocation" },
  { line: "159", caption: "Alberta — gross revenue attributable to the jurisdiction", kind: "money", role: "input", section: "allocation" },
  { line: "021", caption: "British Columbia — permanent establishment in the jurisdiction", kind: "flag", role: "input", section: "allocation" },
  { line: "121", caption: "British Columbia — total salaries and wages paid in the jurisdiction", kind: "money", role: "input", section: "allocation" },
  { line: "161", caption: "British Columbia — gross revenue attributable to the jurisdiction", kind: "money", role: "input", section: "allocation" },
  { line: "023", caption: "Yukon — permanent establishment in the jurisdiction", kind: "flag", role: "input", section: "allocation" },
  { line: "123", caption: "Yukon — total salaries and wages paid in the jurisdiction", kind: "money", role: "input", section: "allocation" },
  { line: "163", caption: "Yukon — gross revenue attributable to the jurisdiction", kind: "money", role: "input", section: "allocation" },
  { line: "025", caption: "Northwest Territories — permanent establishment in the jurisdiction", kind: "flag", role: "input", section: "allocation" },
  { line: "125", caption: "Northwest Territories — total salaries and wages paid in the jurisdiction", kind: "money", role: "input", section: "allocation" },
  { line: "165", caption: "Northwest Territories — gross revenue attributable to the jurisdiction", kind: "money", role: "input", section: "allocation" },
  { line: "026", caption: "Nunavut — permanent establishment in the jurisdiction", kind: "flag", role: "input", section: "allocation" },
  { line: "126", caption: "Nunavut — total salaries and wages paid in the jurisdiction", kind: "money", role: "input", section: "allocation" },
  { line: "166", caption: "Nunavut — gross revenue attributable to the jurisdiction", kind: "money", role: "input", section: "allocation" },
];
