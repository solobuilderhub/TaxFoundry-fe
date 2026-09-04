/**
 * Alberta Loss Carry-Back Application (AT1SCH10) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/sources/tra-forms/pdf/AT1SCH10-loss-carryback-TRA11731.pdf, retrieved 2026-08-30.
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

export const AT1_SCHEDULE_10_SECTIONS: readonly PaperSectionDef[] = [
  { id: "carryback", title: "Application of current year losses", description: "Non-capital, farm, one checkbox-selected \"other loss\" column (restricted farm or listed personal property), and capital." },
];

export const AT1_SCHEDULE_10_FIELDS: readonly PaperField[] = [
  { line: "010002001", caption: "Amount of current year non-capital loss available for carry-back", kind: "money", role: "computed", section: "carryback", requirement: "mandatory" },
  { line: "010003001", caption: "1st preceding taxation year ending", kind: "date", role: "carried-in", section: "carryback", requirement: "conditional", from: { form: "AT1SCH21", line: "", note: "Shared across every loss-type column — whichever pool has carry-back rows first supplies the three preceding-year dates. Entered as part of that pool's carry-back breakdown on the Schedule 21 continuity editor (or, for non-capital, on federal T2SCH4), not on this schedule." } },
  { line: "010004001", caption: "Non-capital loss carried back — 1st preceding taxation year", kind: "money", role: "carried-in", section: "carryback", requirement: "conditional", from: { form: "T2SCH4", line: "901", note: "Non-capital loss carry-back, 1st preceding year." } },
  { line: "010005001", caption: "2nd preceding taxation year ending", kind: "date", role: "carried-in", section: "carryback", requirement: "conditional", from: { form: "AT1SCH21", line: "", note: "Shared across every loss-type column — whichever pool has carry-back rows first supplies the three preceding-year dates. Entered as part of that pool's carry-back breakdown on the Schedule 21 continuity editor (or, for non-capital, on federal T2SCH4), not on this schedule." } },
  { line: "010006001", caption: "Non-capital loss carried back — 2nd preceding taxation year", kind: "money", role: "carried-in", section: "carryback", requirement: "conditional", from: { form: "T2SCH4", line: "902", note: "Non-capital loss carry-back, 2nd preceding year." } },
  { line: "010007001", caption: "3rd preceding taxation year ending", kind: "date", role: "carried-in", section: "carryback", requirement: "conditional", from: { form: "AT1SCH21", line: "", note: "Shared across every loss-type column — whichever pool has carry-back rows first supplies the three preceding-year dates. Entered as part of that pool's carry-back breakdown on the Schedule 21 continuity editor (or, for non-capital, on federal T2SCH4), not on this schedule." } },
  { line: "010008001", caption: "Non-capital loss carried back — 3rd preceding taxation year", kind: "money", role: "carried-in", section: "carryback", requirement: "conditional", from: { form: "T2SCH4", line: "903", note: "Non-capital loss carry-back, 3rd preceding year." } },
  { line: "010010001", caption: "Balance of current year non-capital loss available for carry forward", kind: "money", role: "computed", section: "carryback", requirement: "mandatory", note: "Line 002 minus the total carried back." },
  { line: "010012001", caption: "Amount of current year farm loss available for carry-back", kind: "money", role: "computed", section: "carryback", requirement: "mandatory" },
  { line: "010014001", caption: "Farm loss carried back — 1st preceding taxation year", kind: "money", role: "carried-in", section: "carryback", requirement: "conditional", from: { form: "AT1SCH21", line: "021085001", note: "Entered as a per-year row on the Schedule 21 continuity editor's farm carry-back breakdown; this schedule shows the result, it is not entered here." } },
  { line: "010016001", caption: "Farm loss carried back — 2nd preceding taxation year", kind: "money", role: "carried-in", section: "carryback", requirement: "conditional", from: { form: "AT1SCH21", line: "021085001", note: "Entered as a per-year row on the Schedule 21 continuity editor's farm carry-back breakdown; this schedule shows the result, it is not entered here." } },
  { line: "010018001", caption: "Farm loss carried back — 3rd preceding taxation year", kind: "money", role: "carried-in", section: "carryback", requirement: "conditional", from: { form: "AT1SCH21", line: "021085001", note: "Entered as a per-year row on the Schedule 21 continuity editor's farm carry-back breakdown; this schedule shows the result, it is not entered here." } },
  { line: "010020001", caption: "Balance of current year farm loss available for carry forward", kind: "money", role: "computed", section: "carryback", requirement: "mandatory", note: "Line 012 minus the total carried back." },
  { line: "010023001", caption: "Other Losses: Restricted Farm (check box)", kind: "flag", role: "computed", section: "carryback", requirement: "mandatory", note: "Always filed once Schedule 10 is filed at all — 1 (Yes) or 2 (No). NOT mutually exclusive with line 025; both may be checked." },
  { line: "010025001", caption: "Other Losses: Listed Personal Property (check box)", kind: "flag", role: "computed", section: "carryback", requirement: "mandatory", note: "Always filed once Schedule 10 is filed at all — 1 (Yes) or 2 (No). NOT mutually exclusive with line 023; both may be checked." },
  { line: "010032001", caption: "Amount of current year \"other\" loss available for carry-back", kind: "money", role: "computed", section: "carryback", requirement: "conditional", note: "Restricted farm and/or listed personal property, per 023/025 — the SUM of both when both are checked, not one or the other." },
  { line: "010034001", caption: "\"Other\" loss carried back — 1st preceding taxation year", kind: "money", role: "carried-in", section: "carryback", requirement: "conditional", from: { form: "AT1SCH21", line: "", note: "Entered as a per-year row on the Schedule 21 continuity editor's restricted-farm (021105) and/or listed-personal-property (021123) carry-back breakdown, per whichever box(es) 023/025 have checked; this schedule shows the combined result, it is not entered here." } },
  { line: "010036001", caption: "\"Other\" loss carried back — 2nd preceding taxation year", kind: "money", role: "carried-in", section: "carryback", requirement: "conditional", from: { form: "AT1SCH21", line: "", note: "Entered as a per-year row on the Schedule 21 continuity editor's restricted-farm (021105) and/or listed-personal-property (021123) carry-back breakdown, per whichever box(es) 023/025 have checked; this schedule shows the combined result, it is not entered here." } },
  { line: "010038001", caption: "\"Other\" loss carried back — 3rd preceding taxation year", kind: "money", role: "carried-in", section: "carryback", requirement: "conditional", from: { form: "AT1SCH21", line: "", note: "Entered as a per-year row on the Schedule 21 continuity editor's restricted-farm (021105) and/or listed-personal-property (021123) carry-back breakdown, per whichever box(es) 023/025 have checked; this schedule shows the combined result, it is not entered here." } },
  { line: "010040001", caption: "Balance of current year \"other\" loss available for carry forward", kind: "money", role: "computed", section: "carryback", requirement: "mandatory", note: "Line 032 minus the total carried back." },
  { line: "010042001", caption: "Gross amount of current year capital loss available for carry-back", kind: "money", role: "computed", section: "carryback", requirement: "mandatory" },
  { line: "010044001", caption: "Capital loss applied — 1st preceding taxation year (at the inclusion rate)", kind: "money", role: "computed", section: "carryback", requirement: "conditional", note: "The gross carry-back request × the inclusion rate — not the raw entered amount." },
  { line: "010046001", caption: "Capital loss applied — 2nd preceding taxation year (at the inclusion rate)", kind: "money", role: "computed", section: "carryback", requirement: "conditional", note: "The gross carry-back request × the inclusion rate — not the raw entered amount." },
  { line: "010048001", caption: "Capital loss applied — 3rd preceding taxation year (at the inclusion rate)", kind: "money", role: "computed", section: "carryback", requirement: "conditional", note: "The gross carry-back request × the inclusion rate — not the raw entered amount." },
];

export const AT1_SCHEDULE_10_FOOTNOTES: readonly string[] = [
  "The application of losses is at the corporation's discretion — the application of losses for federal purposes does not apply for Alberta purposes.",
  "A Loss Carry-Back Application must be filed even if the corporation is exempt from filing its AT1.",
  "Inclusion rate for the capital loss column: 3/4 for dispositions before February 28, 2000; 2/3 for dispositions after February 27, 2000 and before October 18, 2000; 1/2 for dispositions after October 17, 2000. Where a taxation year straddles more than one period, use the effective rate computed on federal Schedule 6 or the Schedule 18 supporting documentation.",
  "The amount of loss claimed for Alberta purposes may differ from the amount claimed for federal purposes. Limitations on deductibility under the federal Act apply for Alberta purposes, except that an amount of non-capital or farm loss used to reduce the federal Part IV tax base does not reduce the loss balance available for Alberta purposes.",
];
