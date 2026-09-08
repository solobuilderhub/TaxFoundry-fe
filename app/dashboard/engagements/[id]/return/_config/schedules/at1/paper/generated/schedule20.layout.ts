/**
 * Alberta charitable donations and gifts (AT1SCH20) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/sources/tra-forms/pdf/AT1SCH20-charitable-donations-TRA11740.pdf, retrieved 2026-09-08.
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

export const AT1_SCHEDULE_20_SECTIONS: readonly PaperSectionDef[] = [
  { id: "charitable", title: "Area A — Charitable donations", description: "The ordinary donation pool, capped by the Area B maximum." },
  { id: "maximum", title: "Area B — Maximum deduction calculation for donations for taxation years starting after 1996", description: "75% of income, plus 25% of the taxable capital gain and recapture on gifted capital property. Alberta does have this ceiling." },
  { id: "gifts", title: "Gifts to Canada or a province, gifts of certified cultural property and gifts of certified ecologically sensitive land", description: "Report the combined totals for all three categories of gifts. The same ten-row continuity as Area A, sixty lines apart — but these gifts carry different limits, so a figure in the wrong pool is a wrong return even though the rows still foot." },
  { id: "carryforward", title: "Amount available for carryforward by year of origin", description: "Filed only when at least one category figure is entered. Charitable donations (002-018) and gifts (062-078) are each ONE combined continuity on this schedule; this block reports how much of the gifts pool's closing balance belongs to each of the three federal source categories, plus the medicine-gift deduction (ITA s.110.1(1)(a.1)), which nothing else on this schedule models at all." },
];

export const AT1_SCHEDULE_20_FIELDS: readonly PaperField[] = [
  { line: "020002001", caption: "Charitable donations at the end of the preceding taxation year", kind: "money", role: "carried-in", section: "charitable", from: { form: "T2SCH2", line: "240", note: "Charitable donations at the beginning of the current tax year." } },
  { line: "020004001", caption: "Deduct: donations expired after five taxation years", kind: "money", role: "input", section: "charitable", note: "Donations carry forward five years; anything older falls out here." },
  { line: "020006001", caption: "Charitable donations at the beginning of the taxation year", kind: "money", role: "computed", section: "charitable" },
  { line: "020008001", caption: "Add: Donations transferred on amalgamation or wind-up of subsidiary", kind: "money", role: "input", section: "charitable" },
  { line: "020010001", caption: "Add: Total current year charitable donations made", kind: "money", role: "carried-in", section: "charitable", from: { form: "T2SCH2", line: "210", note: "Total charitable donations made in the current year." } },
  { line: "020012001", caption: "Subtotal: Lines 008 + 010", kind: "money", role: "computed", section: "charitable" },
  { line: "020013001", caption: "Deduct: Adjustment for an acquisition of control (for donations made after March 22, 2004)", kind: "money", role: "input", section: "charitable", note: "An acquisition of control EXTINGUISHES unused carryforwards. A pool that survives a change of control has not applied this adjustment." },
  { line: "020014001", caption: "Total donations available: lines 006 + 012 - 013", kind: "money", role: "computed", section: "charitable" },
  { line: "020016001", caption: "Amount applied against taxable income", kind: "money", role: "input", section: "charitable", note: "Capped by the Area B maximum at line 048.", to: { form: "AT1SCH12", line: "012056001" } },
  { line: "020018001", caption: "Charitable donations closing balance: lines 014 - 016", kind: "money", role: "computed", section: "charitable", note: "Becomes next year's opening balance." },
  { line: "020030001", caption: "Alberta net income for tax purposes*: Schedule 12, line 054 x 75%", kind: "money", role: "computed", section: "maximum", note: "75% of Alberta net income for the year. The asterisk is the form’s own, and points at the credit-union footnote below." },
  { line: "020032001", caption: "Taxable capital gains arising in respect of gifts of capital property", kind: "money", role: "input", section: "maximum" },
  { line: "020034001", caption: "Taxable capital gain in respect of deemed gifts of non-qualifying securities per ITA subsection 40(1.01)", kind: "money", role: "input", section: "maximum" },
  { line: "020036001", caption: "The amount of the recapture of capital cost allowance in respect of charitable gifts", kind: "money", role: "input", section: "maximum" },
  { line: "020038001", caption: "Proceeds of dispositions less outlays and expenses", kind: "money", role: "input", section: "maximum" },
  { line: "020040001", caption: "The capital cost", kind: "money", role: "input", section: "maximum" },
  { line: "020042001", caption: "The lesser of amounts on lines 038 and 040", kind: "money", role: "computed", section: "maximum", note: "A nested lesser-of, not a sum." },
  { line: "020044001", caption: "The lesser of amounts on lines 036 and 042", kind: "money", role: "computed", section: "maximum" },
  { line: "020046001", caption: "Calculate: (lines 032 + 034 + 044) x 25%", kind: "money", role: "computed", section: "maximum", note: "25% of the taxable capital gain and recapture on the gifted property." },
  { line: "020048001", caption: "Maximum deduction allowable: lines 030 + 046", kind: "money", role: "computed", section: "maximum", note: "Caps the amounts applied at lines 016 and 076." },
  { line: "020062001", caption: "Gifts balance at the end of the preceding taxation year", kind: "money", role: "input", section: "gifts" },
  { line: "020064001", caption: "Deduct: gifts expired after five taxation years, or after ten taxation years for gifts of certified ecological sensitive land made after February 10, 2014", kind: "money", role: "input", section: "gifts", note: "Donations carry forward five years; anything older falls out here." },
  { line: "020066001", caption: "Gifts balance at the beginning of the taxation year", kind: "money", role: "computed", section: "gifts" },
  { line: "020068001", caption: "Add: Gifts transferred on amalgamation or wind-up of a subsidiary", kind: "money", role: "input", section: "gifts" },
  { line: "020070001", caption: "Add: Total current year gifts", kind: "money", role: "input", section: "gifts" },
  { line: "020072001", caption: "Subtotal: Lines 068 + 070", kind: "money", role: "computed", section: "gifts" },
  { line: "020073001", caption: "Deduct: Adjustment for an acquisition of control (for donations made after March 22, 2004)", kind: "money", role: "input", section: "gifts", note: "An acquisition of control EXTINGUISHES unused carryforwards. A pool that survives a change of control has not applied this adjustment." },
  { line: "020074001", caption: "Total gifts available: lines 066 + 072 - 073", kind: "money", role: "computed", section: "gifts" },
  { line: "020076001", caption: "Deduct: Amount applied against taxable income", kind: "money", role: "input", section: "gifts", note: "Capped by the Area B maximum at line 048.", to: { form: "AT1SCH12", line: "012058001" } },
  { line: "020078001", caption: "Gifts closing balance: lines 074 - 076", kind: "money", role: "computed", section: "gifts", note: "Becomes next year's opening balance." },
  { line: "020090001", caption: "Year of origin YYYY/MM/DD", kind: "date", role: "input", section: "carryforward", requirement: "conditional", note: "Mandatory whenever 092, 094, 096, 098 or 100 has a value." },
  { line: "020092001", caption: "Charitable donations available for carryforward", kind: "money", role: "input", section: "carryforward", requirement: "optional" },
  { line: "020094001", caption: "Gifts to Canada, a province, or territory available for carryforward", kind: "money", role: "input", section: "carryforward", requirement: "optional" },
  { line: "020096001", caption: "Gifts of certified cultural property available for carryforward", kind: "money", role: "input", section: "carryforward", requirement: "optional" },
  { line: "020098001", caption: "Gifts of certified ecologically sensitive land available for carryforward", kind: "money", role: "input", section: "carryforward", requirement: "optional" },
  { line: "020100001", caption: "Additional deduction for gifts of medicine available for carryforward", kind: "money", role: "input", section: "carryforward", requirement: "optional", note: "ITA s.110.1(1)(a.1). Not modelled anywhere else in this engine — accepted here as a direct entry." },
];

export const AT1_SCHEDULE_20_FOOTNOTES: readonly string[] = [
  "This schedule is required if the opening balance or the claim for Alberta purposes differs from that for federal purposes.",
  "If the corporation is reporting nil net income or a loss for the year, donations cannot be claimed.",
  "If the corporation elects to differ its Alberta claim for the additional deduction for gifts of medicine (federal T2 Schedule 2, line 660), enter the Alberta amount on Schedule 12, line 40, the federal amount on Schedule 12, line 41, and provide the explanation of the difference on Schedule 12, line 48.",
  "Report the combined totals for all three categories of gifts (to Canada or a province, of certified cultural property, and of certified ecologically sensitive land) in the 062-078 block.",
  "* For credit unions this amount is before the deduction of payments pursuant to allocations in proportion to borrowing and bonus interest.",
];
