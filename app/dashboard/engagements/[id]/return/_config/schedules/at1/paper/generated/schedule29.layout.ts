/**
 * Alberta Innovation Employment Grant (AT1SCH29) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/sources/tra-forms/pdf/AT1SCH29-innovation-employment-grant-TRA14637.pdf, retrieved 2026-09-13.
 *
 * Carries EVERY field, not just `input` ones — a paper view shows the whole
 * form. The paper renderer, not this file, is responsible for keeping
 * computed/carried-in lines read-only.
 */
export type PaperFieldRole = "input" | "computed" | "total" | "carried-in" | "not-collected";
export type PaperFieldKind = "money" | "date" | "text" | "rate" | "flag" | "code" | "count";

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

export const AT1_SCHEDULE_29_SECTIONS: readonly PaperSectionDef[] = [
  { id: "eligible", title: "Eligible Expenditures for IEG Purposes", description: "Derives line 031, the \"eligible expenditures\" figure everything else on this schedule is built from, off federal T661 line 559 or 557 (see the note the page prints above this box) and the AT4970 attachment’s own totals.", printedBefore: "NOTE: For Alberta IEG calculations, use the federal amount of qualified SR&ED expenditures reported on line 559 of federal Form T661 for taxation years ending before December 16, 2024. For taxation years ending after December 15, 2024, use the federal amount of current SR&ED expenditures reported on line 557 of federal Form T661." },
  { id: "limit", title: "Maximum Expenditure Limit", description: "Whether the corporation is associated for IEG purposes, and the resulting expenditure limit for the year — shared with the group (line 102, from the Agreement) if associated, or this corporation’s own day-prorated $4,000,000 (line 104) if not." },
  { id: "grant", title: "Alberta Innovation Employment Grant Calculation", description: "Base rate on the capped expenditures, enhanced rate on the increment above the average of the previous two years, both scaled by the taxable-capital reduction factor. Lines 112 and 125 are ALTERNATIVES — see the printed \"(a) Non-Associated\" / \"(b) Associated\" headings." },
  { id: "agreement", title: "Alberta Innovation Employment Grant Agreement Among Associated Corporations", description: "Filed only when the corporation is associated (line 100 = Yes). The member with the longest taxation year sets the group’s shared $4,000,000 pool at line 208." },
  { id: "allocation", title: "Allocation of the Maximum Expenditure Limit (Use the first line for the claiming corporation)", description: "One row per associated member, the claiming corporation FIRST. Each row’s own agreed share of the pool, its spending history, and the resulting allowed amount — whose group total at line 310 is what line 125 draws on instead of spending above base." },
];

