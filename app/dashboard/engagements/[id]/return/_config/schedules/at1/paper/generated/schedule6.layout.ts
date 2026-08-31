/**
 * Alberta Royalty Tax Credit (AT1SCH06) — paper Form View layout.
 *
 * GENERATED from the form definition in @classytic/ca-tax:
 *   npx tsx packages/ca-tax/scripts/emit-ui-schedule.ts
 *
 * Ultimately from research/sources/tra-spec/AT1-Chapter3-2025.2-full.txt, retrieved 2026-08-31.
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
  from?: { form: string; line: string; note?: string };
}

export interface PaperSectionDef {
  id: string;
  title: string;
  description?: string;
}

export const AT1_SCHEDULE_6_SECTIONS: readonly PaperSectionDef[] = [
  { id: "core", title: "Alberta Royalty Tax Credit", description: "No credit dollar amount is computed here — the ARTC is administered as an instalment program (AT1 jacket line 000082). This schedule establishes the royalty amount, shelter and rate TRA uses for that determination." },
  { id: "acrs", title: "Aggregate of the Crown Royalty Shelter (ACRS)", description: "Complete only when associated (line 002 = Yes)." },
  { id: "aacrs", title: "Allocation of the Aggregate of the Crown Royalty Shelter (AACRS)", description: "Complete only when associated. Put the corporation filing this return FIRST — its own allocation becomes line 006 directly." },
];

export const AT1_SCHEDULE_6_FIELDS: readonly PaperField[] = [
  { line: "006002001", caption: "Is the corporation associated with one or more corporations that have incurred Alberta Crown Royalty in the year?", kind: "flag", role: "input", section: "core", requirement: "mandatory", note: "Default 2 (No)." },
  { line: "006004001", caption: "Alberta Crown Royalty incurred in the taxation year", kind: "money", role: "input", section: "core", requirement: "mandatory", note: "= Schedule 7, line 003 + Σ line 077 − Σ line 087 + Σ line 089." },
  { line: "006006001", caption: "Crown Royalty Shelter", kind: "money", role: "computed", section: "core", note: "Not associated: $2,000,000 × (days in own tax year, max 365) / 365. Associated: this filer's own AACRS allocation (line 034, first occurrence)." },
  { line: "006008001", caption: "Weighted Average Rate", kind: "rate", role: "computed", section: "core", note: "Day-weighted average of the published RTC quarterly rate across every calendar quarter the taxation year spans, to 4 decimal places." },
  { line: "006022001", caption: "Corporate Account Number of the associated corporation with the longest taxation year", kind: "code", role: "input", section: "acrs" },
  { line: "006024001", caption: "Taxation Year Beginning", kind: "date", role: "input", section: "acrs" },
  { line: "006026001", caption: "Taxation Year Ending", kind: "date", role: "input", section: "acrs" },
  { line: "006028001", caption: "Number of days in the longest year", kind: "text", role: "input", section: "acrs", note: "Max 365. Spec Type N — not money; matches the same field's kind on schedule29.ts." },
  { line: "006030001", caption: "Name of Corporation", kind: "text", role: "input", section: "aacrs", note: "One occurrence per associated corporation sharing the pool." },
  { line: "006032001", caption: "Alberta Corporate Account Number", kind: "code", role: "input", section: "aacrs", requirement: "optional" },
  { line: "006034001", caption: "Allocated Amount", kind: "money", role: "input", section: "aacrs", note: "Capped at $2,000,000 × (line 028 / 365), aggregate across all occurrences." },
];
