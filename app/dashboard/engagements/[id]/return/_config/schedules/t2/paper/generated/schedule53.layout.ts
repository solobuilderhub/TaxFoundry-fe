/**
 * General rate income pool (GRIP) calculation (T2SCH53) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/sources/cra-forms/T2SCH53-grip.pdf, retrieved 2026-08-11.
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

export const T2_SCHEDULE_53_SECTIONS: readonly PaperSectionDef[] = [
  { id: "part-1", title: "Part 1 — General rate income pool (GRIP) calculation", description: "The continuity of the pool: what it held at the end of last year, what this year adds, and what dividends already paid take out of it." },
  { id: "part-2", title: "Part 2 — Adjustment for specified future tax consequences", description: "Where a later event changes an earlier year, the pool is adjusted for each of the three preceding years, each at the same 0.72 factor." },
];

export const T2_SCHEDULE_53_FIELDS: readonly PaperField[] = [
  { line: "100", caption: "GRIP at the end of the previous tax year", kind: "money", role: "input", section: "part-1" },
  { line: "110", caption: "Taxable income for the year (DICs enter \"0\")", kind: "money", role: "input", section: "part-1" },
  { line: "130", caption: "Amount on line 400, 405, 410, or 428 of the T2 return, whichever is the least", kind: "money", role: "carried-in", section: "part-1", from: { form: "T2", line: "400", note: "The least of lines 400, 405, 410 and 428" } },
  { line: "140", caption: "For a CCPC, the lesser of aggregate investment income (line 440 of the T2 return) and taxable income", kind: "money", role: "carried-in", section: "part-1", from: { form: "T2", line: "440", note: "Aggregate investment income" } },
  { line: "190", caption: "After-tax income (line 150 multiplied by 0.72 (the general rate factor for the tax year))", kind: "money", role: "computed", section: "part-1", note: "The general rate factor of 0.72 — the share of income that bore full corporate tax, and so the share payable as an eligible dividend." },
  { line: "200", caption: "Eligible dividends received in the tax year", kind: "money", role: "input", section: "part-1" },
  { line: "210", caption: "Dividends deductible under section 113 received in the tax year", kind: "money", role: "input", section: "part-1" },
  { line: "220", caption: "Becoming a CCPC (amount W5 in Part 4)", kind: "money", role: "input", section: "part-1" },
  { line: "230", caption: "Post-amalgamation (total of amount E4 in Part 3 and amount W5 in Part 4)", kind: "money", role: "input", section: "part-1" },
  { line: "240", caption: "Post-wind-up (total of amount E4 in Part 3 and amount W5 in Part 4)", kind: "money", role: "input", section: "part-1" },
  { line: "290", caption: "Subtotal (add lines 220, 230, and 240)", kind: "money", role: "total", section: "part-1" },
  { line: "300", caption: "Eligible dividends paid in the previous tax year", kind: "money", role: "input", section: "part-1" },
  { line: "310", caption: "Excessive eligible dividend designations made in the previous tax year", kind: "money", role: "input", section: "part-1", note: "Last year’s excessive designations reduce this year’s pool: the Part III.1 tax does not restore what was over-designated." },
  { line: "490", caption: "GRIP before adjustment for specified future tax consequences (amount C minus amount D) (amount can be negative)", kind: "money", role: "computed", section: "part-1", note: "May be NEGATIVE, and the form says so. A corporation can over-designate itself into a deficit, and flooring it here would hide that from next year." },
  { line: "560", caption: "Total GRIP adjustment for specified future tax consequences to previous tax years (amount L3 in Part 2)", kind: "money", role: "carried-in", section: "part-1", from: { form: "T2SCH53", line: "500", note: "Amount L3, from Part 2 of this schedule" } },
  { line: "590", caption: "GRIP at the end of the tax year (line 490 minus line 560)", kind: "money", role: "computed", section: "part-1", note: "The figure Schedule 55 line 160 reads. Negative is carried forward but never shelters a designation, because Schedule 55 floors it at nil.", to: { form: "T2SCH55", line: "160", note: "The ceiling on eligible designations. Schedule 55 floors it at nil." } },
  { line: "500", caption: "GRIP adjustment for specified future tax consequences to the first previous tax year (amount K1 multiplied by 0.72)", kind: "money", role: "input", section: "part-2" },
  { line: "520", caption: "GRIP adjustment for specified future tax consequences to the second previous tax year (amount K2 multiplied by 0.72)", kind: "money", role: "input", section: "part-2" },
  { line: "540", caption: "GRIP adjustment for specified future tax consequences to the third previous tax year (amount K3 multiplied by 0.72)", kind: "money", role: "input", section: "part-2" },
];
