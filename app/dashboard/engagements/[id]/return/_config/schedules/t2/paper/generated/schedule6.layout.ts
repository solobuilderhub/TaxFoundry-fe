/**
 * Summary of dispositions of capital property (T2SCH6) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/sources/cra-forms/T2SCH06-capital-gains.pdf, retrieved 2026-08-12.
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

export const T2_SCHEDULE_6_SECTIONS: readonly PaperSectionDef[] = [
  { id: "designation", title: "Designation under paragraph 111(4)(e)" },
  { id: "shares", title: "Part 1 — Shares" },
  { id: "real-estate", title: "Part 2 — Real estate" },
  { id: "bonds", title: "Part 3 — Bonds" },
  { id: "other", title: "Part 4 — Other properties" },
  { id: "personal-use", title: "Part 5 — Personal-use property", description: "Gains only. A loss on personal-use property is denied outright." },
  { id: "listed-personal", title: "Part 6 — Listed personal property", description: "Losses may be used only against other listed personal property gains." },
  { id: "abil", title: "Part 7 — Allowable business investment loss", description: "A capital loss on a small business corporation, which s.39(1)(c) makes deductible against ANY income. That is why it has its own part." },
  { id: "summary", title: "Summary of capital gains and losses" },
];

export const T2_SCHEDULE_6_FIELDS: readonly PaperField[] = [
  { line: "050", caption: "Are any dispositions shown on this schedule related to deemed dispositions designated under paragraph 111(4)(e)?", kind: "flag", role: "input", section: "designation", note: "A designation on an acquisition of control. If yes, a statement must be attached." },
  { line: "100", caption: "Shares — Number of shares", kind: "code", role: "input", section: "shares" },
  { line: "105", caption: "Shares — Name of corporation in which the shares were held", kind: "text", role: "input", section: "shares" },
  { line: "106", caption: "Shares — Class of shares", kind: "text", role: "input", section: "shares" },
  { line: "110", caption: "Shares — Date of acquisition", kind: "date", role: "input", section: "shares" },
  { line: "120", caption: "Shares — Proceeds of disposition", kind: "money", role: "input", section: "shares" },
  { line: "130", caption: "Shares — Adjusted cost base", kind: "money", role: "input", section: "shares" },
  { line: "140", caption: "Shares — Outlays and expenses from disposition", kind: "money", role: "input", section: "shares" },
  { line: "150", caption: "Shares — Gain (or loss)", kind: "money", role: "computed", section: "shares" },
  { line: "160", caption: "Total adjustment under subsection 112(3) to all losses", kind: "money", role: "input", section: "shares", note: "The stop-loss rule: a loss on shares is reduced by dividends received on them, so a corporation cannot strip value out as a deductible dividend and then claim the fall in value as a loss.", to: { form: "AT1SCH18", line: "018053001", note: "Alberta reads this into its shares row" } },
  { line: "200", caption: "Real estate — Municipal address of real estate", kind: "text", role: "input", section: "real-estate" },
  { line: "210", caption: "Real estate — Date of acquisition", kind: "date", role: "input", section: "real-estate" },
  { line: "220", caption: "Real estate — Proceeds of disposition", kind: "money", role: "input", section: "real-estate" },
  { line: "230", caption: "Real estate — Adjusted cost base", kind: "money", role: "input", section: "real-estate" },
  { line: "240", caption: "Real estate — Outlays and expenses from disposition", kind: "money", role: "input", section: "real-estate" },
  { line: "250", caption: "Real estate — Gain (or loss)", kind: "money", role: "computed", section: "real-estate" },
  { line: "300", caption: "Bonds — Face value of bonds", kind: "money", role: "input", section: "bonds" },
  { line: "305", caption: "Bonds — Maturity date", kind: "date", role: "input", section: "bonds" },
  { line: "307", caption: "Bonds — Name of bond issuer", kind: "text", role: "input", section: "bonds" },
  { line: "310", caption: "Bonds — Date of acquisition", kind: "date", role: "input", section: "bonds" },
  { line: "320", caption: "Bonds — Proceeds of disposition", kind: "money", role: "input", section: "bonds" },
  { line: "330", caption: "Bonds — Adjusted cost base", kind: "money", role: "input", section: "bonds" },
  { line: "340", caption: "Bonds — Outlays and expenses from disposition", kind: "money", role: "input", section: "bonds" },
  { line: "350", caption: "Bonds — Gain (or loss)", kind: "money", role: "computed", section: "bonds" },
  { line: "400", caption: "Other properties — Description of other property", kind: "text", role: "input", section: "other" },
  { line: "406", caption: "Total allowable business investment losses", kind: "money", role: "computed", section: "abil", note: "Leaves this schedule separately — deductible against any income." },
  { line: "410", caption: "Other properties — Date of acquisition", kind: "date", role: "input", section: "other" },
  { line: "420", caption: "Other properties — Proceeds of disposition", kind: "money", role: "input", section: "other" },
  { line: "430", caption: "Other properties — Adjusted cost base", kind: "money", role: "input", section: "other" },
  { line: "440", caption: "Other properties — Outlays and expenses from disposition", kind: "money", role: "input", section: "other" },
  { line: "450", caption: "Other properties — Gain (or loss)", kind: "money", role: "computed", section: "other" },
  { line: "500", caption: "Personal-use property — Description of personal-use property", kind: "text", role: "input", section: "personal-use" },
  { line: "510", caption: "Personal-use property — Date of acquisition", kind: "date", role: "input", section: "personal-use" },
  { line: "520", caption: "Personal-use property — Proceeds of disposition", kind: "money", role: "input", section: "personal-use" },
  { line: "530", caption: "Personal-use property — Adjusted cost base", kind: "money", role: "input", section: "personal-use" },
  { line: "540", caption: "Personal-use property — Outlays and expenses from disposition", kind: "money", role: "input", section: "personal-use" },
  { line: "550", caption: "Personal-use property — Gain only", kind: "money", role: "computed", section: "personal-use", note: "Floored at nil — the form prints \"if negative, enter 0\". A loss here does not net against gains on other property." },
  { line: "600", caption: "Listed personal property — Description of listed personal property", kind: "text", role: "input", section: "listed-personal" },
  { line: "610", caption: "Listed personal property — Date of acquisition", kind: "date", role: "input", section: "listed-personal" },
  { line: "620", caption: "Listed personal property — Proceeds of disposition", kind: "money", role: "input", section: "listed-personal" },
  { line: "630", caption: "Listed personal property — Adjusted cost base", kind: "money", role: "input", section: "listed-personal" },
  { line: "640", caption: "Listed personal property — Outlays and expenses from disposition", kind: "money", role: "input", section: "listed-personal" },
  { line: "650", caption: "Listed personal property — Gain (or loss)", kind: "money", role: "computed", section: "listed-personal", note: "Floored at nil — the form prints \"if negative, enter 0\". A loss here does not net against gains on other property." },
  { line: "875", caption: "Capital gains dividend received in the year", kind: "money", role: "input", section: "summary" },
  { line: "880", caption: "Capital gains reserve, opening balance", kind: "money", role: "carried-in", section: "summary", note: "Last year's reserve comes BACK INTO income.", from: { form: "T2SCH13", line: "008", note: "With line 009, from Part 1 of Schedule 13" } },
  { line: "885", caption: "Capital gains reserve, closing balance", kind: "money", role: "carried-in", section: "summary", note: "This year's reserve is deducted. Both halves of the swing are needed.", from: { form: "T2SCH13", line: "010" } },
  { line: "890", caption: "Capital gains or losses, excluding allowable business investment losses", kind: "money", role: "computed", section: "summary" },
  { line: "900", caption: "Property qualifying for an allowable business investment loss — Name of the small business corporation", kind: "text", role: "input", section: "abil" },
  { line: "905", caption: "Property qualifying for an allowable business investment loss — Shares (1) or debt (2)", kind: "code", role: "input", section: "abil" },
  { line: "910", caption: "Property qualifying for an allowable business investment loss — Date of acquisition", kind: "date", role: "input", section: "abil" },
  { line: "920", caption: "Property qualifying for an allowable business investment loss — Proceeds of disposition", kind: "money", role: "input", section: "abil" },
  { line: "930", caption: "Property qualifying for an allowable business investment loss — Adjusted cost base", kind: "money", role: "input", section: "abil" },
  { line: "940", caption: "Property qualifying for an allowable business investment loss — Outlays and expenses from disposition", kind: "money", role: "input", section: "abil" },
  { line: "950", caption: "Property qualifying for an allowable business investment loss — Loss only", kind: "money", role: "computed", section: "abil" },
];
