/**
 * Alberta income/loss reconciliation (AT1SCH12) — paper Form View layout.
 *
 * GENERATED from the form definition in @classytic/ca-tax:
 *   npx tsx packages/ca-tax/scripts/emit-ui-schedule.ts
 *
 * Ultimately from research/field-maps/at1-schedules-12-21.md, retrieved 2026-08-08.
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

export const AT1_SCHEDULE_12_SECTIONS: readonly PaperSectionDef[] = [
  { id: "area-a", title: "Area A — net income for Alberta corporate income tax purposes", description: "Reconciling items between federal and Alberta net income. Report a pair only where the two figures differ." },
  { id: "area-b", title: "Area B — taxable income for Alberta purposes", description: "The Division C deductions, on the same federal/Alberta pairing. The loss lines are where Schedule 21 delivers its continuity figures." },
];

export const AT1_SCHEDULE_12_FIELDS: readonly PaperField[] = [
  { line: "012002001", caption: "Net income (loss) for federal purposes", kind: "money", role: "carried-in", section: "area-a", requirement: "mandatory", from: { form: "T2SCH1", line: "300", note: "Line 300 of the T2 jacket" } },
  { line: "012004001", caption: "Capital cost allowance — Alberta", kind: "money", role: "input", section: "area-a", requirement: "conditional", note: "Report only if it differs from the federal figure at 012005001." },
  { line: "012005001", caption: "Capital cost allowance — federal", kind: "money", role: "input", section: "area-a", requirement: "conditional", note: "Report only if it differs from the Alberta figure at 012004001." },
  { line: "012006001", caption: "Recapture of capital cost allowance — Alberta", kind: "money", role: "input", section: "area-a", requirement: "conditional", note: "Report only if it differs from the federal figure at 012007001." },
  { line: "012007001", caption: "Recapture of capital cost allowance — federal", kind: "money", role: "input", section: "area-a", requirement: "conditional", note: "Report only if it differs from the Alberta figure at 012006001." },
  { line: "012008001", caption: "Terminal loss — Alberta", kind: "money", role: "input", section: "area-a", requirement: "conditional", note: "Report only if it differs from the federal figure at 012009001." },
  { line: "012009001", caption: "Terminal loss — federal", kind: "money", role: "input", section: "area-a", requirement: "conditional", note: "Report only if it differs from the Alberta figure at 012008001." },
  { line: "012014001", caption: "Farming inventory — mandatory adjustment, current year — Alberta", kind: "money", role: "input", section: "area-a", requirement: "conditional", note: "Report only if it differs from the federal figure at 012015001." },
  { line: "012015001", caption: "Farming inventory — mandatory adjustment, current year — federal", kind: "money", role: "input", section: "area-a", requirement: "conditional", note: "Report only if it differs from the Alberta figure at 012014001." },
  { line: "012016001", caption: "Farming inventory — mandatory adjustment, prior year — Alberta", kind: "money", role: "input", section: "area-a", requirement: "conditional", note: "Report only if it differs from the federal figure at 012017001." },
  { line: "012017001", caption: "Farming inventory — mandatory adjustment, prior year — federal", kind: "money", role: "input", section: "area-a", requirement: "conditional", note: "Report only if it differs from the Alberta figure at 012016001." },
  { line: "012018001", caption: "Farming inventory — optional value, current year — Alberta", kind: "money", role: "input", section: "area-a", requirement: "conditional", note: "Report only if it differs from the federal figure at 012019001." },
  { line: "012019001", caption: "Farming inventory — optional value, current year — federal", kind: "money", role: "input", section: "area-a", requirement: "conditional", note: "Report only if it differs from the Alberta figure at 012018001." },
  { line: "012020001", caption: "Farming inventory — optional value, prior year — Alberta", kind: "money", role: "input", section: "area-a", requirement: "conditional", note: "Report only if it differs from the federal figure at 012021001." },
  { line: "012021001", caption: "Farming inventory — optional value, prior year — federal", kind: "money", role: "input", section: "area-a", requirement: "conditional", note: "Report only if it differs from the Alberta figure at 012020001." },
  { line: "012022001", caption: "Depletion — Alberta", kind: "money", role: "input", section: "area-a", requirement: "conditional", note: "Report only if it differs from the federal figure at 012023001." },
  { line: "012023001", caption: "Depletion — federal", kind: "money", role: "input", section: "area-a", requirement: "conditional", note: "Report only if it differs from the Alberta figure at 012022001." },
  { line: "012026001", caption: "Canadian exploration expenses — Alberta", kind: "money", role: "input", section: "area-a", requirement: "conditional", note: "Report only if it differs from the federal figure at 012027001." },
  { line: "012027001", caption: "Canadian exploration expenses — federal", kind: "money", role: "input", section: "area-a", requirement: "conditional", note: "Report only if it differs from the Alberta figure at 012026001." },
  { line: "012028001", caption: "Canadian development expenses — Alberta", kind: "money", role: "input", section: "area-a", requirement: "conditional", note: "Report only if it differs from the federal figure at 012029001." },
  { line: "012029001", caption: "Canadian development expenses — federal", kind: "money", role: "input", section: "area-a", requirement: "conditional", note: "Report only if it differs from the Alberta figure at 012028001." },
  { line: "012030001", caption: "Foreign exploration and development expenses — Alberta", kind: "money", role: "input", section: "area-a", requirement: "conditional", note: "Report only if it differs from the federal figure at 012031001." },
  { line: "012031001", caption: "Foreign exploration and development expenses — federal", kind: "money", role: "input", section: "area-a", requirement: "conditional", note: "Report only if it differs from the Alberta figure at 012030001." },
  { line: "012032001", caption: "Canadian oil and gas property expenses — Alberta", kind: "money", role: "input", section: "area-a", requirement: "conditional", note: "Report only if it differs from the federal figure at 012033001." },
  { line: "012033001", caption: "Canadian oil and gas property expenses — federal", kind: "money", role: "input", section: "area-a", requirement: "conditional", note: "Report only if it differs from the Alberta figure at 012032001." },
  { line: "012034001", caption: "Scientific research expenses claimed in year — Alberta", kind: "money", role: "input", section: "area-a", requirement: "conditional", note: "Report only if it differs from the federal figure at 012035001." },
  { line: "012035001", caption: "Scientific research expenses claimed in year — federal", kind: "money", role: "input", section: "area-a", requirement: "conditional", note: "Report only if it differs from the Alberta figure at 012034001." },
  { line: "012036001", caption: "Tax reserves deducted in prior year — Alberta", kind: "money", role: "input", section: "area-a", requirement: "conditional", note: "Report only if it differs from the federal figure at 012037001." },
  { line: "012037001", caption: "Tax reserves deducted in prior year — federal", kind: "money", role: "input", section: "area-a", requirement: "conditional", note: "Report only if it differs from the Alberta figure at 012036001." },
  { line: "012038001", caption: "Tax reserves claimed in current year — Alberta", kind: "money", role: "input", section: "area-a", requirement: "conditional", note: "Report only if it differs from the federal figure at 012039001." },
  { line: "012039001", caption: "Tax reserves claimed in current year — federal", kind: "money", role: "input", section: "area-a", requirement: "conditional", note: "Report only if it differs from the Alberta figure at 012038001." },
  { line: "012040001", caption: "Other — attach supporting schedule — Alberta", kind: "money", role: "input", section: "area-a", requirement: "conditional", note: "Report only if it differs from the federal figure at 012041001. Line 048 explanation is required when this is used." },
  { line: "012041001", caption: "Other — attach supporting schedule — federal", kind: "money", role: "input", section: "area-a", requirement: "conditional", note: "Report only if it differs from the Alberta figure at 012040001. Line 048 explanation is required when this is used." },
  { line: "012042001", caption: "Capital tax liability in other provinces", kind: "money", role: "input", section: "area-a" },
  { line: "012048001", caption: "Explanation of other reconciling items", kind: "text", role: "input", section: "area-a", requirement: "conditional", note: "Required when line 040/041 is used." },
  { line: "012050001", caption: "Subtotal — federal column", kind: "money", role: "total", section: "area-a" },
  { line: "012052001", caption: "Subtotal — Alberta column", kind: "money", role: "total", section: "area-a" },
  { line: "012054001", caption: "Net income (loss) for Alberta purposes", kind: "money", role: "computed", section: "area-a", requirement: "mandatory", note: "Line 002 minus line 050 plus line 052." },
  { line: "012056001", caption: "Charitable donations — Alberta", kind: "money", role: "input", section: "area-b", requirement: "conditional", note: "Report only if it differs from the federal figure at 012057001." },
  { line: "012057001", caption: "Charitable donations — federal", kind: "money", role: "input", section: "area-b", requirement: "conditional", note: "Report only if it differs from the Alberta figure at 012056001." },
  { line: "012058001", caption: "Gifts to Canada or a province, cultural and ecological gifts — Alberta", kind: "money", role: "input", section: "area-b", requirement: "conditional", note: "Report only if it differs from the federal figure at 012059001." },
  { line: "012059001", caption: "Gifts to Canada or a province, cultural and ecological gifts — federal", kind: "money", role: "input", section: "area-b", requirement: "conditional", note: "Report only if it differs from the Alberta figure at 012058001." },
  { line: "012060001", caption: "Taxable dividends deductible under ITA s.112, 113 or 186(6) — Alberta", kind: "money", role: "input", section: "area-b", requirement: "conditional", note: "Report only if it differs from the federal figure at 012061001." },
  { line: "012061001", caption: "Taxable dividends deductible under ITA s.112, 113 or 186(6) — federal", kind: "money", role: "input", section: "area-b", requirement: "conditional", note: "Report only if it differs from the Alberta figure at 012060001." },
  { line: "012062001", caption: "Part VI.1 tax deduction — Alberta", kind: "money", role: "input", section: "area-b", requirement: "conditional", note: "Report only if it differs from the federal figure at 012063001." },
  { line: "012063001", caption: "Part VI.1 tax deduction — federal", kind: "money", role: "input", section: "area-b", requirement: "conditional", note: "Report only if it differs from the Alberta figure at 012062001." },
  { line: "012064001", caption: "Non-capital losses of preceding years — Alberta", kind: "money", role: "input", section: "area-b", requirement: "conditional", note: "Report only if it differs from the federal figure at 012065001. Alberta side is a Schedule 21 destination." },
  { line: "012065001", caption: "Non-capital losses of preceding years — federal", kind: "money", role: "input", section: "area-b", requirement: "conditional", note: "Report only if it differs from the Alberta figure at 012064001. Alberta side is a Schedule 21 destination." },
  { line: "012066001", caption: "Net-capital losses of preceding years — Alberta", kind: "money", role: "input", section: "area-b", requirement: "conditional", note: "Report only if it differs from the federal figure at 012067001. Alberta side is a Schedule 21 destination." },
  { line: "012067001", caption: "Net-capital losses of preceding years — federal", kind: "money", role: "input", section: "area-b", requirement: "conditional", note: "Report only if it differs from the Alberta figure at 012066001. Alberta side is a Schedule 21 destination." },
  { line: "012068001", caption: "Restricted farm losses of preceding years — Alberta", kind: "money", role: "input", section: "area-b", requirement: "conditional", note: "Report only if it differs from the federal figure at 012069001. Alberta side is a Schedule 21 destination." },
  { line: "012069001", caption: "Restricted farm losses of preceding years — federal", kind: "money", role: "input", section: "area-b", requirement: "conditional", note: "Report only if it differs from the Alberta figure at 012068001. Alberta side is a Schedule 21 destination." },
  { line: "012070001", caption: "Farm losses of preceding years — Alberta", kind: "money", role: "input", section: "area-b", requirement: "conditional", note: "Report only if it differs from the federal figure at 012071001. Alberta side is a Schedule 21 destination." },
  { line: "012071001", caption: "Farm losses of preceding years — federal", kind: "money", role: "input", section: "area-b", requirement: "conditional", note: "Report only if it differs from the Alberta figure at 012070001. Alberta side is a Schedule 21 destination." },
  { line: "012072001", caption: "Limited partnership losses of preceding years — Alberta", kind: "money", role: "input", section: "area-b", requirement: "conditional", note: "Report only if it differs from the federal figure at 012073001." },
  { line: "012073001", caption: "Limited partnership losses of preceding years — federal", kind: "money", role: "input", section: "area-b", requirement: "conditional", note: "Report only if it differs from the Alberta figure at 012072001." },
  { line: "012074001", caption: "Taxable capital gains / dividends from a central credit union — Alberta", kind: "money", role: "input", section: "area-b", requirement: "conditional", note: "Report only if it differs from the federal figure at 012075001." },
  { line: "012075001", caption: "Taxable capital gains / dividends from a central credit union — federal", kind: "money", role: "input", section: "area-b", requirement: "conditional", note: "Report only if it differs from the Alberta figure at 012074001." },
  { line: "012130001", caption: "Restricted interest and financing expenses — Alberta", kind: "money", role: "input", section: "area-b", requirement: "conditional", note: "Report only if it differs from the federal figure at 012131001. The EIFEL denial (ITA s.18.2), carried onto the Alberta return." },
  { line: "012131001", caption: "Restricted interest and financing expenses — federal", kind: "money", role: "input", section: "area-b", requirement: "conditional", note: "Report only if it differs from the Alberta figure at 012130001. The EIFEL denial (ITA s.18.2), carried onto the Alberta return." },
];
