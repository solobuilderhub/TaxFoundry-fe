/**
 * Alberta Corporate Income Tax Return — AT1 (AT1) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/sources/tra-forms/pdf/AT1-jacket-TRA11722.pdf, retrieved 2026-09-14.
 *
 * Two documents: this PDF for what the form says and prints, and the AT1 Net
 * File specification for what transmits (the Line-Item-IDs, the M/O/X
 * requirement per field, and the nine lines the RSI still carries that this
 * form no longer prints). See ca-tax's `jacket.ts` header.
 *
 * Carries EVERY field, not just `input` ones — a paper view shows the whole
 * form. The paper renderer, not this file, is responsible for keeping
 * computed/carried-in lines read-only.
 */
export type PaperFieldRole = "input" | "computed" | "total" | "carried-in" | "not-collected";
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
  /** Text the form prints inside this box AFTER its last numbered line, verbatim. */
  printedAfter?: string;
}

export const AT1_JACKET_SECTIONS: readonly PaperSectionDef[] = [
  { id: "identification", title: "Identification", description: "Who is filing, for which period, at which address." },
  { id: "status", title: "Corporate status and elections", description: "The questions that decide which schedules TRA expects, and the coded answers behind the printed tick boxes — see AT1_JACKET_CODE_OPTIONS." },
  { id: "financials", title: "Financial statement figures", description: "Two mandatory figures the page prints \"to nearest thousand\", with the three trailing zeros pre-printed in the box." },
  { id: "income", title: "Alberta income", description: "Whether Alberta figures diverge from federal, the taxable income itself, and the allocation factor that apportions it.", printedBefore: "Report all monetary amounts in dollars; Do Not include cents. Show negative amounts in brackets ( )." },
  { id: "tax", title: "Alberta tax and deductions", description: "Basic tax — day-weighted across five rate bands the page prints as a lettered table (AT1_JACKET_DAY_BANDS / AT1_JACKET_RATE_ROWS) — then the deductions that reduce it." },
  { id: "credits", title: "Credits and balance", description: "Six credits total at 088 and net against tax payable to give the balance at 090." },
  { id: "preparer", title: "Preparer", description: "Two lines the page prints between the balance and the certification box. They were banded into \"status\" with the corporate-status questions, eleven boxes and a page away from where the form puts them." },
  { id: "certification", title: "CERTIFICATION", printedAfter: "Note: This email must belong to the owner, operator, or director of the corporation. It is not intended for accountants, tax preparers, or third party. It will only be used to send important TRACS updates and key documents related to your tax account." },
];