export const AT1_SCHEDULE_29_FIELDS: readonly PaperField[] = [
  { line: "029003001", caption: "Federal amount of qualified/current SR&ED expenditures on line 559/557 of federal T661", kind: "money", role: "input", section: "eligible", note: "Federal T661 line 559 for a taxation year ending on or before 2024-12-15; T661 line 557 (a DIFFERENT federal figure — current, not qualified, SR&ED expenditures) for a taxation year ending on or after 2024-12-16. See `iegT661SourceLine` in `schedule29-eligible-expenditures.ts`. The page states the cut-off in the NOTE it prints above this box, not on the line.", sourceText: "line 559/557 of federal T661" },
  { line: "029005001", caption: "Portion of line 559/557 of federal T661 carried out in Alberta", kind: "money", role: "input", section: "eligible", note: "Normally the AT4970 attachment’s own total of column 105 across every project. The caption read \"Portion of line 003 carried out in Alberta\" until the 2026-09-13 cross-check: 003 holds the same figure, so the arithmetic was right, but the page sends a preparer to the FEDERAL return for it and this sent them here instead.", sourceText: "line 559/557 of federal T661" },
  { line: "029007001", caption: "Deduct: Federal prescribed proxy amount (if any) included in the Alberta portion of line 559/557", kind: "money", role: "input", section: "eligible", note: "Normally AT4970’s total of column 111." },
  { line: "029009001", caption: "Add: Alberta proxy amount", kind: "money", role: "input", section: "eligible", note: "Normally AT4970’s total of column 113." },
  { line: "029011001", caption: "Add: IEG that reduced the federal expenditure in line 559/557 of federal T661 in the taxation year", kind: "money", role: "input", section: "eligible", note: "Zero for a first-time current-year claim reported on the pre-deduction federal figures — only non-zero when line 003 was already reported net of this year’s own IEG (see the Step 1 / Step 2 note in schedule29-eligible-expenditures.ts)." },
  { line: "029025001", caption: "Add: Alberta portion of any repayment of government assistance (other than an IEG) or a contract payment made in the taxation year that relates to amounts included in line 005 above made in the taxation year or any preceding taxation year (portion of line 560 of federal T661 that relates to Alberta other than an IEG)", kind: "money", role: "input", section: "eligible", note: "The Alberta portion of EITHER a repayment of government assistance (other than an IEG) OR a contract payment — two independent triggers — relating to amounts in line 005 from the current year or ANY PRECEDING taxation year.", sourceText: "portion of line 560 of federal T661 that relates to Alberta other than an IEG" },
  { line: "029031001", caption: "Total: Eligible Expenditures for Alberta Purposes (lines 005 - 007 + 009 + 011 + 025)", kind: "money", role: "total", section: "eligible", note: "Feeds every other \"eligible expenditures\" figure on this schedule. The page states the arithmetic in the caption, so this note no longer restates it — a second copy of a formula is a second thing to keep true." },
  { line: "029040001", caption: "Select the primary field of science or technology the corporation is involved in: 1 = Natural and formal sciences 2 = Engineering and technology 3 = Medical and health sciences 4 = Agricultural sciences", kind: "code", role: "input", section: "eligible", note: "Printed in a box of its own below the eligible-expenditures box, with no heading of its own — see the note on SECTIONS for why it is filed under `eligible` anyway. The page lays the four codes out in two columns; they read 1, 2, 3, 4." },
  { line: "029100001", caption: "Is the corporation associated with one or more corporations for IEG purposes?", kind: "flag", role: "computed", section: "limit", note: "Derived from whether an Agreement Among Associated Corporations (page 3) was supplied — not asked as its own question. If \"Yes\", page 3 must be complete." },
  { line: "029102001", caption: "If the corporation is associated (line 100 = Yes), enter the allocated expenditure limit amount from applicable line 240 on page 3", kind: "money", role: "input", section: "limit", note: "Transcribed from this corporation’s own line 240 on page 3 (row 1, the claiming corporation) — filled in here, not re-derived.", sourceText: "applicable line 240 on page 3" },
  { line: "029104001", caption: "If the corporation is not associated (line 100 = No), calculate the following and enter the amount on line 104", kind: "money", role: "computed", section: "limit", note: "This corporation’s own limit; there is no group to share it with. NOT YET COMPUTED OR FILED: `computeIegGroupFigures` (`schedule29-ieg-group.ts`) hardcodes `groupExpenditureLimit` to the flat $4,000,000 with no day-of-year proration, and `schedule29Values` has no `put('104', …)` call at all — a short or long taxation year files an unprorated limit rather than a wrong one, which is deliberately safer than guessing, but the line itself is currently absent from the payload.", sourceText: "$4,000,000 X days in tax year / 365", footnoteMarks: [0, 1] },
  { line: "029108001", caption: "Maximum expenditure limit for the year (line 102 or line 104 as applicable)", kind: "money", role: "computed", section: "limit", note: "Feeds lines 110, 112 and 125. NOT YET FILED as its own line — see line 104’s note; the resolved limit is used internally to compute 110/112/125 but never surfaced at 108 itself." },
  { line: "029110001", caption: "Calculate: (Lesser of line 031 and line 108) X 8%", kind: "money", role: "computed", section: "grant", note: "The base rate, and the one part of the grant EVERY claimant gets — the page heads it \"Part I calculation: Non-Associated and Associated at 8%\", so it is not an alternative to anything. Line 112 or line 125 is then added to it." },
  { line: "029112001", caption: "Calculate: ((Lesser of line 031 and line 108) - Base Amount from line 118) X 12%", kind: "money", role: "computed", section: "grant", note: "Twelve per cent, on the INCREMENT above the base level. Applying it to the whole expenditure overstates the grant. Filed instead of line 125, never alongside it — the page prints this under \"(a) Non-Associated\" and 125 under \"(b) Associated\".", footnoteMarks: [2] },
  { line: "029114001", caption: "Eligible expenditures for the first preceding year", kind: "money", role: "computed", section: "grant", note: "Non-associated only (see line 112’s note) — this corporation’s OWN prior year, not a group figure. NOT YET COMPUTED OR FILED: `computeIegGroupFigures` only aggregates every member’s prior-year figures into one group total (`groupBaseAmount`); nothing in the engine isolates a single corporation’s own 114/116 at this grain, and `schedule29Values` never files either. No editable UI binding exists either — marked `computed`, not `input`, because there is nowhere on this schedule’s own form to type it." },
  { line: "029116001", caption: "Eligible expenditures for the second preceding year", kind: "money", role: "computed", section: "grant", note: "Non-associated only, this corporation’s own prior year — see line 114’s note." },
  { line: "029118001", caption: "Base amount: average of line 114 + line 116", kind: "money", role: "computed", section: "grant", note: "Feeds line 112 only — the associated formula at line 125 does not subtract a base amount at all. NOT YET FILED as its own line, for the same reason as 114/116: `schedule29-ieg-group.ts`’s own doc comment on `groupBaseAmount` states it \"does not correspond to anything a preparer could actually file\" — the group-aggregated figure the engine computes is not the same number the live form wants here. Read the caption as printed: it is the AVERAGE of the two, not their sum, however the \"+\" reads." },
  { line: "029125001", caption: "Calculate: (Lesser of line 108 or the allocated allowed amount from line 325) X 12%", kind: "money", role: "computed", section: "grant", note: "A genuinely different formula from line 112 — no base amount is subtracted, and actual spending above base plays no part. Filed instead of line 112, never alongside it.", footnoteMarks: [3] },
  { line: "029126001", caption: "Taxable Capital", kind: "money", role: "computed", section: "grant", note: "This corporation alone if not associated with anyone for IEG purposes; the associated group’s total otherwise (`iegGroup.groupTaxableCapital` or `iegAgreement.totalTaxableCapitalPriorYear`). Drives the reduction factor at line 128. The page’s own \"***\" note is where the two cases are stated, and it names federal T2SCH33 line 690 as the source of each.", footnoteMarks: [4] },
  { line: "029128001", caption: "(($40,000,000 - (line 126 - $10,000,000))/$40,000,000", kind: "rate", role: "computed", section: "grant", note: "A reduction factor: 1 at $10,000,000 taxable capital or below (the page says so explicitly in its \"****\" note), straight-line down to 0 at $50,000,000. Multiplies lines 110 + 112 at line 130 — it does not reduce the $4,000,000 expenditure limit.", footnoteMarks: [5] },
  { line: "029130001", caption: "IEG ((line 110 + (line 112 or line 125)) x line 128", kind: "money", role: "computed", section: "grant", note: "The caption is the page’s, unbalanced bracket and all. \"line 112 OR line 125\" is the part a paraphrase loses: this file said \"(Line 110 + line 112) × line 128\", which is the non-associated case only and silently drops an associated claimant’s entire enhanced-rate credit." },
  { line: "029132001", caption: "If the corporation has received an IEG in respect of property that is sold or converted to commercial use during the taxation year, enter the amount of recapture", kind: "money", role: "input", section: "grant", note: "Blank, not zero, when there is none to report." },
  { line: "029134001", caption: "NET IEG (line 130 - line132)", kind: "money", role: "total", section: "grant", note: "The page prints \"line132\" closed up. Kept verbatim: a transcription is not the place to correct a form’s typography, and a reader diffing this against the page should find nothing.", to: { form: "AT1", line: "000129001", note: "Enter amount from line 134 on AT1 page 2, line 129" } },
  { line: "029200001", caption: "The Alberta Corporate Account Number of the associated corporation with the longest taxation year(Enter the 9 or 10 digit account number):", kind: "text", role: "input", section: "agreement", note: "The page sets \"year(Enter\" with no space — kept, like line 134’s \"line132\". This is the LONGEST-year member’s account number, which need not be the claimant’s: line 208 prorates the group’s whole pool by that member’s year." },
  { line: "029202001", caption: "Taxation Year Beginning:", kind: "date", role: "input", section: "agreement", note: "The longest-year member’s own tax year — not necessarily the claimant’s." },
  { line: "029204001", caption: "Taxation Year Ending:", kind: "date", role: "input", section: "agreement", note: "The longest-year member’s own tax year end." },
  { line: "029206001", caption: "Number of days in the longest year: (max 365 days)", kind: "text", role: "input", section: "agreement", note: "The page prints \"(max 365 days **)\" beneath the box; the asterisks are in `footnoteMarks`, and page 3’s \"**\" is its OWN footnote — worded \"the longest taxation year\", not page 2’s \"the taxation year\".", footnoteMarks: [6] },
  { line: "029208001", caption: "Maximum Expenditure Limit", kind: "money", role: "computed", section: "agreement", note: "The group’s shared pool for the year. \"Maximum Expenditure Limit\" is the bold label the page sets under the box; the formula beside it is in `sourceText`.", sourceText: "$4,000,000 X (Line 206 ÷ 365 days)", footnoteMarks: [6] },
  { line: "029220001", caption: "Federal Business Number (FBN)", kind: "text", role: "input", section: "allocation", note: "One row per associated member, the claiming corporation first. There is NO line for the member’s name on this form — 220 is the FBN, not a name field." },
  { line: "029230001", caption: "Alberta Corporate Account Number (CAN) (Enter the 9 or 10 digit account number)", kind: "text", role: "input", section: "allocation", note: "This member’s own account number." },
  { line: "029235001", caption: "Current Taxation Year End (yyyy-mm-dd)", kind: "date", role: "input", section: "allocation", note: "Which year end qualifies is the page’s own Note against this line: the one that ended within the CLAIMING corporation’s calendar year, not this member’s.", footnoteMarks: [7] },
  { line: "029240001", caption: "Allocated Expenditure Limit (Enter the amount allocated to the corporation on line 102 on page 2)", kind: "money", role: "input", section: "allocation", note: "The amount allocated to this member — the claimant’s own row 1 figure is transcribed to line 102 on page 2." },
  { line: "029245001", caption: "Current year’s eligible expenditures", kind: "money", role: "input", section: "allocation", note: "This member’s own current-year eligible expenditures. Summed at line 275 (\"X\")." },
  { line: "029250001", caption: "Eligible expenditures for the first preceding year", kind: "money", role: "input", section: "allocation", note: "This member’s own figure. Summed at line 280 (\"Y\")." },
  { line: "029260001", caption: "Eligible expenditures for the second preceding year", kind: "money", role: "input", section: "allocation", note: "This member’s own figure. Summed at line 290 (\"Z\")." },
  { line: "029265001", caption: "Taxable Capital for the first preceding year", kind: "money", role: "input", section: "allocation", note: "This member’s own figure. Summed at line 300 — informational; does not feed line 128." },
  { line: "029267001", caption: "Individual corporation maximum allowed amount Line 245 - [(line 250 + line 260) / 2]", kind: "money", role: "computed", section: "allocation", note: "The page states the arithmetic in the column heading itself. Its Note adds the floor: a negative result gives this member a NIL allowed amount at line 268, not a negative one.", footnoteMarks: [8] },
  { line: "029268001", caption: "Allocated allowed amount to each corporation", kind: "money", role: "computed", section: "allocation", note: "A three-way least, spelled out in the page’s own Note against this line. Note that the third term uses THIS member’s days in the tax year, and line 031 — the CLAIMANT’s eligible expenditures.", footnoteMarks: [9] },
  { line: "029270001", caption: "Totals", kind: "money", role: "total", section: "allocation", note: "Σ line 240. The page gives the seven totals no captions of their own — they are cells in a row labelled only \"Totals\", each sitting under the column it sums, so the column heading IS the caption. See `AT1_SCHEDULE_29_ALLOCATION_COLUMNS`, which pairs each with its `totalsLine`; a renderer reading these captions alone shows seven identical rows.", footnoteMarks: [10] },
  { line: "029275001", caption: "Totals", kind: "money", role: "total", section: "allocation", note: "Σ line 245 — \"X\" in the Allowed Amount formula on page 2." },
  { line: "029280001", caption: "Totals", kind: "money", role: "total", section: "allocation", note: "Σ line 250 — \"Y\" in the Allowed Amount formula." },
  { line: "029290001", caption: "Totals", kind: "money", role: "total", section: "allocation", note: "Σ line 260 — \"Z\" in the Allowed Amount formula." },
  { line: "029300001", caption: "Totals", kind: "money", role: "total", section: "allocation", note: "Σ line 265, across every member." },
  { line: "029310001", caption: "Totals", kind: "money", role: "total", section: "allocation", note: "The Group Allowed Amount. It sits in the line-267 column, but the page’s Note does not define it as Σ267 — it says it \"should be equal to line 275 minus the average of line 280 and line 290\", i.e. X − ((Y + Z) / 2). The two agree only while no member’s 267 has been floored at nil, which is precisely when the cross-check earns its keep.", footnoteMarks: [11] },
  { line: "029320001", caption: "Totals", kind: "money", role: "total", section: "allocation", note: "Σ line 268. Must be less than or equal to line 310.", footnoteMarks: [12] },
  { line: "029325001", caption: "Corporation Allocated Allowed amount (the claiming corporation amount reported on line 268, to be used to calculate line 125:", kind: "money", role: "total", section: "allocation", note: "The claiming corporation’s own line 268, restated. The page’s unclosed parenthesis and trailing colon are kept. Printed BELOW the grid, outside it — it is not a Totals cell." },
];

