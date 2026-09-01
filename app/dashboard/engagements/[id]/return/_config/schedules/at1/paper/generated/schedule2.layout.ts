/**
 * Alberta Income Allocation Factor (AT1SCH2) — paper Form View layout.
 *
 * GENERATED from the form definition in @classytic/ca-tax:
 *   npx tsx packages/ca-tax/scripts/emit-ui-schedule.ts
 *
 * Ultimately from research/sources/tra-forms/pdf/AT1SCH02-income-allocation-factor-TRA11724.pdf, retrieved 2026-08-30.
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

export const AT1_SCHEDULE_2_SECTIONS: readonly PaperSectionDef[] = [
  { id: "general", title: "Area A — General Allocation Formula (ITA Reg 402)", description: "The common case: taken straight from the federal Schedule 5. Area B's seven industry-specific formulas (insurance, banking, airlines, railways, ship operators, trust & loan, divided businesses) are not modelled — see this module's doc comment." },
];

export const AT1_SCHEDULE_2_FIELDS: readonly PaperField[] = [
  { line: "002002001", caption: "Salaries and wages paid in Alberta", kind: "money", role: "carried-in", section: "general", requirement: "mandatory", from: { form: "T2SCH5", line: "", note: "The Alberta row of the federal establishments allocation." } },
  { line: "002004001", caption: "Total salaries and wages paid in all jurisdictions", kind: "money", role: "carried-in", section: "general", requirement: "mandatory", from: { form: "T2SCH5", line: "", note: "Every jurisdiction's row, summed." } },
  { line: "002006001", caption: "Gross revenue in Alberta", kind: "money", role: "carried-in", section: "general", requirement: "mandatory", from: { form: "T2SCH5", line: "", note: "The Alberta row of the federal establishments allocation." } },
  { line: "002008001", caption: "Gross revenue in all jurisdictions", kind: "money", role: "carried-in", section: "general", requirement: "mandatory", from: { form: "T2SCH5", line: "", note: "Every jurisdiction's row, summed." } },
];

export const AT1_SCHEDULE_2_FOOTNOTES: readonly string[] = [
  "For corporations with taxable income that is in part allocable to permanent establishments outside Alberta.",
  "Non-resident corporations (ITA Regulation 413): salaries and wages paid in all jurisdictions does not include amounts paid to employees of a permanent establishment outside Canada; gross revenue in all jurisdictions does not include revenue reasonably attributable to a permanent establishment outside Canada.",
  "If either amount B or D is nil, do not multiply by 1/2.",
];