/** In the order the FORM prints them — not the specification's numeric order. The credits block runs 129, 082, 085, 110, 086, 115, 087. */
export const AT1_JACKET_FIELDS: readonly PaperField[] = [
  { line: "000005001", caption: "Software Approval Code", kind: "text", role: "input", section: "identification", requirement: "mandatory", note: "The TRA-issued Software Approval Code. Printed inside the \"For Department Use\" box, beside a pre-printed \"01RT\". Supplied by the transmitter — see the EDI schedule’s own EDI001001, which carries the same code." },
  { line: "000010001", caption: "Legal Name of Corporation", kind: "text", role: "input", section: "identification", requirement: "mandatory" },
  { line: "000011001", caption: "Operating Name of Corporation", kind: "text", role: "input", section: "identification", requirement: "optional" },
  { line: "000012001", caption: "Mailing Address of Business Line 1", kind: "text", role: "input", section: "identification", requirement: "mandatory", note: "The page prints one caption, \"Mailing Address of Business\", across both this box and 013; the specification’s \"Line 1\"/\"Line 2\" is its own disambiguation and is kept because nothing else distinguishes the two." },
  { line: "000013001", caption: "Mailing Address of Business Line 2", kind: "text", role: "input", section: "identification", requirement: "conditional" },
  { line: "000014001", caption: "City/Town", kind: "text", role: "input", section: "identification", requirement: "mandatory" },
  { line: "000015001", caption: "Prov./State", kind: "text", role: "input", section: "identification", requirement: "conditional" },
  { line: "000016001", caption: "Country Code (other than Canada)", kind: "text", role: "input", section: "identification", requirement: "conditional" },
  { line: "000017001", caption: "Postal or Zip Code", kind: "text", role: "input", section: "identification", requirement: "mandatory" },
  { line: "000025001", caption: "Name of the person to contact to discuss this return", kind: "text", role: "input", section: "identification", requirement: "mandatory" },
  { line: "000026001", caption: "Contact Person’s Telephone No.", kind: "text", role: "input", section: "identification", requirement: "mandatory", note: "The page labels the row \"Telephone number:\" and numbers the \"Area Code\" sub-box; the whole number files against this one id." },
  { line: "000028001", caption: "SIC Code", kind: "code", role: "input", section: "identification", requirement: "mandatory" },
  { line: "000034001", caption: "Alberta Corporate Account Number (CAN) (Enter the 9 or 10 digit account number)", kind: "flag", role: "input", section: "identification", requirement: "mandatory" },
  { line: "000035001", caption: "Federal Business Number (BN)", kind: "text", role: "input", section: "identification", requirement: "mandatory" },
  { line: "000036001", caption: "Taxation Year Beginning", kind: "date", role: "input", section: "identification", requirement: "mandatory" },
  { line: "000037001", caption: "Taxation Year Ending", kind: "date", role: "input", section: "identification", requirement: "mandatory" },
  { line: "000018001", caption: "Assessment Address Name", kind: "text", role: "input", section: "identification", requirement: "optional", note: "Assessment address — the name line. Not on the printed AT1 (TRA11722 Rev. 2025-07), which carries only the MAILING address at 012-017 and prints a footnote sending every address change through TRACS. Retained because the specification still tabulates the block; conditional, so omitted rather than zeroed when absent." },
  { line: "000019001", caption: "Assessment Address Line 1", kind: "text", role: "input", section: "identification", requirement: "conditional", note: "Assessment address — address line 1. Not on the printed AT1 (TRA11722 Rev. 2025-07), which carries only the MAILING address at 012-017 and prints a footnote sending every address change through TRACS. Retained because the specification still tabulates the block; conditional, so omitted rather than zeroed when absent." },
  { line: "000020001", caption: "Assessment Address Line 2", kind: "text", role: "input", section: "identification", requirement: "optional", note: "Assessment address — address line 2. Not on the printed AT1 (TRA11722 Rev. 2025-07), which carries only the MAILING address at 012-017 and prints a footnote sending every address change through TRACS. Retained because the specification still tabulates the block; conditional, so omitted rather than zeroed when absent." },
  { line: "000021001", caption: "City/Town", kind: "text", role: "input", section: "identification", requirement: "conditional", note: "Assessment address — the city/town. Not on the printed AT1 (TRA11722 Rev. 2025-07), which carries only the MAILING address at 012-017 and prints a footnote sending every address change through TRACS. Retained because the specification still tabulates the block; conditional, so omitted rather than zeroed when absent." },
  { line: "000022001", caption: "Prov./State", kind: "text", role: "input", section: "identification", requirement: "conditional", note: "Assessment address — the province/state. Not on the printed AT1 (TRA11722 Rev. 2025-07), which carries only the MAILING address at 012-017 and prints a footnote sending every address change through TRACS. Retained because the specification still tabulates the block; conditional, so omitted rather than zeroed when absent." },
  { line: "000023001", caption: "Country Code", kind: "text", role: "input", section: "identification", requirement: "conditional", note: "Assessment address — the country code. Not on the printed AT1 (TRA11722 Rev. 2025-07), which carries only the MAILING address at 012-017 and prints a footnote sending every address change through TRACS. Retained because the specification still tabulates the block; conditional, so omitted rather than zeroed when absent." },
  { line: "000024001", caption: "Postal/Zip Code", kind: "text", role: "input", section: "identification", requirement: "conditional", note: "Assessment address — the postal/zip code. Not on the printed AT1 (TRA11722 Rev. 2025-07), which carries only the MAILING address at 012-017 and prints a footnote sending every address change through TRACS. Retained because the specification still tabulates the block; conditional, so omitted rather than zeroed when absent." },
  { line: "000027001", caption: "Contact Person’s Fax No.", kind: "text", role: "input", section: "identification", requirement: "optional", note: "Contact person’s fax number. Not on the printed AT1 — the current form prints one telephone number for the contact and nothing else. Optional." },
  { line: "000093001", caption: "Fax number for transmitting NOA", kind: "text", role: "input", section: "identification", requirement: "optional", note: "Fax number for transmitting the Notice of Assessment. Not on the printed AT1, which routes notices by the authorized email at 105 instead, under a printed note restricting that address to an owner, operator or director. Optional." },
  { line: "000001001", caption: "Is the corporation associated with one or more Canadian-controlled private corporations?", kind: "flag", role: "input", section: "status", requirement: "mandatory", note: "The question itself is not printed on this page — TRA prints it on AT1 Schedule 1, whose own box 001 carries this identical caption, and the jacket’s 001 sits inside the \"For Department Use\" box with no words beside it. The VALUE files here regardless: four accepted certification samples file it as the first value under Schedule 000 and none ever files 001001001. See LINE_001’s doc comment." },
  { line: "000029001", caption: "Type of Corporation", kind: "code", role: "input", section: "status", requirement: "mandatory" },
  { line: "000030001", caption: "Special Corporation Status (if applicable)", kind: "code", role: "input", section: "status", requirement: "conditional" },
  { line: "000031001", caption: "Has there been a wind-up of a subsidiary under federal Income Tax Act (ITA) section 88 during the current taxation year?", kind: "flag", role: "input", section: "status", requirement: "mandatory" },
  { line: "000032001", caption: "Is this the first year of filing after an amalgamation?", kind: "flag", role: "input", section: "status", requirement: "mandatory" },
  { line: "000038001", caption: "Has the taxation year end changed since the last return was filed?", kind: "flag", role: "input", section: "status", requirement: "mandatory" },
  { line: "000039001", caption: "If \"Yes\", specify the reason:", kind: "code", role: "input", section: "status", requirement: "conditional" },
  { line: "000041001", caption: "State the functional currency used, if other than Canadian:", kind: "code", role: "input", section: "status", requirement: "conditional" },
  { line: "000043001", caption: "If field 041 is checked, provide average exchange rate for calculation: (functional currency converting to Canadian currency)", kind: "text", role: "input", section: "status", requirement: "conditional" },
  { line: "000050001", caption: "Is this a final return?", kind: "flag", role: "input", section: "status", requirement: "mandatory" },
  { line: "000051001", caption: "If \"Yes\", specify the reason:", kind: "code", role: "input", section: "status", requirement: "conditional" },
  { line: "000052001", caption: "Amalgamation, specify date of amalgamation:", kind: "date", role: "input", section: "status", requirement: "conditional" },
  { line: "000053001", caption: "Dissolution of corporation, specify date operations ceased:", kind: "date", role: "input", section: "status", requirement: "conditional" },
  { line: "000054001", caption: "Was there a transfer of property under federal ITA subsection 85(1), 85(2) or 97(2) that occurred after May 30, 2001, and during the taxation year being reported?", kind: "flag", role: "input", section: "status", requirement: "mandatory" },
  { line: "000047001", caption: "Gross Revenue (to nearest thousand)", kind: "money", role: "input", section: "financials", requirement: "mandatory" },
  { line: "000048001", caption: "Total Assets (book value per balance sheet, to nearest thousand)", kind: "money", role: "input", section: "financials", requirement: "mandatory" },
  { line: "000060001", caption: "Is the corporation reporting different taxable income for Alberta and federal purposes?", kind: "flag", role: "input", section: "income", requirement: "mandatory" },
  { line: "000061001", caption: "Has the corporation elected to use any different discrectionary amounts for the current year claim or do opening balances differ for federal and Alberta purposes?", kind: "flag", role: "input", section: "income", requirement: "mandatory" },
  { line: "000062001", caption: "Alberta taxable income or (loss)", kind: "money", role: "input", section: "income", requirement: "mandatory", note: "Alberta taxable income. Where it differs from federal, Schedule 12 must reconcile the difference item by item — which is what lines 060 and 061 above decide. See the two instruction blocks the page prints over this box." },
  { line: "000065001", caption: "Alberta Allocation Factor (Schedule 2, column I)", kind: "rate", role: "carried-in", section: "income", requirement: "mandatory", note: "The Reg 402 allocation factor from Schedule 2, to six decimal places. A single-jurisdiction corporation files 1.0, not a blank.", sourceText: "Schedule 2, column I", from: { form: "AT1SCH2", line: "", note: "Area A's (A/B + C/D) × ½ allocation factor. Has no line number of its own on Schedule 2 — that schedule's own doc comment says it is 'a computed column carried to the jacket at 000065, which is where it's actually filed.' The page names it by COLUMN for that reason: \"Schedule 2, column I\"." } },
  { line: "000066001", caption: "Amount Taxable in Alberta line 062 X line 065 * (if negative, enter \"0\")", kind: "money", role: "computed", section: "income", note: "PRINTED but never transmitted: the specification’s cross-reference tables have no row for 066, and the RSI carries 062, 065 and the resulting tax at 068 instead. It is on the form because it is the base every rate in the table below it is applied to, and federal-facing schedules cite it by number — AT1 Schedule 4 column D is \"B X C X (AT1 line 068 / AT1 line 066)\". Absent from this definition until the 2026-09-14 re-read; the consumer app’s generated layout carried a comment admitting the gap.", footnoteMarks: [2] },
  { line: "000068001", caption: "Total (line G + line H + line I + line J + line K)", kind: "money", role: "computed", section: "tax", requirement: "mandatory", note: "A = (062 − 064) × 065 × rate. The base every deduction below works against. The page does not print one rate: it prints five, day-weighted across the bands Alberta cut the general rate on — see AT1_JACKET_RATE_ROWS, whose multipliers a test cross-checks against AB_GENERAL_RATE_BANDS." },
  { line: "000070001", caption: "Alberta Small Business Deduction", kind: "money", role: "carried-in", section: "tax", requirement: "mandatory", sourceText: "Schedule 1, line 031", from: { form: "AT1SCH1", line: "001031001", note: "Alberta small business deduction. The page names the line: \"Schedule 1, line 031\"." } },
  { line: "000072001", caption: "Alberta Foreign Investment Income Tax Credit", kind: "money", role: "carried-in", section: "tax", requirement: "mandatory", sourceText: "Schedule 4, line 020", from: { form: "AT1SCH4", line: "004020001", note: "Foreign investment income tax credit. The page names the line: \"Schedule 4, line 020\"." } },
  { line: "000076001", caption: "Other deductions per AT1 Schedule 3 (AITC, CITC, and APITC)", kind: "money", role: "carried-in", section: "tax", requirement: "mandatory", from: { form: "AT1SCH3", line: "003604001", note: "Maximum Allowable Deduction (MAD) — printed on Schedule 3 itself: \"Enter this amount on AT1 page 2, line 076.\"" } },
  { line: "000079001", caption: "Total (lines 070 + 072 + 076)", kind: "money", role: "total", section: "tax", note: "PRINTED but never transmitted, and it does NOT total the same lines the specification’s 080 formula subtracts. The page strikes 070 + 072 + 076; §3.2.3.1 computes 080 as 068 − (070 + 071 + 072 + 074 + 076). The difference is 071 and 074, both always nil and both absent from the printed page, so the two agree arithmetically for every filable year — the same relationship AT1 Schedule 4’s line 018 documents. Do not \"fix\" either one to match the other." },
  { line: "000080001", caption: "Alberta Tax Payable (lines 068 - line 079)", kind: "money", role: "computed", section: "tax", requirement: "mandatory", note: "Tax payable before credits — the 090 balance starts here." },
  { line: "000064001", caption: "Royalty Tax Deduction", kind: "money", role: "computed", section: "tax", requirement: "mandatory", note: "Royalty tax deduction (was AT1 Schedule 5). ALWAYS NIL — the Alberta Royalty Tax Credit programme was eliminated at the end of 2006. Retained because the specification still marks it mandatory; not on the printed form." },
  { line: "000071001", caption: "Alberta Manufacturing and Processing Profits Deduction", kind: "money", role: "computed", section: "tax", requirement: "mandatory", note: "Alberta manufacturing and processing profits deduction (was AT1 Schedule 11). ALWAYS NIL — pre-2001-04-01 only. Retained because the specification still marks it mandatory; not on the printed form. Line 079, the printed deductions subtotal, does not include it." },
  { line: "000074001", caption: "Alberta Political Contributions Tax Credit", kind: "money", role: "computed", section: "tax", requirement: "mandatory", note: "Alberta political contributions tax credit (was AT1 Schedule 8). ALWAYS NIL — corporate political contributions have been prohibited in Alberta since 2015-06-15 (Bill 1), so the contribution the credit rewards cannot lawfully be made. Retained because the specification still marks it mandatory; not on the printed form. Line 079, the printed deductions subtotal, does not include it." },
  { line: "000129001", caption: "Innovation Employment Grant", kind: "money", role: "carried-in", section: "credits", requirement: "mandatory", note: "The Innovation Employment Grant. Netted at 090 via the printed form’s 088 subtotal, which the Net File specification’s own line-090 rule omits — see AT1_BALANCE_CREDIT_LINES.", sourceText: "Schedule 29, line 134", from: { form: "AT1SCH29", line: "029134001", note: "Net Innovation Employment Grant" } },
  { line: "000082001", caption: "Installments and other payments credited to income tax account for this taxation year", kind: "money", role: "input", section: "credits", requirement: "mandatory", note: "The page spells it \"Installments\" and stops there. The specification adds \"and ARTC instalments\" (Alberta Royalty Tax Credit instalments, a closed programme) and spells it \"Instalments\". The caption follows the page; this note records the other document." },
  { line: "000085001", caption: "Interactive Digital Media Tax Credit (IDMTC)", kind: "money", role: "input", section: "credits", requirement: "mandatory" },
  { line: "000110001", caption: "Tax Certificate Number (issued at time of IDMTC approval)", kind: "text", role: "input", section: "credits", requirement: "conditional", note: "Issued by TRA when the Interactive Digital Media Tax Credit at 085 is approved. Conditional on that claim, which is why the page prints it directly beneath 085 rather than in line-number order." },
  { line: "000086001", caption: "Alberta Capital Gains Refund (available only to mutual fund corporations and public investment corporations)", kind: "money", role: "input", section: "credits", requirement: "mandatory" },
  { line: "000115001", caption: "Alberta Film and Television Tax Credit (FTTC)", kind: "money", role: "input", section: "credits", requirement: "mandatory" },
  { line: "000087001", caption: "Other Credits (QET)", kind: "money", role: "input", section: "credits", requirement: "mandatory", note: "Other credits, for a qualifying environmental trust. Mandatory, and part of the 090 formula — it was missing from the payload table while still being subtracted from the balance." },
  { line: "000088001", caption: "Total (lines 129 + 082 + 085 + 086 + 115 + 087)", kind: "money", role: "total", section: "credits", note: "PRINTED but never transmitted — the RSI carries the six parts and the result at 090. Its caption is nevertheless the single best piece of evidence in this package for which credits net against the balance: the page names 129 and 115, both of which §3.2.3.1’s own line-090 rule omits while marking them mandatory. AT1_BALANCE_CREDIT_LINES follows this caption, and a test asserts the two name the same six lines." },
  { line: "000090001", caption: "Balance Unpaid (Overpayment) (line 080 - line 088)", kind: "money", role: "computed", section: "credits", requirement: "mandatory", note: "080 − (129 + 082 + 085 + 086 + 115 + 087), which is the printed form’s own 088 subtotal. SIGNED: negative is an overpayment, and 092 then chooses between refunding it and applying it to next year. The Net File specification still states the pre-2020 formula — see AT1_BALANCE_CREDIT_LINES for why the form governs." },
  { line: "000091001", caption: "If line 090 is a balance due (i.e. positive amount), indicate the amount enclosed with the return", kind: "money", role: "input", section: "credits", requirement: "mandatory", note: "Fixed at zero for Net File by the specification itself — a Net File return carries no payment instrument, whatever the balance at 090 says." },
  { line: "000092001", caption: "If line 090 is an overpayment (i.e. negative amount), indicate the desired disposition:", kind: "code", role: "input", section: "credits", requirement: "conditional" },
  { line: "000081001", caption: "Alberta Scientific Research & Experimental Development Tax Credit", kind: "money", role: "computed", section: "credits", requirement: "mandatory", note: "Alberta SR&ED tax CREDIT (was AT1 Schedule 9) — distinct from Schedule 16’s expenditure-pool deduction, which is live. ALWAYS NIL: eliminated for expenditures after 2019-12-31 and replaced by the Innovation Employment Grant at line 129. Retained because the specification still marks it mandatory; not on the printed form, and not in the printed 088 credits subtotal — though §3.2.3.1’s own line-090 rule still nets it. See AT1_BALANCE_CREDIT_LINES." },
  { line: "000095001", caption: "Was this return prepared by a tax preparer for a fee?", kind: "flag", role: "input", section: "preparer", requirement: "mandatory" },
  { line: "000096001", caption: "If yes, provide the preparer's name or firm name:", kind: "text", role: "input", section: "preparer", requirement: "conditional" },
  { line: "000097001", caption: "Print Surname", kind: "text", role: "input", section: "certification", requirement: "mandatory", note: "The signing officer’s surname. The page sets these three boxes inside \"I, ___\"." },
  { line: "000098001", caption: "Print First Name", kind: "text", role: "input", section: "certification", requirement: "mandatory" },
  { line: "000099001", caption: "Position, Office or Rank", kind: "text", role: "input", section: "certification", requirement: "mandatory" },
  { line: "000101001", caption: "Date (YYYY-MM-DD)", kind: "date", role: "input", section: "certification", requirement: "mandatory" },
  { line: "000103001", caption: "Telephone Number", kind: "text", role: "input", section: "certification", requirement: "mandatory" },
  { line: "000105001", caption: "Authorized Email", kind: "text", role: "input", section: "certification", requirement: "mandatory", note: "Must belong to an owner, operator or director of the corporation — the page prints a note saying so, and excluding accountants, preparers and third parties by name. See the certification box’s printedAfter." },
];