export const AT1_SCHEDULE_29_FOOTNOTES: readonly string[] = [
  "After December 31, 2020 to a maximum of 365, or 366 if the taxation year includes February 29",
  "366 days if the taxation year includes February 29",
  "If the corporation is NOT associated with one or more corporations in the taxation year, the Base Amount is the amount that is the average of the eligible expenditures of the corporation for the two immediately preceding taxation years.",
  "If the qualified corporation is associated with one or more corporations in the taxation year (referred to as the particular taxation year), the Allowed Amount is: X - ((Y + Z) / 2) Where X equals line 275 in page 3, the aggregated total of all the rows of line 245 in page 3. This is the total of the current year’s eligible expenditures of the claiming corporation and its associated corporation(s). Y equals line 280 in page 3, the aggregated total of all the rows of line 250 in page 3. This is the total of the eligible expenditures for the first preceding year of the claiming corporation and its associated corporation(s). Z equals line 290 in page 3, the aggregated total of all the rows of line 260 in page 3. This is the total of the eligible expenditures for the second preceding year of the claiming corporation and its associated corporation(s). For the purposes of determining either the Base Amount or the Allowed Amount for a taxation year, eligible expenditures for a preceding year are calculated in the same way as line 031 on page1.",
  "If the corporation is associated with one or more corporations in the taxation year, regardless of whether the other corporation(s) has eligible expenditures in Alberta or not, enter on line 126 the total of all taxable capital employed in Canada of all associated corporations for their last taxation year ending in the previous calendar year. (The total of all amounts reported on line 690 of the federal form T2SCH33 for each corporation in the associated group.) If the corporation is NOT associated with one or more corporations in the taxation year, enter on line 126 the amount of taxable capital employed in Canada from line 690 of federal form T2SCH33 for the corporation’s immediately preceding taxation year.",
  "If taxable Capital is less than or equal to $10,000,000, enter 1 on line 128",
  "366 days if the longest taxation year includes February 29",
  "Line 235: input each of the eligible corporation’s current taxation year end that ended within the calendar year of the claiming corporation",
  "Line 267: if a calculated amount is negative, that particular corporation will have a nil allowed amount on line 268",
  "Line 268: The least of: line 240, line 267, and the lesser of [(4,000,000 x days in tax year/365 or 366) or line 031] less base amount",
  "Line 270: total must not exceed line 208",
  "Line 310: should be equal to line 275 minus the average of line 280 and line 290",
  "Line 320: must be less than or equal to line 310",
  "For use by a corporation for a taxation year in which the corporation is claiming the Innovation Employment Grant (IEG). Schedule 29 must be received by Alberta Treasury Board and Finance, Tax and Revenue Administration within 15 months after the day on or before which the corporation is required to file its AT1 for the year. For additional information on completing Schedule 29, see the Guide to Claiming the Innovation Employment Grant (the Guide).",
  "Report all monetary values in dollars; DO NOT include cents.",
  "A qualified corporation is required to share the maximum expenditure limit with one or more associated corporations that claim an IEG in taxation years within the same calendar year. One copy of this completed agreement is to be filed by each corporation of the group with its AT1 for the taxation year. A new agreement must be filed in respect of each taxation year. Use additional pages if space is insufficient.",
];

