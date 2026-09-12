/**
 * Corporation loss continuity and application (T2SCH4) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/sources/cra-forms/T2SCH04-loss-continuity.pdf, retrieved 2026-08-12.
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
  /** Text the form prints immediately BEFORE this heading, verbatim. */
  printedBefore?: string;
}

export const T2_SCHEDULE_4_SECTIONS: readonly PaperSectionDef[] = [
  { id: "non-capital", title: "Part 1 — Non-capital losses", description: "The ordinary business loss. Carries forward 20 years and back 3, and is deductible against any income." },
  { id: "capital", title: "Part 2 — Capital losses", description: "Carried forward INDEFINITELY, but deductible only against taxable capital gains — a large pool here does not shelter business income." },
  { id: "farm", title: "Part 3 — Farm losses" },
  { id: "restricted-farm", title: "Part 4 — Restricted farm losses", description: "Deductible only against farm income (ITA s.31)." },
  { id: "listed-personal", title: "Part 5 — Listed personal property losses", description: "Seven years, and only against gains on listed personal property." },
  { id: "limited-partnership", title: "Part 7 — Limited partnership losses", description: "Three grid tables, one row per partnership: the current year’s loss, what prior years leave applicable, and the continuity carried forward. The at-risk amount caps each one, which is what makes a limited partnership loss different from every other pool on this form." },
  { id: "rife", title: "Part 8 — Restricted interest and financing expenses", description: "The EIFEL carry-forward. Interest denied under ITA s.18.2 is not lost — it pools here and may be deducted in a later year with capacity." },
  { id: "election", title: "Part 9 — Election under paragraph 88(1.1)(f)" },
];

