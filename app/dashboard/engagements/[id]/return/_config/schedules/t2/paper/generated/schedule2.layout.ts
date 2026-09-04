/**
 * Charitable donations and gifts (T2SCH2) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/sources/cra-forms/pdf/T2SCH02-donations.pdf, retrieved 2026-08-19.
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

export const T2_SCHEDULE_2_SECTIONS: readonly PaperSectionDef[] = [
  { id: "charitable", title: "Part 2 — Charitable donations", description: "Ordinary charitable gifts. Limited to 75% of net income." },
  { id: "cultural", title: "Part 3 — Gifts of certified cultural property", description: "Not subject to the 75% income limitation." },
  { id: "ecological", title: "Part 4 — Gifts of certified ecologically sensitive land", description: "Carried forward ten years rather than five." },
];

export const T2_SCHEDULE_2_FIELDS: readonly PaperField[] = [
  { line: "239", caption: "Charitable donations expired after five tax years", kind: "money", role: "input", section: "charitable" },
  { line: "240", caption: "Charitable donations at the beginning of the current tax year", kind: "money", role: "input", section: "charitable", note: "Amount 1A less the expired amount at line 239 — last year’s closing pool, net of what aged out." },
  { line: "250", caption: "Charitable donations transferred on an amalgamation or the wind-up of a subsidiary", kind: "money", role: "input", section: "charitable" },
  { line: "210", caption: "Total charitable donations made in the current year", kind: "money", role: "input", section: "charitable", note: "Also included at line 112 of Schedule 1 — the book deduction is added back and the tax claim taken here." },
  { line: "255", caption: "Adjustment for an acquisition of control", kind: "money", role: "input", section: "charitable", note: "An acquisition of control ends the carryforward of unused donations." },
  { line: "439", caption: "Gifts of certified cultural property expired after five tax years", kind: "money", role: "input", section: "cultural" },
  { line: "440", caption: "Gifts of certified cultural property at the beginning of the current tax year", kind: "money", role: "input", section: "cultural" },
  { line: "450", caption: "Gifts of certified cultural property transferred on an amalgamation or the wind-up of a subsidiary", kind: "money", role: "input", section: "cultural" },
  { line: "410", caption: "Total gifts of certified cultural property in the current year", kind: "money", role: "input", section: "cultural" },
  { line: "455", caption: "Adjustment for an acquisition of control", kind: "money", role: "input", section: "cultural" },
  { line: "539", caption: "Gifts of certified ecologically sensitive land expired", kind: "money", role: "input", section: "ecological" },
  { line: "540", caption: "Gifts of certified ecologically sensitive land at the beginning of the current tax year", kind: "money", role: "input", section: "ecological" },
  { line: "550", caption: "Gifts of certified ecologically sensitive land transferred on an amalgamation or the wind-up of a subsidiary", kind: "money", role: "input", section: "ecological" },
  { line: "520", caption: "Total gifts of certified ecologically sensitive land in the current year", kind: "money", role: "input", section: "ecological" },
  { line: "555", caption: "Adjustment for an acquisition of control", kind: "money", role: "input", section: "ecological" },
];
