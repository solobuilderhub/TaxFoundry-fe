/**
 * Taxable capital employed in Canada — large corporations (T2SCH33) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/sources/cra-forms/T2SCH33-taxable-capital.pdf, retrieved 2026-08-11.
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

export const T2_SCHEDULE_33_SECTIONS: readonly PaperSectionDef[] = [
  { id: "capital", title: "Part 1 — Capital for the year", description: "Everything the corporation is funded by: equity, surpluses, and debt of every description. Debt counts as capital here, which surprises people expecting a net-worth figure." },
  { id: "deductions", title: "Part 1 — Deductions from capital", description: "Deficits, deferred tax debits and unrealized exchange losses." },
  { id: "investment-allowance", title: "Part 2 — Investment allowance", description: "Holdings in OTHER corporations, removed so the same money is not counted as capital at every link in a chain of companies." },
  { id: "canadian", title: "Part 3 — Taxable capital employed in Canada", description: "The Canadian slice: assets used through a permanent establishment here, less the debt reasonably related to that business." },
];

export const T2_SCHEDULE_33_FIELDS: readonly PaperField[] = [
  { line: "101", caption: "Reserves that have not been deducted in calculating income for the year under Part I", kind: "money", role: "input", section: "capital" },
  { line: "103", caption: "Capital stock (or members' contributions if incorporated without share capital)", kind: "money", role: "input", section: "capital" },
  { line: "104", caption: "Retained earnings", kind: "money", role: "input", section: "capital" },
  { line: "105", caption: "Contributed surplus", kind: "money", role: "input", section: "capital" },
  { line: "106", caption: "Any other surpluses", kind: "money", role: "input", section: "capital" },
  { line: "107", caption: "Deferred unrealized foreign exchange gains", kind: "money", role: "input", section: "capital" },
  { line: "108", caption: "All loans and advances to the corporation", kind: "money", role: "input", section: "capital" },
  { line: "109", caption: "All indebtedness of the corporation represented by bonds, debentures, notes, mortgages, hypothecary claims, bankers' acceptances, or similar obligations", kind: "money", role: "input", section: "capital", note: "Debt counts as capital. A corporation funded by borrowing has taxable capital even with no retained earnings." },
  { line: "110", caption: "Any dividends declared but not paid by the corporation before the end of the year", kind: "money", role: "input", section: "capital" },
  { line: "111", caption: "All other indebtedness of the corporation (other than any indebtedness for a lease) that has been outstanding for more than 365 days before the end of the year", kind: "money", role: "input", section: "capital" },
  { line: "112", caption: "The total of all amounts, each of which is the amount, if any, in respect of a partnership in which the corporation held a membership interest at the end of the year, either directly or indirectly through another partnership (see note below)", kind: "money", role: "input", section: "capital" },
  { line: "121", caption: "Deferred tax debit balance at the end of the year", kind: "money", role: "input", section: "deductions" },
  { line: "122", caption: "Any deficit deducted in calculating its shareholders' equity (including, for this purpose, the amount of any provision for the redemption of preferred shares) at the end of the year", kind: "money", role: "input", section: "deductions" },
  { line: "123", caption: "To the extent that the amount may reasonably be regarded as being included in any of lines 101 to 112 above for the year, any amount deducted under subsection 135(1) in calculating income under Part I for the year", kind: "money", role: "input", section: "deductions" },
  { line: "124", caption: "Deferred unrealized foreign exchange losses at the end of the year", kind: "money", role: "input", section: "deductions" },
  { line: "190", caption: "Capital for the year (amount A minus amount B) (if negative, enter \"0\")", kind: "money", role: "computed", section: "capital", note: "Floored at nil — the form says \"if negative, enter 0\"." },
  { line: "401", caption: "A share of another corporation", kind: "money", role: "input", section: "investment-allowance" },
  { line: "402", caption: "A loan or advance to another corporation (other than a financial institution)", kind: "money", role: "input", section: "investment-allowance" },
  { line: "403", caption: "A bond, debenture, note, mortgage, hypothecary claim, or similar obligation of another corporation (other than a financial institution)", kind: "money", role: "input", section: "investment-allowance" },
  { line: "404", caption: "Long-term debt of a financial institution", kind: "money", role: "input", section: "investment-allowance" },
  { line: "405", caption: "A dividend payable on a share of the capital stock of another corporation", kind: "money", role: "input", section: "investment-allowance" },
  { line: "406", caption: "A loan or advance to, or a bond, debenture, note, mortgage, hypothecary claim or similar obligation of, a partnership each member of which was, throughout the year, another corporation (other than a financial institution) that was not exempt from tax under this Part (otherwise than because of paragraph 181.1(3)(d)), or another partnership described in paragraph 181.2(4)(d.1)", kind: "money", role: "input", section: "investment-allowance" },
  { line: "407", caption: "An interest in a partnership (see note 2 below)", kind: "money", role: "input", section: "investment-allowance" },
  { line: "490", caption: "Investment allowance for the year (add lines 401 to 407)", kind: "money", role: "computed", section: "investment-allowance", note: "Subtracted, not added. Removing holdings in other corporations stops the same money being counted at every link of a chain." },
  { line: "500", caption: "Taxable capital for the year (amount C minus amount D) (if negative, enter \"0\")", kind: "money", role: "computed", section: "investment-allowance", note: "Floored at nil." },
  { line: "701", caption: "held in the year, in the course of carrying on any business during the year through a permanent establishment in Canada", kind: "money", role: "input", section: "canadian" },
  { line: "711", caption: "Corporation's indebtedness at the end of the year [other than indebtedness described in any of paragraphs 181.2(3)(c) to (f)] that may reasonably be regarded as relating to a business it carried on during the year through a permanent establishment in Canada", kind: "money", role: "input", section: "canadian" },
  { line: "712", caption: "subsection 181.2(4) of the corporation that it used in the year, or held in the year, in the course of carrying on any business during the year through a permanent establishment in Canada", kind: "money", role: "input", section: "canadian" },
  { line: "713", caption: "corporation that is a ship or aircraft the corporation operated in international traffic, or personal or movable property used or held by the corporation in carrying on any business during the year through a permanent establishment in Canada (see note below)", kind: "money", role: "input", section: "canadian" },
  { line: "790", caption: "Taxable capital employed in Canada (line 701 minus amount E) (if negative, enter \"0\")", kind: "money", role: "computed", section: "canadian", note: "The figure that grinds the small business deduction: the business limit reduces from $10 million of taxable capital and is gone at $50 million.", to: { form: "T2SCH7", line: "", note: "Grinds the business limit between $10M and $50M — s.125(5.1)" } },
];
