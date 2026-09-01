/**
 * Alberta Manufacturing and Processing Profits Deduction (AT1SCH11) — paper Form View layout.
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
  to?: { form: string; line: string; note?: string };
}

export interface PaperSectionDef {
  id: string;
  title: string;
  description?: string;
}

export const AT1_SCHEDULE_11_SECTIONS: readonly PaperSectionDef[] = [
  { id: "adjubi", title: "ADJUBI", description: "Line 001 = fed 027130 (federal ADJUBI) by default, or Schedule 12 lines 112 + 114 when Alberta calculates ADJUBI differently — neither Schedule 12 line, nor the federal ADJUBI itself, is an AT1 line on THIS schedule." },
  { id: "ccpc", title: "CCPC-only: Aggregate Investment Income", description: "Disclosure only — the transcribed spec does not use this figure in the line 042 proration." },
  { id: "capitalAndLabour", title: "Cost of Capital and Cost of Labour", description: "Must not exist for a small manufacturing corp — see line 042." },
  { id: "profits", title: "Alberta Manufacturing and Processing Profits" },
];

export const AT1_SCHEDULE_11_FIELDS: readonly PaperField[] = [
  { line: "011001001", caption: "AMPPD — ADJUBI for Alberta purposes", kind: "money", role: "computed", section: "adjubi", note: "= fed 027130, or Schedule 12 lines 112 + 114 when Alberta calculates ADJUBI differently." },
  { line: "011013001", caption: "Canadian-controlled Private Corporations Only: Aggregate investment income for the year", kind: "money", role: "computed", section: "ccpc", requirement: "conditional", note: "CCPC only. = Alberta figure when Schedule 12 exists, otherwise fed 200440. Omitted entirely for a non-CCPC." },
  { line: "011031001", caption: "Cost of Capital", kind: "money", role: "input", section: "capitalAndLabour", note: "Must equal fed 027140 for a corp other than a small manufacturer." },
  { line: "011033001", caption: "Alberta Cost of Manufacturing and Processing Capital", kind: "money", role: "input", section: "capitalAndLabour", note: "Cannot exceed line 031." },
  { line: "011037001", caption: "Cost of Labour", kind: "money", role: "input", section: "capitalAndLabour", note: "Must equal fed 027160 for a corp other than a small manufacturer." },
  { line: "011039001", caption: "Alberta Cost of Manufacturing and Processing Labour", kind: "money", role: "input", section: "capitalAndLabour", note: "Cannot exceed line 037." },
  { line: "011042001", caption: "Alberta Manufacturing and Processing Profits", kind: "money", role: "input", section: "profits", note: "Computed from lines 001/031/033/037/039 in the general case; a direct entry for a small manufacturing corp, since the spec gives no proration formula for that case. Nil whenever the historical eligibility test fails, regardless of the workings." },
];