/** The lines the RSI still carries that this form no longer prints anywhere — four of them mandatory, so they transmit even when nil. A paper Form View must not render these among the printed rows: they are indistinguishable there, on a view whose whole purpose is to be the page. */
export const AT1_JACKET_LINES_NOT_PRINTED: readonly string[] = ["018", "019", "020", "021", "022", "023", "024", "027", "064", "071", "074", "081", "093"];

export const AT1_JACKET_FOOTNOTES: readonly string[] = [
  "*All address changes should be done via TRACS or contacting TRA.",
  "**The address will not be updated unless it is a first time filer.",
  "if the corporation has permanent establishments only in Alberta, multiply by \"1\"",
  "The personal information collected through Alberta Corporate Income Tax Return - AT1 for 2004 and Subsequent Taxation Years is for the purpose of administering the Corporate Income Tax program and will be input into an automated system to make decisions, recommendations, or predictions. This collection is authorized by section 4 (c) of the Protection of Privacy Act. For questions about the collection of personal information, email Tax and Revenue Administration at tra.revenue@gov.ab.ca.",
  "The AT1 and applicable schedules must be received by Tax and Revenue Administration (TRA) within 6 months of the corporation's taxation year end. Refer to Filing Exemption Checklist to determine if the corporation is exempt from filing. If the corporation is not exempt from filing, the corporation must file electronically using net file unless it is an insurance corporation, a non-resident corporation, or reports in functional currency.",
  "Taxable Income: The calculation of taxable income for federal purposes can differ from the calculation for Alberta purposes if the corporation chooses to use different discretionary deduction amounts (e.g., different application of losses, CCA, charitable donation, etc.).",
  "(An assessed balance, including interest and penalty charges, of less than $20.00 will be neither charged nor refunded)",
];

