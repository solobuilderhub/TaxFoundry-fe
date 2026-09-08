/**
 * Alberta Scientific Research & Experimental Development Tax Credit (AT1SCH09) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
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
  /** How the form itself says this line is calculated, where it prints the arithmetic. */
  formula?: { expression: string; inputs: readonly string[] };
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

export const AT1_SCHEDULE_9_SECTIONS: readonly PaperSectionDef[] = [
  { id: "expenditures", title: "Eligible Expenditures", description: "The credit is wound down — no expenditures carried out in Alberta on or after 2020-01-01 are eligible." },
  { id: "limit", title: "Expenditure Limit and Credit" },
  { id: "group", title: "Allocation of the Maximum Expenditure Limit", description: "Required whenever line 100 is Yes. Each occurrence, and the group total, capped at $4,000,000 × (line 206 / 365)." },
];

export const AT1_SCHEDULE_9_FIELDS: readonly PaperField[] = [
  { line: "009003001", caption: "Federal amount of total qualified SR&ED expenditures", kind: "money", role: "input", section: "expenditures", requirement: "mandatory", note: "Must equal fed T661 line 559." },
  { line: "009005001", caption: "Portion of line 559 incurred in Alberta", kind: "money", role: "input", section: "expenditures", note: "Must not exceed line 003. Excludes spending on or after 2020-01-01." },
  { line: "009007001", caption: "Deduct: federal prescribed proxy amount included in the Alberta portion", kind: "money", role: "input", section: "expenditures" },
  { line: "009009001", caption: "Add: Alberta proxy amount", kind: "money", role: "input", section: "expenditures" },
  { line: "009011001", caption: "Add: Alberta SR&ED credit that reduced the federal expense in the taxation year", kind: "money", role: "input", section: "expenditures", note: "Calculation deferred by the spec to the Guide to Claiming the Alberta SR&ED Tax Credit." },
  { line: "009015001", caption: "Federal Investment Tax Credit received in the immediately preceding taxation year", kind: "money", role: "input", section: "expenditures", note: "Fed T661 line 435." },
  { line: "009017001", caption: "Total Alberta-eligible expenditures for years in which incurred", kind: "money", role: "input", section: "expenditures" },
  { line: "009019001", caption: "Total federal expenditures for those same years", kind: "money", role: "input", section: "expenditures", note: "Fed T661 line 570." },
  { line: "009023001", caption: "Deduct: Alberta portion of the prior-year federal ITC", kind: "money", role: "computed", section: "expenditures", note: "= 015 × 017 / 019." },
  { line: "009025001", caption: "Add: Alberta portion of any repayment of assistance and contract payments", kind: "money", role: "input", section: "expenditures" },
  { line: "009031001", caption: "Eligible expenditures for Alberta purposes", kind: "money", role: "computed", section: "expenditures", note: "No confirmed formula/caption of its own in the spec — filed alongside 106, same figure. Derived as 005 − 007 + 009 + 011 − 023 + 025 unless overridden." },
  { line: "009040001", caption: "Primary field of science or technology", kind: "code", role: "input", section: "limit", requirement: "mandatory", note: "1-4." },
  { line: "009100001", caption: "Is the corporation associated with one or more corporations for SR&ED purposes?", kind: "flag", role: "input", section: "limit", requirement: "mandatory" },
  { line: "009102001", caption: "Allocated amount from line 240 on page 3", kind: "money", role: "computed", section: "limit", requirement: "conditional", note: "Filed only when line 100 = Yes." },
  { line: "009104001", caption: "Maximum Expenditure Limit", kind: "money", role: "computed", section: "limit", requirement: "conditional", note: "Filed only when line 100 = No. = $4,000,000 × (days in tax year / 365)." },
  { line: "009106001", caption: "Eligible expenditures for Alberta purposes", kind: "money", role: "computed", section: "limit", note: "Must equal line 031." },
  { line: "009108001", caption: "Maximum Expenditure Limit for the year", kind: "money", role: "computed", section: "limit", note: "= line 102 or 104, whichever applies." },
  { line: "009112001", caption: "Recapture on disposal (or deemed disposal) of Alberta SR&ED property", kind: "money", role: "input", section: "limit", requirement: "optional" },
  { line: "009116001", caption: "Less: Alberta portion of prior year federal investment tax credit", kind: "money", role: "input", section: "limit", requirement: "optional", note: "Schedule 9 Supplemental line 428 — only when the taxation year end is on or before 2012-03-31." },
  { line: "009120001", caption: "Net Alberta SR&ED Tax Credit (Repayment)", kind: "money", role: "computed", section: "limit", note: "= (lesser of 031 and 108 × 10%) − 112 − 116. Signed — may be negative. To AT1 page 2 line 081." },
  { line: "009200001", caption: "Alberta CAN of the associated corporation with the longest taxation year", kind: "code", role: "input", section: "group", requirement: "conditional" },
  { line: "009202001", caption: "Taxation Year Beginning", kind: "date", role: "input", section: "group", requirement: "conditional" },
  { line: "009204001", caption: "Taxation Year Ending", kind: "date", role: "input", section: "group", requirement: "conditional" },
  { line: "009206001", caption: "Number of days in the longest year", kind: "text", role: "input", section: "group", requirement: "conditional", note: "Max 365 (366 across a February 29). Spec Type N — not money; matches the same field's kind on schedule29.ts." },
  { line: "009220001", caption: "Name of Corporation", kind: "text", role: "input", section: "group", note: "One occurrence per associated corporation, claimant first." },
  { line: "009230001", caption: "Alberta Corporate Account Number", kind: "code", role: "input", section: "group", requirement: "optional" },
  { line: "009240001", caption: "Allocated Amount", kind: "money", role: "input", section: "group", note: "Capped at $4,000,000 × (line 206 / 365), aggregate across all occurrences." },
];
