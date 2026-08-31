/**
 * Alberta Loss Carry-Back Application (AT1SCH10) — paper Form View layout.
 *
 * GENERATED from the form definition in @classytic/ca-tax:
 *   npx tsx packages/ca-tax/scripts/emit-ui-schedule.ts
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
  { line: "010003001", caption: "1st preceding taxation year ending", kind: "date", role: "input", section: "carryback", requirement: "conditional" },
  { line: "010004001", caption: "Non-capital loss carried back — 1st preceding taxation year", kind: "money", role: "input", section: "carryback", requirement: "conditional" },
  { line: "010005001", caption: "2nd preceding taxation year ending", kind: "date", role: "input", section: "carryback", requirement: "conditional" },
  { line: "010006001", caption: "Non-capital loss carried back — 2nd preceding taxation year", kind: "money", role: "input", section: "carryback", requirement: "conditional" },
  { line: "010007001", caption: "3rd preceding taxation year ending", kind: "date", role: "input", section: "carryback", requirement: "conditional" },
  { line: "010008001", caption: "Non-capital loss carried back — 3rd preceding taxation year", kind: "money", role: "input", section: "carryback", requirement: "conditional" },
  { line: "010010001", caption: "Balance of current year non-capital loss available for carry forward", kind: "money", role: "computed", section: "carryback", requirement: "mandatory", note: "Line 002 minus the total carried back." },
  { line: "010012001", caption: "Amount of current year farm loss available for carry-back", kind: "money", role: "computed", section: "carryback", requirement: "mandatory" },
  { line: "010014001", caption: "Farm loss carried back — 1st preceding taxation year", kind: "money", role: "input", section: "carryback", requirement: "conditional" },
  { line: "010016001", caption: "Farm loss carried back — 2nd preceding taxation year", kind: "money", role: "input", section: "carryback", requirement: "conditional" },
  { line: "010018001", caption: "Farm loss carried back — 3rd preceding taxation year", kind: "money", role: "input", section: "carryback", requirement: "conditional" },
  { line: "010020001", caption: "Balance of current year farm loss available for carry forward", kind: "money", role: "computed", section: "carryback", requirement: "mandatory", note: "Line 012 minus the total carried back." },
  { line: "010023001", caption: "Other Losses: Restricted Farm (check box)", kind: "flag", role: "computed", section: "carryback", requirement: "mandatory", note: "Always filed once Schedule 10 is filed at all — 1 (Yes) or 2 (No). NOT mutually exclusive with line 025; both may be checked." },
  { line: "010025001", caption: "Other Losses: Listed Personal Property (check box)", kind: "flag", role: "computed", section: "carryback", requirement: "mandatory", note: "Always filed once Schedule 10 is filed at all — 1 (Yes) or 2 (No). NOT mutually exclusive with line 023; both may be checked." },
  { line: "010032001", caption: "Amount of current year \"other\" loss available for carry-back", kind: "money", role: "computed", section: "carryback", requirement: "conditional", note: "Restricted farm and/or listed personal property, per 023/025 — the SUM of both when both are checked, not one or the other." },
  { line: "010034001", caption: "\"Other\" loss carried back — 1st preceding taxation year", kind: "money", role: "input", section: "carryback", requirement: "conditional" },
  { line: "010036001", caption: "\"Other\" loss carried back — 2nd preceding taxation year", kind: "money", role: "input", section: "carryback", requirement: "conditional" },
  { line: "010038001", caption: "\"Other\" loss carried back — 3rd preceding taxation year", kind: "money", role: "input", section: "carryback", requirement: "conditional" },
  { line: "010040001", caption: "Balance of current year \"other\" loss available for carry forward", kind: "money", role: "computed", section: "carryback", requirement: "mandatory", note: "Line 032 minus the total carried back." },
  { line: "010042001", caption: "Gross amount of current year capital loss available for carry-back", kind: "money", role: "computed", section: "carryback", requirement: "mandatory" },
  { line: "010044001", caption: "Capital loss applied — 1st preceding taxation year (at the inclusion rate)", kind: "money", role: "computed", section: "carryback", requirement: "conditional", note: "The gross carry-back request × the inclusion rate — not the raw entered amount." },
  { line: "010046001", caption: "Capital loss applied — 2nd preceding taxation year (at the inclusion rate)", kind: "money", role: "computed", section: "carryback", requirement: "conditional", note: "The gross carry-back request × the inclusion rate — not the raw entered amount." },
  { line: "010048001", caption: "Capital loss applied — 3rd preceding taxation year (at the inclusion rate)", kind: "money", role: "computed", section: "carryback", requirement: "conditional", note: "The gross carry-back request × the inclusion rate — not the raw entered amount." },
];