export const T2_SCHEDULE_4_FIELDS: readonly PaperField[] = [
  { line: "100", caption: "Non-capital loss expired", kind: "money", role: "input", section: "non-capital" },
  { line: "102", caption: "Non-capital losses at the beginning of the tax year (amount 1N minus line 100)", kind: "money", role: "input", section: "non-capital" },
  { line: "105", caption: "Non-capital losses transferred on an amalgamation or on the wind-up of a subsidiary 2 corporation", kind: "money", role: "input", section: "non-capital" },
  { line: "110", caption: "Current-year non-capital loss (from amount 1M)", kind: "money", role: "carried-in", section: "non-capital", from: { form: "T2SCH1", line: "", note: "The current-year loss, from net income for tax purposes" } },
  { line: "150", caption: "Other adjustments (includes adjustments for an acquisition of control)", kind: "money", role: "input", section: "non-capital" },
  { line: "140", caption: "Section 80 – Adjustments for forgiven amounts", kind: "money", role: "input", section: "non-capital" },
  { line: "130", caption: "Non-capital losses of previous tax years applied in the current tax year", kind: "money", role: "input", section: "non-capital", to: { form: "T2", line: "331", note: "Non-capital losses applied" } },
  { line: "135", caption: "Current and previous years non-capital losses applied against current-year taxable dividends subject to Part IV tax", kind: "money", role: "input", section: "non-capital" },
  { line: "901", caption: "First previous tax year to reduce taxable income", kind: "money", role: "input", section: "non-capital", note: "Carried back to the FIRST preceding year. The same three-row pattern repeats per loss type (951/952/953 capital, 921–923 farm, 941–943 restricted farm, 961–963 listed personal), and only the number says which." },
  { line: "902", caption: "Second previous tax year to reduce taxable income", kind: "money", role: "input", section: "non-capital" },
  { line: "903", caption: "Third previous tax year to reduce taxable income", kind: "money", role: "input", section: "non-capital" },
  { line: "911", caption: "First previous tax year to reduce taxable dividends subject to Part IV tax", kind: "money", role: "input", section: "non-capital" },
  { line: "912", caption: "Second previous tax year to reduce taxable dividends subject to Part IV tax", kind: "money", role: "input", section: "non-capital" },
  { line: "913", caption: "Third previous tax year to reduce taxable dividends subject to Part IV tax", kind: "money", role: "input", section: "non-capital" },
  { line: "200", caption: "Continuity of capital losses and request for a carryback Capital losses at the end of the previous tax year", kind: "money", role: "input", section: "capital" },
  { line: "205", caption: "Capital losses transferred on an amalgamation or on the wind-up of a subsidiary corporation", kind: "money", role: "input", section: "capital" },
  { line: "250", caption: "Other adjustments (includes adjustments for an acquisition of control)", kind: "money", role: "input", section: "capital", note: "Capped by taxable capital gains in the year — a capital loss pool cannot shelter business income however large it is." },
  { line: "240", caption: "Section 80 – Adjustments for forgiven amounts", kind: "money", role: "input", section: "capital" },
  { line: "210", caption: "Current-year capital loss (from the calculation on Schedule 6, Summary of Dispositions of Capital Property)", kind: "money", role: "input", section: "capital" },
  { line: "215", caption: "Enter amount 2D or 2E, whichever is less", kind: "money", role: "input", section: "capital" },
  { line: "220", caption: "ABILs expired as non-capital losses (line 215 multiplied by 2)", kind: "money", role: "input", section: "capital" },
  { line: "225", caption: "Capital losses from previous tax years applied against the current-year net capital gain", kind: "money", role: "input", section: "capital", to: { form: "T2", line: "332", note: "Net capital losses applied — enter HALF of line 225 (the 50% inclusion rate)" } },
  { line: "951", caption: "Request to carry back capital loss to: 7 First previous tax year", kind: "money", role: "input", section: "capital" },
  { line: "952", caption: "Second previous tax year", kind: "money", role: "input", section: "capital" },
  { line: "953", caption: "Third previous tax year", kind: "money", role: "input", section: "capital" },
  { line: "300", caption: "Farm loss expired", kind: "money", role: "input", section: "farm" },
  { line: "302", caption: "Farm losses at the beginning of the tax year (amount 3A minus line 300)", kind: "money", role: "input", section: "farm" },
  { line: "305", caption: "Farm losses transferred on an amalgamation or on the wind-up of a subsidiary corporation", kind: "money", role: "input", section: "farm" },
  { line: "310", caption: "Current-year farm loss (amount 1L in Part 1)", kind: "money", role: "input", section: "farm" },
  { line: "350", caption: "Other adjustments (includes adjustments for an acquisition of control)", kind: "money", role: "input", section: "farm" },
  { line: "340", caption: "Section 80 – Adjustments for forgiven amounts", kind: "money", role: "input", section: "farm" },
  { line: "330", caption: "Farm losses of previous tax years applied in the current tax year", kind: "money", role: "input", section: "farm", to: { form: "T2", line: "334", note: "Farm losses applied" } },
  { line: "335", caption: "Current and previous years farm losses applied against current-year taxable dividends subject to Part IV tax", kind: "money", role: "input", section: "farm" },
  { line: "921", caption: "First previous tax year to reduce taxable income", kind: "money", role: "input", section: "farm" },
  { line: "922", caption: "Second previous tax year to reduce taxable income", kind: "money", role: "input", section: "farm" },
  { line: "923", caption: "Third previous tax year to reduce taxable income", kind: "money", role: "input", section: "farm" },
  { line: "931", caption: "First previous tax year to reduce taxable dividends subject to Part IV tax", kind: "money", role: "input", section: "farm" },
  { line: "932", caption: "Second previous tax year to reduce taxable dividends subject to Part IV tax", kind: "money", role: "input", section: "farm" },
  { line: "933", caption: "Third previous tax year to reduce taxable dividends subject to Part IV tax", kind: "money", role: "input", section: "farm" },
  { line: "485", caption: "Current-year restricted farm loss Total losses for the year from farming business", kind: "money", role: "input", section: "restricted-farm" },
  { line: "400", caption: "Restricted farm loss expired", kind: "money", role: "input", section: "restricted-farm" },
  { line: "402", caption: "Restricted farm losses at the beginning of the tax year (amount 4F minus line 400)", kind: "money", role: "input", section: "restricted-farm" },
  { line: "405", caption: "Restricted farm losses transferred on an amalgamation or on the wind-up of a subsidiary corporation", kind: "money", role: "input", section: "restricted-farm" },
  { line: "410", caption: "Current-year restricted farm loss (from amount 4E)", kind: "money", role: "input", section: "restricted-farm" },
  { line: "430", caption: "Restricted farm losses from previous tax years applied against current farming income", kind: "money", role: "input", section: "restricted-farm", to: { form: "T2", line: "333", note: "Restricted farm losses applied" } },
  { line: "440", caption: "Section 80 – Adjustments for forgiven amounts", kind: "money", role: "input", section: "restricted-farm" },
  { line: "450", caption: "Other adjustments", kind: "money", role: "input", section: "restricted-farm" },
  { line: "941", caption: "First previous tax year to reduce farming income", kind: "money", role: "input", section: "restricted-farm" },
  { line: "942", caption: "Second previous tax year to reduce farming income", kind: "money", role: "input", section: "restricted-farm" },
  { line: "943", caption: "Third previous tax year to reduce farming income", kind: "money", role: "input", section: "restricted-farm" },
  { line: "500", caption: "Listed personal property loss expired", kind: "money", role: "input", section: "restricted-farm" },
  { line: "502", caption: "Listed personal property losses at the beginning of the tax year (amount 5A minus line 500)", kind: "money", role: "input", section: "listed-personal" },
  { line: "510", caption: "Current-year listed personal property loss (from Schedule 6)", kind: "money", role: "input", section: "listed-personal" },
  { line: "530", caption: "Listed personal property losses from previous tax years applied against listed personal property gains", kind: "money", role: "input", section: "listed-personal" },
  { line: "550", caption: "Other adjustments", kind: "money", role: "input", section: "listed-personal" },
  { line: "961", caption: "First previous tax year to reduce listed personal property gains", kind: "money", role: "input", section: "listed-personal" },
  { line: "962", caption: "Second previous tax year to reduce listed personal property gains", kind: "money", role: "input", section: "listed-personal" },
  { line: "963", caption: "Third previous tax year to reduce listed personal property gains", kind: "money", role: "input", section: "listed-personal" },
  { line: "700", caption: "RIFE at the end of the previous tax year", kind: "money", role: "input", section: "rife", note: "Restricted interest and financing expenses carried forward — denied interest under the EIFEL rules, not a loss." },
  { line: "705", caption: "RIFE transferred on an amalgamation or on the wind-up of a subsidiary corporation", kind: "money", role: "input", section: "rife" },
  { line: "750", caption: "RIFE adjustments for an acquisition of control", kind: "money", role: "input", section: "rife" },
  { line: "710", caption: "Current-year restricted interest and financing expense determined under subsection 111(8) (amount A from Part 2O of Schedule 130)", kind: "money", role: "input", section: "rife" },
  { line: "730", caption: "RIFE deducted for the tax year", kind: "money", role: "input", section: "rife", to: { form: "T2", line: "336", note: "Restricted interest and financing expenses deducted this year" } },
  { line: "190", caption: "If you are making an election under paragraph 88(1.1)(f), tick the box", kind: "money", role: "input", section: "election" },
  { line: "600", caption: "Partnership account number", kind: "money", role: "input", section: "limited-partnership" },
  { line: "602", caption: "Tax year ending", kind: "money", role: "input", section: "limited-partnership" },
  { line: "604", caption: "Corporation's share of limited partnership loss", kind: "money", role: "input", section: "limited-partnership" },
  { line: "606", caption: "Corporation's at-risk amount", kind: "money", role: "input", section: "limited-partnership" },
  { line: "608", caption: "Total of corporation's share of partnership investment tax credit, clean economy tax credit, farming losses, and resource expenses", kind: "money", role: "input", section: "limited-partnership" },
  { line: "620", caption: "Current-year limited partnership losses (column 3 minus column 6)", kind: "money", role: "input", section: "limited-partnership" },
  { line: "630", caption: "Partnership account number", kind: "money", role: "input", section: "limited-partnership" },
  { line: "632", caption: "Tax year ending", kind: "money", role: "input", section: "limited-partnership" },
  { line: "634", caption: "Limited partnership losses at the end of the previous tax year and amounts transferred on an amalgamation or on the wind-up of a subsidiary", kind: "money", role: "input", section: "limited-partnership" },
  { line: "636", caption: "Corporation's at-risk amount", kind: "money", role: "input", section: "limited-partnership" },
  { line: "638", caption: "Total of corporation's share of partnership investment tax credit, clean economy tax credit, business or property losses, and resource expenses", kind: "money", role: "input", section: "limited-partnership" },
  { line: "650", caption: "Limited partnership losses that may be applied in the year (the lesser of column 3 and 6)", kind: "money", role: "input", section: "limited-partnership" },
  { line: "660", caption: "Partnership account number", kind: "money", role: "input", section: "limited-partnership" },
  { line: "662", caption: "Limited partnership losses at the end of the previous tax year", kind: "money", role: "input", section: "limited-partnership" },
  { line: "664", caption: "Limited partnership losses transferred in the year on an amalgamation or on the wind-up of a subsidiary", kind: "money", role: "input", section: "limited-partnership" },
  { line: "670", caption: "Current-year limited partnership losses (from line 620)", kind: "money", role: "input", section: "limited-partnership" },
  { line: "675", caption: "Limited partnership losses applied in the current year (must be equal to or less than line 650)", kind: "money", role: "input", section: "limited-partnership" },
  { line: "680", caption: "Current year limited partnership losses closing balance to be carried forward to future years (column 2 plus column 3 plus column 4 minus column 5)", kind: "money", role: "input", section: "limited-partnership" },
];
