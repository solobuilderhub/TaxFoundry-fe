/**
 * Current-year loss and continuity of losses (AT1SCH21) — paper Form View layout.
 *
 * GENERATED from the form definition in @classytic/ca-tax:
 *   npx tsx packages/ca-tax/scripts/emit-ui-schedule.ts
 *
 * Ultimately from research/field-maps/at1-schedules-12-21.md, retrieved 2026-08-08.
 *
 * Not modelled: page 5 (Restricted Interest and Financing Expenses
 * continuity, lines 200-350) and the limited-partnership-loss table are not
 * in AT1_SCHEDULE_21 either — see that module's own doc comment.
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

export const AT1_SCHEDULE_21_SECTIONS: readonly PaperSectionDef[] = [
  { id: "current-year", title: "Part 1 — Calculating the current-year non-capital loss", description: "Starts from Alberta net income on Schedule 12 line 054 and works down through the Division C deductions to the loss for the year." },
  { id: "continuity", title: "Part 2 — Continuity of losses", description: "Five pools, each a full continuity. Every closing balance carries to a specific Alberta loss line on Schedule 12." },
];

export const AT1_SCHEDULE_21_FIELDS: readonly PaperField[] = [
  { line: "021001001", caption: "Net income (loss) for Alberta purposes", kind: "money", role: "carried-in", section: "current-year", requirement: "mandatory", from: { form: "AT1SCH12", line: "012054001", note: "Alberta net income" } },
  { line: "021002001", caption: "Restricted interest and financing expenses deducted under ITA paragraph 111(1)(a.1)", kind: "money", role: "input", section: "current-year" },
  { line: "021003001", caption: "Net capital losses deducted in the year", kind: "money", role: "input", section: "current-year" },
  { line: "021005001", caption: "Taxable dividends deductible", kind: "money", role: "input", section: "current-year" },
  { line: "021007001", caption: "Part VI.1 tax deductible", kind: "money", role: "input", section: "current-year" },
  { line: "021011001", caption: "Prospector's and grubstaker's shares", kind: "money", role: "input", section: "current-year" },
  { line: "021012001", caption: "Employer deduction for non-qualified securities under ITA paragraph 110(1)(e)", kind: "money", role: "input", section: "current-year" },
  { line: "021013001", caption: "Subtotal of lines 003 to 011", kind: "money", role: "total", section: "current-year" },
  { line: "021015001", caption: "Line 001 minus line 013", kind: "money", role: "computed", section: "current-year" },
  { line: "021017001", caption: "Additions under ITA section 110.5 or subparagraph 115(1)(a)(vii) for foreign tax credits", kind: "money", role: "input", section: "current-year" },
  { line: "021019001", caption: "Current-year farm loss", kind: "money", role: "input", section: "current-year" },
  { line: "021021001", caption: "Non-capital loss for the current year", kind: "money", role: "computed", section: "current-year", note: "Line 015 minus line 017 plus line 019." },
  { line: "021031001", caption: "Non-capital losses — Carried forward from the preceding year", kind: "money", role: "input", section: "continuity" },
  { line: "021032001", caption: "Non-capital losses — Losses expired", kind: "money", role: "input", section: "continuity" },
  { line: "021033001", caption: "Non-capital losses — Balance at the beginning of the taxation year", kind: "money", role: "input", section: "continuity" },
  { line: "021035001", caption: "Non-capital losses — Transfer on a wind-up or amalgamation", kind: "money", role: "input", section: "continuity" },
  { line: "021037001", caption: "Non-capital losses — Current-year loss", kind: "money", role: "input", section: "continuity" },
  { line: "021041001", caption: "Non-capital losses — Applied against income", kind: "money", role: "input", section: "continuity" },
  { line: "021043001", caption: "Non-capital losses — Adjustment under ITA section 80", kind: "money", role: "input", section: "continuity" },
  { line: "021045001", caption: "Non-capital losses — Other adjustments", kind: "money", role: "input", section: "continuity" },
  { line: "021047001", caption: "Non-capital losses — Total carried back to prior years", kind: "money", role: "input", section: "continuity", note: "A carry-back also requires Schedule 10 to be completed." },
  { line: "021049001", caption: "Non-capital losses — Closing balance", kind: "money", role: "computed", section: "continuity" },
  { line: "021051001", caption: "Net capital losses — Carried forward from the preceding year", kind: "money", role: "input", section: "continuity" },
  { line: "021055001", caption: "Net capital losses — Transfer on a wind-up or amalgamation", kind: "money", role: "input", section: "continuity" },
  { line: "021057001", caption: "Net capital losses — Current-year loss", kind: "money", role: "input", section: "continuity" },
  { line: "021061001", caption: "Net capital losses — Applied against income", kind: "money", role: "input", section: "continuity" },
  { line: "021063001", caption: "Net capital losses — Adjustment under ITA section 80", kind: "money", role: "input", section: "continuity" },
  { line: "021065001", caption: "Net capital losses — Other adjustments", kind: "money", role: "input", section: "continuity" },
  { line: "021067001", caption: "Net capital losses — Total carried back to prior years", kind: "money", role: "input", section: "continuity", note: "A carry-back also requires Schedule 10 to be completed." },
  { line: "021069001", caption: "Net capital losses — Closing balance", kind: "money", role: "computed", section: "continuity" },
  { line: "021071001", caption: "Farm losses — Carried forward from the preceding year", kind: "money", role: "input", section: "continuity" },
  { line: "021072001", caption: "Farm losses — Losses expired", kind: "money", role: "input", section: "continuity" },
  { line: "021073001", caption: "Farm losses — Balance at the beginning of the taxation year", kind: "money", role: "input", section: "continuity" },
  { line: "021075001", caption: "Farm losses — Transfer on a wind-up or amalgamation", kind: "money", role: "input", section: "continuity" },
  { line: "021077001", caption: "Farm losses — Current-year loss", kind: "money", role: "input", section: "continuity" },
  { line: "021079001", caption: "Farm losses — Applied against income", kind: "money", role: "input", section: "continuity" },
  { line: "021081001", caption: "Farm losses — Adjustment under ITA section 80", kind: "money", role: "input", section: "continuity" },
  { line: "021083001", caption: "Farm losses — Other adjustments", kind: "money", role: "input", section: "continuity" },
  { line: "021085001", caption: "Farm losses — Total carried back to prior years", kind: "money", role: "input", section: "continuity", note: "A carry-back also requires Schedule 10 to be completed." },
  { line: "021087001", caption: "Farm losses — Closing balance", kind: "money", role: "computed", section: "continuity" },
  { line: "021091001", caption: "Restricted farm losses — Carried forward from the preceding year", kind: "money", role: "input", section: "continuity" },
  { line: "021092001", caption: "Restricted farm losses — Losses expired", kind: "money", role: "input", section: "continuity" },
  { line: "021093001", caption: "Restricted farm losses — Balance at the beginning of the taxation year", kind: "money", role: "input", section: "continuity" },
  { line: "021095001", caption: "Restricted farm losses — Transfer on a wind-up or amalgamation", kind: "money", role: "input", section: "continuity" },
  { line: "021097001", caption: "Restricted farm losses — Current-year loss", kind: "money", role: "input", section: "continuity" },
  { line: "021101001", caption: "Restricted farm losses — Adjustment under ITA section 80", kind: "money", role: "input", section: "continuity" },
  { line: "021103001", caption: "Restricted farm losses — Other adjustments", kind: "money", role: "input", section: "continuity" },
  { line: "021105001", caption: "Restricted farm losses — Total carried back to prior years", kind: "money", role: "input", section: "continuity", note: "A carry-back also requires Schedule 10 to be completed." },
  { line: "021107001", caption: "Restricted farm losses — Closing balance", kind: "money", role: "computed", section: "continuity" },
  { line: "021111001", caption: "Listed personal property losses — Carried forward from the preceding year", kind: "money", role: "input", section: "continuity" },
  { line: "021113001", caption: "Listed personal property losses — Losses expired", kind: "money", role: "input", section: "continuity" },
  { line: "021115001", caption: "Listed personal property losses — Balance at the beginning of the taxation year", kind: "money", role: "input", section: "continuity" },
  { line: "021117001", caption: "Listed personal property losses — Current-year loss", kind: "money", role: "input", section: "continuity" },
  { line: "021119001", caption: "Listed personal property losses — Applied against income", kind: "money", role: "input", section: "continuity" },
  { line: "021121001", caption: "Listed personal property losses — Other adjustments", kind: "money", role: "input", section: "continuity" },
  { line: "021123001", caption: "Listed personal property losses — Total carried back to prior years", kind: "money", role: "input", section: "continuity", note: "A carry-back also requires Schedule 10 to be completed." },
  { line: "021125001", caption: "Listed personal property losses — Closing balance", kind: "money", role: "computed", section: "continuity" },
];

export interface Schedule21PoolRow {
  kind: string;
  caption: string;
  line: string;
  role: PaperFieldRole;
}

export interface Schedule21Pool {
  key: string;
  label: string;
  toSchedule12?: string;
  rows: readonly Schedule21PoolRow[];
}

export const AT1_SCHEDULE_21_POOL_TABLE: readonly Schedule21Pool[] = [
  {
    key: "non-capital",
    label: "Non-capital losses",
    toSchedule12: "012064001",
    rows: [
      { kind: "carriedForward", caption: "Carried forward from the preceding year", line: "021031001", role: "input" },
      { kind: "expired", caption: "Losses expired", line: "021032001", role: "input" },
      { kind: "opening", caption: "Balance at the beginning of the taxation year", line: "021033001", role: "input" },
      { kind: "windUpTransfer", caption: "Transfer on a wind-up or amalgamation", line: "021035001", role: "input" },
      { kind: "currentYearLoss", caption: "Current-year loss", line: "021037001", role: "input" },
      { kind: "appliedAgainstIncome", caption: "Applied against income", line: "021041001", role: "input" },
      { kind: "section80Adjustment", caption: "Adjustment under ITA section 80", line: "021043001", role: "input" },
      { kind: "otherAdjustments", caption: "Other adjustments", line: "021045001", role: "input" },
      { kind: "carryBack", caption: "Total carried back to prior years", line: "021047001", role: "input" },
      { kind: "closing", caption: "Closing balance", line: "021049001", role: "computed" },
    ],
  },
  {
    key: "capital",
    label: "Net capital losses",
    toSchedule12: "012066001",
    rows: [
      { kind: "carriedForward", caption: "Carried forward from the preceding year", line: "021051001", role: "input" },
      { kind: "windUpTransfer", caption: "Transfer on a wind-up or amalgamation", line: "021055001", role: "input" },
      { kind: "currentYearLoss", caption: "Current-year loss", line: "021057001", role: "input" },
      { kind: "appliedAgainstIncome", caption: "Applied against income", line: "021061001", role: "input" },
      { kind: "section80Adjustment", caption: "Adjustment under ITA section 80", line: "021063001", role: "input" },
      { kind: "otherAdjustments", caption: "Other adjustments", line: "021065001", role: "input" },
      { kind: "carryBack", caption: "Total carried back to prior years", line: "021067001", role: "input" },
      { kind: "closing", caption: "Closing balance", line: "021069001", role: "computed" },
    ],
  },
  {
    key: "farm",
    label: "Farm losses",
    toSchedule12: "012070001",
    rows: [
      { kind: "carriedForward", caption: "Carried forward from the preceding year", line: "021071001", role: "input" },
      { kind: "expired", caption: "Losses expired", line: "021072001", role: "input" },
      { kind: "opening", caption: "Balance at the beginning of the taxation year", line: "021073001", role: "input" },
      { kind: "windUpTransfer", caption: "Transfer on a wind-up or amalgamation", line: "021075001", role: "input" },
      { kind: "currentYearLoss", caption: "Current-year loss", line: "021077001", role: "input" },
      { kind: "appliedAgainstIncome", caption: "Applied against income", line: "021079001", role: "input" },
      { kind: "section80Adjustment", caption: "Adjustment under ITA section 80", line: "021081001", role: "input" },
      { kind: "otherAdjustments", caption: "Other adjustments", line: "021083001", role: "input" },
      { kind: "carryBack", caption: "Total carried back to prior years", line: "021085001", role: "input" },
      { kind: "closing", caption: "Closing balance", line: "021087001", role: "computed" },
    ],
  },
  {
    key: "restricted-farm",
    label: "Restricted farm losses",
    toSchedule12: "012068001",
    rows: [
      { kind: "carriedForward", caption: "Carried forward from the preceding year", line: "021091001", role: "input" },
      { kind: "expired", caption: "Losses expired", line: "021092001", role: "input" },
      { kind: "opening", caption: "Balance at the beginning of the taxation year", line: "021093001", role: "input" },
      { kind: "windUpTransfer", caption: "Transfer on a wind-up or amalgamation", line: "021095001", role: "input" },
      { kind: "currentYearLoss", caption: "Current-year loss", line: "021097001", role: "input" },
      { kind: "section80Adjustment", caption: "Adjustment under ITA section 80", line: "021101001", role: "input" },
      { kind: "otherAdjustments", caption: "Other adjustments", line: "021103001", role: "input" },
      { kind: "carryBack", caption: "Total carried back to prior years", line: "021105001", role: "input" },
      { kind: "closing", caption: "Closing balance", line: "021107001", role: "computed" },
    ],
  },
  {
    key: "listed-personal",
    label: "Listed personal property losses",
    rows: [
      { kind: "carriedForward", caption: "Carried forward from the preceding year", line: "021111001", role: "input" },
      { kind: "expired", caption: "Losses expired", line: "021113001", role: "input" },
      { kind: "opening", caption: "Balance at the beginning of the taxation year", line: "021115001", role: "input" },
      { kind: "currentYearLoss", caption: "Current-year loss", line: "021117001", role: "input" },
      { kind: "appliedAgainstIncome", caption: "Applied against income", line: "021119001", role: "input" },
      { kind: "otherAdjustments", caption: "Other adjustments", line: "021121001", role: "input" },
      { kind: "carryBack", caption: "Total carried back to prior years", line: "021123001", role: "input" },
      { kind: "closing", caption: "Closing balance", line: "021125001", role: "computed" },
    ],
  },
];