export interface PaperFootnotePlacement {
  /** Index into the footnote list above. */
  footnote: number;
  /** The section id at whose foot the page prints it. */
  section: string;
  /** The glyph the page prints. Absent where the page anchors the note by naming a line instead. */
  mark?: string;
}

export const AT1_JACKET_FOOTNOTE_PLACEMENT: readonly PaperFootnotePlacement[] = [
  { footnote: 0, section: "identification" },
  { footnote: 1, section: "identification" },
  { footnote: 2, section: "income", mark: "*" },
  { footnote: 3, section: "identification" },
  { footnote: 4, section: "identification" },
  { footnote: 5, section: "income" },
  { footnote: 6, section: "credits" },
];


export interface JacketBlockHeading {
  /** The printed line the heading stands immediately above. */
  aboveLine: string;
  text: string;
  footnoteMarks?: readonly number[];
}

/** Three share `aboveLine: "062"` — the page stacks the Schedule 12 warning, the box heading and the federal-equality instruction. Print every match, in order. */
export const AT1_JACKET_BLOCK_HEADINGS: readonly JacketBlockHeading[] = [
  { aboveLine: "026", text: "Telephone number:" },
  { aboveLine: "028", text: "Nature of Business" },
  { aboveLine: "062", text: "If line 060 and/or 061 is \"Yes\", then schedule 12 and supporting schedules MUST be completed to reconcile federal and Alberta taxable income." },
  { aboveLine: "062", text: "Alberta taxable income or (loss)" },
  { aboveLine: "062", text: "If both lines 060 and 061 are \"No\", then line 062 must equal federal T2, lines 360 - 370 OR, if reporting a loss, enter the amount from federal Schedule 4 lines 110 + 310 If either line 060 or 061 is \"Yes\", enter the amount from Schedule 12, line 090" },
  { aboveLine: "065", text: "(If line 062 is negative, complete Schedule 10 to request a loss carry-back, if applicable)" },
  { aboveLine: "068", text: "Basic Alberta Tax Payable Number of days in taxation year:" },
  { aboveLine: "092", text: "Make cheque payable to Government of Alberta" },
  { aboveLine: "101", text: "am an authorized signing officer of the corporation. I certify this return, including accompanying schedules and statements, has been examined by me and is a true, correct and complete return. I further certify that the method of computing income for this taxation year is consistent with that of the previous taxation year except as specifically disclosed in a statement to this return." },
];

