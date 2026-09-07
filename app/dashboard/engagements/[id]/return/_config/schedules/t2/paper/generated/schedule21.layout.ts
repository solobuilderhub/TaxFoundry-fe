/**
 * Federal and provincial or territorial foreign income tax credits and federal logging tax credit (T2SCH21) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/sources/cra-forms/pdf/T2SCH21-foreign-tax-credits.pdf, retrieved 2026-08-19.
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

export const T2_SCHEDULE_21_SECTIONS: readonly PaperSectionDef[] = [
  { id: "non-business", title: "Part 1 — Federal foreign non-business income tax credit", description: "One row per country. Unused amounts do not carry forward." },
  { id: "business", title: "Part 2 — Federal foreign business income tax credit", description: "One row per country. Unused amounts pool in Part 3." },
  { id: "continuity", title: "Part 3 — Continuity of unused federal foreign business income tax credits" },
];

export const T2_SCHEDULE_21_FIELDS: readonly PaperField[] = [
  { line: "100", caption: "Country of source of foreign non-business income", kind: "text", role: "input", section: "non-business" },
  { line: "110", caption: "Net foreign non-business income earned in the year", kind: "money", role: "input", section: "non-business" },
  { line: "120", caption: "Foreign non-business income tax paid for the year", kind: "money", role: "input", section: "non-business" },
  { line: "130", caption: "Foreign non-business income tax paid, deducted from income under subsection 20(12)", kind: "money", role: "input", section: "non-business", note: "Deducting under 20(12) instead of crediting — the alternative when the credit cannot be used." },
  { line: "180", caption: "Total deductible federal foreign non-business income tax credit", kind: "money", role: "total", section: "non-business", to: { form: "T2", line: "632", note: "Non-business credit — NOT 636" } },
  { line: "200", caption: "Country in which foreign business income was earned", kind: "text", role: "input", section: "business" },
  { line: "210", caption: "Net foreign business income", kind: "money", role: "input", section: "business", note: "The excess of qualifying income over qualifying losses, per subsection 126(9)." },
  { line: "220", caption: "Foreign business income tax", kind: "money", role: "input", section: "business" },
  { line: "230", caption: "Unused foreign income tax", kind: "money", role: "input", section: "business" },
  { line: "280", caption: "Total deductible federal foreign business income tax credit", kind: "money", role: "total", section: "business", to: { form: "T2", line: "636", note: "Business credit — the form says \"enter on line 636\"" } },
  { line: "345", caption: "Country in which foreign business income was earned", kind: "text", role: "input", section: "continuity" },
  { line: "348", caption: "Balance at the end of the previous tax year", kind: "money", role: "input", section: "continuity", note: "The pool carried forward. The opening balance is this less anything expired at line 350." },
  { line: "350", caption: "Amount expired in the year", kind: "money", role: "input", section: "continuity" },
  { line: "360", caption: "Credits transferred on an amalgamation or the wind-up of a subsidiary", kind: "money", role: "input", section: "continuity" },
  { line: "380", caption: "Closing balance", kind: "money", role: "total", section: "continuity" },
];
