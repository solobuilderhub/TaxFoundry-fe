/**
 * Alberta Corporate Income Tax Return — AT1 (AT1) — paper Form View layout.
 *
 * GENERATED from the form definition in @classytic/ca-tax:
 *   npx tsx packages/ca-tax/scripts/emit-ui-schedule.ts
 *
 * Ultimately from research/sources/tra-spec/AT1-Chapter3-2025.2-full.txt, retrieved 2026-08-14.
 *
 * Line 066 ("Amount Taxable in Alberta = 062 × 065") appears on the printed
 * form but is absent from AT1_JACKET_CAPTIONS (generated from spec text, not
 * the PDF) — a known gap in the captions generator, not fixed here.
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
}

export interface PaperSectionDef {
  id: string;
  title: string;
  description?: string;
}

export const AT1_JACKET_SECTIONS: readonly PaperSectionDef[] = [
  { id: "identification", title: "Identification", description: "Who is filing, for which period, at which address." },
  { id: "status", title: "Corporate status and elections", description: "The questions that decide which schedules TRA expects — including whether Alberta figures diverge from federal at all." },
  { id: "income", title: "Alberta income", description: "Taxable income and the allocation factor that apportions it." },
  { id: "tax", title: "Alberta tax and deductions", description: "Basic tax, then the deductions that reduce it." },
  { id: "credits", title: "Credits and balance", description: "Five credits net against tax payable to give the balance at 090." },
  { id: "certification", title: "Certification" },
];

export const AT1_JACKET_FIELDS: readonly PaperField[] = [
  { line: "000001001", caption: "Is the corporation associated with one or more Canadian- controlled private corporations?", kind: "flag", role: "input", section: "identification", requirement: "mandatory" },
  { line: "000003001", caption: "Inc. from active business carried on in Canada as reported on the T2 line 400 OR schedule 12, line 106", kind: "money", role: "input", section: "identification", requirement: "mandatory" },
  { line: "000005001", caption: "Software Approval Code", kind: "text", role: "input", section: "identification", requirement: "mandatory" },
  { line: "000009001", caption: "Taxable Income (less adj. For foreign tax credits. See Guide for calc. Details)", kind: "money", role: "input", section: "identification", requirement: "mandatory" },
  { line: "000010001", caption: "Legal Name of Corporation", kind: "text", role: "input", section: "identification", requirement: "mandatory" },
  { line: "000011001", caption: "Operating Name of Corporation", kind: "text", role: "input", section: "identification", requirement: "optional" },
  { line: "000012001", caption: "Mailing Address of Business Line 1", kind: "text", role: "input", section: "identification", requirement: "mandatory" },
  { line: "000013001", caption: "Mailing Address of Business Line 2", kind: "text", role: "input", section: "identification", requirement: "conditional" },
  { line: "000014001", caption: "City/Town", kind: "text", role: "input", section: "identification", requirement: "mandatory" },
  { line: "000015001", caption: "Prov./State", kind: "text", role: "input", section: "identification", requirement: "conditional" },
  { line: "000016001", caption: "Country Code", kind: "text", role: "input", section: "identification", requirement: "conditional" },
  { line: "000017001", caption: "Postal/Zip Code", kind: "text", role: "input", section: "identification", requirement: "mandatory" },
  { line: "000018001", caption: "Assessment Address Name", kind: "text", role: "input", section: "identification", requirement: "optional" },
  { line: "000019001", caption: "Assessment Address Line 1", kind: "text", role: "input", section: "identification", requirement: "conditional" },
  { line: "000020001", caption: "Assessment Address Line 2", kind: "text", role: "input", section: "identification", requirement: "optional" },
  { line: "000021001", caption: "City/Town", kind: "text", role: "input", section: "identification", requirement: "conditional" },
  { line: "000022001", caption: "Prov./State", kind: "text", role: "input", section: "identification", requirement: "conditional" },
  { line: "000023001", caption: "Country Code", kind: "text", role: "input", section: "identification", requirement: "conditional" },
  { line: "000024001", caption: "Postal/Zip Code", kind: "text", role: "input", section: "identification", requirement: "conditional" },
  { line: "000025001", caption: "Contact Person to discuss return", kind: "text", role: "input", section: "status", requirement: "mandatory" },
  { line: "000026001", caption: "Contact Person’s Telephone No.", kind: "text", role: "input", section: "status", requirement: "mandatory" },
  { line: "000027001", caption: "Contact Person’s Fax No.", kind: "text", role: "input", section: "status", requirement: "optional" },
  { line: "000028001", caption: "Nature of Business", kind: "code", role: "input", section: "status", requirement: "mandatory" },
  { line: "000029001", caption: "Type of Corporation", kind: "code", role: "input", section: "status", requirement: "mandatory" },
  { line: "000030001", caption: "Special Corporation Status", kind: "code", role: "input", section: "status", requirement: "conditional" },
  { line: "000031001", caption: "Has there been a wind-up of a subsidiary under ITA section 88 during the current taxation year?", kind: "flag", role: "input", section: "status", requirement: "mandatory" },
  { line: "000032001", caption: "Is this the first year of filing after an amalgamation?", kind: "flag", role: "input", section: "status", requirement: "mandatory" },
  { line: "000034001", caption: "Alberta Corporate Account Number", kind: "flag", role: "input", section: "identification", requirement: "mandatory" },
  { line: "000035001", caption: "Federal Business Number", kind: "text", role: "input", section: "identification", requirement: "mandatory" },
  { line: "000036001", caption: "Taxation Year Beginning", kind: "date", role: "input", section: "identification", requirement: "mandatory" },
  { line: "000037001", caption: "Taxation Year Ending", kind: "date", role: "input", section: "identification", requirement: "mandatory" },
  { line: "000038001", caption: "Tax Year End Change since last return filed?", kind: "flag", role: "input", section: "status", requirement: "mandatory" },
  { line: "000039001", caption: "Reason for Tax Year End Change", kind: "code", role: "input", section: "status", requirement: "conditional" },
  { line: "000041001", caption: "State the functional currency used", kind: "code", role: "input", section: "status", requirement: "conditional" },
  { line: "000043001", caption: "Average Exchange Rate", kind: "text", role: "input", section: "status", requirement: "conditional" },
  { line: "000047001", caption: "Gross Revenue", kind: "money", role: "input", section: "status", requirement: "mandatory" },
  { line: "000048001", caption: "Total Assets", kind: "money", role: "input", section: "status", requirement: "mandatory" },
  { line: "000050001", caption: "Final Return?", kind: "flag", role: "input", section: "status", requirement: "mandatory" },
  { line: "000051001", caption: "Reason for Final Return", kind: "code", role: "input", section: "status", requirement: "conditional" },
  { line: "000052001", caption: "Date of Amalgamation", kind: "date", role: "input", section: "status", requirement: "conditional" },
  { line: "000053001", caption: "Date Operations Ceased.", kind: "date", role: "input", section: "status", requirement: "conditional" },
  { line: "000054001", caption: "Transfer of property under ITA 85(1), 85(2) or 97(2) ?", kind: "flag", role: "input", section: "status", requirement: "mandatory" },
  { line: "000060001", caption: "Is the corporation reporting different taxable income for AB and federal purposes?", kind: "flag", role: "input", section: "status", requirement: "mandatory" },
  { line: "000061001", caption: "Has the corp elected to use any different discretionary amounts for the current year claim or do opening balances differ for federal and Alberta purposes?", kind: "flag", role: "input", section: "status", requirement: "mandatory" },
  { line: "000062001", caption: "Alberta Taxable Income or (Loss)", kind: "money", role: "input", section: "income", requirement: "mandatory", note: "Alberta taxable income. Where it differs from federal, Schedule 12 must reconcile the difference item by item." },
  { line: "000064001", caption: "Royalty Tax Deduction", kind: "money", role: "carried-in", section: "tax", requirement: "mandatory", from: { form: "AT1SCH5", line: "", note: "Royalty tax deduction" } },
  { line: "000065001", caption: "Alberta Allocation Factor", kind: "rate", role: "input", section: "income", requirement: "mandatory", note: "The Reg 402 allocation factor from Schedule 2, to six decimal places. A single-jurisdiction corporation files 1.0, not a blank." },
  { line: "000068001", caption: "Basic Alberta Tax Payable", kind: "money", role: "computed", section: "tax", requirement: "mandatory", note: "A = (062 − 064) × 065 × rate. The base every deduction below works against." },
  { line: "000070001", caption: "Alberta Small Business Deduction", kind: "money", role: "carried-in", section: "tax", requirement: "mandatory", from: { form: "AT1SCH1", line: "", note: "Alberta small business deduction" } },
  { line: "000071001", caption: "Alberta Manufacturing and Processing Profits Deduction", kind: "money", role: "input", section: "tax", requirement: "mandatory" },
  { line: "000072001", caption: "Alberta Foreign Investment Income Tax Credit", kind: "money", role: "carried-in", section: "tax", requirement: "mandatory", from: { form: "AT1SCH4", line: "", note: "Foreign investment income tax credit" } },
  { line: "000074001", caption: "Alberta Political Contributions Tax Credit", kind: "money", role: "input", section: "tax", requirement: "mandatory" },
  { line: "000076001", caption: "Other Deductions", kind: "money", role: "input", section: "tax", requirement: "mandatory" },
  { line: "000080001", caption: "Alberta Tax Payable", kind: "money", role: "computed", section: "tax", requirement: "mandatory", note: "Tax payable before credits — the 090 balance starts here." },
  { line: "000081001", caption: "Alberta Scientific Research & Experimental Development Tax Credit", kind: "money", role: "carried-in", section: "credits", requirement: "mandatory", from: { form: "AT1SCH9", line: "", note: "Alberta SR&ED tax credit" } },
  { line: "000082001", caption: "Instalments and other payments and ARTC instalments credited to income tax account for this taxation year", kind: "money", role: "input", section: "credits", requirement: "mandatory" },
  { line: "000085001", caption: "Interactive Digital Media Tax Credit (IDMTC)", kind: "money", role: "input", section: "credits", requirement: "mandatory" },
  { line: "000086001", caption: "Alberta Capital Gains Refund", kind: "money", role: "input", section: "credits", requirement: "mandatory" },
  { line: "000087001", caption: "Other Credits", kind: "money", role: "input", section: "credits", requirement: "mandatory", note: "Other credits, for a qualifying environmental trust. Mandatory, and part of the 090 formula — it was missing from the payload table while still being subtracted from the balance." },
  { line: "000090001", caption: "Balance Unpaid (Overpayment)", kind: "money", role: "computed", section: "credits", requirement: "mandatory", note: "080 − (081 + 082 + 085 + 086 + 087). SIGNED: negative is an overpayment, and 092 then chooses between refunding it and applying it to next year." },
  { line: "000091001", caption: "Payment Amount", kind: "money", role: "input", section: "credits", requirement: "mandatory" },
  { line: "000092001", caption: "Method of Payment", kind: "code", role: "input", section: "credits", requirement: "conditional" },
  { line: "000093001", caption: "Fax number for transmitting NOA", kind: "text", role: "input", section: "credits", requirement: "optional" },
  { line: "000095001", caption: "Was this return prepared by a tax preparer for a fee?", kind: "flag", role: "input", section: "status", requirement: "mandatory" },
  { line: "000096001", caption: "If yes, provide the preparer's name or firm name", kind: "text", role: "input", section: "status", requirement: "conditional" },
  { line: "000097001", caption: "Surname of signing officer", kind: "text", role: "input", section: "certification", requirement: "mandatory" },
  { line: "000098001", caption: "First name of signing officer", kind: "text", role: "input", section: "certification", requirement: "mandatory" },
  { line: "000099001", caption: "Position, office or rank of signing officer", kind: "text", role: "input", section: "certification", requirement: "mandatory" },
  { line: "000101001", caption: "Certification: Date", kind: "date", role: "input", section: "certification", requirement: "mandatory" },
  { line: "000103001", caption: "Certification: Telephone Number", kind: "text", role: "input", section: "certification", requirement: "mandatory" },
  { line: "000105001", caption: "CIT Authorized Email", kind: "text", role: "input", section: "certification", requirement: "mandatory" },
  { line: "000110001", caption: "Tax Certificate Number", kind: "text", role: "input", section: "credits", requirement: "conditional" },
  { line: "000115001", caption: "Alberta Film and Television Tax Credit (FTTC)", kind: "money", role: "input", section: "credits", requirement: "mandatory" },
  { line: "000129001", caption: "Innovation Employment Grant", kind: "money", role: "carried-in", section: "credits", requirement: "mandatory", note: "The Innovation Employment Grant is mandatory to report but is deliberately NOT in the 090 formula — netting it would understate what is owing.", from: { form: "AT1SCH29", line: "029110001", note: "Innovation Employment Grant" } },
];

export const AT1_JACKET_FOOTNOTES: readonly string[] = [
  "The AT1 and applicable schedules must be received by Tax and Revenue Administration (TRA) within 6 months of the corporation's taxation year end. If the corporation is not exempt from filing, it must file electronically using Net File unless it is an insurance corporation, a non-resident corporation, or reports in functional currency.",
  "Taxable income: the calculation for federal purposes can differ from the calculation for Alberta purposes if the corporation chooses different discretionary deduction amounts (e.g. different application of losses, CCA, charitable donations).",
  "If line 060 and/or 061 is \"Yes\", Schedule 12 and supporting schedules must be completed to reconcile federal and Alberta taxable income. If both are \"No\", line 062 must equal federal T2 lines 360-370 (or federal Schedule 4 lines 110+310 for a loss).",
];
