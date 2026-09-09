/**
 * Notes checklist (GIFI additional information) (T2SCH141) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/sources/cra-forms/pdf/T2SCH141-gifi-notes.pdf, retrieved 2026-08-12.
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

export const T2_SCHEDULE_141_SECTIONS: readonly PaperSectionDef[] = [
  { id: "preparer", title: "Part 1 — Information on the person who prepared the financial statements", description: "Whether that person can be identified at all, holds an accounting designation, and is connected with the corporation." },
  { id: "involvement", title: "Part 2 — Type of involvement with the financial statements", description: "Audit, review, compilation, accounting or bookkeeping — four different levels of assurance, and the form makes the corporation say which one it has." },
  { id: "reservation", title: "Part 3 — Reservations", description: "Whether the preparer qualified their opinion or report." },
  { id: "notes", title: "Part 4 — Other information", description: "What the notes to the financial statements disclose: impairments and revaluations, subsequent events, contingent liabilities, commitments, hedge accounting, and any correction made against opening retained earnings." },
  { id: "return-preparer", title: "Part 5 — Information on the person who prepared the tax return", description: "A different question from Part 1. The person who prepared the RETURN need not be the person who prepared the statements, and the form asks what the client supplied." },
];

export const T2_SCHEDULE_141_FIELDS: readonly PaperField[] = [
  { line: "111", caption: "Can you identify the person* specified in the heading of Part 1?", kind: "money", role: "input", section: "preparer" },
  { line: "095", caption: "Does that person have a professional designation in accounting?", kind: "money", role: "input", section: "preparer" },
  { line: "097", caption: "Is that person connected** with the corporation?", kind: "money", role: "input", section: "preparer", note: "Connected means an officer, a shareholder, a related person, or an employee — the answer that decides whether the statements are independently prepared." },
  { line: "300", caption: "Completed an auditor's report", kind: "money", role: "input", section: "involvement" },
  { line: "301", caption: "Completed a review engagement report", kind: "money", role: "input", section: "involvement" },
  { line: "302", caption: "Conducted a compilation engagement", kind: "money", role: "input", section: "involvement" },
  { line: "303", caption: "Provided accounting services", kind: "money", role: "input", section: "involvement" },
  { line: "304", caption: "Provided bookkeeping services", kind: "money", role: "input", section: "involvement" },
  { line: "305", caption: "Other (please specify)", kind: "text", role: "input", section: "involvement" },
  { line: "099", caption: "Has the person referred to in Part 1 expressed a reservation?", kind: "money", role: "input", section: "reservation", note: "A reservation is the preparer declining to give an unqualified opinion. It is reported here whatever the level of assurance, including on a compilation." },
  { line: "101", caption: "Were notes to the financial statements prepared?", kind: "money", role: "input", section: "notes" },
  { line: "104", caption: "Did the corporation have any subsequent events?", kind: "money", role: "input", section: "notes" },
  { line: "105", caption: "Did the corporation re-evaluate its assets during the tax year?", kind: "money", role: "input", section: "notes" },
  { line: "106", caption: "Did the corporation have any contingent liabilities during the tax year?", kind: "money", role: "input", section: "notes" },
  { line: "107", caption: "Did the corporation have any commitments during the tax year?", kind: "money", role: "input", section: "notes" },
  { line: "108", caption: "Does the corporation have investments in joint venture(s) or partnership(s)?", kind: "money", role: "input", section: "notes" },
  { line: "200", caption: "of an impairment loss in the tax year, a reversal of an impairment loss recognized in a previous tax year, or a change in fair Yes No value during the tax year?", kind: "money", role: "input", section: "notes" },
  { line: "210", caption: "Property, plant, and equipment", kind: "money", role: "input", section: "notes" },
  { line: "215", caption: "Intangible assets", kind: "money", role: "input", section: "notes" },
  { line: "220", caption: "Investment property", kind: "money", role: "input", section: "notes" },
  { line: "225", caption: "Biological assets", kind: "money", role: "input", section: "notes" },
  { line: "230", caption: "Financial instruments", kind: "money", role: "input", section: "notes" },
  { line: "235", caption: "Other", kind: "money", role: "input", section: "notes" },
  { line: "250", caption: "Did the corporation derecognize any financial instrument(s) during the tax year (other than trade receivables)?", kind: "money", role: "input", section: "notes" },
  { line: "255", caption: "Did the corporation apply hedge accounting during the tax year?", kind: "money", role: "input", section: "notes" },
  { line: "260", caption: "Did the corporation discontinue hedge accounting during the tax year?", kind: "money", role: "input", section: "notes" },
  { line: "265", caption: "Was an amount included in the opening balance of retained earnings or equity, in order to correct an error, to recognize a Yes No change in accounting policy, or to adopt a new accounting standard in the current tax year?", kind: "money", role: "input", section: "notes", note: "A correction made against the OPENING balance of retained earnings rather than through the current year, so the prior year as filed no longer agrees with the comparative figures." },
  { line: "310", caption: "Prepared the T2 return and the financial information contained therein", kind: "money", role: "input", section: "return-preparer" },
  { line: "311", caption: "The client provided the financial statements", kind: "money", role: "input", section: "return-preparer" },
  { line: "312", caption: "The client provided a trial balance", kind: "money", role: "input", section: "return-preparer" },
  { line: "313", caption: "The client provided a general ledger", kind: "money", role: "input", section: "return-preparer" },
  { line: "314", caption: "Other (please specify)", kind: "text", role: "input", section: "return-preparer" },
];
