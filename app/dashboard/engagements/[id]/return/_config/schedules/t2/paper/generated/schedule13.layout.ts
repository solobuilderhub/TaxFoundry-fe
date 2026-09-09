/**
 * Continuity of reserves (T2SCH13) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/sources/cra-forms/T2SCH13-continuity-of-reserves.pdf, retrieved 2026-08-11.
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

export const T2_SCHEDULE_13_SECTIONS: readonly PaperSectionDef[] = [
  { id: "capital-gains", title: "Part 1 — Capital gains reserves", description: "A repeating grid, one row per property. Lines 001–004 head the columns rather than naming fields, so only the totals carry single figures." },
  { id: "other", title: "Part 2 — Other reserves", description: "Six named tax reserves. The opening balances return to income and the closing balances are deducted — both halves of the swing are filed." },
];

export const T2_SCHEDULE_13_FIELDS: readonly PaperField[] = [
  { line: "001", caption: "Description of property", kind: "text", role: "input", section: "capital-gains", note: "A COLUMN heading, not a single field — it applies to every row added." },
  { line: "002", caption: "Balance at the beginning of the year", kind: "money", role: "input", section: "capital-gains", note: "A column heading; totalled at line 008." },
  { line: "003", caption: "Transfer on an amalgamation or the wind-up of a subsidiary", kind: "money", role: "input", section: "capital-gains", note: "A column heading; totalled at line 009." },
  { line: "004", caption: "Balance at the end of the year", kind: "money", role: "input", section: "capital-gains", note: "A column heading; totalled at line 010." },
  { line: "008", caption: "Totals — balance at the beginning of the year", kind: "money", role: "total", section: "capital-gains", to: { form: "T2SCH6", line: "880", note: "With line 009" } },
  { line: "009", caption: "Totals — transfer on an amalgamation or the wind-up of a subsidiary", kind: "money", role: "total", section: "capital-gains", to: { form: "T2SCH6", line: "880", note: "With line 008" } },
  { line: "010", caption: "Totals — balance at the end of the year", kind: "money", role: "total", section: "capital-gains", to: { form: "T2SCH6", line: "885" } },
  { line: "110", caption: "Reserve for doubtful debts — Balance at the beginning of the year", kind: "money", role: "input", section: "other" },
  { line: "115", caption: "Reserve for doubtful debts — Transfer on an amalgamation or the wind-up of a subsidiary", kind: "money", role: "input", section: "other" },
  { line: "120", caption: "Reserve for doubtful debts — Balance at the end of the year", kind: "money", role: "input", section: "other" },
  { line: "130", caption: "Reserve for undelivered goods and services not rendered — Balance at the beginning of the year", kind: "money", role: "input", section: "other" },
  { line: "135", caption: "Reserve for undelivered goods and services not rendered — Transfer on an amalgamation or the wind-up of a subsidiary", kind: "money", role: "input", section: "other" },
  { line: "140", caption: "Reserve for undelivered goods and services not rendered — Balance at the end of the year", kind: "money", role: "input", section: "other" },
  { line: "150", caption: "Reserve for prepaid rent — Balance at the beginning of the year", kind: "money", role: "input", section: "other" },
  { line: "155", caption: "Reserve for prepaid rent — Transfer on an amalgamation or the wind-up of a subsidiary", kind: "money", role: "input", section: "other" },
  { line: "160", caption: "Reserve for prepaid rent — Balance at the end of the year", kind: "money", role: "input", section: "other" },
  { line: "190", caption: "Reserve for returnable containers — Balance at the beginning of the year", kind: "money", role: "input", section: "other" },
  { line: "195", caption: "Reserve for returnable containers — Transfer on an amalgamation or the wind-up of a subsidiary", kind: "money", role: "input", section: "other" },
  { line: "200", caption: "Reserve for returnable containers — Balance at the end of the year", kind: "money", role: "input", section: "other" },
  { line: "210", caption: "Reserve for unpaid amounts — Balance at the beginning of the year", kind: "money", role: "input", section: "other" },
  { line: "215", caption: "Reserve for unpaid amounts — Transfer on an amalgamation or the wind-up of a subsidiary", kind: "money", role: "input", section: "other" },
  { line: "220", caption: "Reserve for unpaid amounts — Balance at the end of the year", kind: "money", role: "input", section: "other" },
  { line: "230", caption: "Other tax reserves — Balance at the beginning of the year", kind: "money", role: "input", section: "other" },
  { line: "235", caption: "Other tax reserves — Transfer on an amalgamation or the wind-up of a subsidiary", kind: "money", role: "input", section: "other" },
  { line: "240", caption: "Other tax reserves — Balance at the end of the year", kind: "money", role: "input", section: "other" },
  { line: "270", caption: "Totals — balance at the beginning of the year", kind: "money", role: "total", section: "other", to: { form: "T2SCH1", line: "125", note: "With line 275, as an ADDITION — last year’s reserves return to income" } },
  { line: "275", caption: "Totals — transfer on an amalgamation or the wind-up of a subsidiary", kind: "money", role: "total", section: "other", to: { form: "T2SCH1", line: "125", note: "With line 270" } },
  { line: "280", caption: "Totals — balance at the end of the year", kind: "money", role: "total", section: "other", to: { form: "T2SCH1", line: "413", note: "As a DEDUCTION — this year’s reserves come out of income" } },
];
