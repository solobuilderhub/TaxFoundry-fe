/**
 * Agreement among associated Canadian-controlled private corporations to allocate the business limit (T2SCH23) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/sources/cra-forms/pdf/T2SCH23-associated-business-limit.pdf, retrieved 2026-08-12.
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

export const T2_SCHEDULE_23_SECTIONS: readonly PaperSectionDef[] = [
  { id: "agreement", title: "The agreement", description: "Which calendar year it applies to, and whether it replaces one already filed by any member of the group." },
  { id: "allocation", title: "Allocation of the business limit", description: "A grid — one row per associated corporation. The percentages must total 100%, and the limit is nil for everyone if no agreement is filed." },
  { id: "reduction", title: "Business limit reduction under subsection 125(5.1)", description: "The grind on the group’s whole limit, applied before allocation. Not an allocation row." },
];

export const T2_SCHEDULE_23_FIELDS: readonly PaperField[] = [
  { line: "025", caption: "Calendar year the agreement applies to", kind: "date", role: "input", section: "agreement" },
  { line: "050", caption: "Tax year start", kind: "date", role: "input", section: "agreement" },
  { line: "075", caption: "Tax year end", kind: "date", role: "input", section: "agreement" },
  { line: "100", caption: "Is this an amended agreement for the above calendar year?", kind: "flag", role: "input", section: "agreement" },
  { line: "200", caption: "Is this agreement intended to replace an agreement previously filed by any of the associated corporations?", kind: "flag", role: "input", section: "agreement" },
  { line: "300", caption: "Are all the associated corporations listed below?", kind: "flag", role: "input", section: "agreement" },
  { line: "350", caption: "Percentage of the business limit allocated", kind: "rate", role: "input", section: "allocation", note: "A column heading — one per associated corporation. The percentages total 100%." },
  { line: "400", caption: "Business limit allocated", kind: "money", role: "computed", section: "allocation", note: "The group limit at the percentage on line 350." },
  { line: "410", caption: "Total business limit reduction under subsection 125(5.1)", kind: "money", role: "computed", section: "reduction" },
  { line: "415", caption: "Business limit reduction under subsection 125(5.1)", kind: "money", role: "carried-in", section: "reduction", note: "The GROUP’s grind, applied before allocation. Read as an allocation row it is counted twice.", from: { form: "T2SCH33", line: "790", note: "The taxable capital limb. The passive income limb comes from Schedule 7 line 745." } },
];
