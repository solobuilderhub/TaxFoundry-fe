/**
 * Alberta dispositions of capital property (for taxation years ending on or after July 1, 2019) (AT1SCH18) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/sources/tra-forms/xfa/AT1SCH18-dispositions-TRA15156.template.txt, retrieved 2026-09-08.
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

export const AT1_SCHEDULE_18_SECTIONS: readonly PaperSectionDef[] = [
  { id: "dispositions", title: "Capital property dispositions", description: "Proceeds, cost base and outlays for each of six categories, then the reserves, donated securities, flow-through share threshold and section 34.2 partnership amounts that adjust the total. Losses on personal-use and listed personal property are restricted and do not net against ordinary gains." },
  { id: "abil", title: "Property qualifying for and resulting in an allowable business investment loss", description: "A capital loss on a small business corporation. Unlike an ordinary capital loss it is deductible against ANY income, which is why the form gives it its own page." },
];

export const AT1_SCHEDULE_18_FIELDS: readonly PaperField[] = [
  { line: "018001001", caption: "Is the corporation electing to transfer property as stated under ACTA section 14.1(3), 14.2(3) or 16.1(3)?", kind: "flag", role: "input", section: "dispositions" },
  { line: "018002001", caption: "Total of all shares", kind: "money", role: "input", section: "dispositions" },
  { line: "018004001", caption: "Total of all real estate", kind: "money", role: "input", section: "dispositions" },
  { line: "018006001", caption: "Total of all bonds", kind: "money", role: "input", section: "dispositions" },
  { line: "018008001", caption: "Total of all other properties", kind: "money", role: "input", section: "dispositions" },
  { line: "018010001", caption: "Total of all personal-use property", kind: "money", role: "input", section: "dispositions" },
  { line: "018012001", caption: "Total of all listed personal property", kind: "money", role: "input", section: "dispositions" },
  { line: "018022001", caption: "Adjusted cost base: Total of all shares", kind: "money", role: "input", section: "dispositions" },
  { line: "018024001", caption: "Adjusted cost base: Total of all real estate", kind: "money", role: "input", section: "dispositions" },
  { line: "018026001", caption: "Adjusted cost base: Total of all bonds", kind: "money", role: "input", section: "dispositions" },
  { line: "018028001", caption: "Adjusted cost base: Total of all other properties", kind: "money", role: "input", section: "dispositions" },
  { line: "018030001", caption: "Adjusted cost base: Total of all personal-use property", kind: "money", role: "input", section: "dispositions" },
  { line: "018032001", caption: "Adjusted cost base: Total of all listed personal property", kind: "money", role: "input", section: "dispositions" },
  { line: "018042001", caption: "Outlays and expenses: Total of all shares", kind: "money", role: "input", section: "dispositions" },
  { line: "018044001", caption: "Outlays and expenses: Total of all real estate", kind: "money", role: "input", section: "dispositions" },
  { line: "018046001", caption: "Outlays and expenses: Total of all bonds", kind: "money", role: "input", section: "dispositions" },
  { line: "018048001", caption: "Outlays and expenses: Total of all other properties", kind: "money", role: "input", section: "dispositions" },
  { line: "018050001", caption: "Outlays and expenses: Total of all personal-use property", kind: "money", role: "input", section: "dispositions" },
  { line: "018052001", caption: "Outlays and expenses: Total of all listed personal property", kind: "money", role: "input", section: "dispositions" },
  { line: "018053001", caption: "Add: Line 160 of federal Schedule 6", kind: "money", role: "carried-in", section: "dispositions", from: { form: "T2SCH6", line: "160", note: "§3.2.3.19: \"Must equal fed 006160.\" The page prints only the reference, not a description." } },
  { line: "018054001", caption: "Gain or (loss): Total of all shares", kind: "money", role: "computed", section: "dispositions" },
  { line: "018055001", caption: "Gain or (loss): Total of all real estate", kind: "money", role: "computed", section: "dispositions" },
  { line: "018056001", caption: "Gain or (loss): Total of all bonds", kind: "money", role: "computed", section: "dispositions" },
  { line: "018057001", caption: "Gain or (loss): Total of all other properties", kind: "money", role: "computed", section: "dispositions" },
  { line: "018058001", caption: "Gain: Total of all personal-use property", kind: "money", role: "computed", section: "dispositions", note: "A LOSS here is excluded from line 062 — it is not deductible against ordinary capital gains." },
  { line: "018059001", caption: "Gain: Total of all listed personal property", kind: "money", role: "computed", section: "dispositions", note: "A LOSS here is excluded from line 062 — it is not deductible against ordinary capital gains." },
  { line: "018060001", caption: "Subtract: Unapplied listed personal property losses from other years up to the total listed personal property gains", kind: "money", role: "input", section: "dispositions", note: "Net listed personal property losses may only be applied against listed personal property gains. Capped at line 059; where Schedule 21 exists, capped at the lesser of that and Schedule 21 line 115.", to: { form: "AT1SCH21", line: "021119001", note: "Printed on the form: \"carry this amount forward to schedule 21, line 119, if applicable\"." } },
  { line: "018062001", caption: "Total of Column D", kind: "money", role: "computed", section: "dispositions", note: "EXCLUDES lines 059 and 060 where the difference is a net loss — restricted losses are dropped, not netted. Summing column D over-deducts." },
  { line: "018064001", caption: "Capital gains dividends", kind: "money", role: "input", section: "dispositions" },
  { line: "018066001", caption: "Add: capital gain reserve opening balance, if any", kind: "money", role: "input", section: "dispositions" },
  { line: "018068001", caption: "Deduct: capital gain reserve closing balance, if any", kind: "money", role: "input", section: "dispositions" },
  { line: "018070001", caption: "Capital gain or (loss): Line 062 + line 064 + line 066 - line 068", kind: "money", role: "computed", section: "dispositions", note: "Line 062 plus 064 plus 066 minus 068." },
  { line: "018071001", caption: "Deduct: Gain on the donation to a qualified donee of a share, debt obligation, or right listed on a designated stock exchange and other securities under paragraphs 38(a.1)(i) and (iii) of the federal Act", kind: "money", role: "input", section: "dispositions" },
  { line: "018073001", caption: "Deduct: Gain on the donation to a qualified donee of ecologically sensitive land under paragraph 38(a.2) of the federal Act", kind: "money", role: "input", section: "dispositions" },
  { line: "018075001", caption: "Line 070 minus (line 071 + 073)", kind: "money", role: "computed", section: "dispositions", note: "Line 070 minus lines 071 and 073." },
  { line: "018076001", caption: "Taxable capital gain: Line 099 X 50%", kind: "money", role: "computed", section: "dispositions", note: "Line 099 at the inclusion rate — the only place the halving happens. If line 099 is positive, carry this forward to Schedule 12, line 040. The 50% printed here is the current rate; a year whose dispositions straddle an inclusion-rate change needs supporting documentation with the RSI (§3.2.3.19 filing-requirement exception).", to: { form: "AT1SCH12", line: "012040001", note: "Only when line 099 is positive." } },
  { line: "018077001", caption: "Add: Exemption threshold at time of disposal", kind: "money", role: "input", section: "dispositions", note: "Flow-through share class of property — ITA subsection 40(12)." },
  { line: "018078001", caption: "Add: Total of all capital gains from the disposition of the actual property", kind: "money", role: "input", section: "dispositions" },
  { line: "018079001", caption: "Lesser of lines 077 or 078", kind: "money", role: "computed", section: "dispositions", note: "The LESSER of lines 077 and 078 — not their sum. Adding them inflates the gain." },
  { line: "018082001", caption: "Name of small business corporation", kind: "text", role: "input", section: "abil" },
  { line: "018084001", caption: "Specify: 1 = shares or 2 = debt", kind: "code", role: "input", section: "abil" },
  { line: "018086001", caption: "Date of Acquisition (YYYYMMDD)", kind: "date", role: "input", section: "abil" },
  { line: "018088001", caption: "A - Proceeds of disposition", kind: "money", role: "input", section: "abil" },
  { line: "018090001", caption: "B - Adjusted cost base", kind: "money", role: "input", section: "abil" },
  { line: "018092001", caption: "C - Outlays and expenses (re dispositions)", kind: "money", role: "input", section: "abil" },
  { line: "018094001", caption: "Allowable Business Investment Loss: total of column D X Inclusion Rate", kind: "money", role: "computed", section: "abil", note: "Column D at the inclusion rate (see the note at line 076). Unlike an ordinary capital loss this is deductible against ANY income, which is why it has its own part. Printed on the form: carry this amount forward to Schedule 12, and include it in line 040.", to: { form: "AT1SCH12", line: "012040001", note: "Included IN line 040, alongside the taxable capital gain at line 076 — not instead of it." } },
  { line: "018096001", caption: "Taxable capital gains under section 34.2 of the federal Act (line 275 of federal Schedule 73, Income Inclusion Summary for Corporations that are members of Partnerships) X 2 =", kind: "money", role: "carried-in", section: "dispositions", note: "Federal Schedule 73 line 275, MULTIPLIED BY TWO. That form reports the taxable half; this schedule works in whole gains until line 076.", from: { form: "T2SCH73", line: "270" } },
  { line: "018097001", caption: "Subtotal: Line 075 + line 079 + line 096", kind: "money", role: "computed", section: "dispositions", note: "Lines 075 plus 079 plus 096." },
  { line: "018098001", caption: "Deduct: Allowable capital losses under section 34.2 of the federal Act (line 285 of federal Schedule 73, Income Inclusion Summary for Corporations that are Members of Partnerships) X 2 =", kind: "money", role: "carried-in", section: "dispositions", note: "Federal Schedule 73 line 285, MULTIPLIED BY TWO — see line 096.", from: { form: "T2SCH73", line: "285" } },
  { line: "018099001", caption: "Total capital gains or losses: Line 097 - line 098", kind: "money", role: "computed", section: "dispositions", note: "If line 099 is NEGATIVE, carry the capital loss forward to Schedule 21, line 057, and no taxable capital gain arises at line 076.", to: { form: "AT1SCH21", line: "021057001", note: "Only when negative — the capital loss, not the gain." } },
];

export const AT1_SCHEDULE_18_FOOTNOTES: readonly string[] = [
  "This schedule is required if the opening balance, proceeds of disposition, adjusted cost base or gain/loss for Alberta purposes differs from that for federal purposes.",
  "Report all monetary amounts in dollars; DO NOT include cents. Show negative amounts in brackets ( ).",
  "Net listed personal property losses may only be applied against listed personal property gains. Do not include listed personal property losses in total.",
  "If the corporation is electing to transfer property under ACTA section 14.1(3), 14.2(3) or 16.1(3), the applicable Alberta election form (AT107, AT108 or AT109) must be completed and submitted by the corporation acquiring the property (\"transferee\"). See the election form for filing instructions.",
  "If dispositions in a taxation year straddle one or more inclusion rate periods, supporting documentation MUST be submitted with the AT1 RSI to detail how the inclusion rate was calculated.",
];
