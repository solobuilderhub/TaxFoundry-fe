/**
 * Alberta capital cost allowance (AT1SCH13) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/field-maps/at1-schedule-13-cca.md, retrieved 2026-08-07.
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
  footnoteMarks?: readonly number[];
}

export interface PaperSectionDef {
  id: string;
  title: string;
  description?: string;
}

export const AT1_SCHEDULE_13_SECTIONS: readonly PaperSectionDef[] = [
  { id: "grid", title: "Alberta capital cost allowance by class", description: "One row per class. Twenty-four columns, of which nineteen carry a line number; the rest are arithmetic the form shows on the way." },
  { id: "totals", title: "Totals carried to Schedule 12", description: "Three figures on two different sides of the Alberta reconciliation — recapture is income, the other two are deductions." },
];

export const AT1_SCHEDULE_13_FIELDS: readonly PaperField[] = [
  { line: "013001001", caption: "Class number", kind: "code", role: "input", section: "grid", note: "Chosen from a list, not free text." },
  { line: "013003001", caption: "UCC at the beginning of the year", kind: "money", role: "input", section: "grid", note: "Must equal the closing balance from last year's CCA schedule." },
  { line: "013005001", caption: "Cost of acquisitions during the year", kind: "money", role: "carried-in", section: "grid", note: "New property must be available for use.", from: { form: "T2SCH8", line: "203", note: "Cost of acquisitions during the year." } },
  { line: "013007001", caption: "Net adjustments", kind: "money", role: "carried-in", section: "grid", note: "SIGNED — negative amounts are shown in brackets.", from: { form: "T2SCH8", line: "205", note: "Adjustments and transfers." } },
  { line: "013009001", caption: "Proceeds of dispositions", kind: "money", role: "carried-in", section: "grid", note: "Not to exceed the capital cost.", from: { form: "T2SCH8", line: "207", note: "Proceeds of dispositions." } },
  { line: "013013001", caption: "CCA rate", kind: "rate", role: "computed", section: "grid", note: "Reported as NA for classes with no fixed rate, such as 13 and 14." },
  { line: "013015001", caption: "Recapture of capital cost allowance", kind: "money", role: "computed", section: "grid" },
  { line: "013017001", caption: "Terminal loss", kind: "money", role: "computed", section: "grid" },
  { line: "013019001", caption: "Capital cost allowance", kind: "money", role: "input", section: "grid", note: "Declining balance, or a lower amount — the claim is optional." },
  { line: "013021001", caption: "UCC at the end of the year", kind: "money", role: "computed", section: "grid" },
  { line: "013023001", caption: "Total recapture of capital cost allowance", kind: "money", role: "total", section: "totals", note: "Recapture is INCOME on Schedule 12 — the opposite sign to the allowance.", to: { form: "AT1SCH12", line: "012006001" } },
  { line: "013025001", caption: "Total terminal loss", kind: "money", role: "total", section: "totals", note: "A deduction.", to: { form: "AT1SCH12", line: "012008001" } },
  { line: "013027001", caption: "Total capital cost allowance", kind: "money", role: "total", section: "totals", note: "Schedule 12 line 004 is the sum of every occurrence of 013019. The form footer lists 006, 008 and 004 out of order, and filing positionally puts the allowance on the recapture line.", to: { form: "AT1SCH12", line: "012004001" } },
  { line: "013029001", caption: "Of which AIIP or property in classes 54 to 56", kind: "money", role: "carried-in", section: "grid", from: { form: "T2SCH8", line: "225", note: "Accelerated investment incentive property (AIIP)." } },
  { line: "013031001", caption: "Assistance received or receivable, subsequent to disposition", kind: "money", role: "input", section: "grid" },
  { line: "013033001", caption: "Assistance repaid, subsequent to disposition", kind: "money", role: "input", section: "grid" },
  { line: "013035001", caption: "UCC adjustment for AIIP", kind: "money", role: "computed", section: "grid", note: "The accelerated uplift — a different factor from the half-year rule below." },
  { line: "013037001", caption: "UCC adjustment for property other than AIIP", kind: "money", role: "computed", section: "grid", note: "The half-year rule: half of net additions is held out of this year’s base." },
  { line: "013039001", caption: "Of which designated immediate expensing property (DIEP)", kind: "money", role: "carried-in", section: "grid", note: "A subset of column 3, not an addition to it.", from: { form: "T2SCH8", line: "", note: "The DIEP-eligible amount — no override path is wired; always federal." } },
  { line: "013041001", caption: "Proceeds of dispositions of the DIEP", kind: "money", role: "input", section: "grid" },
  { line: "013043001", caption: "UCC of the DIEP", kind: "money", role: "input", section: "grid" },
  { line: "013045001", caption: "Immediate expensing", kind: "money", role: "computed", section: "grid" },
  { line: "013125001", caption: "Immediate expensing limit", kind: "money", role: "input", section: "grid", note: "Per RETURN, not per class. Relevant only where associated with other eligible persons or partnerships." },
];

export const AT1_SCHEDULE_13_FOOTNOTES: readonly string[] = [
  "This schedule is required if the opening UCC or the CCA claimed for Alberta purposes for any class of assets differs from that for federal purposes.",
  "All federal notes listed on the T2 Schedule 8 — Capital Cost Allowance — also apply for Alberta purposes.",
];

export interface Schedule13GridColumn {
  column: number;
  line: string;
  caption: string;
  kind: PaperFieldKind;
  note?: string;
}

export const AT1_SCHEDULE_13_GRID_COLUMNS: readonly Schedule13GridColumn[] = [
  { column: 1, line: "013001001", caption: "Class number", kind: "code", note: "Chosen from a list, not free text." },
  { column: 2, line: "013003001", caption: "UCC at the beginning of the year", kind: "money", note: "Must equal the closing balance from last year's CCA schedule." },
  { column: 3, line: "013005001", caption: "Cost of acquisitions during the year", kind: "money", note: "New property must be available for use." },
  { column: 4, line: "013039001", caption: "Of which designated immediate expensing property (DIEP)", kind: "money", note: "A subset of column 3, not an addition to it." },
  { column: 5, line: "013007001", caption: "Net adjustments", kind: "money", note: "SIGNED — negative amounts are shown in brackets." },
  { column: 6, line: "013031001", caption: "Assistance received or receivable, subsequent to disposition", kind: "money" },
  { column: 7, line: "013033001", caption: "Assistance repaid, subsequent to disposition", kind: "money" },
  { column: 8, line: "013009001", caption: "Proceeds of dispositions", kind: "money", note: "Not to exceed the capital cost." },
  { column: 9, line: "013041001", caption: "Proceeds of dispositions of the DIEP", kind: "money" },
  { column: 11, line: "013043001", caption: "UCC of the DIEP", kind: "money" },
  { column: 12, line: "013045001", caption: "Immediate expensing", kind: "money" },
  { column: 14, line: "013029001", caption: "Of which AIIP or property in classes 54 to 56", kind: "money" },
  { column: 18, line: "013035001", caption: "UCC adjustment for AIIP", kind: "money", note: "The accelerated uplift — a different factor from the half-year rule below." },
  { column: 19, line: "013037001", caption: "UCC adjustment for property other than AIIP", kind: "money", note: "The half-year rule: half of net additions is held out of this year’s base." },
  { column: 20, line: "013013001", caption: "CCA rate", kind: "rate", note: "Reported as NA for classes with no fixed rate, such as 13 and 14." },
  { column: 21, line: "013015001", caption: "Recapture of capital cost allowance", kind: "money" },
  { column: 22, line: "013017001", caption: "Terminal loss", kind: "money" },
  { column: 23, line: "013019001", caption: "Capital cost allowance", kind: "money", note: "Declining balance, or a lower amount — the claim is optional." },
  { column: 24, line: "013021001", caption: "UCC at the end of the year", kind: "money" },
];
