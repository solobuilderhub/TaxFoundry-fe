/**
 * Alberta Income Allocation Factor (AT1SCH2) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/sources/tra-forms/pdf/AT1SCH02-income-allocation-factor-TRA11724.pdf, retrieved 2026-08-30.
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
}

export const AT1_SCHEDULE_2_SECTIONS: readonly PaperSectionDef[] = [
  { id: "gate", title: "Which formula applies", description: "Answered \"No\", the corporation completes Area A. Answered \"Yes\", it completes the one line in Area B for its own type of operation instead — and where more than one applies, only Divided Businesses." },
  { id: "general", title: "Area A — General Allocation Formula (ITA Reg 402)", description: "The common case, taken straight from the federal Schedule 5." },
  { id: "bus-truck", title: "Area B — Bus and Truck Operators (ITA Reg 409)", description: "Not computed by this engine." },
  { id: "grain-elevator", title: "Area B — Grain Elevator Operators (ITA Reg 408)", description: "Not computed by this engine." },
  { id: "pipeline", title: "Area B — Pipeline Operators (ITA Reg 411)", description: "Not computed by this engine." },
  { id: "insurance", title: "Area B — Insurance Corporations (ITA Reg 403)", description: "Columns A and B are shaded out on the page — this formula has two inputs, not four. Not computed by this engine." },
  { id: "chartered-banks", title: "Area B — Chartered Banks (ITA Reg 404)", description: "Loans and deposits weigh double in this formula. Not computed by this engine." },
  { id: "trust-loan", title: "Area B — Trust & Loan Corporations (ITA Reg 405)", description: "Columns A and B are shaded out on the page. Not computed by this engine." },
  { id: "airline", title: "Area B — Airline Corporations (ITA Reg 407)", description: "Revenue plane miles weigh triple in this formula. Not computed by this engine." },
  { id: "railway", title: "Area B — Railway Corporations (ITA Reg 406)", description: "Not computed by this engine." },
  { id: "ship", title: "Area B — Ship Operators (ITA Reg 410)", description: "Eight lines, not four: G and H are computed on the page from the other six and the jacket's line 062. Not computed by this engine." },
  { id: "divided-businesses", title: "Area B — Divided Businesses (ITA Reg 412)", description: "Where more than one special formula applies to a corporation, the page says to complete ONLY this one. Not computed by this engine." },
];

export const AT1_SCHEDULE_2_FIELDS: readonly PaperField[] = [
  { line: "002001001", caption: "Is the corporation in any of these special allocation categories?", kind: "flag", role: "input", section: "gate", requirement: "mandatory", note: "Review the types of operation listed in Area B. \"No\" sends the filer to Area A; \"Yes\" to the one Area B line matching its operation." },
  { line: "002002001", caption: "Salaries and wages paid in Alberta", kind: "money", role: "carried-in", section: "general", requirement: "mandatory", from: { form: "T2SCH5", line: "", note: "The Alberta row of the federal establishments allocation." } },
  { line: "002004001", caption: "Total salaries and wages paid in all jurisdictions", kind: "money", role: "carried-in", section: "general", requirement: "mandatory", from: { form: "T2SCH5", line: "", note: "Every jurisdiction's row, summed." } },
  { line: "002006001", caption: "Gross revenue in Alberta", kind: "money", role: "carried-in", section: "general", requirement: "mandatory", from: { form: "T2SCH5", line: "", note: "The Alberta row of the federal establishments allocation." } },
  { line: "002008001", caption: "Gross revenue in all jurisdictions", kind: "money", role: "carried-in", section: "general", requirement: "mandatory", from: { form: "T2SCH5", line: "", note: "Every jurisdiction's row, summed." } },
  { line: "002012001", caption: "Salaries & wages paid in Alberta", kind: "money", role: "input", section: "bus-truck" },
  { line: "002014001", caption: "Total salaries & wages paid", kind: "money", role: "input", section: "bus-truck" },
  { line: "002016001", caption: "Kilometres traveled in Alberta", kind: "money", role: "input", section: "bus-truck" },
  { line: "002018001", caption: "Total kilometres traveled in jurisdictions where corporation has permanent establishment", kind: "money", role: "input", section: "bus-truck" },
  { line: "002022001", caption: "Salaries & wages paid in Alberta", kind: "money", role: "input", section: "grain-elevator" },
  { line: "002024001", caption: "Total salaries & wages paid", kind: "money", role: "input", section: "grain-elevator" },
  { line: "002026001", caption: "Bushels of grain received at Alberta elevators", kind: "money", role: "input", section: "grain-elevator" },
  { line: "002028001", caption: "Bushels of grain received at all elevators", kind: "money", role: "input", section: "grain-elevator" },
  { line: "002032001", caption: "Salaries & wages paid in Alberta", kind: "money", role: "input", section: "pipeline" },
  { line: "002034001", caption: "Total salaries & wages paid", kind: "money", role: "input", section: "pipeline" },
  { line: "002036001", caption: "Miles of pipeline in Alberta", kind: "money", role: "input", section: "pipeline" },
  { line: "002038001", caption: "Total miles of pipeline in provinces where corporation has permanent establishment", kind: "money", role: "input", section: "pipeline" },
  { line: "002046001", caption: "Net premiums in Alberta", kind: "money", role: "input", section: "insurance" },
  { line: "002048001", caption: "Total net premiums earned", kind: "money", role: "input", section: "insurance" },
  { line: "002052001", caption: "Salaries and wages paid in Alberta", kind: "money", role: "input", section: "chartered-banks" },
  { line: "002054001", caption: "Total salaries and wages paid", kind: "money", role: "input", section: "chartered-banks" },
  { line: "002056001", caption: "Loans & deposits in Alberta", kind: "money", role: "input", section: "chartered-banks" },
  { line: "002058001", caption: "Total loans & deposits", kind: "money", role: "input", section: "chartered-banks" },
  { line: "002066001", caption: "Gross revenue earned in Alberta", kind: "money", role: "input", section: "trust-loan" },
  { line: "002068001", caption: "Total gross revenue", kind: "money", role: "input", section: "trust-loan" },
  { line: "002072001", caption: "Fixed asset cost (other than aircraft) in Alberta", kind: "money", role: "input", section: "airline" },
  { line: "002074001", caption: "Fixed asset cost (other than aircraft) in Canada", kind: "money", role: "input", section: "airline" },
  { line: "002076001", caption: "Revenue plane miles flown in Alberta", kind: "money", role: "input", section: "airline" },
  { line: "002078001", caption: "Revenue plane miles flown in Canada where the corporation has permanent establishment", kind: "money", role: "input", section: "airline" },
  { line: "002082001", caption: "Equated track miles in Alberta", kind: "money", role: "input", section: "railway" },
  { line: "002084001", caption: "Total equated track miles in Canada", kind: "money", role: "input", section: "railway" },
  { line: "002086001", caption: "Gross ton miles in Alberta", kind: "money", role: "input", section: "railway" },
  { line: "002088001", caption: "Total gross ton miles in Canada", kind: "money", role: "input", section: "railway" },
  { line: "002090001", caption: "Salaries and wages paid in Alberta", kind: "money", role: "input", section: "ship" },
  { line: "002092001", caption: "Total salaries and wages paid in Canada", kind: "money", role: "input", section: "ship", note: "The page marks this with an asterisk: \"Salaries & wages paid by the corporation to employees of its permanent establishments (other than ships) in Canada.\"" },
  { line: "002094001", caption: "Port-call-tonnage in Alberta", kind: "money", role: "input", section: "ship" },
  { line: "002096001", caption: "Total port-call-tonnage in all provinces with permanent establishments", kind: "money", role: "input", section: "ship" },
  { line: "002098001", caption: "Total port-call-tonnage in Canada", kind: "money", role: "input", section: "ship" },
  { line: "002100001", caption: "Total port-call-tonnage in all countries", kind: "money", role: "input", section: "ship" },
  { line: "002102001", caption: "(E/F) x (AT1 lines 062)", kind: "money", role: "computed", section: "ship", note: "Amount G — line 098 divided by line 100, times Alberta taxable income at AT1 line 062." },
  { line: "002104001", caption: "(A/B) x [(AT1 lines 062) - G]", kind: "money", role: "computed", section: "ship", note: "Amount H — line 090 divided by line 092, times what is left of AT1 line 062 after amount G." },
  { line: "002106001", caption: "Amount Taxable in Alberta", kind: "money", role: "input", section: "divided-businesses" },
  { line: "002108001", caption: "AT1 line 062", kind: "money", role: "carried-in", section: "divided-businesses", from: { form: "AT1", line: "000062001", note: "Printed as the caption itself — the divisor is Alberta taxable income off the jacket." } },
];

export const AT1_SCHEDULE_2_FOOTNOTES: readonly string[] = [
  "For corporations with taxable income that is in part allocable to permanent establishments outside Alberta. Report all monetary values in dollars; DO NOT include cents.",
  "Divided Businesses (ITA Reg 412): Where more than one special allocation formula applies to a corporation, complete only the calculation for Divided Businesses at the bottom of page 2.",
  "Non-resident Corporations (ITA Reg 413): Where a corporation is not resident in Canada, \"salaries and wages paid in all jurisdictions\" by the corporation does not include salaries and wages paid to employees of a permanent establishment outside of Canada. When calculating using the general allocation formula under ITA Reg. 402(3)(a), \"gross revenue in all jurisdictions\" does not include gross revenue reasonably attributable to a permanent establishment outside Canada.",
  "Use the amounts from the federal Schedule 5 to complete the applicable formula.",
  "References to Regulations below are to those of the Income Tax Act (Canada), as adopted by the Alberta Corporate Tax Act.",
  "If either amount B or D is nil, do not multiply by 1/2.",
  "Salaries & wages paid by the corporation to employees of its permanent establishments (other than ships) in Canada.",
];

/** Column I per formula — the arithmetic the page prints, with no line number on any row. See `AT1_SCHEDULE_2_FACTOR_DESTINATION` for where every factor goes. */
export interface Schedule2Formula {
  section: string;
  regulation: string;
  factor: string;
  /** Which printed line each letter in `factor` stands for — the page heads its columns A-H and prints those letters nowhere else. */
  columns: Readonly<Record<string, string>>;
  note?: string;
}

