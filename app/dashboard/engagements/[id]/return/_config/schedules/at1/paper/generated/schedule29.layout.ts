/**
 * Alberta Innovation Employment Grant (AT1SCH29) — paper Form View layout.
 *
 * GENERATED from the form definition in @classytic/ca-tax:
 *   npx tsx packages/ca-tax/scripts/emit-ui-schedule.ts
 *
 * Ultimately from research/sources/tra-forms/pdf/AT1SCH29-innovation-employment-grant-TRA14637.pdf, retrieved 2026-08-28.
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

export const AT1_SCHEDULE_29_SECTIONS: readonly PaperSectionDef[] = [
  { id: "eligible", title: "Eligible Expenditures for IEG Purposes", description: "Derives line 031, the \"eligible expenditures\" figure everything else on this schedule is built from, off federal T661 line 559 or 557 (see the field notes below) and the AT4970 attachment’s own totals." },
  { id: "limit", title: "Maximum Expenditure Limit", description: "Whether the corporation is associated for IEG purposes, and the resulting expenditure limit for the year — shared with the group (line 102, from the Agreement) if associated, or this corporation’s own day-prorated $4,000,000 (line 104) if not." },
  { id: "grant", title: "Innovation Employment Grant", description: "Base rate on the capped expenditures, enhanced rate on the increment above the average of the previous two years, both scaled by the taxable-capital reduction factor." },
  { id: "agreement", title: "Agreement Among Associated Corporations", description: "Filed only when the corporation is associated (line 100 = Yes). Names every member, each one’s own agreed share of the $4,000,000 pool, and the group’s Allowed Amount — the figure line 125 uses instead of spending above base." },
];

export const AT1_SCHEDULE_29_FIELDS: readonly PaperField[] = [
  { line: "029003001", caption: "Federal amount of qualified/current SR&ED expenditures", kind: "money", role: "input", section: "eligible", note: "Federal T661 line 559 for a taxation year ending on or before 2024-12-15; T661 line 557 (a DIFFERENT federal figure — current, not qualified, SR&ED expenditures) for a taxation year ending on or after 2024-12-16. See `iegT661SourceLine` in `schedule29-eligible-expenditures.ts`." },
  { line: "029005001", caption: "Portion of line 003 carried out in Alberta", kind: "money", role: "input", section: "eligible", note: "Normally the AT4970 attachment’s own total of column 105 across every project." },
  { line: "029007001", caption: "Deduct: federal prescribed proxy amount included in the Alberta portion", kind: "money", role: "input", section: "eligible", note: "Normally AT4970’s total of column 111." },
  { line: "029009001", caption: "Add: Alberta proxy amount", kind: "money", role: "input", section: "eligible", note: "Normally AT4970’s total of column 113." },
  { line: "029011001", caption: "Add: IEG that reduced the federal expenditure in the taxation year", kind: "money", role: "input", section: "eligible", note: "Zero for a first-time current-year claim reported on the pre-deduction federal figures — only non-zero when line 003 was already reported net of this year’s own IEG (see the Step 1 / Step 2 note in schedule29-eligible-expenditures.ts)." },
  { line: "029025001", caption: "Add: repayment of government assistance or a contract payment", kind: "money", role: "input", section: "eligible", note: "The Alberta portion of EITHER a repayment of government assistance (other than an IEG) OR a contract payment — two independent triggers — relating to amounts in line 005 from the current year or ANY PRECEDING taxation year." },
  { line: "029031001", caption: "Total: Eligible Expenditures for Alberta Purposes", kind: "money", role: "total", section: "eligible", note: "005 − 007 + 009 + 011 + 025. Feeds every other \"eligible expenditures\" figure on this schedule." },
  { line: "029040001", caption: "Primary field of science or technology", kind: "code", role: "input", section: "eligible", note: "1 = Natural and formal sciences, 2 = Engineering and technology, 3 = Medical and health sciences, 4 = Agricultural sciences." },
  { line: "029100001", caption: "Associated with one or more corporations for IEG purposes?", kind: "flag", role: "input", section: "limit", note: "If \"Yes\", complete page 3 — the formal Agreement Among Associated Corporations." },
  { line: "029102001", caption: "Allocated expenditure limit, if associated", kind: "money", role: "input", section: "limit", note: "Transcribed from this corporation’s own line 240 on page 3 (row 1, the claiming corporation) — filled in here, not re-derived." },
  { line: "029104001", caption: "Expenditure limit, if not associated", kind: "money", role: "computed", section: "limit", note: "$4,000,000 × (days in the tax year ÷ 365, or 366 if the year includes February 29) — this corporation’s own limit; there is no group to share it with." },
  { line: "029108001", caption: "Maximum expenditure limit for the year", kind: "money", role: "computed", section: "limit", note: "Line 102 or line 104, as applicable. Feeds lines 110, 112 and 125." },
  { line: "029110001", caption: "Grant at the base rate", kind: "money", role: "computed", section: "grant", note: "Eight per cent, on the LESSER of eligible expenditures (line 031) and line 108." },
  { line: "029112001", caption: "Grant at the enhanced rate — non-associated", kind: "money", role: "computed", section: "grant", note: "Twelve per cent, on the INCREMENT above the base level — (lesser of line 031 and line 108) minus the base amount at line 118. Applying it to the whole expenditure overstates the grant. Filed instead of line 125, never alongside it." },
  { line: "029114001", caption: "Eligible expenditures — first preceding year", kind: "money", role: "input", section: "grant", note: "Non-associated only (see line 112’s note) — this corporation’s OWN prior year, not a group figure." },
  { line: "029116001", caption: "Eligible expenditures — second preceding year", kind: "money", role: "input", section: "grant", note: "Non-associated only, this corporation’s own prior year — see line 114." },
  { line: "029118001", caption: "Base amount", kind: "money", role: "computed", section: "grant", note: "Average of lines 114 and 116. Feeds line 112 only — the associated formula at line 125 does not subtract a base amount at all." },
  { line: "029125001", caption: "Grant at the enhanced rate — associated", kind: "money", role: "computed", section: "grant", note: "(Lesser of line 108 or the allocated allowed amount at line 325) × 12%. A genuinely different formula from line 112 — no base amount is subtracted, and actual spending above base plays no part. Filed instead of line 112, never alongside it." },
  { line: "029126001", caption: "Taxable capital employed in Canada", kind: "money", role: "input", section: "grant", note: "This corporation alone if not associated with anyone for IEG purposes; the associated group’s total otherwise. Drives the reduction factor at line 128." },
  { line: "029128001", caption: "Taxable-capital reduction factor", kind: "rate", role: "computed", section: "grant", note: "1 at $10,000,000 taxable capital or below, straight-line down to 0 at $50,000,000. Multiplies lines 110 + 112 at line 130 — it does not reduce the $4,000,000 expenditure limit." },
  { line: "029130001", caption: "Grant before recapture", kind: "money", role: "computed", section: "grant", note: "(Line 110 + line 112) × line 128." },
  { line: "029132001", caption: "Recapture", kind: "money", role: "input", section: "grant", note: "Where IEG-funded property was sold or converted to commercial use in the year. Blank, not zero, when there is none to report." },
  { line: "029134001", caption: "Net Innovation Employment Grant", kind: "money", role: "total", section: "grant", note: "Line 130 minus line 132.", to: { form: "AT1", line: "000129001", note: "Carried to AT1 page 2, line 129." } },
  { line: "029200001", caption: "CAN of the associated corporation with the longest taxation year", kind: "text", role: "input", section: "agreement", note: "9 or 10 digit Alberta Corporate Account Number." },
  { line: "029202001", caption: "Taxation year beginning", kind: "date", role: "input", section: "agreement", note: "The longest-year member’s own tax year — not necessarily the claimant’s." },
  { line: "029204001", caption: "Taxation year ending", kind: "date", role: "input", section: "agreement", note: "The longest-year member’s own tax year end." },
  { line: "029206001", caption: "Number of days in the longest year", kind: "text", role: "input", section: "agreement", note: "Max 365 days; 366 if the longest taxation year includes February 29." },
  { line: "029208001", caption: "Maximum Expenditure Limit", kind: "money", role: "computed", section: "agreement", note: "$4,000,000 × (line 206 ÷ 365). The group’s shared pool for the year." },
  { line: "029220001", caption: "Federal Business Number (FBN)", kind: "text", role: "input", section: "agreement", note: "One row per associated member, the claiming corporation first. There is NO line for the member’s name on this form — 220 is the FBN, not a name field." },
  { line: "029230001", caption: "Alberta Corporate Account Number (CAN)", kind: "text", role: "input", section: "agreement", note: "9 or 10 digit account number, this member’s own." },
  { line: "029235001", caption: "Current Taxation Year End", kind: "date", role: "input", section: "agreement", note: "This member’s own current taxation year end that ended within the claiming corporation’s calendar year." },
  { line: "029240001", caption: "Allocated Expenditure Limit", kind: "money", role: "input", section: "agreement", note: "The amount allocated to this member — the claimant’s own row 1 figure is transcribed to line 102 on page 2." },
  { line: "029245001", caption: "Current year’s eligible expenditures", kind: "money", role: "input", section: "agreement", note: "This member’s own current-year eligible expenditures. Summed at line 275 (\"X\")." },
  { line: "029250001", caption: "Eligible expenditures for the first preceding year", kind: "money", role: "input", section: "agreement", note: "This member’s own figure. Summed at line 280 (\"Y\")." },
  { line: "029260001", caption: "Eligible expenditures for the second preceding year", kind: "money", role: "input", section: "agreement", note: "This member’s own figure. Summed at line 290 (\"Z\")." },
  { line: "029265001", caption: "Taxable Capital for the first preceding year", kind: "money", role: "input", section: "agreement", note: "This member’s own figure. Summed at line 300 — informational; does not feed line 128." },
  { line: "029267001", caption: "Individual corporation maximum allowed amount", kind: "money", role: "computed", section: "agreement", note: "Line 245 − [(line 250 + line 260) / 2]. If negative, this member’s allowed amount (line 268) is nil, not negative." },
  { line: "029268001", caption: "Allocated allowed amount to each corporation", kind: "money", role: "computed", section: "agreement", note: "The LEAST of: line 240, line 267, and the lesser of [(4,000,000 × days in this member’s own tax year / 365 or 366) or line 031] less this member’s own base amount." },
  { line: "029270001", caption: "Total allocated expenditure limit", kind: "money", role: "total", section: "agreement", note: "Σ line 240 across every member. Must not exceed line 208." },
  { line: "029275001", caption: "Total current-year eligible expenditures", kind: "money", role: "total", section: "agreement", note: "Σ line 245 — \"X\" in the Allowed Amount formula on page 2." },
  { line: "029280001", caption: "Total eligible expenditures — first preceding year", kind: "money", role: "total", section: "agreement", note: "Σ line 250 — \"Y\" in the Allowed Amount formula." },
  { line: "029290001", caption: "Total eligible expenditures — second preceding year", kind: "money", role: "total", section: "agreement", note: "Σ line 260 — \"Z\" in the Allowed Amount formula." },
  { line: "029300001", caption: "Total taxable capital — first preceding year", kind: "money", role: "total", section: "agreement", note: "Σ line 265, across every member." },
  { line: "029310001", caption: "Group Allowed Amount", kind: "money", role: "computed", section: "agreement", note: "Line 275 − (average of line 280 and line 290). \"X − ((Y + Z) / 2)\"." },
  { line: "029320001", caption: "Total allocated allowed amount", kind: "money", role: "total", section: "agreement", note: "Σ line 268. Must be less than or equal to line 310." },
  { line: "029325001", caption: "Corporation Allocated Allowed amount", kind: "money", role: "total", section: "agreement", note: "The claiming corporation’s own line 268, restated — used to calculate line 125 on page 2." },
];

export const AT1_SCHEDULE_29_FOOTNOTES: readonly string[] = [
  "Schedule 29 must be received by Alberta Treasury Board and Finance, Tax and Revenue Administration within 15 months after the day on or before which the corporation is required to file its AT1 for the year.",
];