export interface PaperFootnotePlacement {
  /** Index into the footnote list above. */
  footnote: number;
  /** The section id at whose foot the page prints it. */
  section: string;
  /** The glyph the page prints. Absent where the page anchors the note by naming a line instead. */
  mark?: string;
}

export const AT1_SCHEDULE_29_FOOTNOTE_PLACEMENT: readonly PaperFootnotePlacement[] = [
  { footnote: 0, section: "limit", mark: "*" },
  { footnote: 1, section: "limit", mark: "**" },
  { footnote: 2, section: "grant", mark: "*" },
  { footnote: 3, section: "grant", mark: "**" },
  { footnote: 4, section: "grant", mark: "***" },
  { footnote: 5, section: "grant", mark: "****" },
  { footnote: 6, section: "agreement", mark: "**" },
  { footnote: 7, section: "allocation" },
  { footnote: 8, section: "allocation" },
  { footnote: 9, section: "allocation" },
  { footnote: 10, section: "allocation" },
  { footnote: 11, section: "allocation" },
  { footnote: 12, section: "allocation" },
];


export interface Schedule29BlockHeading {
  /** The printed line the heading stands immediately above. */
  aboveLine: string;
  text: string;
}

/** Two may share an `aboveLine` — the page stacks two over line 112. Print every match, in order. */
export const AT1_SCHEDULE_29_BLOCK_HEADINGS: readonly Schedule29BlockHeading[] = [
  { aboveLine: "102", text: "If \"Yes\", complete page 3." },
  { aboveLine: "110", text: "Part I calculation: Non-Associated and Associated at 8%" },
  { aboveLine: "112", text: "Part II calculation: Non-Associated and Associated at 12%" },
  { aboveLine: "112", text: "(a) Non-Associated" },
  { aboveLine: "125", text: "(b) Associated" },
];

