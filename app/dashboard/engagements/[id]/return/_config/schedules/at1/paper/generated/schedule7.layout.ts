/**
 * Alberta Royalty Tax Credit/Deduction Supplemental Information (AT1SCH07) — paper Form View layout.
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

export const AT1_SCHEDULE_7_SECTIONS: readonly PaperSectionDef[] = [
  { id: "cpi", title: "Crown Payment Information", description: "Transcribed directly from the income statement (federal form 125) and balance sheet (federal form 100)." },
  { id: "piti", title: "Partnership Income Tax Information", description: "One occurrence per partnership the corporation is a member of." },
  { id: "acra", title: "Adjustments to ACR Reported in the Current Year but Relating to Prior Taxation Years", description: "One occurrence per correction relating to a prior production year but reported this year." },
  { id: "totals", title: "Totals", description: "Both computed — neither has a preparer-entered box. 061 has no defining row anywhere in this schedule's own MAPPINGS block; its formula is transcribed from Schedule 5's own field 005001 definition." },
];

export const AT1_SCHEDULE_7_FIELDS: readonly PaperField[] = [
  { line: "007003001", caption: "Alberta crown royalty eligible for Royalty Tax Credit", kind: "money", role: "input", section: "cpi" },
  { line: "007005001", caption: "Other royalties paid to Alberta not eligible for Royalty Tax Credit", kind: "money", role: "input", section: "cpi" },
  { line: "007007001", caption: "Crown royalty paid to other provincial or federal jurisdictions", kind: "money", role: "input", section: "cpi" },
  { line: "007009001", caption: "Non-deductible crown lease rentals", kind: "money", role: "input", section: "cpi" },
  { line: "007011001", caption: "Mineral taxes", kind: "money", role: "input", section: "cpi" },
  { line: "007013001", caption: "Saskatchewan resources surcharge (non-deductible portion only)", kind: "money", role: "input", section: "cpi" },
  { line: "007014001", caption: "Other non-deductible crown charges — type", kind: "text", role: "input", section: "cpi", requirement: "optional" },
  { line: "007015001", caption: "Other non-deductible crown charges — type", kind: "text", role: "input", section: "cpi", requirement: "optional" },
  { line: "007016001", caption: "Other non-deductible crown charges — type", kind: "text", role: "input", section: "cpi", requirement: "optional" },
  { line: "007017001", caption: "Other non-deductible crown charges — amount", kind: "money", role: "input", section: "cpi", note: "Blank/zero when no type is named at 014-016." },
  { line: "007025001", caption: "Crown lease rentals capitalized during the year on non-producing properties (non-deductible portion)", kind: "money", role: "input", section: "cpi" },
  { line: "007027001", caption: "Other balance sheet eligible deduction — name", kind: "text", role: "input", section: "cpi", requirement: "optional" },
  { line: "007029001", caption: "Other balance sheet eligible deduction — amount", kind: "money", role: "input", section: "cpi", note: "Blank/zero when no name is given at 027." },
  { line: "007071001", caption: "Partnership name", kind: "text", role: "input", section: "piti", requirement: "mandatory" },
  { line: "007073001", caption: "Corporation's percentage interest in partnership", kind: "rate", role: "input", section: "piti", note: "Decimal to 4 places, e.g. .7500 for 75% — not a whole percentage." },
  { line: "007075001", caption: "Partnership fiscal period end", kind: "date", role: "input", section: "piti" },
  { line: "007077001", caption: "Corporation's share of Alberta Crown Royalties eligible for Royalty Tax Credit", kind: "money", role: "input", section: "piti" },
  { line: "007079001", caption: "Corporation's share of other royalties paid to Alberta not eligible for Royalty Tax Credit", kind: "money", role: "input", section: "piti" },
  { line: "007081001", caption: "Corporation's share of other Crown charges eligible for Royalty Tax Deduction", kind: "money", role: "input", section: "piti", note: "Feeds AT1 Schedule 5, not this schedule's own arithmetic." },
  { line: "007083001", caption: "Prior production period the adjustment relates to", kind: "date", role: "input", section: "acra", requirement: "mandatory" },
  { line: "007085001", caption: "Source of Adjustment", kind: "code", role: "input", section: "acra", note: "1 = Department of Resource Development (formerly Energy), 2 = Operator." },
  { line: "007087001", caption: "Amount of increase to eligible crown royalties for that prior year", kind: "money", role: "input", section: "acra" },
  { line: "007089001", caption: "Amount of decrease to eligible crown royalties for that prior year", kind: "money", role: "input", section: "acra" },
  { line: "007091001", caption: "Adjustment to the amount not eligible for the Royalty Tax Credit for that prior year", kind: "money", role: "input", section: "acra" },
  { line: "007051001", caption: "Total Adjustments to current year Alberta Crown Royalty due to adjustments from Prior Production Years", kind: "money", role: "computed", section: "totals", note: "= Σ (087 − 089 + 091)." },
  { line: "007061001", caption: "Crown charges net of reimbursements", kind: "money", role: "computed", section: "totals", note: "No defining row in this schedule's own MAPPINGS block — formula transcribed from Schedule 5's field 005001. Signed; Schedule 5 applies its own floor at zero." },
];
