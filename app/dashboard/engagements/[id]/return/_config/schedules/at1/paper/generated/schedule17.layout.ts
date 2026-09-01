/**
 * Alberta continuity of reserves (AT1SCH17) — paper Form View layout.
 *
 * GENERATED from the form definition in @classytic/ca-tax:
 *   npx tsx packages/ca-tax/scripts/emit-ui-schedule.ts
 *
 * Ultimately from research/field-maps/at1-schedules-16-17.md, retrieved 2026-08-08.
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

export const AT1_SCHEDULE_17_SECTIONS: readonly PaperSectionDef[] = [
  { id: "reserves", title: "Continuity of reserves", description: "Eight reserve kinds. Six mirror federal Schedule 13; policy reserves and bank reserves exist only on the Alberta form." },
  { id: "totals", title: "Totals carried to Schedule 12", description: "Two totals, because the swing has two halves — what returns to income and what is deducted again." },
];

export const AT1_SCHEDULE_17_FIELDS: readonly PaperField[] = [
  { line: "017001001", caption: "Doubtful debts — Balance at the beginning of the year", kind: "money", role: "input", section: "reserves", requirement: "conditional", from: { form: "T2SCH13", line: "110", note: "The federal balance this is compared against" } },
  { line: "017003001", caption: "Undelivered goods and services not rendered — Balance at the beginning of the year", kind: "money", role: "input", section: "reserves", requirement: "conditional", from: { form: "T2SCH13", line: "130", note: "The federal balance this is compared against" } },
  { line: "017005001", caption: "Prepaid rent — Balance at the beginning of the year", kind: "money", role: "input", section: "reserves", requirement: "conditional", from: { form: "T2SCH13", line: "150", note: "The federal balance this is compared against" } },
  { line: "017009001", caption: "Returnable containers — Balance at the beginning of the year", kind: "money", role: "input", section: "reserves", requirement: "conditional", from: { form: "T2SCH13", line: "190", note: "The federal balance this is compared against" } },
  { line: "017011001", caption: "Unpaid amounts — Balance at the beginning of the year", kind: "money", role: "input", section: "reserves", requirement: "conditional", from: { form: "T2SCH13", line: "210", note: "The federal balance this is compared against" } },
  { line: "017013001", caption: "Insurance corporations policy reserves — Balance at the beginning of the year", kind: "money", role: "input", section: "reserves", requirement: "conditional", note: "No federal Schedule 13 equivalent — the federal return handles it elsewhere." },
  { line: "017015001", caption: "Bank reserves — Balance at the beginning of the year", kind: "money", role: "input", section: "reserves", requirement: "conditional", note: "No federal Schedule 13 equivalent — the federal return handles it elsewhere." },
  { line: "017017001", caption: "Other tax reserves — Balance at the beginning of the year", kind: "money", role: "input", section: "reserves", requirement: "conditional", from: { form: "T2SCH13", line: "230", note: "The federal balance this is compared against" } },
  { line: "017021001", caption: "Total of the opening balances", kind: "money", role: "total", section: "totals" },
  { line: "017031001", caption: "Doubtful debts — Transfer on a wind-up or amalgamation", kind: "money", role: "input", section: "reserves", requirement: "conditional" },
  { line: "017033001", caption: "Undelivered goods and services not rendered — Transfer on a wind-up or amalgamation", kind: "money", role: "input", section: "reserves", requirement: "conditional" },
  { line: "017035001", caption: "Prepaid rent — Transfer on a wind-up or amalgamation", kind: "money", role: "input", section: "reserves", requirement: "conditional" },
  { line: "017039001", caption: "Returnable containers — Transfer on a wind-up or amalgamation", kind: "money", role: "input", section: "reserves", requirement: "conditional" },
  { line: "017041001", caption: "Unpaid amounts — Transfer on a wind-up or amalgamation", kind: "money", role: "input", section: "reserves", requirement: "conditional" },
  { line: "017043001", caption: "Insurance corporations policy reserves — Transfer on a wind-up or amalgamation", kind: "money", role: "input", section: "reserves", requirement: "conditional" },
  { line: "017045001", caption: "Bank reserves — Transfer on a wind-up or amalgamation", kind: "money", role: "input", section: "reserves", requirement: "conditional" },
  { line: "017047001", caption: "Other tax reserves — Transfer on a wind-up or amalgamation", kind: "money", role: "input", section: "reserves", requirement: "conditional" },
  { line: "017051001", caption: "Total of the transfers on wind-up or amalgamation", kind: "money", role: "total", section: "totals" },
  { line: "017061001", caption: "Doubtful debts — Balance at the end of the year", kind: "money", role: "input", section: "reserves", requirement: "conditional" },
  { line: "017063001", caption: "Undelivered goods and services not rendered — Balance at the end of the year", kind: "money", role: "input", section: "reserves", requirement: "conditional" },
  { line: "017065001", caption: "Prepaid rent — Balance at the end of the year", kind: "money", role: "input", section: "reserves", requirement: "conditional" },
  { line: "017069001", caption: "Returnable containers — Balance at the end of the year", kind: "money", role: "input", section: "reserves", requirement: "conditional" },
  { line: "017071001", caption: "Unpaid amounts — Balance at the end of the year", kind: "money", role: "input", section: "reserves", requirement: "conditional" },
  { line: "017073001", caption: "Insurance corporations policy reserves — Balance at the end of the year", kind: "money", role: "input", section: "reserves", requirement: "conditional" },
  { line: "017075001", caption: "Bank reserves — Balance at the end of the year", kind: "money", role: "input", section: "reserves", requirement: "conditional" },
  { line: "017077001", caption: "Other tax reserves — Balance at the end of the year", kind: "money", role: "input", section: "reserves", requirement: "conditional" },
  { line: "017081001", caption: "Total of the closing balances", kind: "money", role: "total", section: "totals", note: "This year’s reserves, deducted from Alberta income.", to: { form: "AT1SCH12", line: "012038001" } },
  { line: "017091001", caption: "Total of line 021 plus line 051", kind: "money", role: "computed", section: "totals", note: "Opening balances plus transfers — everything that comes BACK INTO income. Filing this without line 081, or the reverse, misstates Alberta income by the other half of the swing.", to: { form: "AT1SCH12", line: "012036001" } },
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
  { label: "Doubtful debts", opening: "017001001", transfer: "017031001", closing: "017061001" },
  { label: "Undelivered goods and services not rendered", opening: "017003001", transfer: "017033001", closing: "017063001" },
  { label: "Prepaid rent", opening: "017005001", transfer: "017035001", closing: "017065001" },
  { label: "Returnable containers", opening: "017009001", transfer: "017039001", closing: "017069001" },
  { label: "Unpaid amounts", opening: "017011001", transfer: "017041001", closing: "017071001" },
  { label: "Insurance corporations policy reserves", opening: "017013001", transfer: "017043001", closing: "017073001" },
  { label: "Bank reserves", opening: "017015001", transfer: "017045001", closing: "017075001" },
  { label: "Other tax reserves", opening: "017017001", transfer: "017047001", closing: "017077001" },
];
