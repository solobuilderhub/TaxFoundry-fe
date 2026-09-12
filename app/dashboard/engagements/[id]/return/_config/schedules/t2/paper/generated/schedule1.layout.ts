/**
 * Net income (loss) for income tax purposes (T2SCH1) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/sources/cra-forms/T2SCH01-net-income-for-tax.pdf, retrieved 2026-08-11.
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

export const T2_SCHEDULE_1_SECTIONS: readonly PaperSectionDef[] = [
  { id: "add-1", title: "Add", description: "Amounts charged in the books that tax does not allow, and amounts taxable that the books did not record. Book amortization is added here at line 104 and replaced by capital cost allowance at line 403 — the two are the same size and opposite in sign, and only the line number distinguishes them." },
  { id: "deduct-2", title: "Deduct", description: "Deductions tax allows that the books did not take, and book income that is not taxable. Capital cost allowance, terminal loss and the reserve continuity arrive from their own schedules." },
  { id: "add-3", title: "Add — continued", description: "The continuation of the additions. Its total returns to line 199 on page 1, so nothing here escapes the line 500 total." },
  { id: "deduct-4", title: "Deduct — continued", description: "The continuation of the deductions. Its total returns to line 499 on page 2. These are deductions despite carrying 300-series numbers." },
];

export const T2_SCHEDULE_1_FIELDS: readonly PaperField[] = [
  { line: "101", caption: "Provision for income taxes – current", kind: "money", role: "input", section: "add-1", note: "The current provision only; the deferred provision is line 102." },
  { line: "102", caption: "Provision for income taxes – deferred", kind: "money", role: "input", section: "add-1" },
  { line: "103", caption: "Interest and penalties on taxes", kind: "money", role: "input", section: "add-1" },
  { line: "104", caption: "Amortization of tangible assets", kind: "money", role: "input", section: "add-1", note: "Book amortization. The tax equivalent is capital cost allowance at line 403." },
  { line: "105", caption: "Amortization of natural resource assets", kind: "money", role: "input", section: "add-1" },
  { line: "106", caption: "Amortization of intangible assets", kind: "money", role: "input", section: "add-1" },
  { line: "107", caption: "Recapture of capital cost allowance from Schedule 8", kind: "money", role: "carried-in", section: "add-1", from: { form: "T2SCH8", line: "", note: "Recapture computed on the CCA schedule" } },
  { line: "110", caption: "Loss in equity of subsidiaries and affiliates", kind: "money", role: "input", section: "add-1" },
  { line: "111", caption: "Loss on disposal of assets", kind: "money", role: "input", section: "add-1" },
  { line: "112", caption: "Charitable donations and gifts from Schedule 2", kind: "money", role: "carried-in", section: "add-1", from: { form: "T2SCH2", line: "", note: "After the 75% of net income limit" } },
  { line: "113", caption: "Taxable capital gains from Schedule 6", kind: "money", role: "carried-in", section: "add-1", from: { form: "T2SCH6", line: "", note: "The taxable half of the net capital gain" } },
  { line: "114", caption: "Political contributions", kind: "money", role: "input", section: "add-1" },
  { line: "115", caption: "Holdbacks", kind: "money", role: "input", section: "add-1" },
  { line: "116", caption: "Deferred and prepaid expenses", kind: "money", role: "input", section: "add-1" },
  { line: "117", caption: "Depreciation in inventory – end of year", kind: "money", role: "input", section: "add-1" },
  { line: "118", caption: "Scientific research expenditures deducted per financial statements", kind: "money", role: "input", section: "add-1" },
  { line: "119", caption: "Capitalized interest", kind: "money", role: "input", section: "add-1" },
  { line: "120", caption: "Non-deductible club dues and fees", kind: "money", role: "input", section: "add-1" },
  { line: "121", caption: "Non-deductible meals and entertainment expenses", kind: "money", role: "input", section: "add-1", note: "Half of meals and entertainment is denied by ITA s.67.1 — enter the disallowed half here, not the whole expense." },
  { line: "122", caption: "Non-deductible automobile expenses", kind: "money", role: "input", section: "add-1" },
  { line: "123", caption: "Non-deductible life insurance premiums", kind: "money", role: "input", section: "add-1" },
  { line: "124", caption: "Non-deductible company pension plans", kind: "money", role: "input", section: "add-1" },
  { line: "125", caption: "Other reserves on lines 270 and 275 from Schedule 13", kind: "money", role: "carried-in", section: "add-1", from: { form: "T2SCH13", line: "270", note: "Prior reserves reversed back into income" } },
  { line: "126", caption: "Reserves from financial statements – balance at the end of the year", kind: "money", role: "input", section: "add-1" },
  { line: "127", caption: "Soft costs on construction and renovation of buildings", kind: "money", role: "input", section: "add-1" },
  { line: "128", caption: "Non-deductible fines and penalties under section 67.6", kind: "money", role: "input", section: "add-1", note: "ITA s.67.6 denies fines and penalties outright." },
  { line: "129", caption: "Income or loss for tax purposes – partnerships", kind: "money", role: "input", section: "add-1" },
  { line: "130", caption: "Amounts calculated under section 34.2 from Schedule 73", kind: "money", role: "carried-in", section: "add-1", from: { form: "T2SCH73", line: "" } },
  { line: "131", caption: "Income shortfall adjustment and additional amount from Schedule 73", kind: "money", role: "carried-in", section: "add-1", from: { form: "T2SCH73", line: "" } },
  { line: "132", caption: "Income or loss for tax purposes – joint ventures", kind: "money", role: "input", section: "add-1" },
  { line: "199", caption: "Amount D on page 3", kind: "money", role: "total", section: "add-1", note: "Not keyed: it is the total of the page 3 continuation." },
  { line: "500", caption: "Total (lines 101 to 199)", kind: "money", role: "total", section: "add-1" },
  { line: "401", caption: "Gain on disposal of assets per financial statements", kind: "money", role: "input", section: "deduct-2" },
  { line: "402", caption: "Non-taxable dividends under section 83 from Schedule 3", kind: "money", role: "carried-in", section: "deduct-2", from: { form: "T2SCH3", line: "" } },
  { line: "403", caption: "Capital cost allowance from Schedule 8", kind: "money", role: "carried-in", section: "deduct-2", note: "From Schedule 8. Do not also enter a manual amortization deduction.", from: { form: "T2SCH8", line: "" } },
  { line: "404", caption: "Terminal loss from Schedule 8", kind: "money", role: "carried-in", section: "deduct-2", from: { form: "T2SCH8", line: "" } },
  { line: "406", caption: "Allowable business investment loss from Schedule 6", kind: "money", role: "carried-in", section: "deduct-2", from: { form: "T2SCH6", line: "" } },
  { line: "407", caption: "Foreign non-business tax deduction under subsection 20(12)", kind: "money", role: "input", section: "deduct-2" },
  { line: "408", caption: "Holdbacks", kind: "money", role: "input", section: "deduct-2" },
  { line: "409", caption: "Deferred and prepaid expenses", kind: "money", role: "input", section: "deduct-2" },
  { line: "410", caption: "Depreciation in inventory – end of prior year", kind: "money", role: "input", section: "deduct-2" },
  { line: "411", caption: "SR&ED expenditures claimed in the year on line 460 from Form T661", kind: "money", role: "carried-in", section: "deduct-2", from: { form: "T661", line: "460" } },
  { line: "413", caption: "Other reserves on line 280 from Schedule 13", kind: "money", role: "carried-in", section: "deduct-2", from: { form: "T2SCH13", line: "280", note: "This year's reserves deducted" } },
  { line: "414", caption: "Reserves from financial statements – balance at the beginning of the year", kind: "money", role: "input", section: "deduct-2" },
  { line: "416", caption: "Patronage dividend deduction from Schedule 16", kind: "money", role: "carried-in", section: "deduct-2", from: { form: "T2SCH16", line: "" } },
  { line: "417", caption: "Contributions to deferred income plans from Schedule 15", kind: "money", role: "carried-in", section: "deduct-2", from: { form: "T2SCH15", line: "" } },
  { line: "418", caption: "Incorporation expenses under paragraph 20(1)(b)", kind: "money", role: "input", section: "deduct-2" },
  { line: "499", caption: "Amount E on page 4", kind: "money", role: "total", section: "deduct-2", note: "Not keyed: it is the total of the page 4 continuation." },
  { line: "510", caption: "Total (lines 401 to 499)", kind: "money", role: "total", section: "deduct-2" },
  { line: "201", caption: "Accounts payable and accruals for cash basis – closing", kind: "money", role: "input", section: "add-3" },
  { line: "202", caption: "Accounts receivable and prepaid for cash basis – opening", kind: "money", role: "input", section: "add-3" },
  { line: "203", caption: "Accrual inventory – opening", kind: "money", role: "input", section: "add-3" },
  { line: "204", caption: "Accrued dividends – prior year", kind: "money", role: "input", section: "add-3" },
  { line: "206", caption: "Capital items expensed", kind: "money", role: "input", section: "add-3" },
  { line: "208", caption: "Debt issue expense", kind: "money", role: "input", section: "add-3" },
  { line: "209", caption: "Deemed dividend income", kind: "money", role: "input", section: "add-3" },
  { line: "210", caption: "Deemed interest on loans to non-residents", kind: "money", role: "input", section: "add-3" },
  { line: "211", caption: "Deemed interest received", kind: "money", role: "input", section: "add-3" },
  { line: "212", caption: "Development expenses claimed in current year", kind: "money", role: "input", section: "add-3" },
  { line: "213", caption: "Dividend stop-loss adjustment", kind: "money", role: "input", section: "add-3" },
  { line: "214", caption: "Dividends credited to the investment account", kind: "money", role: "input", section: "add-3" },
  { line: "215", caption: "Exploration expenses claimed in current year", kind: "money", role: "input", section: "add-3" },
  { line: "216", caption: "Financing fees deducted in books", kind: "money", role: "input", section: "add-3" },
  { line: "217", caption: "Foreign accrual property income", kind: "money", role: "input", section: "add-3" },
  { line: "218", caption: "Foreign affiliate property income", kind: "money", role: "input", section: "add-3" },
  { line: "219", caption: "Foreign exchange included in retained earnings", kind: "money", role: "input", section: "add-3" },
  { line: "220", caption: "Gain on settlement of debt", kind: "money", role: "input", section: "add-3" },
  { line: "221", caption: "Interest paid on income debentures", kind: "money", role: "input", section: "add-3" },
  { line: "222", caption: "Limited partnership losses from Schedule 4", kind: "money", role: "input", section: "add-3" },
  { line: "224", caption: "Mandatory inventory adjustment – included in current year", kind: "money", role: "input", section: "add-3" },
  { line: "226", caption: "Non-deductible advertising", kind: "money", role: "input", section: "add-3" },
  { line: "227", caption: "Non-deductible interest", kind: "money", role: "input", section: "add-3" },
  { line: "228", caption: "Non-deductible legal and accounting fees", kind: "money", role: "input", section: "add-3" },
  { line: "229", caption: "Optional value of inventory – included in current year", kind: "money", role: "input", section: "add-3" },
  { line: "230", caption: "Other expenses from financial statements", kind: "money", role: "input", section: "add-3" },
  { line: "231", caption: "Recapture of SR&ED expenditures from Form T661", kind: "money", role: "input", section: "add-3" },
  { line: "232", caption: "Resource amounts deducted", kind: "money", role: "input", section: "add-3" },
  { line: "233", caption: "Restricted farm losses – current year from Schedule 4", kind: "money", role: "input", section: "add-3" },
  { line: "234", caption: "Sales tax assessments", kind: "money", role: "input", section: "add-3" },
  { line: "235", caption: "Share issue expense", kind: "money", role: "input", section: "add-3" },
  { line: "236", caption: "Write-down of capital property", kind: "money", role: "input", section: "add-3" },
  { line: "237", caption: "Amounts received in respect of qualifying environmental trust per paragraphs 12(1)(z.1) and 12(1)(z.2)", kind: "money", role: "input", section: "add-3" },
  { line: "238", caption: "Contractors' completion method adjustment: revenue net of costs on contracts under two years – previous year", kind: "money", role: "input", section: "add-3" },
  { line: "239", caption: "Taxable/non-deductible other comprehensive income items", kind: "money", role: "input", section: "add-3" },
  { line: "248", caption: "Book loss of joint ventures", kind: "money", role: "input", section: "add-3" },
  { line: "249", caption: "Book loss of partnerships", kind: "money", role: "input", section: "add-3" },
  { line: "250", caption: "Hybrid mismatch amount under subsection 18.4(4) or 12.7(3)", kind: "money", role: "input", section: "add-3" },
  { line: "251", caption: "Excess IFE under subsection 18.2(2) from Schedule 130", kind: "money", role: "input", section: "add-3" },
  { line: "252", caption: "Partnership IFE add-back under paragraph 12(1)(l.2) from Schedule 130", kind: "money", role: "input", section: "add-3" },
  { line: "253", caption: "Non-deductible interest under subsection 18(4)", kind: "money", role: "input", section: "add-3" },
  { line: "254", caption: "Partnership interest deduction add-back under paragraph 12(1)(l.1)", kind: "money", role: "input", section: "add-3" },
  { line: "296", caption: "Total of column 2", kind: "money", role: "input", section: "add-3" },
  { line: "300", caption: "Accounts payable and accruals for cash basis – opening", kind: "money", role: "input", section: "deduct-4" },
  { line: "301", caption: "Accounts receivable and prepaid for cash basis – closing", kind: "money", role: "input", section: "deduct-4" },
  { line: "302", caption: "Accrual inventory – closing", kind: "money", role: "input", section: "deduct-4" },
  { line: "303", caption: "Accrued dividends – current year", kind: "money", role: "input", section: "deduct-4" },
  { line: "304", caption: "Bad debt", kind: "money", role: "input", section: "deduct-4" },
  { line: "306", caption: "Equity in income from subsidiaries or affiliates", kind: "money", role: "input", section: "deduct-4" },
  { line: "307", caption: "Exempt income under section 81", kind: "money", role: "input", section: "deduct-4" },
  { line: "309", caption: "Mandatory inventory adjustment – included in prior year", kind: "money", role: "input", section: "deduct-4" },
  { line: "310", caption: "Contributions to a qualifying environmental trust", kind: "money", role: "input", section: "deduct-4" },
  { line: "311", caption: "Non-Canadian advertising expenses – broadcasting", kind: "money", role: "input", section: "deduct-4" },
  { line: "312", caption: "Non-Canadian advertising expenses – printed materials", kind: "money", role: "input", section: "deduct-4" },
  { line: "313", caption: "Optional value of inventory – included in prior year", kind: "money", role: "input", section: "deduct-4" },
  { line: "314", caption: "Other income from financial statements", kind: "money", role: "input", section: "deduct-4" },
  { line: "315", caption: "Payments made for allocations in proportion to borrowing and bonus interest payments from Schedule 17", kind: "money", role: "input", section: "deduct-4" },
  { line: "316", caption: "Contractors' completion method adjustment: revenue net of costs on contracts under two years – current year", kind: "money", role: "input", section: "deduct-4" },
  { line: "347", caption: "Non-taxable/deductible other comprehensive income items", kind: "money", role: "input", section: "deduct-4" },
  { line: "348", caption: "Book income of joint venture", kind: "money", role: "input", section: "deduct-4" },
  { line: "349", caption: "Book income of partnership", kind: "money", role: "input", section: "deduct-4" },
  { line: "350", caption: "Adjustment for hybrid mismatch amount under paragraph 20(1)(yy)", kind: "money", role: "input", section: "deduct-4" },
  { line: "340", caption: "Canadian development expenses from Schedule 12", kind: "money", role: "input", section: "deduct-4" },
  { line: "341", caption: "Canadian exploration expenses from Schedule 12", kind: "money", role: "input", section: "deduct-4" },
  { line: "342", caption: "Canadian oil and gas property expenses from Schedule 12", kind: "money", role: "input", section: "deduct-4" },
  { line: "344", caption: "Depletion from Schedule 12", kind: "money", role: "input", section: "deduct-4" },
  { line: "345", caption: "Foreign exploration and development expenses from Schedule 12", kind: "money", role: "input", section: "deduct-4" },
  { line: "396", caption: "Total of column 2", kind: "money", role: "input", section: "deduct-4" },
];
