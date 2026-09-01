/**
 * Alberta charitable donations and gifts (AT1SCH20) — paper Form View layout.
 *
 * GENERATED from the form definition in @classytic/ca-tax:
 *   npx tsx packages/ca-tax/scripts/emit-ui-schedule.ts
 *
 * Ultimately from research/validation/auratax/2026-08-07-cca-classes/README.md, retrieved 2026-08-08.
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

export const AT1_SCHEDULE_20_SECTIONS: readonly PaperSectionDef[] = [
  { id: "charitable", title: "Area A — Charitable donations", description: "The ordinary donation pool, capped by the Area B maximum." },
  { id: "gifts", title: "Area A — Gifts to Canada, cultural property and ecological land", description: "The same ten-row continuity, sixty lines apart. These gifts carry different limits, so a figure in the wrong pool is a wrong return even though the rows still foot." },
  { id: "maximum", title: "Area B — Maximum deduction", description: "75% of income, plus 25% of the taxable capital gain and recapture on gifted capital property. Alberta does have this ceiling." },
  { id: "carryforward", title: "Carryforward available, by category", description: "Filed only when at least one category figure is entered. Charitable donations (002-018) and gifts (062-078) are each ONE combined continuity on this schedule; this block reports how much of the gifts pool's closing balance belongs to each of the three federal source categories, plus the medicine-gift deduction (ITA s.110.1(1)(a.1)), which nothing else on this schedule models at all." },
];

export const AT1_SCHEDULE_20_FIELDS: readonly PaperField[] = [
  { line: "020002001", caption: "Charitable donations — Balance at the end of the previous year", kind: "money", role: "input", section: "charitable" },
  { line: "020004001", caption: "Charitable donations — Deduct: expired", kind: "money", role: "input", section: "charitable", note: "Donations carry forward five years; anything older falls out here." },
  { line: "020006001", caption: "Charitable donations — Balance at the beginning of the year", kind: "money", role: "computed", section: "charitable" },
  { line: "020008001", caption: "Charitable donations — Add: transferred on an amalgamation or wind-up", kind: "money", role: "input", section: "charitable" },
  { line: "020010001", caption: "Charitable donations — Add: donations and gifts made in the current year", kind: "money", role: "input", section: "charitable" },
  { line: "020012001", caption: "Charitable donations — Subtotal", kind: "money", role: "computed", section: "charitable" },
  { line: "020013001", caption: "Charitable donations — Adjustment on an acquisition of control", kind: "money", role: "input", section: "charitable", note: "An acquisition of control EXTINGUISHES unused carryforwards. A pool that survives a change of control has not applied this adjustment." },
  { line: "020014001", caption: "Charitable donations — Amount available for deduction", kind: "money", role: "computed", section: "charitable" },
  { line: "020016001", caption: "Charitable donations — Amount applied against income", kind: "money", role: "input", section: "charitable", note: "Capped by the Area B maximum at line 048.", to: { form: "AT1SCH12", line: "012056001" } },
  { line: "020018001", caption: "Charitable donations — Closing balance carried forward", kind: "money", role: "computed", section: "charitable", note: "Becomes next year's opening balance." },
  { line: "020030001", caption: "Income component of the maximum", kind: "money", role: "computed", section: "maximum", note: "75% of Alberta net income for the year." },
  { line: "020032001", caption: "Taxable capital gains arising on gifts of capital property", kind: "money", role: "input", section: "maximum" },
  { line: "020034001", caption: "Taxable capital gain on deemed gifts of non-qualifying securities (ITA subsection 40(1.01))", kind: "money", role: "input", section: "maximum" },
  { line: "020036001", caption: "Recapture of capital cost allowance on charitable gifts", kind: "money", role: "input", section: "maximum" },
  { line: "020038001", caption: "Proceeds of disposition, less outlays and expenses", kind: "money", role: "input", section: "maximum" },
  { line: "020040001", caption: "Capital cost of the gifted property", kind: "money", role: "input", section: "maximum" },
  { line: "020042001", caption: "Lesser of proceeds of disposition and capital cost of gifted capital property", kind: "money", role: "computed", section: "maximum", note: "A nested lesser-of, not a sum." },
  { line: "020044001", caption: "Allowable recapture on gifted capital property", kind: "money", role: "computed", section: "maximum" },
  { line: "020046001", caption: "Gains component of the maximum", kind: "money", role: "computed", section: "maximum", note: "25% of the taxable capital gain and recapture on the gifted property." },
  { line: "020048001", caption: "Maximum deduction for the year", kind: "money", role: "computed", section: "maximum", note: "Caps the amounts applied at lines 016 and 076." },
  { line: "020062001", caption: "Gifts to Canada or a province, cultural property and ecologically sensitive land — Balance at the end of the previous year", kind: "money", role: "input", section: "gifts" },
  { line: "020064001", caption: "Gifts to Canada or a province, cultural property and ecologically sensitive land — Deduct: expired", kind: "money", role: "input", section: "gifts", note: "Donations carry forward five years; anything older falls out here." },
  { line: "020066001", caption: "Gifts to Canada or a province, cultural property and ecologically sensitive land — Balance at the beginning of the year", kind: "money", role: "computed", section: "gifts" },
  { line: "020068001", caption: "Gifts to Canada or a province, cultural property and ecologically sensitive land — Add: transferred on an amalgamation or wind-up", kind: "money", role: "input", section: "gifts" },
  { line: "020070001", caption: "Gifts to Canada or a province, cultural property and ecologically sensitive land — Add: donations and gifts made in the current year", kind: "money", role: "input", section: "gifts" },
  { line: "020072001", caption: "Gifts to Canada or a province, cultural property and ecologically sensitive land — Subtotal", kind: "money", role: "computed", section: "gifts" },
  { line: "020073001", caption: "Gifts to Canada or a province, cultural property and ecologically sensitive land — Adjustment on an acquisition of control", kind: "money", role: "input", section: "gifts", note: "An acquisition of control EXTINGUISHES unused carryforwards. A pool that survives a change of control has not applied this adjustment." },
  { line: "020074001", caption: "Gifts to Canada or a province, cultural property and ecologically sensitive land — Amount available for deduction", kind: "money", role: "computed", section: "gifts" },
  { line: "020076001", caption: "Gifts to Canada or a province, cultural property and ecologically sensitive land — Amount applied against income", kind: "money", role: "input", section: "gifts", note: "Capped by the Area B maximum at line 048.", to: { form: "AT1SCH12", line: "012058001" } },
  { line: "020078001", caption: "Gifts to Canada or a province, cultural property and ecologically sensitive land — Closing balance carried forward", kind: "money", role: "computed", section: "gifts", note: "Becomes next year's opening balance." },
  { line: "020090001", caption: "Year of origin", kind: "date", role: "input", section: "carryforward", requirement: "conditional", note: "Mandatory whenever 092, 094, 096, 098 or 100 has a value." },
  { line: "020092001", caption: "Charitable donations available for carryforward", kind: "money", role: "input", section: "carryforward", requirement: "optional" },
  { line: "020094001", caption: "Gifts to Canada, a province or territory available for carryforward", kind: "money", role: "input", section: "carryforward", requirement: "optional" },
  { line: "020096001", caption: "Gifts of certified cultural property available for carryforward", kind: "money", role: "input", section: "carryforward", requirement: "optional" },
  { line: "020098001", caption: "Gifts of certified ecologically sensitive land available for carryforward", kind: "money", role: "input", section: "carryforward", requirement: "optional" },
  { line: "020100001", caption: "Additional deduction for gifts of medicine available for carryforward", kind: "money", role: "input", section: "carryforward", requirement: "optional", note: "ITA s.110.1(1)(a.1). Not modelled anywhere else in this engine — accepted here as a direct entry." },
];

export const AT1_SCHEDULE_20_FOOTNOTES: readonly string[] = [
  "This schedule is required if the opening balance or the claim for Alberta purposes differs from that for federal purposes.",
  "If the corporation is reporting nil net income or a loss for the year, donations cannot be claimed.",
  "If the corporation elects to differ its Alberta claim for the additional deduction for gifts of medicine (federal T2 Schedule 2, line 660), enter the Alberta amount on Schedule 12, line 40, the federal amount on Schedule 12, line 41, and provide the explanation of the difference on Schedule 12, line 48.",
];

export interface Schedule20PoolRow {
  kind: string;
  caption: string;
  line: string;
  role: PaperFieldRole;
}

export interface Schedule20Pool {
  key: string;
  label: string;
  rows: readonly Schedule20PoolRow[];
}

export const AT1_SCHEDULE_20_POOL_TABLE: readonly Schedule20Pool[] = [
  {
    key: "charitable",
    label: "Charitable donations",
    rows: [
      { kind: "opening", caption: "Balance at the end of the previous year", line: "020002001", role: "input" },
      { kind: "expired", caption: "Deduct: expired", line: "020004001", role: "input" },
      { kind: "beginning", caption: "Balance at the beginning of the year", line: "020006001", role: "computed" },
      { kind: "transferred", caption: "Add: transferred on an amalgamation or wind-up", line: "020008001", role: "input" },
      { kind: "currentYear", caption: "Add: donations and gifts made in the current year", line: "020010001", role: "input" },
      { kind: "subtotal", caption: "Subtotal", line: "020012001", role: "computed" },
      { kind: "acquisitionOfControl", caption: "Adjustment on an acquisition of control", line: "020013001", role: "input" },
      { kind: "available", caption: "Amount available for deduction", line: "020014001", role: "computed" },
      { kind: "applied", caption: "Amount applied against income", line: "020016001", role: "input" },
      { kind: "closing", caption: "Closing balance carried forward", line: "020018001", role: "computed" },
    ],
  },
  {
    key: "gifts",
    label: "Gifts to Canada or a province, cultural property and ecologically sensitive land",
    rows: [
      { kind: "opening", caption: "Balance at the end of the previous year", line: "020062001", role: "input" },
      { kind: "expired", caption: "Deduct: expired", line: "020064001", role: "input" },
      { kind: "beginning", caption: "Balance at the beginning of the year", line: "020066001", role: "computed" },
      { kind: "transferred", caption: "Add: transferred on an amalgamation or wind-up", line: "020068001", role: "input" },
      { kind: "currentYear", caption: "Add: donations and gifts made in the current year", line: "020070001", role: "input" },
      { kind: "subtotal", caption: "Subtotal", line: "020072001", role: "computed" },
      { kind: "acquisitionOfControl", caption: "Adjustment on an acquisition of control", line: "020073001", role: "input" },
      { kind: "available", caption: "Amount available for deduction", line: "020074001", role: "computed" },
      { kind: "applied", caption: "Amount applied against income", line: "020076001", role: "input" },
      { kind: "closing", caption: "Closing balance carried forward", line: "020078001", role: "computed" },
    ],
  },
];
