/**
 * Aggregate investment income and income eligible for the small business deduction (T2SCH7) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/sources/cra-forms/T2SCH07-aggregate-investment-income-sbd.pdf, retrieved 2026-08-11.
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

export const T2_SCHEDULE_7_SECTIONS: readonly PaperSectionDef[] = [
  { id: "aii", title: "Part 1 — Aggregate investment income", description: "All world source investment income. Drives the refundable portion of Part I tax." },
  { id: "adjusted-aii", title: "Part 2 — Adjusted aggregate investment income", description: "The passive income measure that grinds the business limit — $5 of limit for every $1 above $50,000, gone entirely at $150,000." },
  { id: "foreign", title: "Part 3 — Foreign investment income", description: "Income from sources OUTSIDE Canada. Shares its captions with Part 1, and is a different figure." },
  { id: "specified-partnership", title: "Part 4 — Specified partnership income" },
  { id: "partnership-ineligible", title: "Part 5 — Partnership income not eligible for the small business deduction" },
  { id: "sbd-income", title: "Part 6 — Income eligible for the small business deduction", description: "What survives after the ineligible income is stripped out." },
  { id: "specified-corporate", title: "Part 7 — Specified corporate income and assignment under subsection 125(3.2)", description: "Income from a private corporation the claimant does not deal at arm’s length with, unless the business limit is assigned to it." },
];

export const T2_SCHEDULE_7_FIELDS: readonly PaperField[] = [
  { line: "002", caption: "Eligible portion of taxable capital gains for the year", kind: "money", role: "input", section: "aii" },
  { line: "012", caption: "Eligible portion of allowable capital losses for the year (including allowable business investment losses)", kind: "money", role: "input", section: "aii" },
  { line: "032", caption: "carried on in Canada other than income from a source outside Canada)", kind: "money", role: "input", section: "aii" },
  { line: "042", caption: "Exempt income", kind: "money", role: "input", section: "aii", note: "Exempt income is excluded from aggregate investment income: it never bore tax, so it cannot attract the refundable portion." },
  { line: "052", caption: "Amounts received from AgriInvest Fund No. 2 that were included in computing the corporation's income for the year", kind: "money", role: "input", section: "aii" },
  { line: "062", caption: "Taxable dividends deductible (amount deductible under paragraph 113(1)(c) plus total of column F on Schedule 3, Dividends Received, Taxable Dividends Paid, and Part IV Tax Calculation minus related expenses)", kind: "money", role: "input", section: "aii" },
  { line: "072", caption: "Business income from an interest in a trust that is considered property income under paragraph 108(5)(a)", kind: "money", role: "input", section: "aii" },
  { line: "082", caption: "other than a loss from a source outside Canada)", kind: "money", role: "input", section: "aii" },
  { line: "092", caption: "Amount E minus line 082 (if negative, enter \"0\") (enter on line 440 of the T2 return)", kind: "money", role: "input", section: "aii" },
  { line: "705", caption: "Eligible portion of taxable capital gains for the year (other than taxable capital gains from the disposition of an active asset 13 )", kind: "money", role: "input", section: "adjusted-aii" },
  { line: "710", caption: "Eligible portion of allowable capital losses for the year (including allowable business investment losses) (other than allowable capital losses from the disposition of an active asset 13 )", kind: "money", role: "input", section: "adjusted-aii" },
  { line: "715", caption: "Total income from property", kind: "money", role: "input", section: "adjusted-aii" },
  { line: "720", caption: "Exempt income", kind: "money", role: "input", section: "adjusted-aii" },
  { line: "725", caption: "Amounts received from AgriInvest Fund No. 2 that were included in computing the corporation's income for the year", kind: "money", role: "input", section: "adjusted-aii" },
  { line: "730", caption: "Dividends from connected corporations", kind: "money", role: "input", section: "adjusted-aii" },
  { line: "735", caption: "Business income from an interest in a trust that is considered property income under paragraph 108(5)(a)", kind: "money", role: "input", section: "adjusted-aii" },
  { line: "740", caption: "Total losses from property", kind: "money", role: "input", section: "adjusted-aii" },
  { line: "741", caption: "Amount, if any, deducted under subsection 91(4) in computing the corporation's income for the year", kind: "money", role: "input", section: "adjusted-aii" },
  { line: "745", caption: "Adjusted aggregate investment income (amount I minus line 740, plus line 741) (if negative, enter \"0\")", kind: "money", role: "computed", section: "adjusted-aii", note: "The grind figure. $5 of business limit for every $1 above $50,000 — the deduction is gone at $150,000 of adjusted aggregate investment income, however small the active business.", to: { form: "T2SCH23", line: "", note: "The passive income grind on the business limit — s.125(5.1)(b)" } },
  { line: "001", caption: "Eligible portion of taxable capital gains for the year", kind: "money", role: "input", section: "foreign" },
  { line: "009", caption: "Eligible portion of allowable capital losses for the year (including allowable business investment losses)", kind: "money", role: "input", section: "foreign" },
  { line: "019", caption: "Total income from property from a source outside Canada (net of related expenses)", kind: "money", role: "input", section: "foreign" },
  { line: "029", caption: "Exempt income", kind: "money", role: "input", section: "foreign" },
  { line: "059", caption: "Business income from an interest in a trust that is considered property income under paragraph 108(5)(a)", kind: "money", role: "input", section: "foreign" },
  { line: "069", caption: "Total losses from property from a source outside Canada", kind: "money", role: "input", section: "foreign" },
  { line: "079", caption: "Amount M minus line 069 (if negative, enter \"0\") (enter on line 445 of the T2 return)", kind: "money", role: "input", section: "foreign" },
  { line: "350", caption: "Total", kind: "money", role: "input", section: "specified-partnership" },
  { line: "385", caption: "Total", kind: "money", role: "input", section: "specified-partnership" },
  { line: "370", caption: "Corporation's losses for the year from an active business carried on in Canada (other than as a member of a partnership) – enter as a positive amount", kind: "money", role: "input", section: "specified-partnership" },
  { line: "380", caption: "Specified partnership loss of the corporation for the year – enter as a positive amount (total of all negative amounts in column F1)", kind: "money", role: "input", section: "specified-partnership" },
  { line: "390", caption: "Amount at line 385 or amount N, whichever is less", kind: "money", role: "input", section: "specified-partnership" },
  { line: "400", caption: "Specified partnership income (line 360 plus line 390)", kind: "money", role: "computed", section: "specified-partnership" },
  { line: "450", caption: "Partnership income not eligible for the small business deduction (amount Q minus amount R)", kind: "money", role: "computed", section: "partnership-ineligible" },
  { line: "500", caption: "Foreign business income after deducting related expenses", kind: "money", role: "input", section: "specified-partnership" },
  { line: "520", caption: "Personal services business income and other income after deducting related expenses", kind: "money", role: "input", section: "sbd-income" },
  { line: "530", caption: "Partnership income allocated to your corporation under subsection 96(1.1)", kind: "money", role: "input", section: "sbd-income" },
  { line: "540", caption: "Income referred to in clause 125(1)(a)(i)(C)", kind: "money", role: "input", section: "sbd-income" },
  { line: "600", caption: "Business number of the corporation", kind: "money", role: "input", section: "specified-corporate" },
  { line: "615", caption: "Total income described under clause 125(1)(a)(i)(B) (total of column FF)", kind: "money", role: "input", section: "specified-corporate" },
  { line: "610", caption: "Income described under clause 125(1)(a)(i)(B) from the corporation identified in column EE", kind: "money", role: "input", section: "specified-corporate" },
  { line: "620", caption: "Business limit assigned from the corporation identified in column EE", kind: "money", role: "input", section: "specified-corporate" },
  { line: "625", caption: "Total business limit assigned (total of column GG)", kind: "money", role: "input", section: "specified-corporate" },
];
