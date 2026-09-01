/**
 * Alberta Other Tax Deductions and Credits (AT1SCH03) — paper Form View layout.
 *
 * GENERATED from the form definition in @classytic/ca-tax:
 *   npx tsx packages/ca-tax/scripts/emit-ui-schedule.ts
 *
 * Ultimately from research/sources/tra-forms/pdf/AT1SCH03-other-tax-deductions-credits-TRA11725.pdf, retrieved 2026-09-01.
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

export const AT1_SCHEDULE_3_SECTIONS: readonly PaperSectionDef[] = [
  { id: "itc", title: "Investor Tax Credit (ITC)" },
  { id: "citc", title: "Capital Investment Tax Credit (CITC)" },
  { id: "apitc", title: "Agri-Processing Investment Tax Credit (APITC)", description: "Per-vintage caps: 20% current year, 30% 1st preceding, 50% 2nd preceding, uncapped 3rd-10th." },
  { id: "mad", title: "Maximum Allowable Deduction (MAD)", description: "The shared ceiling across all three credits — ITC has first call on it." },
];

export const AT1_SCHEDULE_3_FIELDS: readonly PaperField[] = [
  { line: "003100001", caption: "ITC — total on certificates issued during the year", kind: "money", role: "input", section: "itc" },
  { line: "003102001", caption: "ITC — carried forward from prior year(s)", kind: "money", role: "input", section: "itc", note: "= prior year’s line 108." },
  { line: "003104001", caption: "ITC — amount applied to the current taxation year", kind: "money", role: "input", section: "itc", note: "Blank claims the maximum the shared room (604) and the pool (100+102) both allow." },
  { line: "003106001", caption: "ITC — expired during the year", kind: "money", role: "input", section: "itc" },
  { line: "003108001", caption: "ITC — carried forward to next year", kind: "money", role: "computed", section: "itc", note: "= 100 + 102 − 104 − 106." },
  { line: "003200001", caption: "CITC — total on certificates issued during the year", kind: "money", role: "input", section: "citc" },
  { line: "003202001", caption: "CITC — carried forward from prior year(s)", kind: "money", role: "input", section: "citc", note: "= prior year’s line 208." },
  { line: "003204001", caption: "CITC — amount applied to the current taxation year", kind: "money", role: "input", section: "citc", note: "Forced to nil while ITC (line 108) still has an unused carryforward balance." },
  { line: "003206001", caption: "CITC — expired during the year", kind: "money", role: "input", section: "citc" },
  { line: "003208001", caption: "CITC — carried forward to next year", kind: "money", role: "computed", section: "citc", note: "= 200 + 202 − 204 − 206." },
  { line: "003300001", caption: "APITC — total received on certificates issued this year", kind: "money", role: "input", section: "apitc" },
  { line: "003302001", caption: "APITC — carried forward from prior year(s), all vintages", kind: "money", role: "input", section: "apitc" },
  { line: "003304001", caption: "APITC — applied, current year (≤20%)", kind: "money", role: "input", section: "apitc" },
  { line: "003306001", caption: "APITC — applied, 1st preceding taxation year (≤30%)", kind: "money", role: "input", section: "apitc" },
  { line: "003308001", caption: "APITC — applied, 2nd preceding taxation year (≤50%)", kind: "money", role: "input", section: "apitc" },
  { line: "003310001", caption: "APITC — applied, 3rd-10th preceding taxation years (uncapped)", kind: "money", role: "input", section: "apitc" },
  { line: "003312001", caption: "APITC — total applied, after shared-room allocation", kind: "money", role: "computed", section: "apitc", note: "= 304 + 306 + 308 + 310." },
  { line: "003314001", caption: "APITC — expired during the year", kind: "money", role: "input", section: "apitc" },
  { line: "003316001", caption: "APITC — available for carryforward", kind: "money", role: "computed", section: "apitc", note: "= 300 + 302 − 312 − 314." },
  { line: "003600001", caption: "MAD — total credits applied (104 + 204 + 312)", kind: "money", role: "computed", section: "mad" },
  { line: "003602001", caption: "MAD — room (AT1 jacket line 068 minus lines 070+071+072+074)", kind: "money", role: "computed", section: "mad" },
  { line: "003604001", caption: "MAD — maximum allowable deduction for the year", kind: "money", role: "computed", section: "mad", note: "Lesser of line 600 and the room at line 602 (AT1 jacket line 068 minus lines 070+071+072+074); floored at nil.", to: { form: "AT1", line: "000076001", note: "Printed on the form: \"Enter this amount on AT1 page 2, line 076.\"" } },
];

export const AT1_SCHEDULE_3_FOOTNOTES: readonly string[] = [
  "In order to be eligible for any deduction on this schedule, the corporation must have Investor Tax Credit Certificates, Capital Investment Tax Credit Certificates, or an Agri-processing Investment Tax Credit Certificate issued by the appropriate ministry.",
  "Capital Investment Tax Credit: the Investor Tax Credit must be fully utilized, including any carry-forward amounts, before the Capital Investment Tax Credit can be claimed.",
];
