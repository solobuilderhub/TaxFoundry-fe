/**
 * Investment tax credits — corporations (T2SCH31) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/sources/cra-forms/T2SCH31-sred-itc.pdf, retrieved 2026-08-11.
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

export const T2_SCHEDULE_31_SECTIONS: readonly PaperSectionDef[] = [
  { id: "eligibility", title: "Parts 2–3 — Eligibility", description: "Whether the corporation is a qualifying corporation, which decides whether the SR&ED credit is refundable and at what rate." },
  { id: "qualified-property", title: "Parts 4–7 — Investment tax credit from qualified property", description: "The Atlantic investment tax credit on qualified property. Its balances run in parallel with every other credit on this form." },
  { id: "sred-expenditures", title: "Parts 8–11 — Qualified SR&ED expenditures and the expenditure limit", description: "The pool, and the CCPC expenditure limit that decides how much of it earns the enhanced 35% rate rather than the general 15%." },
  { id: "sred-balances", title: "Parts 12–17 — SR&ED credit, balances and recapture", description: "The SR&ED continuity block, its carryback request and its recapture." },
  { id: "mining", title: "Part 18 — Pre-production mining expenditures" },
  { id: "apprenticeship", title: "Parts 19–21 — Apprenticeship job creation expenditures" },
  { id: "child-care", title: "Part 22 — Child care spaces expenditures", description: "Balances only. Revision 26 retired the recapture rows along with the credit." },
  { id: "clean-economy", title: "Part 23 — Clean economy investment tax credits", description: "New in revision 26, and the part that replaced the child care recapture block. Each credit is computed on its own schedule and lands here." },
];

export const T2_SCHEDULE_31_FIELDS: readonly PaperField[] = [
  { line: "101", caption: "Is the corporation a qualifying corporation?", kind: "flag", role: "input", section: "eligibility", note: "A qualifying corporation gets a REFUNDABLE SR&ED credit. The answer changes the rate and whether unused credit is paid out or carried." },
  { line: "390", caption: "Enter your taxable income for the previous tax year1 (prior to any loss carrybacks applied)", kind: "money", role: "carried-in", section: "eligibility", from: { form: "T2", line: "360", note: "The previous year's taxable income" } },
  { line: "650", caption: "Is the qualifying corporation an excluded corporation as defined under subsection 127.1(2)?", kind: "flag", role: "input", section: "eligibility" },
  { line: "102", caption: "Is the corporation claiming a contribution in the current year to an agricultural organization whose goal is to Yes No finance SR&ED work (for example, check-off dues)?", kind: "flag", role: "input", section: "eligibility" },
  { line: "210", caption: "Credit deemed as a remittance of co-op corporations", kind: "money", role: "input", section: "qualified-property" },
  { line: "215", caption: "Credit expired", kind: "money", role: "input", section: "qualified-property", note: "Credit expired — qualified property. The same caption is 515, 615, 770 and 845 on other credits." },
  { line: "220", caption: "ITC at the beginning of the tax year (amount 5A minus amount 5B)", kind: "money", role: "computed", section: "qualified-property" },
  { line: "230", caption: "Credit transferred on an amalgamation or the wind-up of a subsidiary", kind: "money", role: "input", section: "qualified-property" },
  { line: "235", caption: "ITC from repayment of assistance", kind: "money", role: "input", section: "qualified-property" },
  { line: "250", caption: "Credit allocated from a partnership", kind: "money", role: "input", section: "qualified-property" },
  { line: "260", caption: "Credit deducted from Part I tax", kind: "money", role: "input", section: "qualified-property" },
  { line: "280", caption: "Credit transferred to offset Part VII tax liability", kind: "money", role: "input", section: "qualified-property" },
  { line: "310", caption: "Refund of credit claimed on investments from qualified property (from Part 7)", kind: "money", role: "input", section: "qualified-property" },
  { line: "320", caption: "ITC closing balance of investments from qualified property and qualified resource property (amount 5G minus line 310)", kind: "money", role: "computed", section: "qualified-property" },
  { line: "903", caption: "Total of lines 901 to", kind: "money", role: "input", section: "qualified-property" },
  { line: "350", caption: "Current expenditures (line 557 on Form T661 plus line 103 in Part 3)4", kind: "money", role: "carried-in", section: "eligibility", from: { form: "T661", line: "559", note: "Qualified SR&ED expenditures" } },
  { line: "360", caption: "Capital expenditures incurred after December 15, 2024 (from line 558 on Form T661)", kind: "money", role: "input", section: "sred-expenditures" },
  { line: "370", caption: "Repayments made in the year (from line 560 on Form T661)", kind: "money", role: "input", section: "sred-expenditures" },
  { line: "380", caption: "Total qualified SR&ED expenditures (total of lines 350 to 370)", kind: "money", role: "input", section: "sred-expenditures" },
  { line: "382", caption: "Are you an ECPC as defined in subsection 127(9)?", kind: "money", role: "input", section: "sred-expenditures" },
  { line: "385", caption: "Is the corporation associated with another CCPC for the purpose of calculating the SR&ED expenditure limit?", kind: "money", role: "input", section: "sred-expenditures" },
  { line: "398", caption: "For TYS after December 15, 2024, if this amount is over $60 million, enter $60 million", kind: "money", role: "input", section: "sred-expenditures" },
  { line: "399", caption: "$15 million. If you are an ECPC that is a member of a consolidated group, enter the average, over the period of three fiscal years immediately preceding and ending in the last calendar year that ended before the end of the particular tax year, of the annual revenue of the consolidated group, minus $15 million.5 If this amount is nil or negative, enter \"0\". If this amount is over $60 million, enter $60 million", kind: "money", role: "input", section: "sred-expenditures" },
  { line: "400", caption: "If associated, the allocation of the SR&ED expenditure limit, as provided on Schedule 49", kind: "money", role: "input", section: "sred-expenditures" },
  { line: "410", caption: "Your SR&ED expenditure limit for the year (enter amount 10C, line 400, or amount 10D, whichever applies)", kind: "money", role: "computed", section: "sred-expenditures", note: "The expenditure limit decides how much of the pool earns the enhanced 35% rate; above it the rate is the general 15%." },
  { line: "420", caption: "Current SR&ED expenditures (from line 350 in Part 8) or the expenditure limit (from line 410), whichever is less", kind: "money", role: "input", section: "sred-expenditures" },
  { line: "430", caption: "Line 350 minus line 410 (if negative, enter \"0\")", kind: "money", role: "input", section: "sred-expenditures" },
  { line: "440", caption: "Capital expenditures incurred after December 15, 2024 (from line 360 in Part 8) or amount × 35% = 11D 11C above, whichever is less", kind: "money", role: "input", section: "sred-expenditures" },
  { line: "450", caption: "Line 360 minus amount 11C above (if negative, enter \"0\")", kind: "money", role: "input", section: "sred-expenditures" },
  { line: "460", caption: "Repayment of assistance that reduced a qualifying expenditure eligible for the 35% SR&ED ITC rate", kind: "money", role: "input", section: "sred-expenditures" },
  { line: "480", caption: "September 16, 2016, that reduced a × 20% = 11G qualifying expenditure incurred before 2015", kind: "money", role: "input", section: "sred-expenditures" },
  { line: "490", caption: "September 16, 2016, that reduced a × 15% = 11H qualifying expenditure incurred after 2014", kind: "money", role: "input", section: "sred-expenditures" },
  { line: "510", caption: "Credit deemed as a remittance of co-op corporations", kind: "money", role: "input", section: "sred-balances" },
  { line: "515", caption: "Credit expired", kind: "money", role: "input", section: "sred-balances", note: "Credit expired — SR&ED." },
  { line: "520", caption: "ITC at the beginning of the tax year (amount 12A minus amount 12B)", kind: "money", role: "computed", section: "sred-balances" },
  { line: "530", caption: "Credit transferred on an amalgamation or the wind-up of a subsidiary", kind: "money", role: "input", section: "sred-balances" },
  { line: "540", caption: "Total current-year credit (from amount 11J)", kind: "money", role: "input", section: "sred-expenditures" },
  { line: "550", caption: "Credit allocated from a partnership", kind: "money", role: "input", section: "sred-balances" },
  { line: "560", caption: "Credit deducted from Part I tax", kind: "money", role: "input", section: "sred-expenditures" },
  { line: "580", caption: "Credit transferred to offset Part VII tax liability", kind: "money", role: "input", section: "sred-balances" },
  { line: "610", caption: "Refund of credit claimed on SR&ED expenditures (from Part 14 or 15, whichever applies)", kind: "money", role: "input", section: "sred-balances" },
  { line: "620", caption: "ITC closing balance on SR&ED (amount 12G minus line 610)", kind: "money", role: "computed", section: "sred-balances" },
  { line: "913", caption: "Total of lines 911 to", kind: "money", role: "input", section: "sred-balances" },
  { line: "841", caption: "Credit deemed as a remittance of co-op corporations", kind: "money", role: "input", section: "mining" },
  { line: "845", caption: "Credit expired", kind: "money", role: "input", section: "mining", note: "Credit expired — pre-production mining." },
  { line: "850", caption: "ITC at the beginning of the tax year (amount 18A minus amount 18B)", kind: "money", role: "computed", section: "mining" },
  { line: "860", caption: "Credit transferred on an amalgamation or the wind-up of a subsidiary", kind: "money", role: "input", section: "mining" },
  { line: "885", caption: "Amount of unused credit carried forward from previous years and applied to reduce Part I tax payable in the current year", kind: "money", role: "input", section: "mining" },
  { line: "890", caption: "ITC closing balance from pre-production mining expenditures (amount 18C minus line 885)", kind: "money", role: "input", section: "mining" },
  { line: "611", caption: "apprentice whose contract number (or social insurance number (SIN) or name) appears below? (If not, you Yes No cannot claim the tax credit.)", kind: "money", role: "input", section: "apprenticeship" },
  { line: "602", caption: "wages11 D or $2,000", kind: "money", role: "input", section: "apprenticeship" },
  { line: "612", caption: "Credit deemed as a remittance of co-op corporations", kind: "money", role: "input", section: "apprenticeship" },
  { line: "615", caption: "Credit expired after 20 tax years", kind: "money", role: "input", section: "apprenticeship", note: "Credit expired — apprenticeship job creation." },
  { line: "625", caption: "ITC at the beginning of the tax year (amount 20A minus amount 20B)", kind: "money", role: "input", section: "apprenticeship" },
  { line: "630", caption: "Credit transferred on an amalgamation or the wind-up of a subsidiary", kind: "money", role: "input", section: "apprenticeship" },
  { line: "635", caption: "ITC from repayment of assistance", kind: "money", role: "input", section: "apprenticeship" },
  { line: "640", caption: "Total current-year credit (amount 19A)", kind: "money", role: "input", section: "apprenticeship" },
  { line: "655", caption: "Credit allocated from a partnership", kind: "money", role: "input", section: "apprenticeship" },
  { line: "660", caption: "Credit deducted from Part I tax", kind: "money", role: "input", section: "apprenticeship" },
  { line: "690", caption: "ITC closing balance from apprenticeship job creation expenditures (amount 20D minus amount 20F)", kind: "money", role: "input", section: "apprenticeship" },
  { line: "933", caption: "Total of lines 931 to", kind: "money", role: "input", section: "apprenticeship" },
  { line: "765", caption: "Credit deemed as a remittance of co-op corporations", kind: "money", role: "input", section: "child-care" },
  { line: "770", caption: "Credit expired after 20 tax years", kind: "money", role: "input", section: "child-care", note: "Credit expired — child care spaces." },
  { line: "775", caption: "ITC at the beginning of the tax year (amount 22A minus amount 22B)", kind: "money", role: "computed", section: "child-care" },
  { line: "777", caption: "Credit transferred on an amalgamation or the wind-up of a subsidiary", kind: "money", role: "input", section: "child-care" },
  { line: "782", caption: "Credit allocated from a partnership", kind: "money", role: "input", section: "child-care" },
  { line: "785", caption: "Credit deducted from Part I tax", kind: "money", role: "input", section: "child-care" },
  { line: "790", caption: "ITC closing balance from child care spaces expenditures (amount 22D minus line 785)", kind: "money", role: "input", section: "child-care", note: "The child care spaces credit was eliminated for later expenditures, and revision 26 retired its recapture rows (792/795/797) with it. Only the closing balance survives, running the remaining pool down." },
  { line: "140", caption: "Clean hydrogen ITC (from Schedule 74)", kind: "money", role: "carried-in", section: "clean-economy", from: { form: "T2SCH74", line: "", note: "Clean hydrogen" } },
  { line: "155", caption: "Clean technology ITC (from Schedule 75)", kind: "money", role: "carried-in", section: "clean-economy", from: { form: "T2SCH75", line: "", note: "Clean technology" } },
  { line: "170", caption: "Clean technology manufacturing ITC (from Schedule 76)", kind: "money", role: "carried-in", section: "clean-economy", from: { form: "T2SCH76", line: "", note: "Clean technology manufacturing" } },
  { line: "185", caption: "Clean electricity ITC", kind: "money", role: "input", section: "clean-economy" },
  { line: "200", caption: "Carbon capture, utilization, and storage ITC (from Schedule 78)", kind: "money", role: "carried-in", section: "clean-economy", from: { form: "T2SCH78", line: "", note: "Carbon capture, utilisation and storage" } },
];
