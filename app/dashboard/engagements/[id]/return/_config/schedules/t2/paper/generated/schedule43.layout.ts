/**
 * Calculation of Parts IV.1 and VI.1 taxes (T2SCH43) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/sources/cra-forms/T2SCH43-part-vi-1.pdf, retrieved 2026-08-11.
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

export const T2_SCHEDULE_43_SECTIONS: readonly PaperSectionDef[] = [
  { id: "allowance", title: "Part 1 — Dividend allowance", description: "The $500,000 shelter, so ordinary preferred-share financing does not attract Part VI.1 tax." },
  { id: "agreement", title: "Part 2 — Agreement among associated corporations", description: "An associated group shares ONE allowance and allocates it here." },
  { id: "part-vi-1", title: "Part 3 — Part VI.1 tax payable", description: "The tax on the corporation PAYING a taxable preferred share dividend." },
  { id: "part-iv-1", title: "Part 4 — Part IV.1 tax payable", description: "The tax on the corporation RECEIVING one." },
];

export const T2_SCHEDULE_43_FIELDS: readonly PaperField[] = [
  { line: "115", caption: "Dividend allowance (amount 1A minus line 110) (if negative, enter \"0\")", kind: "money", role: "computed", section: "allowance", note: "Floored at nil — the form says \"if negative, enter 0\"." },
  { line: "116", caption: "Date filed (do not use this area)", kind: "date", role: "input", section: "agreement" },
  { line: "117", caption: "Is this an amended agreement?", kind: "flag", role: "input", section: "agreement" },
  { line: "118", caption: "Calendar year to which the agreement applies", kind: "code", role: "input", section: "agreement" },
  { line: "210", caption: "Dividend allowance: amount on line 115 (from Part 1) or, if associated, the total amount allocated on line 140 (from Part 2)", kind: "money", role: "carried-in", section: "part-vi-1", from: { form: "T2SCH43", line: "115", note: "Or the allocated share from Part 2, when associated" } },
  { line: "220", caption: "Taxable dividends (other than excluded dividends) paid by the corporation in the year on short-term preferred shares", kind: "money", role: "input", section: "part-vi-1", note: "SHORT-TERM preferred shares. Distinct from lines 230 and 240." },
  { line: "230", caption: "Taxable dividends (other than excluded dividends) paid by the corporation in the year on taxable preferred shares (other than short-term preferred shares) of all classes for which the corporation is making an election under subsection 191.2(1)", kind: "money", role: "input", section: "part-vi-1", note: "Election under s.191.2(1) MADE. Differs from line 240 by a single word, and carries a different rate for the payer." },
  { line: "240", caption: "Taxable dividends (other than excluded dividends) paid by the corporation in the year on taxable preferred shares (other than short-term preferred shares) of all classes for which the corporation is not making an election under subsection 191.2(1)", kind: "money", role: "input", section: "part-vi-1", note: "Election NOT made. See line 230." },
  { line: "250", caption: "Part VI.1 tax transferred from a related corporation", kind: "money", role: "input", section: "part-vi-1" },
  { line: "260", caption: "Part VI.1 tax transferred to a related corporation", kind: "money", role: "input", section: "part-vi-1" },
  { line: "270", caption: "Part VI.1 tax payable (amount 3R minus line 260)", kind: "money", role: "computed", section: "part-vi-1", note: "Attracts a deduction against taxable income under s.110(1)(k) at 3.5 times — so an error moves taxable income by several times this figure.", to: { form: "T2", line: "724", note: "And a s.110(1)(k) deduction at 3.5 times, against taxable income" } },
  { line: "310", caption: "Taxable dividends (other than excepted dividends) received in the year on taxable preferred shares [other than a share of a class for which the corporation has made an election under subsection 191.2(1)]", kind: "money", role: "input", section: "part-iv-1" },
  { line: "320", caption: "Taxable dividends (other than excepted dividends) received in the year by a restricted financial institution on taxable RFI shares (see section 187.3)", kind: "money", role: "input", section: "part-iv-1" },
  { line: "330", caption: "Total taxable dividends subject to Part IV.1 tax (line 310 plus line 320)", kind: "money", role: "computed", section: "part-iv-1" },
  { line: "340", caption: "Part IV.1 tax payable (line 330 multiplied by 10%)", kind: "money", role: "computed", section: "part-iv-1", note: "Part IV.1 at ten per cent of the dividends received." },
  { line: "350", caption: "Portion of taxable dividends included on line 330 that is also subject to Part IV tax", kind: "money", role: "input", section: "part-iv-1" },
  { line: "370", caption: "Portion of taxable dividends included on line 350 received from connected corporations", kind: "money", role: "input", section: "part-iv-1" },
  { line: "380", caption: "Part IV tax on taxable dividends reported on line 370", kind: "money", role: "input", section: "part-iv-1" },
  { line: "360", caption: "Reduction of Part IV tax otherwise payable (amount 4A plus amount 4B)", kind: "money", role: "computed", section: "part-iv-1" },
  { line: "400", caption: "Eligible taxable dividends included on line 390", kind: "money", role: "input", section: "part-iv-1" },
];
