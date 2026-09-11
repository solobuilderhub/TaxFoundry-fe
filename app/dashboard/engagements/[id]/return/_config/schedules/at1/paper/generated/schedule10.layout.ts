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
  /** What the form prints over the box to say where the figure comes from, verbatim. Present even where `from` is not — a sum or a conditional has no single line to link to. */
  sourceText?: string;
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
  { id: "carryback", title: "Application of current year losses", description: "Amount A — the current-year loss available for carry-back, per column: non-capital, farm, a shared \"other loss\" column selected by the check box(es) at 023/025 (restricted farm and/or listed personal property), and capital at its gross amount." },
  { id: "deduct", title: "Deduct loss to be applied under the Alberta Corporate Tax Act to:", description: "One row per preceding taxation year, up to three. The year-end date (003/005/007) is shared across every loss column — one set of three years, not one per loss type." },
  { id: "carry-forward", title: "Balance of current year loss available for carry forward" },
];

export const AT1_SCHEDULE_10_FIELDS: readonly PaperField[] = [
  { line: "010002001", caption: "Non-capital Loss: Amt of current yr loss available for carry-back", kind: "money", role: "carried-in", section: "carryback", requirement: "conditional", from: { form: "AT1SCH21", line: "021037001", note: "The Alberta non-capital loss of the year. Where Schedule 21 is not filed, TRA takes federal 004110 instead." } },
  { line: "010012001", caption: "Farm Loss: Amt of current yr loss available for carry-back", kind: "money", role: "carried-in", section: "carryback", requirement: "conditional", from: { form: "AT1SCH21", line: "021077001", note: "The Alberta farm loss of the year. Where Schedule 21 is not filed, TRA takes federal 004310 instead." } },
  { line: "010023001", caption: "Other Losses: Restricted farm", kind: "flag", role: "computed", section: "carryback", requirement: "mandatory", note: "Printed as one of the two \"Other Losses (check box(es))\" boxes heading the shared column. Always filed once Schedule 10 is filed at all — 1 (Yes) or 2 (No, not applicable), never omitted. NOT mutually exclusive with line 025; both may be checked." },
  { line: "010025001", caption: "Other Losses: Listed Personal Property", kind: "flag", role: "computed", section: "carryback", requirement: "mandatory", note: "Printed as one of the two \"Other Losses (check box(es))\" boxes heading the shared column. Always filed once Schedule 10 is filed at all — 1 (Yes) or 2 (No, not applicable), never omitted. NOT mutually exclusive with line 023; both may be checked." },
  { line: "010032001", caption: "Other Losses: Amt of current yr loss available for carry-back", kind: "money", role: "carried-in", section: "carryback", requirement: "conditional", from: { form: "AT1SCH21", line: "021097001", note: "Restricted farm (021097) and/or listed personal property (021117), per whichever of 023/025 are checked — the SUM of both when both are, not one or the other." } },
  { line: "010042001", caption: "Capital Loss: Gross Amt of current yr loss available for carry-back", kind: "money", role: "carried-in", section: "carryback", requirement: "conditional", from: { form: "AT1SCH21", line: "021057001", note: "Gross, not at the inclusion rate — the column is headed \"Gross Amount Available\". Where Schedule 21 is not filed, TRA takes federal 004210 instead." } },
  { line: "010003001", caption: "1st preceding taxation year ending (YYYY MM DD)", kind: "date", role: "carried-in", section: "deduct", requirement: "conditional", note: "Must exist if any of 004, 014, 034 or 044 exists.", from: { form: "AT1SCH21", line: "", note: "Shared across every loss-type column — whichever pool has carry-back rows first supplies the three preceding-year dates. Entered as part of that pool's carry-back breakdown on the Schedule 21 continuity editor (or, for non-capital, on federal T2SCH4), not on this schedule." } },
  { line: "010004001", caption: "Non-capital Loss: 1st preceding taxation year ending", kind: "money", role: "carried-in", section: "deduct", requirement: "conditional", note: "May exist only if 002 exists, and must not exceed it.", from: { form: "T2SCH4", line: "901", note: "Non-capital loss carry-back, 1st preceding year." } },
  { line: "010014001", caption: "Farm Loss: 1st preceding taxation year ending", kind: "money", role: "carried-in", section: "deduct", requirement: "conditional", note: "May exist only if 012 exists, and must not exceed it.", from: { form: "AT1SCH21", line: "021085001", note: "Entered as a per-year row on the Schedule 21 continuity editor's farm carry-back breakdown; this schedule shows the result, it is not entered here." } },
  { line: "010034001", caption: "Other Losses: 1st preceding taxation year ending", kind: "money", role: "carried-in", section: "deduct", requirement: "conditional", note: "May exist only if 032 exists, and must not exceed it.", from: { form: "AT1SCH21", line: "", note: "Entered as a per-year row on the Schedule 21 continuity editor's restricted-farm (021105) and/or listed-personal-property (021123) carry-back breakdown, per whichever box(es) 023/025 have checked; this schedule shows the combined result, it is not entered here." } },
  { line: "010043001", caption: "Inclusion Rate: 1st preceding taxation year ending", kind: "rate", role: "input", section: "deduct", requirement: "conditional", note: "The rate of the year applied TO, not of the loss year — off AT1 Schedule 18 for that year where it was filed, otherwise federal Schedule 6 amount \"m\". Transmitted as a decimal to exactly six digits (2/3 = .666667, 1/2 = .500000). May exist only if 042 exists." },
  { line: "010044001", caption: "Capital: Gross amount applied to 1st preceding taxation year ending", kind: "money", role: "input", section: "deduct", requirement: "conditional", note: "GROSS, not at the inclusion rate — TRA multiplies it by 043 itself to reach the printed \"Amount of Loss Applied\", which has no line code of its own. May exist only if 042 and 043 exist, and must not exceed 042." },
  { line: "010005001", caption: "2nd preceding taxation year ending (YYYY MM DD)", kind: "date", role: "carried-in", section: "deduct", requirement: "conditional", note: "Must exist if any of 006, 016, 036 or 046 exists.", from: { form: "AT1SCH21", line: "", note: "Shared across every loss-type column — whichever pool has carry-back rows first supplies the three preceding-year dates. Entered as part of that pool's carry-back breakdown on the Schedule 21 continuity editor (or, for non-capital, on federal T2SCH4), not on this schedule." } },
  { line: "010006001", caption: "Non-capital Loss: 2nd preceding taxation year ending", kind: "money", role: "carried-in", section: "deduct", requirement: "conditional", note: "May exist only if 002 exists, and must not exceed it.", from: { form: "T2SCH4", line: "902", note: "Non-capital loss carry-back, 2nd preceding year." } },
  { line: "010016001", caption: "Farm Loss: 2nd preceding taxation year ending", kind: "money", role: "carried-in", section: "deduct", requirement: "conditional", note: "May exist only if 012 exists, and must not exceed it.", from: { form: "AT1SCH21", line: "021085001", note: "Entered as a per-year row on the Schedule 21 continuity editor's farm carry-back breakdown; this schedule shows the result, it is not entered here." } },
  { line: "010036001", caption: "Other Losses: 2nd preceding taxation year ending", kind: "money", role: "carried-in", section: "deduct", requirement: "conditional", note: "May exist only if 032 exists, and must not exceed it.", from: { form: "AT1SCH21", line: "", note: "Entered as a per-year row on the Schedule 21 continuity editor's restricted-farm (021105) and/or listed-personal-property (021123) carry-back breakdown, per whichever box(es) 023/025 have checked; this schedule shows the combined result, it is not entered here." } },
  { line: "010045001", caption: "Inclusion Rate: 2nd preceding taxation year ending", kind: "rate", role: "input", section: "deduct", requirement: "conditional", note: "The rate of the year applied TO, not of the loss year — off AT1 Schedule 18 for that year where it was filed, otherwise federal Schedule 6 amount \"m\". Transmitted as a decimal to exactly six digits (2/3 = .666667, 1/2 = .500000). May exist only if 042 exists." },
  { line: "010046001", caption: "Capital: Gross amount applied to 2nd preceding taxation year ending", kind: "money", role: "input", section: "deduct", requirement: "conditional", note: "GROSS, not at the inclusion rate — TRA multiplies it by 045 itself to reach the printed \"Amount of Loss Applied\", which has no line code of its own. May exist only if 042 and 045 exist, and must not exceed 042." },
  { line: "010007001", caption: "3rd preceding taxation year ending (YYYY MM DD)", kind: "date", role: "carried-in", section: "deduct", requirement: "conditional", note: "Must exist if any of 008, 018, 038 or 048 exists.", from: { form: "AT1SCH21", line: "", note: "Shared across every loss-type column — whichever pool has carry-back rows first supplies the three preceding-year dates. Entered as part of that pool's carry-back breakdown on the Schedule 21 continuity editor (or, for non-capital, on federal T2SCH4), not on this schedule." } },
  { line: "010008001", caption: "Non-capital Loss: 3rd preceding taxation year ending", kind: "money", role: "carried-in", section: "deduct", requirement: "conditional", note: "May exist only if 002 exists, and must not exceed it.", from: { form: "T2SCH4", line: "903", note: "Non-capital loss carry-back, 3rd preceding year." } },
  { line: "010018001", caption: "Farm Loss: 3rd preceding taxation year ending", kind: "money", role: "carried-in", section: "deduct", requirement: "conditional", note: "May exist only if 012 exists, and must not exceed it.", from: { form: "AT1SCH21", line: "021085001", note: "Entered as a per-year row on the Schedule 21 continuity editor's farm carry-back breakdown; this schedule shows the result, it is not entered here." } },
  { line: "010038001", caption: "Other Losses: 3rd preceding taxation year ending", kind: "money", role: "carried-in", section: "deduct", requirement: "conditional", note: "May exist only if 032 exists, and must not exceed it.", from: { form: "AT1SCH21", line: "", note: "Entered as a per-year row on the Schedule 21 continuity editor's restricted-farm (021105) and/or listed-personal-property (021123) carry-back breakdown, per whichever box(es) 023/025 have checked; this schedule shows the combined result, it is not entered here." } },
  { line: "010047001", caption: "Inclusion Rate: 3rd preceding taxation year ending", kind: "rate", role: "input", section: "deduct", requirement: "conditional", note: "The rate of the year applied TO, not of the loss year — off AT1 Schedule 18 for that year where it was filed, otherwise federal Schedule 6 amount \"m\". Transmitted as a decimal to exactly six digits (2/3 = .666667, 1/2 = .500000). May exist only if 042 exists." },
  { line: "010048001", caption: "Capital: Gross amount applied to 3rd preceding taxation year ending", kind: "money", role: "input", section: "deduct", requirement: "conditional", note: "GROSS, not at the inclusion rate — TRA multiplies it by 047 itself to reach the printed \"Amount of Loss Applied\", which has no line code of its own. May exist only if 042 and 047 exist, and must not exceed 042." },
  { line: "010010001", caption: "Non-capital Loss: Balance of current year loss available for carry forward", kind: "money", role: "computed", section: "carry-forward", requirement: "conditional", note: "Must exist if 002 does. 002 - (004 + 006 + 008), which cannot exceed 002." },
  { line: "010020001", caption: "Farm Loss: Balance of current year loss available for carry forward", kind: "money", role: "computed", section: "carry-forward", requirement: "conditional", note: "Must exist if 012 does. 012 - (014 + 016 + 018), which cannot exceed 012." },
  { line: "010040001", caption: "Other Losses: Balance of current year loss available for carry forward", kind: "money", role: "computed", section: "carry-forward", requirement: "conditional", note: "Must exist if 032 does. 032 - (034 + 036 + 038), which cannot exceed 032." },
  { line: "010050001", caption: "Capital: Balance of current year loss available for carry forward", kind: "money", role: "computed", section: "carry-forward", requirement: "conditional", note: "Must exist if 042 does. Gross throughout: 042 - (044 + 046 + 048), which cannot exceed 042. The inclusion rate never enters this line." },
];

export const AT1_SCHEDULE_10_FOOTNOTES: readonly string[] = [
  "The application of losses is at the corporation's discretion — the application of losses for federal purposes does not apply for Alberta purposes.",
  "A Loss Carry-Back Application must be filed even if the corporation is exempt from filing its AT1.",
  "Inclusion rate for the capital loss column: 3/4 for dispositions before February 28, 2000; 2/3 for dispositions after February 27, 2000 and before October 18, 2000; 1/2 for dispositions after October 17, 2000. Where a taxation year straddles more than one period, use the effective rate computed on federal Schedule 6 or the Schedule 18 supporting documentation.",
  "The amount of loss claimed for Alberta purposes may differ from the amount claimed for federal purposes. Limitations on deductibility under the federal Act apply for Alberta purposes, except that an amount of non-capital or farm loss used to reduce the federal Part IV tax base does not reduce the loss balance available for Alberta purposes.",
];
