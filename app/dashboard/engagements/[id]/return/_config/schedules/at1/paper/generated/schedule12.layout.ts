/**
 * Alberta Income/Loss Reconciliation (AT1SCH12) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from AT1SCH12-income-loss-reconciliation-TRA11732.pdf, retrieved 2026-09-07.
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

export const AT1_SCHEDULE_12_SECTIONS: readonly PaperSectionDef[] = [
  { id: "area-a", title: "Area A — Net Income for Alberta Corporate Income Tax Purposes", description: "Specify only the items calculated differently for Alberta, or whose Alberta opening balance differs from federal. Where the two agree, the form says to leave BOTH boxes empty." },
  { id: "area-b", title: "Area B — Taxable Income for Alberta", description: "Unlike Area A, every item here must be specified. Where Alberta does not diverge, enter the federal T2 figure on both sides." },
  { id: "abi-reconciliation", title: "Reconciliation of Active Business Income (ABI)", description: "Completed only when Alberta ABI differs from federal. Line 106 is the figure Schedule 1 line 003 uses for the Alberta small business deduction." },
];

export const AT1_SCHEDULE_12_FIELDS: readonly PaperField[] = [
  { line: "012002001", caption: "Net Income (Loss) for federal purposes from T2 line 300", kind: "money", role: "carried-in", section: "area-a", requirement: "mandatory", from: { form: "T2", line: "300" } },
  { line: "012005001", caption: "Capital Cost Allowance — Federal", kind: "money", role: "carried-in", section: "area-a", from: { form: "T2SCH1", line: "403" } },
  { line: "012004001", caption: "Capital Cost Allowance — Alberta", kind: "money", role: "carried-in", section: "area-a", from: { form: "AT1SCH13", line: "013027001" } },
  { line: "012007001", caption: "Recapture of CCA — Federal", kind: "money", role: "carried-in", section: "area-a", from: { form: "T2SCH1", line: "107" } },
  { line: "012006001", caption: "Recapture of CCA — Alberta", kind: "money", role: "carried-in", section: "area-a", from: { form: "AT1SCH13", line: "013023001" } },
  { line: "012009001", caption: "Terminal Loss — Federal", kind: "money", role: "carried-in", section: "area-a", from: { form: "T2SCH1", line: "404" } },
  { line: "012008001", caption: "Terminal Loss — Alberta", kind: "money", role: "carried-in", section: "area-a", from: { form: "AT1SCH13", line: "013025001" } },
  { line: "012015001", caption: "Farming Inventory: Mandatory inventory adjustment included in current year — Federal", kind: "money", role: "carried-in", section: "area-a", from: { form: "T2SCH1", line: "224" } },
  { line: "012014001", caption: "Farming Inventory: Mandatory inventory adjustment included in current year — Alberta", kind: "money", role: "input", section: "area-a", note: "The form prints no source for the Alberta farming-inventory boxes — they are stated directly." },
  { line: "012017001", caption: "Farming Inventory: Mandatory inventory adjustment included in prior year — Federal", kind: "money", role: "carried-in", section: "area-a", from: { form: "T2SCH1", line: "309" } },
  { line: "012016001", caption: "Farming Inventory: Mandatory inventory adjustment included in prior year — Alberta", kind: "money", role: "input", section: "area-a" },
  { line: "012019001", caption: "Farming Inventory: Optional value of inventory included in current year — Federal", kind: "money", role: "carried-in", section: "area-a", from: { form: "T2SCH1", line: "229" } },
  { line: "012018001", caption: "Farming Inventory: Optional value of inventory included in current year — Alberta", kind: "money", role: "input", section: "area-a" },
  { line: "012021001", caption: "Farming Inventory: Optional value of inventory included in prior year — Federal", kind: "money", role: "carried-in", section: "area-a", from: { form: "T2SCH1", line: "313" } },
  { line: "012020001", caption: "Farming Inventory: Optional value of inventory included in prior year — Alberta", kind: "money", role: "input", section: "area-a" },
  { line: "012023001", caption: "Depletion — Federal", kind: "money", role: "carried-in", section: "area-a", from: { form: "T2SCH1", line: "344" } },
  { line: "012022001", caption: "Depletion — Alberta", kind: "money", role: "carried-in", section: "area-a", note: "The form gives a sum: Schedule 15 lines 007 + 019 + 031.", from: { form: "AT1SCH15", line: "015007001" } },
  { line: "012027001", caption: "Canadian Exploration Expenses (CEE) — Federal", kind: "money", role: "carried-in", section: "area-a", from: { form: "T2SCH1", line: "341" } },
  { line: "012026001", caption: "Canadian Exploration Expenses (CEE) — Alberta", kind: "money", role: "carried-in", section: "area-a", note: "The form gives a sum: Schedule 15 lines 061 + 081.", from: { form: "AT1SCH15", line: "015061001" } },
  { line: "012029001", caption: "Canadian Development Expenses (CDE) — Federal", kind: "money", role: "carried-in", section: "area-a", from: { form: "T2SCH1", line: "340" } },
  { line: "012028001", caption: "Canadian Development Expenses (CDE) — Alberta", kind: "money", role: "carried-in", section: "area-a", note: "The form gives a sum: Schedule 15 lines 115 + 141.", from: { form: "AT1SCH15", line: "015115001" } },
  { line: "012031001", caption: "Foreign Exploration and Development Expenses — Federal", kind: "money", role: "carried-in", section: "area-a", from: { form: "T2SCH1", line: "345" } },
  { line: "012030001", caption: "Foreign Exploration and Development Expenses — Alberta", kind: "money", role: "carried-in", section: "area-a", note: "The form gives a sum: Schedule 15 lines 209 + 221 + I + R + JJ + SS.", from: { form: "AT1SCH15", line: "015209001" } },
  { line: "012033001", caption: "Canadian Oil and gas Property Expenses (COGPE) — Federal", kind: "money", role: "carried-in", section: "area-a", from: { form: "T2SCH1", line: "342" } },
  { line: "012032001", caption: "Canadian Oil and gas Property Expenses (COGPE) — Alberta", kind: "money", role: "carried-in", section: "area-a", note: "The form gives a sum: Schedule 15 lines 169 + 189.", from: { form: "AT1SCH15", line: "015169001" } },
  { line: "012035001", caption: "Scientific Research Expenses claimed in year — Federal", kind: "money", role: "carried-in", section: "area-a", note: "The form gives a net figure: minus Federal Schedule 1 line 411, plus Federal Schedule 1 line 231.", from: { form: "T2SCH1", line: "411" } },
  { line: "012034001", caption: "Scientific Research Expenses claimed in year — Alberta", kind: "money", role: "carried-in", section: "area-a", note: "The form offers a choice: Schedule 16 line 016 OR line 020.", from: { form: "AT1SCH16", line: "016016001" } },
  { line: "012037001", caption: "Tax reserves deducted in prior year — Federal", kind: "money", role: "carried-in", section: "area-a", from: { form: "T2SCH1", line: "125" } },
  { line: "012036001", caption: "Tax reserves deducted in prior year — Alberta", kind: "money", role: "carried-in", section: "area-a", from: { form: "AT1SCH17", line: "017091001" } },
  { line: "012039001", caption: "Tax reserves claimed in current year — Federal", kind: "money", role: "carried-in", section: "area-a", from: { form: "T2SCH1", line: "413" } },
  { line: "012038001", caption: "Tax reserves claimed in current year — Alberta", kind: "money", role: "carried-in", section: "area-a", from: { form: "AT1SCH17", line: "017081001" } },
  { line: "012042001", caption: "Capital Tax Liability in other provinces — Alberta", kind: "money", role: "input", section: "area-a", note: "Alberta only — the form shades the federal side of this row." },
  { line: "012041001", caption: "Other - Attach supporting schedule — Federal", kind: "money", role: "input", section: "area-a", note: "The form lists what belongs here: plus Fed Schedule 1 line 113 minus 406, plus Fed Schedule 1 other Additions, minus Fed Schedule 21 Part 1 column D, minus Fed Schedule 1 line 218." },
  { line: "012040001", caption: "Other - Attach supporting schedule — Alberta", kind: "money", role: "input", section: "area-a", note: "The form lists what belongs here: plus Schedule 18 line 076 + 094, plus Schedule 15 AREAs C, D, F, G & H, minus ACTA subsection 8(2.2) deduction, plus foreign affiliate property income after ITA s.152(6.1) adjustment. An amount here requires the explanation at line 048." },
  { line: "012050001", caption: "Total Federal Amount", kind: "money", role: "total", section: "area-a", note: "The federal column, each row carrying the + or - the form prints beside it." },
  { line: "012052001", caption: "Total Alberta Amount", kind: "money", role: "total", section: "area-a", note: "The Alberta column, each row carrying the + or - the form prints beside it." },
  { line: "012054001", caption: "Net Income (Loss) for Alberta purposes: Line 002 - line 050 + line 052", kind: "money", role: "computed", section: "area-a", requirement: "mandatory", formula: { expression: "Line 002 - line 050 + line 052", inputs: ["012002001", "012050001", "012052001"] }, to: { form: "AT1SCH21", line: "021001001" } },
  { line: "012048001", caption: "If amount in Line 040, provide explanation", kind: "text", role: "input", section: "area-a", requirement: "conditional" },
  { line: "012057001", caption: "Charitable Donations — Federal", kind: "money", role: "carried-in", section: "area-b", from: { form: "T2", line: "311" } },
  { line: "012056001", caption: "Charitable Donations — Alberta", kind: "money", role: "carried-in", section: "area-b", from: { form: "AT1SCH20", line: "020016001" } },
  { line: "012059001", caption: "Gifts to Canada or a province, cultural gifts and ecological gifts — Federal", kind: "money", role: "carried-in", section: "area-b", note: "The form gives a sum: T2 line 312 + 313 + 314.", from: { form: "T2", line: "312" } },
  { line: "012058001", caption: "Gifts to Canada or a province, cultural gifts and ecological gifts — Alberta", kind: "money", role: "carried-in", section: "area-b", from: { form: "AT1SCH20", line: "020076001" } },
  { line: "012061001", caption: "Taxable dividends deductible under ITA section 112, 113 or 138(6) — Federal", kind: "money", role: "carried-in", section: "area-b", from: { form: "T2", line: "320" } },
  { line: "012060001", caption: "Taxable dividends deductible under ITA section 112, 113 or 138(6) — Alberta", kind: "money", role: "carried-in", section: "area-b", from: { form: "T2", line: "320" } },
  { line: "012063001", caption: "Part VI.1 tax deduction — Federal", kind: "money", role: "carried-in", section: "area-b", from: { form: "T2", line: "325" } },
  { line: "012062001", caption: "Part VI.1 tax deduction — Alberta", kind: "money", role: "carried-in", section: "area-b", from: { form: "T2", line: "325" } },
  { line: "012065001", caption: "Non-capital losses of preceding taxation years — Federal", kind: "money", role: "carried-in", section: "area-b", from: { form: "T2", line: "331" } },
  { line: "012064001", caption: "Non-capital losses of preceding taxation years — Alberta", kind: "money", role: "carried-in", section: "area-b", from: { form: "AT1SCH21", line: "021041001" } },
  { line: "012067001", caption: "Net-capital losses of preceding taxation years — Federal", kind: "money", role: "carried-in", section: "area-b", from: { form: "T2", line: "332" } },
  { line: "012066001", caption: "Net-capital losses of preceding taxation years — Alberta", kind: "money", role: "carried-in", section: "area-b", from: { form: "AT1SCH21", line: "021061001", note: "Schedule 21 tracks capital losses GROSS; the form says to multiply line 061 by the inclusion rate on the way here." } },
  { line: "012069001", caption: "Restricted farm losses of preceding taxation years — Federal", kind: "money", role: "carried-in", section: "area-b", from: { form: "T2", line: "333" } },
  { line: "012068001", caption: "Restricted farm losses of preceding taxation years — Alberta", kind: "money", role: "carried-in", section: "area-b", from: { form: "AT1SCH21", line: "021099001" } },
  { line: "012071001", caption: "Farm losses of preceding taxation years — Federal", kind: "money", role: "carried-in", section: "area-b", from: { form: "T2", line: "334" } },
  { line: "012070001", caption: "Farm losses of preceding taxation years — Alberta", kind: "money", role: "carried-in", section: "area-b", from: { form: "AT1SCH21", line: "021079001" } },
  { line: "012073001", caption: "Limited partnership losses of preceding taxation years — Federal", kind: "money", role: "carried-in", section: "area-b", from: { form: "T2", line: "335" } },
  { line: "012072001", caption: "Limited partnership losses of preceding taxation years — Alberta", kind: "money", role: "carried-in", section: "area-b", from: { form: "AT1SCH21", line: "021139001", note: "The TOTAL of Schedule 21's column 139, not any single partnership's row." } },
  { line: "012131001", caption: "Restricted interest and financing expenses — Federal", kind: "money", role: "carried-in", section: "area-b", from: { form: "T2", line: "336" } },
  { line: "012130001", caption: "Restricted interest and financing expenses — Alberta", kind: "money", role: "carried-in", section: "area-b", from: { form: "AT1SCH21", line: "021240001" } },
  { line: "012075001", caption: "Taxable capital gains or taxable dividends allocated from a central credit union — Federal", kind: "money", role: "carried-in", section: "area-b", from: { form: "T2", line: "340" } },
  { line: "012074001", caption: "Taxable capital gains or taxable dividends allocated from a central credit union — Alberta", kind: "money", role: "carried-in", section: "area-b", from: { form: "T2", line: "340" } },
  { line: "012079001", caption: "Prospector's and grubstaker's shares — Federal", kind: "money", role: "carried-in", section: "area-b", from: { form: "T2", line: "350" } },
  { line: "012078001", caption: "Prospector's and grubstaker's shares — Alberta", kind: "money", role: "carried-in", section: "area-b", from: { form: "T2", line: "350" } },
  { line: "012141001", caption: "Employer deduction for non-qualified securities — Federal", kind: "money", role: "carried-in", section: "area-b", from: { form: "T2", line: "352" } },
  { line: "012140001", caption: "Employer deduction for non-qualified securities — Alberta", kind: "money", role: "carried-in", section: "area-b", from: { form: "T2", line: "352" } },
  { line: "012081001", caption: "Subtotal — Federal", kind: "money", role: "total", section: "area-b", note: "The federal deductions above, lines 057 to 141." },
  { line: "012080001", caption: "Subtotal — Alberta", kind: "money", role: "total", section: "area-b", note: "The Alberta deductions above, lines 056 to 140." },
  { line: "012083001", caption: "Add: ITA section 110.5 and/or subparagraph 115(1)(a)(vii) additions — Federal", kind: "money", role: "carried-in", section: "area-b", note: "The form prints T2 line 335 here, the same line it gives for the limited partnership losses at 073. Transcribed as printed.", from: { form: "T2", line: "335" } },
  { line: "012082001", caption: "Add: ITA section 110.5 and/or subparagraph 115(1)(a)(vii) additions — Alberta", kind: "money", role: "carried-in", section: "area-b", note: "The form prints this source as \"Schedule 21 line 0017\"; the line is 017.", from: { form: "AT1SCH21", line: "021017001" } },
  { line: "012091001", caption: "Taxable Income for Federal purposes or (Loss) Lines 002 - 081 + 083", kind: "money", role: "computed", section: "area-b", formula: { expression: "Lines 002 - 081 + 083", inputs: ["012002001", "012081001", "012083001"] }, note: "If there is an amount at line 083 and line 002 - line 081 is negative, then line 091 must equal line 083." },
  { line: "012090001", caption: "Taxable Income for Alberta purposes or (Loss) Lines 054 - 080 + 082", kind: "money", role: "computed", section: "area-b", requirement: "mandatory", formula: { expression: "Lines 054 - 080 + 082", inputs: ["012054001", "012080001", "012082001"] }, note: "If there is an amount at line 082 and line 054 - line 080 is negative, then line 090 must equal line 082. Enter this amount on AT1 page 2, line 062.", to: { form: "AT1", line: "000062001" } },
  { line: "012100001", caption: "Does the corporation's calculation of ABI for Alberta purposes differ from its federal ABI?", kind: "flag", role: "input", section: "abi-reconciliation", note: "If \"Yes\", complete lines 102 to 106 to reconcile the two amounts." },
  { line: "012102001", caption: "Active Business Income from Federal Schedule 7, the calculate value of amount \"Q\" or federal Schedule 16, line 124", kind: "money", role: "carried-in", section: "abi-reconciliation", requirement: "conditional", note: "If the calculated amount is negative, enter it in brackets. If it includes specified partnership income, ensure the correct Alberta small business threshold is used. Federal Schedule 16 line 124 is the alternative source.", from: { form: "T2SCH7", line: "Q" } },
  { line: "012104001", caption: "Adjustment to ABI for Alberta purposes due to discretionary items", kind: "money", role: "input", section: "abi-reconciliation", requirement: "conditional", note: "Show a negative amount in brackets." },
  { line: "012106001", caption: "Active Business Income for Alberta purpose (ABI) Line 102 + 104 (if negative, enter \"0\")", kind: "money", role: "computed", section: "abi-reconciliation", formula: { expression: "Line 102 + 104 (if negative, enter \"0\")", inputs: ["012102001", "012104001"] }, note: "This amount is to be used for Schedule 1, line 003.", to: { form: "AT1SCH1", line: "001003001" } },
];

export const AT1_SCHEDULE_12_FOOTNOTES: readonly string[] = [
  "The Alberta Corporate Tax Act adopts most rules of the federal Income Tax Act for determining income and taxable income. However, some of the rules are elective and allow corporations to claim different amounts for Alberta purposes than they have for federal purposes.",
  "If the corporation elects to differ its claim for Alberta purposes in the current year, if the opening balances for Alberta and federal purposes differ, or if the corporation has crown charges, Alberta Royalty Tax Credit claims or resource allowance in 2003 and onwards, then Schedule 12 MUST be completed and submitted with the applicable supporting Alberta schedule(s).",
  "Report all monetary amounts in dollars; DO NOT indicate cents. Show negative amounts in brackets ().",
];
