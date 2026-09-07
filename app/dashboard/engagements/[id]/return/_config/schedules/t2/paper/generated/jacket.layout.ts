/**
 * T2 Corporation Income Tax Return (T2) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/sources/cra-forms/pdf/T2-jacket.pdf, retrieved 2026-08-12.
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

export const T2_JACKET_SECTIONS: readonly PaperSectionDef[] = [
  { id: "identification", title: "Identification", description: "Who is filing, for which tax year, and what happened to the corporation during it. None of it is a figure, and all of it changes how the figures are read." },
  { id: "taxable-income", title: "Taxable income", description: "Net income for tax, then the Division C deductions." },
  { id: "sbd", title: "Small business deduction", description: "The least of active business income, taxable income and the reduced business limit, at 19%." },
  { id: "refundable", title: "Refundable portion of Part I tax" },
  { id: "rdtoh", title: "Refundable dividend tax on hand" },
  { id: "part-1-tax", title: "Part I tax" },
  { id: "summary", title: "Summary of tax and credits", description: "Where every other part of the Act, and every province, lands." },
  { id: "credits", title: "Credits", description: "Amount B — refundable credits and instalments, totalling at 890. The balance (A − B) is printed with no numbered box." },
];

export const T2_JACKET_FIELDS: readonly PaperField[] = [
  { line: "001", caption: "Business number (BN)", kind: "code", role: "input", section: "identification" },
  { line: "002", caption: "Corporation's name", kind: "text", role: "input", section: "identification" },
  { line: "010", caption: "Head office address — has this address changed since the last time the CRA was notified?", kind: "flag", role: "input", section: "identification", note: "If yes, lines 011 to 018 are completed." },
  { line: "011", caption: "Head office address line 1", kind: "text", role: "input", section: "identification", requirement: "conditional" },
  { line: "012", caption: "Head office address line 2", kind: "text", role: "input", section: "identification", requirement: "conditional" },
  { line: "015", caption: "Head office city", kind: "text", role: "input", section: "identification", requirement: "conditional" },
  { line: "016", caption: "Head office province, territory, or state", kind: "text", role: "input", section: "identification", requirement: "conditional" },
  { line: "017", caption: "Head office country (other than Canada)", kind: "text", role: "input", section: "identification", requirement: "conditional" },
  { line: "018", caption: "Head office postal or ZIP code", kind: "code", role: "input", section: "identification", requirement: "conditional" },
  { line: "020", caption: "Mailing address — has this address changed since the last time the CRA was notified?", kind: "flag", role: "input", section: "identification", note: "Completed only where the mailing address differs from the head office address. If yes, lines 021 to 028 are completed." },
  { line: "021", caption: "Mailing address c/o", kind: "text", role: "input", section: "identification", requirement: "conditional" },
  { line: "022", caption: "Mailing address line 1", kind: "text", role: "input", section: "identification", requirement: "conditional" },
  { line: "023", caption: "Mailing address line 2", kind: "text", role: "input", section: "identification", requirement: "conditional" },
  { line: "025", caption: "Mailing address city", kind: "text", role: "input", section: "identification", requirement: "conditional" },
  { line: "026", caption: "Mailing address province, territory, or state", kind: "text", role: "input", section: "identification", requirement: "conditional" },
  { line: "027", caption: "Mailing address country (other than Canada)", kind: "text", role: "input", section: "identification", requirement: "conditional" },
  { line: "028", caption: "Mailing address postal or ZIP code", kind: "code", role: "input", section: "identification", requirement: "conditional" },
  { line: "030", caption: "Location of books and records — has this address changed since the last time the CRA was notified?", kind: "flag", role: "input", section: "identification", note: "Completed only where the books are kept somewhere other than the head office. If yes, lines 031 to 038 are completed." },
  { line: "031", caption: "Books and records address line 1", kind: "text", role: "input", section: "identification", requirement: "conditional" },
  { line: "032", caption: "Books and records address line 2", kind: "text", role: "input", section: "identification", requirement: "conditional" },
  { line: "035", caption: "Books and records city", kind: "text", role: "input", section: "identification", requirement: "conditional" },
  { line: "036", caption: "Books and records province, territory, or state", kind: "text", role: "input", section: "identification", requirement: "conditional" },
  { line: "037", caption: "Books and records country (other than Canada)", kind: "text", role: "input", section: "identification", requirement: "conditional" },
  { line: "038", caption: "Books and records postal or ZIP code", kind: "code", role: "input", section: "identification", requirement: "conditional" },
  { line: "040", caption: "Type of corporation at the end of the tax year", kind: "code", role: "input", section: "identification", note: "One of five: 1 Canadian-controlled private corporation (CCPC), 2 other private corporation, 3 public corporation, 4 corporation controlled by a public corporation, 5 other. Code 1 is what opens the small business deduction, so it is the single most consequential tick on the form." },
  { line: "043", caption: "If the type of corporation changed during the tax year, the effective date of the change", kind: "date", role: "input", section: "identification", requirement: "conditional" },
  { line: "060", caption: "Tax year start", kind: "date", role: "input", section: "identification" },
  { line: "061", caption: "Tax year-end", kind: "date", role: "input", section: "identification" },
  { line: "063", caption: "Has there been an acquisition of control resulting in the application of subsection 249(4) since the tax year start on line 060?", kind: "flag", role: "input", section: "identification", note: "An acquisition of control ends the tax year and restricts what the loss pools on Schedule 4 may still be applied against." },
  { line: "065", caption: "If yes, the date control was acquired", kind: "date", role: "input", section: "identification", requirement: "conditional" },
  { line: "066", caption: "Is the date on line 061 a deemed tax year-end according to subsection 249(3.1)?", kind: "flag", role: "input", section: "identification" },
  { line: "067", caption: "Is the corporation a professional corporation that is a member of a partnership?", kind: "flag", role: "input", section: "identification" },
  { line: "070", caption: "Is this the first year of filing after incorporation?", kind: "flag", role: "input", section: "identification", note: "If yes, Schedule 24 is completed and attached.", to: { form: "T2SCH24", line: "", note: "First-time filer after incorporation" } },
  { line: "071", caption: "Is this the first year of filing after amalgamation?", kind: "flag", role: "input", section: "identification", note: "If yes, lines 030 to 038 are completed and Schedule 24 is attached.", to: { form: "T2SCH24", line: "", note: "First-time filer after amalgamation" } },
  { line: "072", caption: "Has there been a wind-up of a subsidiary under section 88 during the current tax year?", kind: "flag", role: "input", section: "identification", note: "If yes, Schedule 24 is completed and attached.", to: { form: "T2SCH24", line: "", note: "First-time filer after a wind-up" } },
  { line: "076", caption: "Is this the final tax year before amalgamation?", kind: "flag", role: "input", section: "identification" },
  { line: "078", caption: "Is this the final return up to dissolution?", kind: "flag", role: "input", section: "identification" },
  { line: "079", caption: "If an election was made under section 261, the functional currency used", kind: "code", role: "input", section: "identification", requirement: "conditional", note: "A functional-currency filer reports in a currency other than Canadian dollars, so every figure on the return is in that currency." },
  { line: "080", caption: "Is the corporation a resident of Canada?", kind: "flag", role: "input", section: "identification" },
  { line: "081", caption: "If not resident, the country of residence", kind: "text", role: "input", section: "identification", requirement: "conditional", note: "Schedule 97 is completed and attached." },
  { line: "082", caption: "Is the non-resident corporation claiming an exemption under an income tax treaty?", kind: "flag", role: "input", section: "identification", note: "If yes, Schedule 91 is completed and attached." },
  { line: "085", caption: "If the corporation is exempt from tax under section 149, which paragraph", kind: "code", role: "input", section: "identification", requirement: "conditional", note: "One of three: 1 exempt under paragraph 149(1)(e) or (l), 2 exempt under paragraph 149(1)(j), 4 exempt under other paragraphs of section 149." },
  { line: "300", caption: "Net income or (loss) for income tax purposes", kind: "money", role: "carried-in", section: "taxable-income", note: "Where Schedule 1 lands. Everything downstream is computed from it.", from: { form: "T2SCH1", line: "510", note: "Amount C — the book-to-tax reconciliation" } },
  { line: "311", caption: "Charitable donations from Schedule 2", kind: "money", role: "carried-in", section: "taxable-income", from: { form: "T2SCH2", line: "" } },
  { line: "313", caption: "Cultural gifts from Schedule 2", kind: "money", role: "carried-in", section: "taxable-income", from: { form: "T2SCH2", line: "" } },
  { line: "314", caption: "Ecological gifts from Schedule 2", kind: "money", role: "carried-in", section: "taxable-income", from: { form: "T2SCH2", line: "" } },
  { line: "320", caption: "Taxable dividends deductible under section 112 or 113, or subsection 138(6), from Schedule 3", kind: "money", role: "carried-in", section: "taxable-income", from: { form: "T2SCH3", line: "" } },
  { line: "325", caption: "Part VI.1 tax deduction", kind: "money", role: "computed", section: "taxable-income", note: "Equal to 3.5 times the Part VI.1 tax payable at line 724 — the form says so on the page itself, so it is arithmetic rather than an entry." },
  { line: "331", caption: "Non-capital losses of previous tax years", kind: "money", role: "carried-in", section: "taxable-income", from: { form: "T2SCH4", line: "130" } },
  { line: "332", caption: "Net capital losses of previous tax years", kind: "money", role: "carried-in", section: "taxable-income", note: "Capped by taxable capital gains — a capital loss pool cannot shelter business income.", from: { form: "T2SCH4", line: "225", note: "HALF of line 225 — Schedule 4 records the loss gross, the jacket takes it at the 50% inclusion rate." } },
  { line: "333", caption: "Restricted farm losses of previous tax years", kind: "money", role: "carried-in", section: "taxable-income", note: "Deductible only against farming income (ITA s.31).", from: { form: "T2SCH4", line: "430" } },
  { line: "334", caption: "Farm losses of previous tax years", kind: "money", role: "carried-in", section: "taxable-income", from: { form: "T2SCH4", line: "330" } },
  { line: "335", caption: "Limited partnership losses of previous tax years", kind: "money", role: "carried-in", section: "taxable-income", from: { form: "T2SCH4", line: "", note: "Schedule 4 Part 7, third table — the per-partnership closing balances at line 680 total to this, and that total is the one figure in the part with no numbered box of its own." } },
  { line: "336", caption: "Restricted interest and financing expenses", kind: "money", role: "carried-in", section: "taxable-income", note: "Interest denied in an earlier year under the EIFEL rules (ITA s.18.2) and deducted now against this year’s capacity. See Schedule 130.", from: { form: "T2SCH4", line: "730" } },
  { line: "340", caption: "Taxable capital gains or taxable dividends allocated from a central credit union", kind: "money", role: "input", section: "taxable-income" },
  { line: "350", caption: "Prospector's and grubstaker's shares", kind: "money", role: "input", section: "taxable-income" },
  { line: "352", caption: "Employer deduction for non-qualified securities", kind: "money", role: "input", section: "taxable-income" },
  { line: "355", caption: "Section 110.5 additions or subparagraph 115(1)(a)(vii) additions", kind: "money", role: "input", section: "taxable-income", note: "An ADDITION, after the deductions subtotal — it increases taxable income so a foreign tax credit is not wasted." },
  { line: "360", caption: "Taxable income", kind: "money", role: "computed", section: "taxable-income", note: "The base for Part I tax at line 550, and the ceiling on the small business deduction." },
  { line: "400", caption: "Income eligible for the small business deduction", kind: "money", role: "carried-in", section: "sbd", from: { form: "T2SCH7", line: "" } },
  { line: "405", caption: "Taxable income for the small business deduction", kind: "money", role: "computed", section: "sbd" },
  { line: "410", caption: "Business limit", kind: "money", role: "input", section: "sbd", note: "$500,000, shared across an associated group — see Schedule 23." },
  { line: "425", caption: "Business limit assigned under subsection 125(3.2)", kind: "money", role: "input", section: "sbd" },
  { line: "426", caption: "Reduced business limit", kind: "money", role: "computed", section: "sbd", note: "After both grinds: taxable capital (Schedule 33) and passive income (Schedule 7)." },
  { line: "428", caption: "Reduced business limit after assignment", kind: "money", role: "computed", section: "sbd" },
  { line: "430", caption: "Small business deduction", kind: "money", role: "computed", section: "sbd", note: "The LEAST of active business income, taxable income and the reduced business limit, at 19%." },
  { line: "440", caption: "Aggregate investment income", kind: "money", role: "carried-in", section: "refundable", from: { form: "T2SCH7", line: "" } },
  { line: "450", caption: "Refundable portion of Part I tax", kind: "money", role: "computed", section: "refundable" },
  { line: "520", caption: "Eligible refundable dividend tax on hand at the end of the previous tax year", kind: "money", role: "input", section: "rdtoh" },
  { line: "530", caption: "Eligible refundable dividend tax on hand at the end of the tax year", kind: "money", role: "computed", section: "rdtoh" },
  { line: "545", caption: "Non-eligible refundable dividend tax on hand at the end of the previous tax year", kind: "money", role: "input", section: "rdtoh" },
  { line: "575", caption: "Non-eligible dividend refund for the previous tax year", kind: "money", role: "input", section: "rdtoh" },
  { line: "550", caption: "Base amount of Part I tax", kind: "money", role: "computed", section: "part-1-tax", note: "Taxable income at 38%, before the abatement and the general rate reduction." },
  { line: "560", caption: "Additional tax on personal services business income", kind: "money", role: "computed", section: "part-1-tax" },
  { line: "565", caption: "Additional tax on banks and life insurers", kind: "money", role: "carried-in", section: "part-1-tax", from: { form: "T2SCH68", line: "" } },
  { line: "602", caption: "Recapture of investment tax credit", kind: "money", role: "carried-in", section: "part-1-tax", note: "Clawed back as tax in the year of disposition, however old the credit.", from: { form: "T2SCH31", line: "" } },
  { line: "608", caption: "Federal tax abatement", kind: "money", role: "computed", section: "part-1-tax", note: "Ten per cent of taxable income earned in a province — the room the federal rate leaves for provincial tax." },
  { line: "632", caption: "Federal foreign non-business income tax credit from Schedule 21", kind: "money", role: "carried-in", section: "part-1-tax", from: { form: "T2SCH21", line: "" } },
  { line: "636", caption: "Federal foreign business income tax credit from Schedule 21", kind: "money", role: "carried-in", section: "part-1-tax", note: "Unlike the non-business credit, an unused business credit pools and carries forward.", from: { form: "T2SCH21", line: "" } },
  { line: "638", caption: "General tax reduction for CCPCs from amount I on page 5", kind: "money", role: "computed", section: "part-1-tax" },
  { line: "639", caption: "General tax reduction from amount P on page 5", kind: "money", role: "computed", section: "part-1-tax", note: "The non-CCPC limb. A corporation takes 638 or 639, never both." },
  { line: "640", caption: "Federal logging tax credit from Schedule 21", kind: "money", role: "carried-in", section: "part-1-tax", from: { form: "T2SCH21", line: "" } },
  { line: "641", caption: "Eligible Canadian bank deduction under section 125.21", kind: "money", role: "input", section: "part-1-tax" },
  { line: "648", caption: "Federal qualifying environmental trust tax credit", kind: "money", role: "input", section: "part-1-tax" },
  { line: "652", caption: "Investment tax credit from Schedule 31", kind: "money", role: "carried-in", section: "part-1-tax", from: { form: "T2SCH31", line: "" } },
  { line: "700", caption: "Part I tax payable", kind: "money", role: "carried-in", section: "summary", from: { form: "T2", line: "550" } },
  { line: "705", caption: "Part II.2 tax payable", kind: "money", role: "carried-in", section: "summary", from: { form: "T2SCH56", line: "" } },
  { line: "710", caption: "Part III.1 tax payable", kind: "money", role: "carried-in", section: "summary", note: "The excessive eligible dividend designation charge.", from: { form: "T2SCH55", line: "190", note: "Or line 290 — both parts land here" } },
  { line: "712", caption: "Part IV tax payable", kind: "money", role: "carried-in", section: "summary", from: { form: "T2SCH3", line: "" } },
  { line: "716", caption: "Part IV.1 tax payable", kind: "money", role: "carried-in", section: "summary", from: { form: "T2SCH43", line: "340" } },
  { line: "720", caption: "Part VI tax payable", kind: "money", role: "carried-in", section: "summary", from: { form: "T2SCH38", line: "" } },
  { line: "724", caption: "Part VI.1 tax payable", kind: "money", role: "carried-in", section: "summary", note: "Attracts the s.110(1)(k) deduction (jacket line 325, computed in federal-t2.ts as `partVI1Deduction`) at 3/3.2/3.5 times depending on the tax year end, against taxable income.", from: { form: "T2SCH43", line: "270" } },
  { line: "725", caption: "Part VI.2 tax payable", kind: "money", role: "carried-in", section: "summary", from: { form: "T2SCH67", line: "" } },
  { line: "726", caption: "Part XII.7 tax payable", kind: "money", role: "carried-in", section: "summary", from: { form: "T2SCH78", line: "" } },
  { line: "727", caption: "Part XIII.1 tax payable", kind: "money", role: "carried-in", section: "summary", from: { form: "T2SCH92", line: "" } },
  { line: "728", caption: "Part XIV tax payable", kind: "money", role: "carried-in", section: "summary", from: { form: "T2SCH20", line: "" } },
  { line: "750", caption: "Provincial or territorial jurisdiction", kind: "code", role: "input", section: "summary", note: "Enter \"multiple\" and complete Schedule 5 where there is more than one." },
  { line: "760", caption: "Net provincial or territorial tax payable (except Quebec and Alberta)", kind: "money", role: "computed", section: "summary", note: "The parenthesis is the reason this package has AT1 and CO-17 modules: Alberta and Quebec administer their own corporate tax and are filed separately, so their tax never appears on this line." },
  { line: "770", caption: "Total tax payable", kind: "money", role: "total", section: "summary", note: "Amount A — the SUM of 700 through 760. A return where it exceeds its disclosed components does not add up." },
  { line: "780", caption: "Investment tax credit refund from Schedule 31", kind: "money", role: "carried-in", section: "credits", from: { form: "T2SCH31", line: "" } },
  { line: "784", caption: "Dividend refund from amount JJ on page 7", kind: "money", role: "computed", section: "credits" },
  { line: "788", caption: "Federal capital gains refund from Schedule 18", kind: "money", role: "input", section: "credits" },
  { line: "792", caption: "Federal qualifying environmental trust tax credit refund", kind: "money", role: "input", section: "credits" },
  { line: "795", caption: "Return of fuel charge proceeds to farmers tax credit from Schedule 63", kind: "money", role: "input", section: "credits" },
  { line: "796", caption: "Canadian film or video production tax credit (Form T1131)", kind: "money", role: "input", section: "credits" },
  { line: "797", caption: "Film or video production services tax credit (Form T1177)", kind: "money", role: "input", section: "credits" },
  { line: "798", caption: "Canadian journalism labour tax credit from Schedule 58", kind: "money", role: "input", section: "credits" },
  { line: "800", caption: "Tax withheld at source", kind: "money", role: "input", section: "credits" },
  { line: "801", caption: "Total payments on which tax has been withheld", kind: "money", role: "input", section: "credits" },
  { line: "808", caption: "Provincial and territorial capital gains refund from Schedule 18", kind: "money", role: "input", section: "credits" },
  { line: "812", caption: "Provincial and territorial refundable tax credits from Schedule 5", kind: "money", role: "input", section: "credits" },
  { line: "840", caption: "Tax instalments paid", kind: "money", role: "input", section: "credits" },
  { line: "890", caption: "Total credits", kind: "money", role: "total", section: "credits", note: "Amount B. The balance is A minus B, and the form prints THAT without a numbered box — so a balance owing carries no line number and must never be filed against 890, which would report it as credits claimed." },
  { line: "894", caption: "Refund code", kind: "code", role: "input", section: "credits", note: "A single digit directing what happens to an overpayment. Never a dollar amount." },
];
