/**
 * Alberta Resource Related Deductions (AT1SCH15) — paper Form View layout.
 *
 * GENERATED from the form definition in @classytic/ca-tax:
 *   npx tsx packages/ca-tax/scripts/emit-ui-schedule.ts
 *
 * Ultimately from research/sources/tra-spec/AT1-Chapter3-2025.2-full.txt, retrieved 2026-08-29.
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

export const AT1_SCHEDULE_15_SECTIONS: readonly PaperSectionDef[] = [
  { id: "sfede", title: "SFEDE — Specified Foreign Exploration and Development Expenses, per country" },
  { id: "cfre", title: "CFRE — Cumulative Foreign Resource Expenses, per country" },
];

export const AT1_SCHEDULE_15_FIELDS: readonly PaperField[] = [
  { line: "015241001", caption: "SFEDE regular — country code", kind: "code", role: "input", section: "sfede", note: "Must equal the federal country code (fed 012601)." },
  { line: "015261001", caption: "SFEDE successor — country code", kind: "code", role: "input", section: "sfede", note: "Must equal the federal country code (fed 012651)." },
  { line: "015281001", caption: "CFRE regular — country code", kind: "code", role: "input", section: "cfre", note: "Must equal the federal country code (fed 012701)." },
  { line: "015293001", caption: "CFRE regular — amount claimed this year", kind: "money", role: "input", section: "cfre", note: "= A + B: A is a 10%-floor/30%-income-capped amount from this country’s own pool; B draws on the (spec-undefined) global foreign resource limit." },
  { line: "015301001", caption: "CFRE successor — country code", kind: "code", role: "input", section: "cfre", note: "Must equal the federal country code (fed 012751)." },
];
