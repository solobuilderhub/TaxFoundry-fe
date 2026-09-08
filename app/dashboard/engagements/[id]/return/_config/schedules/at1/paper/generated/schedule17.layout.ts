/**
 * Alberta reserves (AT1SCH17) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/sources/tra-forms/pdf/AT1SCH17-reserves-TRA11738.pdf, retrieved 2026-09-08.
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

export const AT1_SCHEDULE_17_SECTIONS: readonly PaperSectionDef[] = [
  { id: "reserves", title: "Reserves", description: "Eight reserve kinds. Six mirror federal Schedule 13; policy reserves and bank reserves exist only on the Alberta form." },
  { id: "carried-forward", title: "Carried forward to Schedule 12", description: "Line 091 is the sum of the opening and transfer totals. Line 081, the closing total, carries separately from inside the reserves box." },
];

export const AT1_SCHEDULE_17_FIELDS: readonly PaperField[] = [
  { line: "017001001", caption: "Reserve for doubtful debts — Balance at the beginning of the year", kind: "money", role: "input", section: "reserves", requirement: "conditional", from: { form: "T2SCH13", line: "110", note: "Defaults to this federal figure — override only where Alberta genuinely diverges." } },
  { line: "017003001", caption: "Reserve for undelivered goods and services not rendered — Balance at the beginning of the year", kind: "money", role: "input", section: "reserves", requirement: "conditional", from: { form: "T2SCH13", line: "130", note: "Defaults to this federal figure — override only where Alberta genuinely diverges." } },
  { line: "017005001", caption: "Reserve for prepaid rent — Balance at the beginning of the year", kind: "money", role: "input", section: "reserves", requirement: "conditional", from: { form: "T2SCH13", line: "150", note: "Defaults to this federal figure — override only where Alberta genuinely diverges." } },
  { line: "017009001", caption: "Reserve for returnable containers — Balance at the beginning of the year", kind: "money", role: "input", section: "reserves", requirement: "conditional", from: { form: "T2SCH13", line: "190", note: "Defaults to this federal figure — override only where Alberta genuinely diverges." } },
  { line: "017011001", caption: "Reserve for unpaid amounts — Balance at the beginning of the year", kind: "money", role: "input", section: "reserves", requirement: "conditional", from: { form: "T2SCH13", line: "210", note: "Defaults to this federal figure — override only where Alberta genuinely diverges." } },
  { line: "017013001", caption: "Insurance Corporations Policy Reserves — Balance at the beginning of the year", kind: "money", role: "input", section: "reserves", requirement: "conditional", note: "No federal Schedule 13 equivalent — the federal return handles it elsewhere." },
  { line: "017015001", caption: "Bank Reserves — Balance at the beginning of the year", kind: "money", role: "input", section: "reserves", requirement: "conditional", note: "No federal Schedule 13 equivalent — the federal return handles it elsewhere." },
  { line: "017017001", caption: "Other Tax Reserves — Balance at the beginning of the year", kind: "money", role: "input", section: "reserves", requirement: "conditional", from: { form: "T2SCH13", line: "230", note: "Defaults to this federal figure — override only where Alberta genuinely diverges." } },
  { line: "017021001", caption: "TOTALS: Balance at the beginning of the year", kind: "money", role: "total", section: "reserves" },
  { line: "017031001", caption: "Reserve for doubtful debts — Transfer on amalgamation or wind-up of subsidiary", kind: "money", role: "input", section: "reserves", requirement: "conditional", from: { form: "T2SCH13", line: "115", note: "Defaults to this federal figure — override only where Alberta genuinely diverges." } },
  { line: "017033001", caption: "Reserve for undelivered goods and services not rendered — Transfer on amalgamation or wind-up of subsidiary", kind: "money", role: "input", section: "reserves", requirement: "conditional", from: { form: "T2SCH13", line: "135", note: "Defaults to this federal figure — override only where Alberta genuinely diverges." } },
  { line: "017035001", caption: "Reserve for prepaid rent — Transfer on amalgamation or wind-up of subsidiary", kind: "money", role: "input", section: "reserves", requirement: "conditional", from: { form: "T2SCH13", line: "155", note: "Defaults to this federal figure — override only where Alberta genuinely diverges." } },
  { line: "017039001", caption: "Reserve for returnable containers — Transfer on amalgamation or wind-up of subsidiary", kind: "money", role: "input", section: "reserves", requirement: "conditional", from: { form: "T2SCH13", line: "195", note: "Defaults to this federal figure — override only where Alberta genuinely diverges." } },
  { line: "017041001", caption: "Reserve for unpaid amounts — Transfer on amalgamation or wind-up of subsidiary", kind: "money", role: "input", section: "reserves", requirement: "conditional", from: { form: "T2SCH13", line: "215", note: "Defaults to this federal figure — override only where Alberta genuinely diverges." } },
  { line: "017043001", caption: "Insurance Corporations Policy Reserves — Transfer on amalgamation or wind-up of subsidiary", kind: "money", role: "input", section: "reserves", requirement: "conditional", note: "No federal Schedule 13 equivalent — the federal return handles it elsewhere." },
  { line: "017045001", caption: "Bank Reserves — Transfer on amalgamation or wind-up of subsidiary", kind: "money", role: "input", section: "reserves", requirement: "conditional", note: "No federal Schedule 13 equivalent — the federal return handles it elsewhere." },
  { line: "017047001", caption: "Other Tax Reserves — Transfer on amalgamation or wind-up of subsidiary", kind: "money", role: "input", section: "reserves", requirement: "conditional", from: { form: "T2SCH13", line: "235", note: "Defaults to this federal figure — override only where Alberta genuinely diverges." } },
  { line: "017051001", caption: "TOTALS: Transfer on amalgamation or wind-up of subsidiary", kind: "money", role: "total", section: "reserves" },
  { line: "017061001", caption: "Reserve for doubtful debts — Balance at the end of the year", kind: "money", role: "input", section: "reserves", requirement: "conditional", from: { form: "T2SCH13", line: "120", note: "Defaults to this federal figure — override only where Alberta genuinely diverges." } },
  { line: "017063001", caption: "Reserve for undelivered goods and services not rendered — Balance at the end of the year", kind: "money", role: "input", section: "reserves", requirement: "conditional", from: { form: "T2SCH13", line: "140", note: "Defaults to this federal figure — override only where Alberta genuinely diverges." } },
  { line: "017065001", caption: "Reserve for prepaid rent — Balance at the end of the year", kind: "money", role: "input", section: "reserves", requirement: "conditional", from: { form: "T2SCH13", line: "160", note: "Defaults to this federal figure — override only where Alberta genuinely diverges." } },
  { line: "017069001", caption: "Reserve for returnable containers — Balance at the end of the year", kind: "money", role: "input", section: "reserves", requirement: "conditional", from: { form: "T2SCH13", line: "200", note: "Defaults to this federal figure — override only where Alberta genuinely diverges." } },
  { line: "017071001", caption: "Reserve for unpaid amounts — Balance at the end of the year", kind: "money", role: "input", section: "reserves", requirement: "conditional", from: { form: "T2SCH13", line: "220", note: "Defaults to this federal figure — override only where Alberta genuinely diverges." } },
  { line: "017073001", caption: "Insurance Corporations Policy Reserves — Balance at the end of the year", kind: "money", role: "input", section: "reserves", requirement: "conditional", note: "No federal Schedule 13 equivalent — the federal return handles it elsewhere." },
  { line: "017075001", caption: "Bank Reserves — Balance at the end of the year", kind: "money", role: "input", section: "reserves", requirement: "conditional", note: "No federal Schedule 13 equivalent — the federal return handles it elsewhere." },
  { line: "017077001", caption: "Other Tax Reserves — Balance at the end of the year", kind: "money", role: "input", section: "reserves", requirement: "conditional", from: { form: "T2SCH13", line: "240", note: "Defaults to this federal figure — override only where Alberta genuinely diverges." } },
  { line: "017081001", caption: "TOTALS: Balance at the end of the year", kind: "money", role: "total", section: "reserves", note: "This year’s reserves, deducted from Alberta income.", to: { form: "AT1SCH12", line: "012038001" } },
  { line: "017091001", caption: "Line 021 + line 051 =", kind: "money", role: "computed", section: "carried-forward", note: "Opening balances plus transfers — everything that comes BACK INTO income. Filing this without line 081, or the reverse, misstates Alberta income by the other half of the swing.", to: { form: "AT1SCH12", line: "012036001" } },
];

export const AT1_SCHEDULE_17_FOOTNOTES: readonly string[] = [
  "This schedule is required if the opening balance or the claim for Alberta purposes differs from that for federal purposes.",
];

export interface Schedule17ReserveKind {
  label: string;
  opening: string;
  transfer: string;
  closing: string;
}

export const AT1_SCHEDULE_17_RESERVE_KINDS: readonly Schedule17ReserveKind[] = [
  { label: "Reserve for doubtful debts", opening: "017001001", transfer: "017031001", closing: "017061001" },
  { label: "Reserve for undelivered goods and services not rendered", opening: "017003001", transfer: "017033001", closing: "017063001" },
  { label: "Reserve for prepaid rent", opening: "017005001", transfer: "017035001", closing: "017065001" },
  { label: "Reserve for returnable containers", opening: "017009001", transfer: "017039001", closing: "017069001" },
  { label: "Reserve for unpaid amounts", opening: "017011001", transfer: "017041001", closing: "017071001" },
  { label: "Insurance Corporations Policy Reserves", opening: "017013001", transfer: "017043001", closing: "017073001" },
  { label: "Bank Reserves", opening: "017015001", transfer: "017045001", closing: "017075001" },
  { label: "Other Tax Reserves", opening: "017017001", transfer: "017047001", closing: "017077001" },
];