export interface Schedule29AllocationColumn {
  /** The printed line for each MEMBER's own cell in this column. */
  line: string;
  heading: string;
  kind: "text" | "date" | "money";
  role: "input" | "computed";
  /** The line the page prints in this column's cell of the Totals row — absent on the three it leaves untotalled. */
  totalsLine?: string;
}

export const AT1_SCHEDULE_29_ALLOCATION_COLUMNS: readonly Schedule29AllocationColumn[] = [
  { line: "220", heading: "Federal Business Number (FBN)", kind: "text", role: "input" },
  { line: "230", heading: "Alberta Corporate Account Number (CAN) (Enter the 9 or 10 digit account number)", kind: "text", role: "input" },
  { line: "235", heading: "Current Taxation Year End (yyyy-mm-dd)", kind: "date", role: "input" },
  { line: "240", heading: "Allocated Expenditure Limit (Enter the amount allocated to the corporation on line 102 on page 2)", kind: "money", role: "input", totalsLine: "270" },
  { line: "245", heading: "Current year’s eligible expenditures", kind: "money", role: "input", totalsLine: "275" },
  { line: "250", heading: "Eligible expenditures for the first preceding year", kind: "money", role: "input", totalsLine: "280" },
  { line: "260", heading: "Eligible expenditures for the second preceding year", kind: "money", role: "input", totalsLine: "290" },
  { line: "265", heading: "Taxable Capital for the first preceding year", kind: "money", role: "input", totalsLine: "300" },
  { line: "267", heading: "Individual corporation maximum allowed amount Line 245 - [(line 250 + line 260) / 2]", kind: "money", role: "computed", totalsLine: "310" },
  { line: "268", heading: "Allocated allowed amount to each corporation", kind: "money", role: "computed", totalsLine: "320" },
];

export const AT1_SCHEDULE_29_ALLOCATION_TOTALS_LABEL = "Totals";