export const AT1_SCHEDULE_2_FORMULAS: readonly Schedule2Formula[] = [
  { section: "general", regulation: "ITA Reg 402", factor: "(A/B + C/D) x 1/2", columns: { A: "002", B: "004", C: "006", D: "008" }, note: "If either amount B or D is nil, do not multiply by 1/2." },
  { section: "bus-truck", regulation: "ITA Reg 409", factor: "(A/B + C/D) x 1/2", columns: { A: "012", B: "014", C: "016", D: "018" } },
  { section: "grain-elevator", regulation: "ITA Reg 408", factor: "(A/B + C/D) x 1/2", columns: { A: "022", B: "024", C: "026", D: "028" } },
  { section: "pipeline", regulation: "ITA Reg 411", factor: "(A/B + C/D) x 1/2", columns: { A: "032", B: "034", C: "036", D: "038" } },
  { section: "insurance", regulation: "ITA Reg 403", factor: "C/D", columns: { C: "046", D: "048" } },
  { section: "chartered-banks", regulation: "ITA Reg 404", factor: "(A/B + 2C/D) x 1/3", columns: { A: "052", B: "054", C: "056", D: "058" } },
  { section: "trust-loan", regulation: "ITA Reg 405", factor: "C/D", columns: { C: "066", D: "068" } },
  { section: "airline", regulation: "ITA Reg 407", factor: "(A/B + 3C/D) x 1/4", columns: { A: "072", B: "074", C: "076", D: "078" } },
  { section: "railway", regulation: "ITA Reg 406", factor: "(A/B + C/D) x 1/2", columns: { A: "082", B: "084", C: "086", D: "088" } },
  { section: "ship", regulation: "ITA Reg 410", factor: "(G x C/D) + H", columns: { A: "090", B: "092", C: "094", D: "096", E: "098", F: "100", G: "102", H: "104" }, note: "Over AT1 lines 062 — the page prints the divisor beneath the rule." },
  { section: "divided-businesses", regulation: "ITA Reg 412", factor: "A/B", columns: { A: "106", B: "108" } },
];

/** Where every factor is filed, whichever formula produced it — the AT1 jacket. */
export const AT1_SCHEDULE_2_FACTOR_DESTINATION = { form: "AT1", line: "000065001", note: "Printed on the form: \"Carry this amount forward to AT1 line 065\". Calculated to 6 decimal places." };
