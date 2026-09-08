/**
 * Alberta Royalty Tax Deduction (AT1SCH05) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/sources/tra-spec/AT1-Chapter3-2025.2-full.txt, retrieved 2026-08-31.
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
  /** How the form itself says this line is calculated, where it prints the arithmetic. */
  formula?: { expression: string; inputs: readonly string[] };
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

export const AT1_SCHEDULE_5_SECTIONS: readonly PaperSectionDef[] = [
  { id: "crtd", title: "Calculation of the Royalty Tax Deduction (CRTD)", description: "The corporation's own unsuccessored pool. Line 016 is discretionary — blank claims the maximum the pool and Alberta taxable income both allow." },
  { id: "transfer", title: "Pool Transfer / Change in Control", description: "026/027 required only when a transfer occurred; 100 is informational, cross-checked against the AT1 jacket's own tax-year-end-change fields." },
  { id: "sspi", title: "Second Successored Pool Information (SSPI)", description: "One occurrence per vendor/predecessor. 105 and 107 are mutually exclusive per occurrence — supply exactly one. Must not exist unless line 200 is Yes." },
  { id: "fspi", title: "First Successored Pool Information (FSPI)", description: "One occurrence per vendor/predecessor. 125 and 127 are mutually exclusive per occurrence — supply exactly one. Must not exist unless line 200 is Yes." },
  { id: "total", title: "Successored Total" },
];

export const AT1_SCHEDULE_5_FIELDS: readonly PaperField[] = [
  { line: "005001001", caption: "Crown charges under s.20(6)(a)-(e), with reference to s.20(13)", kind: "money", role: "input", section: "crtd", note: "AT1 Schedule 7, line 061. Floored at zero." },
  { line: "005005001", caption: "Deduct: Resource allowance claimed under s.20(6)(g)", kind: "money", role: "input", section: "crtd", note: "AT1 Schedule 12, line 024, or federal Schedule 1, line 346." },
  { line: "005007001", caption: "Deduct: Reimbursements received under a contract in respect of amounts on line 001, under s.20(6)(f)", kind: "money", role: "input", section: "crtd", note: "Excludes ARTC and other government rebates or credits." },
  { line: "005011001", caption: "Attributed Royalty Income carried forward from the preceding year", kind: "money", role: "computed", section: "crtd", note: "= opening unsuccessored pool balance (line 043) + Σ predecessor transfers (line 037)." },
  { line: "005016001", caption: "Royalty tax deduction claim amount in respect of the pool for the year", kind: "money", role: "input", section: "crtd", note: "Discretionary. Blank = claim the maximum the pool and Alberta taxable income both allow." },
  { line: "005017001", caption: "Pool available, carried forward to next year", kind: "money", role: "computed", section: "crtd", note: "= line 013 (unlabeled internal subtotal) − line 016." },
  { line: "005023001", caption: "Deduct: Transfers of Attributed Royalty Income to another corporation during the year due to disposal of substantially all Canadian Resource Properties", kind: "money", role: "input", section: "crtd" },
  { line: "005025001", caption: "Attributed Royalty Income carried forward to next year", kind: "money", role: "computed", section: "crtd", note: "Floored at zero. Literal spec formula omits line 007 and subtracts the COMBINED royalty tax deduction (line 064), not just line 016 — see module doc." },
  { line: "005026001", caption: "Was there a transfer of the resource pools during the year?", kind: "code", role: "input", section: "transfer", requirement: "conditional", note: "1 = disposition of all/substantially all CRP (s.20(8)); 2 = change in control / ceasing s.20(14) exemption; 3 = no transfer." },
  { line: "005027001", caption: "Legal name of the corporation who acquired the resource pools", kind: "text", role: "input", section: "transfer", requirement: "conditional", note: "Required when line 026 is 1 or 2; must be absent when 3." },
  { line: "005100001", caption: "Was there a change in control that created the immediately preceding taxation year end?", kind: "flag", role: "input", section: "transfer", requirement: "optional" },
  { line: "005101001", caption: "Legal name of vendor, predecessor, or the corporation itself on a change in control", kind: "text", role: "input", section: "sspi" },
  { line: "005103001", caption: "Date of Event", kind: "date", role: "input", section: "sspi" },
  { line: "005105001", caption: "Pool amount available for carry-forward at the end of the preceding year", kind: "money", role: "input", section: "sspi", requirement: "conditional" },
  { line: "005107001", caption: "Cost on acquisition of all/substantially all Canadian resource properties, or on a change in control, under s.20(8) or 20(14)", kind: "money", role: "input", section: "sspi", requirement: "conditional" },
  { line: "005109001", caption: "Property income under s.20(1)(c)", kind: "money", role: "input", section: "sspi" },
  { line: "005111001", caption: "Claim", kind: "money", role: "computed", section: "sspi", note: "= min(pool base, property income). Mandatory arithmetic, not discretionary." },
  { line: "005113001", caption: "Carried forward, before transfer", kind: "money", role: "computed", section: "sspi", note: "= pool base − claim." },
  { line: "005115001", caption: "Second Successored Pool subtotal", kind: "money", role: "computed", section: "sspi", note: "Σ line 113 across all SSPI occurrences." },
  { line: "005121001", caption: "Legal name of vendor, predecessor, or the corporation itself on a change in control", kind: "text", role: "input", section: "fspi" },
  { line: "005123001", caption: "Date of Event", kind: "date", role: "input", section: "fspi" },
  { line: "005125001", caption: "Pool amount available for carry-forward at the end of the preceding year", kind: "money", role: "input", section: "fspi", requirement: "conditional" },
  { line: "005127001", caption: "Cost on acquisition of all/substantially all Canadian resource properties, or on a change in control, under s.20(8) or 20(14)", kind: "money", role: "input", section: "fspi", requirement: "conditional" },
  { line: "005129001", caption: "Property income under s.20(1)(c)", kind: "money", role: "input", section: "fspi" },
  { line: "005131001", caption: "Claim", kind: "money", role: "computed", section: "fspi", note: "= min(pool base, property income). Mandatory arithmetic, not discretionary." },
  { line: "005133001", caption: "Carried forward, before transfer", kind: "money", role: "computed", section: "fspi", note: "= pool base − claim." },
  { line: "005135001", caption: "First Successored Pool subtotal", kind: "money", role: "computed", section: "fspi", note: "Σ line 133 across all FSPI occurrences." },
  { line: "005140001", caption: "Successored Total", kind: "money", role: "computed", section: "total", note: "= Σ SSPI claims (111) + Σ FSPI claims (131). Feeds AT1 core line 064 alongside line 016." },
];