export interface JacketDayBand {
  /** The letter the page prints beside the box, parentheses included. */
  letter: string;
  label: string;
}

export interface JacketRateRow {
  letter: string;
  /** Verbatim, trailing "=" and capital X included. */
  formula: string;
  /** Which day band the formula divides by (F) — never (F) itself. */
  daysLetter: string;
  rate: number;
}

/** Six bands, five rates: (F) is the denominator, not a sixth band. */
export const AT1_JACKET_DAY_BANDS: readonly JacketDayBand[] = [
  { letter: "(A)", label: "after March 31, 2006 and before July 1, 2015" },
  { letter: "(B)", label: "after June 30, 2015 and before July 1, 2019" },
  { letter: "(C)", label: "after June 30, 2019 and before January 1, 2020" },
  { letter: "(D)", label: "after December 31, 2019 and before July 1, 2020" },
  { letter: "(E)", label: "after June 30, 2020" },
  { letter: "(F)", label: "Total days in tax year" },
];

export const AT1_JACKET_RATE_ROWS: readonly JacketRateRow[] = [
  { letter: "(G)", formula: "Line 066 X .100 X [line A/(line F)]=", daysLetter: "(A)", rate: 0.1 },
  { letter: "(H)", formula: "Line 066 X .120 X [line B/(line F)]=", daysLetter: "(B)", rate: 0.12 },
  { letter: "(I)", formula: "Line 066 X .110 X [line C/(line F)]=", daysLetter: "(C)", rate: 0.11 },
  { letter: "(J)", formula: "Line 066 X .100 X [line D/(line F)]=", daysLetter: "(D)", rate: 0.1 },
  { letter: "(K)", formula: "Line 066 X .080 X [line E/(line F)]=", daysLetter: "(E)", rate: 0.08 },
];

