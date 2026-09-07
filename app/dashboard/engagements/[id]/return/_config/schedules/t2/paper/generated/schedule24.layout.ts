/**
 * First-time filer after incorporation, amalgamation, or wind-up of a subsidiary (T2SCH24) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/sources/cra-forms/pdf/T2SCH24-first-return.pdf, retrieved 2026-08-20.
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

export const T2_SCHEDULE_24_SECTIONS: readonly PaperSectionDef[] = [
  { id: "operation", title: "Part 1 — Type of operation", description: "For a first return after incorporation or amalgamation." },
  { id: "amalgamation", title: "Part 2 — First year of filing after amalgamation" },
  { id: "wind-up", title: "Part 3 — First year of filing after wind-up of subsidiary corporation(s)", description: "The parent filing for the first time after winding up a subsidiary under s.88." },
];

export const T2_SCHEDULE_24_FIELDS: readonly PaperField[] = [
  { line: "100", caption: "Type of operation that applies to the corporation", kind: "code", role: "input", section: "operation", note: "Filed for a first return after incorporation OR amalgamation." },
  { line: "200", caption: "Name of predecessor corporation(s)", kind: "text", role: "input", section: "amalgamation" },
  { line: "300", caption: "Business number of the predecessor corporation(s)", kind: "text", role: "input", section: "amalgamation", note: "Enter NR where a predecessor was not registered." },
  { line: "400", caption: "Name of subsidiary corporation(s)", kind: "text", role: "input", section: "wind-up" },
  { line: "500", caption: "Business number of the subsidiary corporation(s)", kind: "text", role: "input", section: "wind-up", note: "Enter NR where the subsidiary was not registered." },
  { line: "600", caption: "Commencement date of the wind-up", kind: "date", role: "input", section: "wind-up" },
  { line: "700", caption: "Date of the wind-up", kind: "date", role: "input", section: "wind-up" },
];
