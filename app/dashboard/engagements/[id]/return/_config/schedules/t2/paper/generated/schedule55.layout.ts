/**
 * Part III.1 tax on excessive eligible dividend designations (T2SCH55) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/sources/cra-forms/T2SCH55-part-iii-1.pdf, retrieved 2026-08-11.
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

export const T2_SCHEDULE_55_SECTIONS: readonly PaperSectionDef[] = [
  { id: "part-1", title: "Part 1 — Canadian-controlled private corporations and deposit insurance corporations", description: "The excess is derived here: eligible dividends paid, less the general rate income pool from Schedule 53." },
  { id: "part-2", title: "Part 2 — Other corporations", description: "A corporation that is not a CCPC has no general rate income pool. Its excess arises against the LOW rate income pool and arrives from Schedule 54 rather than being computed here." },
];

export const T2_SCHEDULE_55_FIELDS: readonly PaperField[] = [
  { line: "100", caption: "Total taxable dividends paid in the tax year", kind: "money", role: "input", section: "part-1" },
  { line: "150", caption: "Total eligible dividends paid in the tax year", kind: "money", role: "input", section: "part-1" },
  { line: "160", caption: "GRIP at the end of the tax year (line 590 of Schedule 53) (if negative, enter \"0\")", kind: "money", role: "carried-in", section: "part-1", note: "If Schedule 53 line 590 is negative, enter nil — a pool deficit is carried forward there but never shelters a designation here.", from: { form: "T2SCH53", line: "590", note: "The closing pool. A negative pool is read as nil here." } },
  { line: "180", caption: "Excessive eligible dividend designations elected under subsection 185.1(2) to be treated as ordinary dividends", kind: "money", role: "input", section: "part-1", note: "An AMOUNT, not a tick box. s.185.1(2) permits a partial election, and the unelected remainder is still taxed at 20%. The claim may not exceed the excess, so it can never drive the tax below nil." },
  { line: "190", caption: "Part III.1 tax on excessive eligible dividend designations – CCPC or DIC (amount B multiplied by 20%)", kind: "money", role: "computed", section: "part-1", note: "Twenty per cent. The further 10% for paragraph (c) anti-avoidance cases appears nowhere on this form, but is real — s.185.1(1) states the charge as a total of two components, and CRA assesses the second.", to: { form: "T2", line: "710" } },
  { line: "200", caption: "Total taxable dividends paid in the tax year", kind: "money", role: "input", section: "part-2" },
  { line: "280", caption: "Excessive eligible dividend designations elected under subsection 185.1(2) to be treated as ordinary dividends", kind: "money", role: "input", section: "part-2", note: "The same partial election as line 180, on the Part 2 side." },
  { line: "290", caption: "Part III.1 tax on excessive eligible dividend designations – Other corporations (amount D multiplied by 20%)", kind: "money", role: "computed", section: "part-2", note: "Twenty per cent, exactly as Part 1.", to: { form: "T2", line: "710" } },
];
