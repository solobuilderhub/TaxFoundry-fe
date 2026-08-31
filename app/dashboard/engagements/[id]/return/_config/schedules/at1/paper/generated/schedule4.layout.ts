/**
 * Alberta Foreign Investment Income Tax Credit (AT1SCH04) — paper Form View layout.
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

export const AT1_SCHEDULE_4_SECTIONS: readonly PaperSectionDef[] = [
  { id: "countries", title: "Foreign Investment Credits", description: "One occurrence per country the corporation earned foreign non-business income in, sorted in the same order as federal Schedule 21. AB form 004 exists only if federal Schedule 21 exists." },
];

export const AT1_SCHEDULE_4_FIELDS: readonly PaperField[] = [
  { line: "004002001", caption: "Country", kind: "code", role: "input", section: "countries", requirement: "mandatory", note: "Two-letter code. Must equal the matching occurrence of federal Schedule 21, line 100." },
  { line: "004004001", caption: "Net Foreign Investment Income", kind: "money", role: "input", section: "countries", requirement: "mandatory", note: "Must equal federal Schedule 21, line 110." },
  { line: "004006001", caption: "Foreign tax paid, net of the ITA 20(12)/ACTA 8(2.2) deduction", kind: "money", role: "computed", section: "countries", note: "Derived from the gross federal tax paid and the deduction — neither is itself an AT1 line." },
  { line: "004008001", caption: "Federal non-business foreign tax credit", kind: "money", role: "input", section: "countries", requirement: "mandatory", note: "Must equal federal Schedule 21, line 180." },
  { line: "004012001", caption: "Allowable Credit", kind: "money", role: "computed", section: "countries", note: "Lesser of D (income proration) and G (tax paid less federal credit), both allocation-factor-scaled — see module doc." },
];