export interface JacketCodeOption {
  /** The digit the page prints beside the tick box, and the value transmitted. */
  code: string;
  label: string;
}

/** Printed line → its tick-box options. Line 028 is a code too and is absent: its value is a four-digit SIC code from a published classification, not a list of five. */
export const AT1_JACKET_CODE_OPTIONS: Readonly<Record<string, readonly JacketCodeOption[]>> = {
  "029": [
    { code: "1", label: "Canadian-controlled private corporation throughout the year (excluding Alberta professional)" },
    { code: "2", label: "Alberta professional" },
    { code: "3", label: "Other private" },
    { code: "4", label: "Public" },
    { code: "5", label: "Other, specify:" },
  ],
  "030": [
    { code: "1", label: "Investment Corporation" },
    { code: "2", label: "Mutual Fund Corporation" },
    { code: "3", label: "Co-operative" },
    { code: "4", label: "Credit Union" },
    { code: "5", label: "Corporations exempt under the federal ITA section 149" },
    { code: "6", label: "Insurance Corporation" },
    { code: "7", label: "Non-resident Corporation" },
  ],
  "039": [
    { code: "1", label: "Canada Revenue Agency (CRA) approved tax year end change" },
    { code: "2", label: "Change in control" },
    { code: "3", label: "Final Return" },
  ],
  "041": [
    { code: "1", label: "United States of America" },
    { code: "2", label: "United Kingdom" },
    { code: "3", label: "European Monetary Union" },
    { code: "4", label: "Australia" },
    { code: "5", label: "Japan" },
  ],
  "051": [
    { code: "1", label: "Amalgamation, specify date of amalgamation:" },
    { code: "2", label: "Discontinuance of permanent establishment in Alberta" },
    { code: "3", label: "Bankruptcy" },
    { code: "4", label: "Wind-up into parent" },
    { code: "5", label: "Dissolution of corporation, specify date operations ceased:" },
  ],
  "092": [
    { code: "1", label: "Refund" },
    { code: "2", label: "Apply refund to next taxation year" },
  ],
};

/** Page 1's top-right box. `unmodelled` is line 004: printed, uncaptioned, in no spec table and in no certification sample — so there is nothing to transcribe, and guessing a caption is how a real figure lands against the wrong box. */
export const AT1_JACKET_DEPARTMENT_USE = {
  heading: "For Department Use",
  preprinted: "01RT",
  lines: ["005", "001", "004"] as readonly string[],
  unmodelled: ["004"] as readonly string[],
};
