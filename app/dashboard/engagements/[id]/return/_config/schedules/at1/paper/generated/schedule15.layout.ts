/**
 * Alberta Resource Related Deductions (AT1SCH15) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/sources/tra-forms/pdf/AT1SCH15-resource-related-deductions-TRA11736.pdf, retrieved 2026-09-14.
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

export const AT1_SCHEDULE_15_SECTIONS: readonly PaperSectionDef[] = [
  { id: "area-a", title: "AREA A - Continuity of Earned Depletion Base", description: "A grandfathered pool — no new earned depletion has accrued since the mid-1990s, but a legacy balance can still be drawn down. The two claims are made under different regulations per side: 1201 on regular expenses, 1202(2) on successor.", printedBefore: "This schedule is required if the balance at the end of the preceding taxation year or the claim for Alberta purposes differs from that for federal purposes. Report all monetary values in dollars; DO NOT include cents. Show negative amounts in brackets ( )." },
  { id: "area-b", title: "AREA B - Continuity of Mining Exploration Depletion Base", description: "One column. This pool has no successor side at all, which is why the page heads no columns here." },
  { id: "area-c", title: "AREA C - Cumulative Canadian Exploration Expenses", printedBefore: "Report all monetary amounts in dollars; DO NOT include cents. Show negative amounts in brackets ( )." },
  { id: "area-d", title: "AREA D - Cumulative Canadian Development Expenses", description: "The pool whose credit-balance lines (105 / 133) reach across into Area E, in a direction the page’s own footnote makes conditional on a federal 66.7(4)(a)(iii) designation.", printedBefore: "Report all monetary amounts in dollars; DO NOT include cents. Show negative amounts in brackets ( )." },
  { id: "area-e", title: "AREA E - Cumulative Canadian Oil and Gas Property Expenses (CCOGPE)", description: "The other end of Area D’s credit-balance link. A negative amount available here routes to Area D at line 133 or line 107 depending on the same designation — see the footnote on the Amount Available row.", printedBefore: "Report all monetary amounts in dollars; DO NOT include cents. Show negative amounts in brackets ( )." },
  { id: "area-f", title: "AREA F - Foreign Exploration and Development Expenses", description: "Expenses NOT in respect of a country — the page says so under its own heading, and a country-specific expense belongs in Area G or H instead. Its claims do not total here: page 6 sums them with the per-country areas’." },
  { id: "sfede", title: "AREA G - Specified Foreign Exploration and Development Expenses", description: "One row per country, and a different shape from every area before it: the printed lines are COLUMNS, lettered A to I and J to R, with one occurrence per country. Pre-2001 expenses only — see the paragraph the page prints under its heading.", printedBefore: "Report all monetary amounts in dollars; DO NOT include cents. Show negative amounts in brackets ( )." },
  { id: "cfre", title: "AREA H - Cumulative Foreign Resource Expenses", description: "The 2001-and-after counterpart of Area G, lettered AA to JJ and KK to SS. Its regular claim (column GG) carries the most involved cap on the schedule, half of which rests on a \"global foreign resource limit\" the specification never defines.", printedBefore: "Report all monetary amounts in dollars; DO NOT include cents. Show negative amounts in brackets ( )." },
];

export const AT1_SCHEDULE_15_FIELDS: readonly PaperField[] = [
  { line: "015001001", caption: "Balance at end of preceding taxation year", kind: "money", role: "input", section: "area-a" },
  { line: "015011001", caption: "Balance at end of preceding taxation year", kind: "money", role: "input", section: "area-a" },
  { line: "015003001", caption: "Add: transferred on amalgamation or wind-up of subsidiary", kind: "money", role: "input", section: "area-a", footnoteMarks: [0] },
  { line: "015013001", caption: "Add: transferred on amalgamation or wind-up of subsidiary", kind: "money", role: "input", section: "area-a", footnoteMarks: [0] },
  { line: "015015001", caption: "Add: transferred other than on amalgamation or wind-up of subsidiary", kind: "money", role: "input", section: "area-a", footnoteMarks: [0] },
  { line: "015005001", caption: "Deduct: transferred on sale of resource property to successor", kind: "money", role: "input", section: "area-a" },
  { line: "015017001", caption: "Deduct: transferred on sale of resource property to successor", kind: "money", role: "input", section: "area-a" },
  { line: "015019001", caption: "Deduct: Claim for the year per federal Regulation 1202(2)", kind: "money", role: "input", section: "area-a", note: "Successor-side claim, under federal Regulation 1202(2). See line 007.", to: { form: "AT1SCH12", line: "012022001", note: "Total lines 007 + 019 + 031 and carry this amount forward to Schedule 12, line 022." } },
  { line: "015007001", caption: "Deduct: Claim for the year per federal Regulation 1201", kind: "money", role: "input", section: "area-a", note: "Regular-side claim, under federal Regulation 1201. The successor side claims under Regulation 1202(2) at line 019 instead, and the page shades each column out on the other’s row — the two are not interchangeable.", to: { form: "AT1SCH12", line: "012022001", note: "Total lines 007 + 019 + 031 and carry this amount forward to Schedule 12, line 022." } },
  { line: "015009001", caption: "Closing balance", kind: "money", role: "computed", section: "area-a", note: "Computed. The page’s own footnote requires \"0\" here and at line 007 when the amount available is negative, rather than a negative closing balance." },
  { line: "015021001", caption: "Closing balance", kind: "money", role: "computed", section: "area-a", note: "Computed. \"0\" when the amount available is negative, per the page’s footnote." },
  { line: "015023001", caption: "Balance at end of preceding taxation year", kind: "money", role: "input", section: "area-b" },
  { line: "015025001", caption: "Add: transferred on amalgamation or wind-up of subsidiary", kind: "money", role: "input", section: "area-b" },
  { line: "015027001", caption: "Add: transferred other than on amalgamation or wind-up of subsidiary", kind: "money", role: "input", section: "area-b" },
  { line: "015029001", caption: "Deduct: transferred on disposal of resource property to successor", kind: "money", role: "input", section: "area-b" },
  { line: "015031001", caption: "Deduct: claim for the year per federal Regulation 1203(1)", kind: "money", role: "input", section: "area-b", note: "A genuinely discretionary Alberta claim: no federal line defaults it, unlike every other claim on this schedule.", to: { form: "AT1SCH12", line: "012022001", note: "Total lines 007 + 019 + 031 and carry this amount forward to Schedule 12, line 022." } },
  { line: "015033001", caption: "Closing balance", kind: "money", role: "computed", section: "area-b", note: "Computed. \"0\" when the amount available is negative, per the page’s footnote." },
  { line: "015041001", caption: "Balance at end of preceding taxation year", kind: "money", role: "input", section: "area-c" },
  { line: "015064001", caption: "Balance at end of preceding taxation year", kind: "money", role: "input", section: "area-c" },
  { line: "015043001", caption: "Add: current year expenses excluding expenses incurred under look-back rule", kind: "money", role: "input", section: "area-c", note: "Excludes look-back expenses, which the next row collects separately at 044 — the split exists because 060 renounces against the look-back half only." },
  { line: "015044001", caption: "Add: current year expenses under look-back rule [federal subsection 66(12.66)]", kind: "money", role: "input", section: "area-c", note: "The look-back half of the current year’s expenses, added here and renounced at 060. Regular side only; the page shades the successor column." },
  { line: "015045001", caption: "Add: reclassified Canadian development expenses [federal subsections 66.1(9) and 66.7(9)]", kind: "money", role: "input", section: "area-c" },
  { line: "015065001", caption: "Add: reclassified Canadian development expenses [federal subsections 66.1(9) and 66.7(9)]", kind: "money", role: "input", section: "area-c" },
  { line: "015047001", caption: "Add: transferred on amalgamation or wind-up of subsidiary", kind: "money", role: "input", section: "area-c", footnoteMarks: [3] },
  { line: "015067001", caption: "Add: transferred on amalgamation or wind-up of subsidiary", kind: "money", role: "input", section: "area-c", footnoteMarks: [3] },
  { line: "015069001", caption: "Add: transferred other than on amalgamation or wind-up of subsidiary", kind: "money", role: "input", section: "area-c", footnoteMarks: [3] },
  { line: "015049001", caption: "Add: Canadian renewable and conservation expenses", kind: "money", role: "input", section: "area-c" },
  { line: "015051001", caption: "Add: other additions", kind: "money", role: "input", section: "area-c" },
  { line: "015053001", caption: "Deduct: government assistance and grants", kind: "money", role: "input", section: "area-c" },
  { line: "015055001", caption: "Deduct: other deductions or transfers", kind: "money", role: "input", section: "area-c" },
  { line: "015077001", caption: "Deduct: other deductions or transfers", kind: "money", role: "input", section: "area-c" },
  { line: "015059001", caption: "Deduct: transferred on disposition of resource property to successor", kind: "money", role: "input", section: "area-c" },
  { line: "015079001", caption: "Deduct: transferred on disposition of resource property to successor", kind: "money", role: "input", section: "area-c" },
  { line: "015058001", caption: "Deduct: current and previous year Canadian exploration expenses renounced in the year pursuant to a flow-through share agreement", kind: "money", role: "input", section: "area-c", note: "Printed ABOVE line 060 and BELOW line 059, so this schedule’s printed order and its line order disagree. Renounces current AND previous year expenses under a flow-through share agreement; 060 renounces the look-back expenses added at 044." },
  { line: "015060001", caption: "Deduct: expenses renounced under look-back rule [federal subsection 66(12.66)]", kind: "money", role: "input", section: "area-c" },
  { line: "015061001", caption: "Deduct: current year claim per federal subsections 66.1(2) and 66.7(3)", kind: "money", role: "input", section: "area-c", note: "Claimable at 100%, with no percentage rate. When the amount available is negative the page does not permit a claim at all: the negative goes into income in the \"Other\" area at Schedule 12 line 040 and both this line and 063 are \"0\".", to: { form: "AT1SCH12", line: "012026001", note: "Total lines 061 + 081 and carry this amount forward to Schedule 12, line 026." }, footnoteMarks: [5] },
  { line: "015081001", caption: "Deduct: current year claim per federal subsections 66.1(2) and 66.7(3)", kind: "money", role: "input", section: "area-c", note: "Same 100% claim and the same income-inclusion rule as line 061, on the successor pool.", to: { form: "AT1SCH12", line: "012026001", note: "Total lines 061 + 081 and carry this amount forward to Schedule 12, line 026." }, footnoteMarks: [5] },
  { line: "015063001", caption: "Closing balance", kind: "money", role: "computed", section: "area-c", note: "Computed. \"0\" when the regular amount available is negative — see line 061." },
  { line: "015083001", caption: "Closing balance", kind: "money", role: "computed", section: "area-c", note: "Computed. \"0\" when the successor amount available is negative — see line 081." },
  { line: "015091001", caption: "Balance at end of preceding taxation year", kind: "money", role: "input", section: "area-d" },
  { line: "015119001", caption: "Balance at end of preceding taxation year", kind: "money", role: "input", section: "area-d" },
  { line: "015093001", caption: "Add: current year expenses excluding expenses incurred under look-back rule", kind: "money", role: "input", section: "area-d" },
  { line: "015094001", caption: "Add: current year expenses under look-back rule [federal subsection 66(12.66)]", kind: "money", role: "input", section: "area-d" },
  { line: "015095001", caption: "Add: transferred on amalgamation or wind-up of subsidiary", kind: "money", role: "input", section: "area-d", footnoteMarks: [6] },
  { line: "015121001", caption: "Add: transferred on amalgamation or wind-up of subsidiary", kind: "money", role: "input", section: "area-d", footnoteMarks: [6] },
  { line: "015123001", caption: "Add: transferred other than on amalgamation or wind-up of subsidiary", kind: "money", role: "input", section: "area-d", footnoteMarks: [6] },
  { line: "015097001", caption: "Add: other additions", kind: "money", role: "input", section: "area-d" },
  { line: "015099001", caption: "Deduct: reclassified Canadian exploration expenses [federal subsections 66.1(9) and 66.7(9)]", kind: "money", role: "input", section: "area-d" },
  { line: "015127001", caption: "Deduct: reclassified Canadian exploration expenses [federal subsections 66.1(9) and 66.7(9)]", kind: "money", role: "input", section: "area-d" },
  { line: "015101001", caption: "Deduct: government assistance and grants", kind: "money", role: "input", section: "area-d" },
  { line: "015103001", caption: "Deduct: receivable on disposition of underground oil and gas storage rights or mining property", kind: "money", role: "input", section: "area-d" },
  { line: "015105001", caption: "Deduct: credit balance in the cumulative Canadian oil and gas property expense pool", kind: "money", role: "input", section: "area-d", note: "Deducts a CREDIT balance in Area E’s regular pool — a cross-area link, and one the page traverses in both directions. Area E’s own footnote sends a negative regular amount available here; this page’s footnote sends a negative Area E figure here too when a federal 66.7(4)(a)(iii) designation was made. The engine derives it from Area E’s negative subtotal and reports the designation ambiguity rather than guessing." },
  { line: "015133001", caption: "Deduct: credit balance in the cumulative Canadian oil and gas property expense pool", kind: "money", role: "input", section: "area-d", note: "Area D successor’s credit-balance line, and the destination Area E’s footnote names when a 66.7(4)(a)(iii) designation HAS been made. The specification gives it no federal default line and words its cap ambiguously; the engine follows line 105’s clearer rule and flags it." },
  { line: "015107001", caption: "Deduct: other deductions or transfers", kind: "money", role: "input", section: "area-d", note: "Also the destination the page routes a negative Area D SUCCESSOR amount available to, when no 66.7(4)(a)(iii) designation was made. See the Amount Available footnote." },
  { line: "015135001", caption: "Deduct: other deductions or transfers", kind: "money", role: "input", section: "area-d" },
  { line: "015111001", caption: "Deduct: transferred on disposition of resource property to successor", kind: "money", role: "input", section: "area-d" },
  { line: "015137001", caption: "Deduct: transferred on disposition of resource property to successor", kind: "money", role: "input", section: "area-d" },
  { line: "015110001", caption: "Deduct: current and previous year Canadian development expenses renounced in the year pursuant to a flow-through share agreement", kind: "money", role: "input", section: "area-d", note: "Printed BELOW line 111, so this area’s printed order and its line order disagree — the same inversion Area C has at 059/058. Renounces current AND previous year development expenses under a flow-through share agreement; 112 renounces the look-back expenses added at 094." },
  { line: "015112001", caption: "Deduct: expenses renounced under look-back rule [federal subsection 66(12.66)]", kind: "money", role: "input", section: "area-d" },
  { line: "015115001", caption: "Deduct: current year claim per federal subsection 66.2(2)", kind: "money", role: "input", section: "area-d", note: "Capped at 30% of the regular amount available plus the lesser of 30% of the successor amount available and the federal 66.7(4)(b) figure. Prorated by days/365 for a fiscal period under 51 weeks — the page’s own threshold, which is not the same as \"a short year\".", to: { form: "AT1SCH12", line: "012028001", note: "Total lines 115 + 141 and carry this amount forward to Schedule 12, line 028." }, footnoteMarks: [8] },
  { line: "015141001", caption: "Deduct: current year claim per federal subsection 66.2(2)", kind: "money", role: "input", section: "area-d", note: "Same 30% cap and short-period proration as line 115, on the successor pool.", to: { form: "AT1SCH12", line: "012028001", note: "Total lines 115 + 141 and carry this amount forward to Schedule 12, line 028." }, footnoteMarks: [8] },
  { line: "015117001", caption: "Closing balance", kind: "money", role: "computed", section: "area-d", note: "Computed. \"0\" when the regular amount available is negative — see the footnote." },
  { line: "015143001", caption: "Closing balance", kind: "money", role: "computed", section: "area-d", note: "Computed. \"0\" in both branches of the designation footnote — see the page." },
  { line: "015151001", caption: "Balance at the end of preceding taxation year", kind: "money", role: "input", section: "area-e" },
  { line: "015173001", caption: "Balance at the end of preceding taxation year", kind: "money", role: "input", section: "area-e" },
  { line: "015153001", caption: "Add: current year expenses", kind: "money", role: "input", section: "area-e" },
  { line: "015155001", caption: "Add: transferred on amalgamation or wind-up of subsidiary", kind: "money", role: "input", section: "area-e", footnoteMarks: [9] },
  { line: "015175001", caption: "Add: transferred on amalgamation or wind-up of subsidiary", kind: "money", role: "input", section: "area-e", footnoteMarks: [9] },
  { line: "015177001", caption: "Add: transferred other than on amalgamation or wind-up of subsidiary", kind: "money", role: "input", section: "area-e", footnoteMarks: [9] },
  { line: "015157001", caption: "Add: other additions", kind: "money", role: "input", section: "area-e" },
  { line: "015159001", caption: "Deduct: received or receivable on disposition of Canadian oil and gas property", kind: "money", role: "input", section: "area-e" },
  { line: "015181001", caption: "Deduct: received or receivable on disposition of Canadian oil and gas property", kind: "money", role: "input", section: "area-e" },
  { line: "015161001", caption: "Deduct: government assistance and grants", kind: "money", role: "input", section: "area-e" },
  { line: "015165001", caption: "Deduct: transferred on disposition of resource property to successor", kind: "money", role: "input", section: "area-e" },
  { line: "015185001", caption: "Deduct: transferred on disposition of resource property to successor", kind: "money", role: "input", section: "area-e" },
  { line: "015167001", caption: "Deduct: other deductions or transfers", kind: "money", role: "input", section: "area-e", note: "Also the destination the page routes a negative Area E SUCCESSOR amount available to, when no 66.7(4)(a)(iii) designation was made — and where a negative Area D successor figure lands when one was. Both directions are in the Amount Available footnote." },
  { line: "015187001", caption: "Deduct: other deductions or transfers", kind: "money", role: "input", section: "area-e" },
  { line: "015169001", caption: "Deduct: current year claim per federal subsections 66.4(2) and 66.7(5)", kind: "money", role: "input", section: "area-e", note: "Capped at 10% of the regular amount available plus the lesser of 10% of the successor amount available and the federal 66.7(5)(b) figure, prorated for a fiscal period under 51 weeks.", to: { form: "AT1SCH12", line: "012032001", note: "Total lines 169 + 189 and carry this amount forward to Schedule 12, line 032." }, footnoteMarks: [11] },
  { line: "015189001", caption: "Deduct: current year claim per federal subsections 66.4(2) and 66.7(5)", kind: "money", role: "input", section: "area-e", note: "Same 10% cap and short-period proration as line 169, on the successor pool.", to: { form: "AT1SCH12", line: "012032001", note: "Total lines 169 + 189 and carry this amount forward to Schedule 12, line 032." }, footnoteMarks: [11] },
  { line: "015171001", caption: "Closing balance", kind: "money", role: "computed", section: "area-e", note: "Computed. \"0\" in both branches of the designation footnote." },
  { line: "015191001", caption: "Closing balance", kind: "money", role: "computed", section: "area-e", note: "Computed. \"0\" in both branches of the designation footnote." },
  { line: "015201001", caption: "Balance at end of preceding taxation year", kind: "money", role: "input", section: "area-f" },
  { line: "015213001", caption: "Balance at end of preceding taxation year", kind: "money", role: "input", section: "area-f" },
  { line: "015205001", caption: "Add: transferred on amalgamation or wind-up of subsidiary", kind: "money", role: "input", section: "area-f" },
  { line: "015215001", caption: "Add: transferred on amalgamation or wind-up of subsidiary", kind: "money", role: "input", section: "area-f" },
  { line: "015217001", caption: "Add: transferred other than on amalgamation or wind-up of subsidiary", kind: "money", role: "input", section: "area-f", footnoteMarks: [12] },
  { line: "015207001", caption: "Deduct: other deductions or transfers", kind: "money", role: "input", section: "area-f" },
  { line: "015219001", caption: "Deduct: other deductions or transfers", kind: "money", role: "input", section: "area-f" },
  { line: "015209001", caption: "Deduct: current year claim per federal subsections 66(4) and 66.7(2)", kind: "money", role: "input", section: "area-f", note: "The only claim on this schedule the page does NOT total under its own area. Page 6 closes the form with \"Enter the total of lines 209, 221, I, R, JJ, and SS at line 030 of Schedule 12\" — one instruction spanning this area and the two per-country areas, where I, R, JJ and SS are unnumbered grand totals rather than lines. See AT1_SCHEDULE_15_CLOSING_INSTRUCTION.", to: { form: "AT1SCH12", line: "012030001", note: "Enter the total of lines 209, 221, I, R, JJ, and SS at line 030 of Schedule 12." }, footnoteMarks: [14] },
  { line: "015221001", caption: "Deduct: current year claim per federal subsections 66(4) and 66.7(2)", kind: "money", role: "input", section: "area-f", note: "Totalled with line 209 on page 6, not here. See that line’s note.", to: { form: "AT1SCH12", line: "012030001", note: "Enter the total of lines 209, 221, I, R, JJ, and SS at line 030 of Schedule 12." }, footnoteMarks: [14] },
  { line: "015211001", caption: "Closing balance", kind: "money", role: "computed", section: "area-f", note: "Computed. \"0\" when the amount available is negative — the negative becomes income." },
  { line: "015223001", caption: "Closing balance", kind: "money", role: "computed", section: "area-f", note: "Computed. \"0\" when the amount available is negative." },
  { line: "015231001", caption: "Foreign-source resource income", kind: "money", role: "input", section: "area-f", note: "Printed in a box of its own beneath this area’s footnotes, with the column headings repeated. Not a continuity row: it neither adds to nor deducts from the pool, it CAPS the claim at line 209 — the maximum is the lesser of the pool and the greater of this figure and a 10% floor." },
  { line: "015233001", caption: "Foreign-source resource income", kind: "money", role: "input", section: "area-f", note: "The successor half of the same income figure, capping line 221 — where the maximum is the lesser of the pool and this income attributable to successored properties, with no percentage floor at all." },
  { line: "015241001", caption: "Country in which regular expenses were incurred", kind: "code", role: "input", section: "sfede", note: "The country stub of AREA G, Regular Expenses. Must equal the federal country code (fed 012601)." },
  { line: "015243001", caption: "Balance at the end of the preceding taxation year", kind: "money", role: "input", section: "sfede", note: "Column A of AREA G, Regular Expenses." },
  { line: "015247001", caption: "Amount transferred on amalgamation or wind-up of subsidiary", kind: "money", role: "input", section: "sfede", note: "Column B of AREA G, Regular Expenses.", footnoteMarks: [15] },
  { line: "015249001", caption: "Other additions", kind: "money", role: "input", section: "sfede", note: "Column C of AREA G, Regular Expenses." },
  { line: "015251001", caption: "Other deductions or transfers", kind: "money", role: "input", section: "sfede", note: "Column D of AREA G, Regular Expenses." },
  { line: "015253001", caption: "Current year claim per federal subsection 66(4)", kind: "money", role: "input", section: "sfede", note: "Column F of AREA G, Regular Expenses. Allocated to a particular country per federal subsection 66(4.2) — the page says the maximum is computed on the TOTALS of columns E and H across every country, then allocated, so no single row’s figure can be checked on its own.", footnoteMarks: [17] },
  { line: "015255001", caption: "Closing balance (E-F)", kind: "money", role: "computed", section: "sfede", note: "Column G of AREA G, Regular Expenses." },
  { line: "015257001", caption: "Foreign resource income", kind: "money", role: "input", section: "sfede", note: "Column H of AREA G, Regular Expenses. Not simply the foreign resource income: the page defines this column as the EXCESS of that income over the amount claimed under federal subsection 66.7(2). See footnote ****.", footnoteMarks: [18] },
  { line: "015261001", caption: "Country in which successor expenses were incurred", kind: "code", role: "input", section: "sfede", note: "The country stub of AREA G, Successor Expenses. Must equal the federal country code (fed 012651)." },
  { line: "015263001", caption: "Balance at the end of the preceding taxation year", kind: "money", role: "input", section: "sfede", note: "Column J of AREA G, Successor Expenses." },
  { line: "015265001", caption: "Amount transferred on amalgamation or wind-up of subsidiary", kind: "money", role: "input", section: "sfede", note: "Column K of AREA G, Successor Expenses." },
  { line: "015267001", caption: "Amount transferred other than on amalgamation or wind-up of subsidiary", kind: "money", role: "input", section: "sfede", note: "Column L of AREA G, Successor Expenses." },
  { line: "015269001", caption: "Other deductions or transfers", kind: "money", role: "input", section: "sfede", note: "Column M of AREA G, Successor Expenses." },
  { line: "015273001", caption: "Current year claim per federal subsection 66.7(2)", kind: "money", role: "input", section: "sfede", note: "Column O of AREA G, Successor Expenses. Allocated to a particular country per federal subsection 66.7(2.2). Capped by the total of column Q attributable to successored properties — with no percentage floor, unlike the regular claim at 253.", footnoteMarks: [17] },
  { line: "015275001", caption: "Closing balance (N-O)", kind: "money", role: "computed", section: "sfede", note: "Column P of AREA G, Successor Expenses." },
  { line: "015277001", caption: "Foreign resource income", kind: "money", role: "input", section: "sfede", note: "Column Q of AREA G, Successor Expenses." },
  { line: "015281001", caption: "Country in which regular expenses were incurred", kind: "code", role: "input", section: "cfre", note: "The country stub of AREA H, Regular Expenses. Must equal the federal country code (fed 012701)." },
  { line: "015283001", caption: "Balance at the end of the preceding taxation year", kind: "money", role: "input", section: "cfre", note: "Column AA of AREA H, Regular Expenses." },
  { line: "015285001", caption: "Current year expenses", kind: "money", role: "input", section: "cfre", note: "Column BB of AREA H, Regular Expenses." },
  { line: "015287001", caption: "Amount transferred on amalgamation or wind-up of subsidiary", kind: "money", role: "input", section: "cfre", note: "Column CC of AREA H, Regular Expenses.", footnoteMarks: [19] },
  { line: "015289001", caption: "Other additions", kind: "money", role: "input", section: "cfre", note: "Column DD of AREA H, Regular Expenses." },
  { line: "015291001", caption: "Other deductions or transfers", kind: "money", role: "input", section: "cfre", note: "Column EE of AREA H, Regular Expenses." },
  { line: "015293001", caption: "Current year claim per federal subsection 66.21(4)", kind: "money", role: "input", section: "cfre", note: "Column GG of AREA H, Regular Expenses. The most involved cap on the schedule: A + B, where A is the greater of a 10% floor and the LEAST of three amounts (30% of the pool, this country’s income, the total of every country’s income), and B draws on a \"global foreign resource limit\" the specification references and never defines. The engine treats B as nil — the under-claim direction — and reports it.", footnoteMarks: [21] },
  { line: "015295001", caption: "Closing balance (FF - GG)", kind: "money", role: "computed", section: "cfre", note: "Column HH of AREA H, Regular Expenses." },
  { line: "015297001", caption: "Foreign resource income(loss)", kind: "money", role: "input", section: "cfre", note: "Column II of AREA H, Regular Expenses. The page defines this column as the excess of foreign resource income over the total of any amount designated under federal subparagraph 59(1)(b)(ii) and claimed under federal subsections 66(4), 66.7(2) and 66.7(2.3) — so it nets against the claims in Areas F and G as well as this one. See footnote ****.", footnoteMarks: [22] },
  { line: "015301001", caption: "Country in which successor expenses were incurred", kind: "code", role: "input", section: "cfre", note: "The country stub of AREA H, Successor Expenses. Must equal the federal country code (fed 012751)." },
  { line: "015303001", caption: "Balance at the end of the preceding taxation year", kind: "money", role: "input", section: "cfre", note: "Column KK of AREA H, Successor Expenses." },
  { line: "015305001", caption: "Amount transferred on amalgamation or wind-up of subsidiary", kind: "money", role: "input", section: "cfre", note: "Column LL of AREA H, Successor Expenses." },
  { line: "015307001", caption: "Amount transferred other than on amalgamation or wind-up of subsidiary", kind: "money", role: "input", section: "cfre", note: "Column MM of AREA H, Successor Expenses." },
  { line: "015309001", caption: "Other deductions or transfers", kind: "money", role: "input", section: "cfre", note: "Column NN of AREA H, Successor Expenses." },
  { line: "015313001", caption: "Current year claim per federal subsection 66.7(2.3)", kind: "money", role: "input", section: "cfre", note: "Column PP of AREA H, Successor Expenses. Capped at 30% of the pool or the column RR income attributable to successored properties, whichever is less, with the 30% prorated for a fiscal period under 51 weeks.", footnoteMarks: [21] },
  { line: "015315001", caption: "Closing balance (OO-PP)", kind: "money", role: "computed", section: "cfre", note: "Column QQ of AREA H, Successor Expenses." },
  { line: "015317001", caption: "Foreign resource income (loss)", kind: "money", role: "input", section: "cfre", note: "Column RR of AREA H, Successor Expenses." },
];

export const AT1_SCHEDULE_15_FOOTNOTES: readonly string[] = [
  "Earned depletion base transferred on amalgamation or wind-up to which federal subsections 87(1.2) and 88(1.5) are applicable should be entered in the regular expenses column if the expenses were regular expenses in the hands of the amalgamating company or the subsidiary being wound up.",
  "If the amount is negative, enter \"0\" at lines 007 and 009 and/or lines 019 and 021.",
  "If the amount is negative, enter \"0\" at lines 031 and 033.",
  "Canadian exploration expenses transferred on amalgamation or wind-up to which federal subsections 87(1.2) and 88(1.5) are applicable should be entered in the regular expenses column if the expenses were regular expenses in the hands of the amalgamating company or the subsidiary being wound up.",
  "If the amount in the regular expenses column is negative, include it in income in the \"Other\" area on line 040 on Schedule 12 and enter \"0\" at lines 061 and 063 above. If the amount in the successor expenses column is negative, include it in income in the \"Other\" area at line 040 on Schedule 12 and enter \"0\" at lines 081 and 083 above.",
  "The maximum deduction is the amount available in the regular expenses column plus the lesser of the amount available in the successor expenses column and the amount determined pursuant to federal paragraph 66.7(3)(b), which in most cases will be the income attributable to the disposition of successored properties and the production income from successored properties.",
  "Canadian development expenses transferred on amalgamation or wind-up to which federal subsections 87(1.2) and 88(1.5) are applicable should be entered in the regular expenses column if the expenses were regular expenses in the hands of the amalgamating company or the subsidiary being wound up.",
  "(i) When the amount available in the successor expenses column is negative and there is no designation pursuant to federal subparagraph 66.7(4)(a)(iii), enter the amount at line 107. However, if a designation pursuant to federal subparagraph 66.7(4)(a)(iii) has been made, enter the negative amount available from the successor expenses column at line 167 in Area E \"Cumulative Canadian Oil and Gas Property Expenses\". If this results in a negative amount in the regular expenses column of Area E, enter the amount at line 105 above. In both instances, enter \"0\" at lines 141 and 143 above. (ii) If the amount in the regular expenses column is negative, include it in income in the \"Other\" area at line 040 on Schedule 12 and enter \"0\" at lines 115 and 117 above.",
  "The maximum deduction is 30% of the amount available in the regular expenses column plus the lesser of 30% of the amount available in the successor expenses column and the amount determined pursuant to federal paragraph 66.7(4)(b). In most cases, this will be the income attributed to the production income from successored properties. For a fiscal period of less than 51 weeks, the amount that can be claimed as a deduction is prorated based on the proportion that the number of days in the taxation year is of 365.",
  "Canadian oil and gas property expenses transferred on amalgamation or wind-up to which federal subsections 87(1.2) and 88(1.5) are applicable should be entered in the regular expenses column if the expenses were regular expenses in the hands of the amalgamating company or the subsidiary being wound up.",
  "(i) When the amount available in the successor expenses column is negative and there is no designation pursuant to subparagraph 66.7(4)(a)(iii), enter the amount at line 167 and enter \"0\" at lines 189 and 191. If this results in the amount available in the regular expenses column becoming negative, enter the negative amount at line 133 in Area D \"Cumulative Canadian Development Expenses\" and enter \"0\" at lines 169 and 171 above. If the amount available in the successor expenses column of Area D becomes negative, enter the amount at line 107 in Area D. When a designation pursuant to subparagraph 66.7(4)(a)(iii) has been made, enter the negative amount available from the successor expenses column at line 133 in Area D \"Cumulative Canadian Development Expenses\" and enter \"0\" at lines 189 and 191 above. If the amount available in the successor expenses column in Area D becomes negative, enter the negative amount at line 167 above. If this results in a negative amount in the regular expenses column of Area E above, enter the amount at line 105 in Area D. (ii) When the amount available in the regular expenses column is negative due to other than (i) above, enter the amount at line 105, Area D \"Cumulative Canadian Development Expenses\" and enter \"0\" at lines 169 and 171.",
  "The maximum deduction is 10% of the amount available in the regular expenses column plus the lesser of 10% of the amount available in the successor expenses column and the amount determined pursuant to federal paragraph 66.7(5)(b). In most cases, this will be the income attributable to the production income from successored properties. For a fiscal period of less than 51 weeks, the amount that can be claimed as a deduction is prorated based on the proportion that the number of days in the taxation year is of 365.",
  "Foreign exploration and development expenses transferred on amalgamation or wind-up to which federal subsections 87(1.2) and 88(1.5) apply should be entered in the regular expenses column if the expenses were regular expenses in the hands of the amalgamating company or the subsidiary being wound up.",
  "If the amount is negative, include it in income in the \"Other\" area at line 040 on Schedule 12 and enter \"0\" at lines 209 and 211 and/or lines 221 and 223.",
  "The maximum deduction for regular expenses is the lesser of: (a) the amount available in the regular expenses column; and (b) the greater of foreign-source resource income and 10% of the amount available in the regular expenses column. For successor expenses, the maximum allowable is the lesser of the amount available and foreign-source resource income attributable to successored properties. Foreign-source resource income includes income from oil and gas wells or mines outside Canada and proceeds less applicable expenses and reserves on disposition of foreign resource property. For a fiscal period of less than 51 weeks, 10% is prorated based on the proportion that the number of days in the taxation year is of 365.",
  "Foreign exploration and development expenses transferred on amalgamation or wind-up to which federal subsections 87(1.2) and 88(1.5) apply should be entered in column C if the expenses were regular expenses in the hands of the amalgamating company or the subsidiary being wound up.",
  "If an amount in column E is negative, include it as income in the \"Other\" area at line 040 on Schedule 12, and enter \"0\" at the respective lines 253 and 255 above. If an amount in column N is negative, include it as income in the \"Other\" area at line 040 on Schedule 12, and enter \"0\" at the respective lines 273 and 275 above.",
  "(i) The maximum deduction for regular expenses is the lesser of: a) the total of all amounts available in column E; and b) the greater of the total of all amounts in column H and 10% of the total of all amounts available in column E (for a fiscal period of less than 51 weeks, 10% is prorated based on the number of days in the taxation year divided by 365). The deduction claimed must be allocated to a particular country according to federal subsection 66(4.2) (ii) The maximum deduction for successor expenses is the lesser of: a) the total of all amounts available in column N; and b) the total of all amounts in column Q attributable to successored properties [foreign resource income is calculated in accordance with federal paragraph 66.7(2)(b)]. The deduction claimed must be allocated to a particular country according to federal subsection 66.7(2.2).",
  "The amount in column H is the excess of foreign resource income over the amount claimed under federal subsection 66.7(2).",
  "Foreign resource expenses transferred on amalgamation or wind-up to which federal subsections 87(1.2) and 88(1.5) apply should be entered in column CC if the expenses were regular expenses in the hands of the amalgamating company or the subsidiary being wound up.",
  "If an amount in column FF is negative, include it as income in the \"Other\" area at line 040 on Schedule 12, and enter \"0\" at the respective lines 293 and 295 above. If an amount in column OO is negative, include it as income in the \"Other\" area at line 040 on Schedule 12, and enter \"0\" at the respective lines 313 and 315 above.",
  "(i) The maximum deduction for regular expenses is the total of A and B where: A = the greater of: (i) 10% of the amount available in column FF; and (ii) the least of the following amounts: (a) 30% of the amount available in column FF; (b) the foreign resource income for the particular country in column II; or (c) the total of all amounts in column II. B = the lesser of: (i) the excess of the amount in column FF minus the amount A above; and (ii) the global foreign resource limit for the year designated for that country. For a fiscal period of less than 51 weeks, 10% and 30% are prorated based on the number of days in the taxation year divided by 365. (ii) The maximum deduction for successor expenses is the lesser of: a) 30% of the amount available in column OO (for a fiscal period of less than 51 weeks, 30% is prorated based on the number of days in the taxation year divided by 365); and b) the foreign resource income in column RR attributable to successored properties [foreign resource income is calculated in accordance with federal paragraph 66.7(2.3)(b)].",
  "Column II is the excess of foreign resource income over the total of any amount designated under federal subparagraph 59(1)(b)(ii) and claimed under federal subsections 66(4), 66.7(2), and 66.7(2.3).",
];

export interface PaperFootnotePlacement {
  /** Index into the footnote list above. */
  footnote: number;
  /** The section id at whose foot the page prints it. */
  section: string;
  /** The glyph the page prints. Absent where the page anchors the note by naming a line instead. */
  mark?: string;
}

export const AT1_SCHEDULE_15_FOOTNOTE_PLACEMENT: readonly PaperFootnotePlacement[] = [
  { footnote: 0, section: "area-a", mark: "*" },
  { footnote: 1, section: "area-a", mark: "**" },
  { footnote: 2, section: "area-b", mark: "*" },
  { footnote: 3, section: "area-c", mark: "*" },
  { footnote: 4, section: "area-c", mark: "**" },
  { footnote: 5, section: "area-c", mark: "***" },
  { footnote: 6, section: "area-d", mark: "*" },
  { footnote: 7, section: "area-d", mark: "**" },
  { footnote: 8, section: "area-d", mark: "***" },
  { footnote: 9, section: "area-e", mark: "*" },
  { footnote: 10, section: "area-e", mark: "**" },
  { footnote: 11, section: "area-e", mark: "***" },
  { footnote: 12, section: "area-f", mark: "*" },
  { footnote: 13, section: "area-f", mark: "**" },
  { footnote: 14, section: "area-f", mark: "***" },
  { footnote: 15, section: "sfede", mark: "*" },
  { footnote: 16, section: "sfede", mark: "**" },
  { footnote: 17, section: "sfede", mark: "***" },
  { footnote: 18, section: "sfede", mark: "****" },
  { footnote: 19, section: "cfre", mark: "*" },
  { footnote: 20, section: "cfre", mark: "**" },
  { footnote: 21, section: "cfre", mark: "***" },
  { footnote: 22, section: "cfre", mark: "****" },
];


export interface ResourceContinuityRow {
  /** The row label, verbatim, as the page prints it once for both columns. */
  label: string;
  regular?: string;
  successor?: string;
  /** Columns the page SHADES OUT: the quantity does not exist on that side, which is not the same as an empty box. */
  shaded?: readonly ("regular" | "successor")[];
  /** The page prints an open box in both columns and numbers neither — the "Amount Available" subtotals. */
  unnumbered?: boolean;
  /** Printed in a BOX OF ITS OWN below the area's footnotes, column headings repeated. Only "Foreign-source resource income" (231/233) does this — it caps Area F's claim rather than moving the pool. */
  separateBox?: boolean;
  footnoteMarks?: readonly number[];
}

export interface ResourceContinuityArea {
  /** Matches the section id its lines belong to. */
  section: string;
  title: string;
  /** The line the page prints immediately under the box heading, verbatim. Area F's is routing: a country-specific expense belongs in Area G or H instead. */
  subtitle?: string;
  /** Absent on Area B, which prints ONE unheaded column — it has no successor side at all. */
  columnHeadings?: readonly [string, string];
  rows: readonly ResourceContinuityRow[];
  /** The bold instruction printed beneath the table, verbatim. */
  carryForward?: string;
  /** The same instruction structured: the claim lines it names, and the AT1 Schedule 12 line they total to. */
  carryForwardTo?: { line: string; claims: readonly string[] };
}

export const AT1_SCHEDULE_15_AREAS: readonly ResourceContinuityArea[] = [
  {
    section: "area-a",
    title: "AREA A - CONTINUITY OF EARNED DEPLETION BASE",
    columnHeadings: ["Regular Expenses ($)", "Successor Expenses ($)"],
    rows: [
      { label: "Balance at end of preceding taxation year", regular: "001", successor: "011" },
      { label: "Add: transferred on amalgamation or wind-up of subsidiary", regular: "003", successor: "013", footnoteMarks: [0] },
      { label: "Add: transferred other than on amalgamation or wind-up of subsidiary", successor: "015", shaded: ["regular"], footnoteMarks: [0] },
      { label: "Deduct: transferred on sale of resource property to successor", regular: "005", successor: "017" },
      { label: "Amount Available", unnumbered: true, footnoteMarks: [1] },
      { label: "Deduct: Claim for the year per federal Regulation 1202(2)", successor: "019", shaded: ["regular"] },
      { label: "Deduct: Claim for the year per federal Regulation 1201", regular: "007", shaded: ["successor"] },
      { label: "Closing balance", regular: "009", successor: "021" },
    ],
  },
  {
    section: "area-b",
    title: "AREA B - CONTINUITY OF MINING EXPLORATION DEPLETION BASE",
    carryForward: "Total lines 007 + 019 + 031 and carry this amount forward to Schedule 12, line 022.",
    carryForwardTo: { line: "012022001", claims: ["007", "019", "031"] },
    rows: [
      { label: "Balance at end of preceding taxation year", regular: "023" },
      { label: "Add: transferred on amalgamation or wind-up of subsidiary", regular: "025" },
      { label: "Add: transferred other than on amalgamation or wind-up of subsidiary", regular: "027" },
      { label: "Deduct: transferred on disposal of resource property to successor", regular: "029" },
      { label: "Amount Available", unnumbered: true, footnoteMarks: [2] },
      { label: "Deduct: claim for the year per federal Regulation 1203(1)", regular: "031" },
      { label: "Closing balance", regular: "033" },
    ],
  },
  {
    section: "area-c",
    title: "AREA C - CUMULATIVE CANADIAN EXPLORATION EXPENSES",
    columnHeadings: ["Regular Expenses ($)", "Successor Expenses ($)"],
    carryForward: "Total lines 061 + 081 and carry this amount forward to Schedule 12, line 026.",
    carryForwardTo: { line: "012026001", claims: ["061", "081"] },
    rows: [
      { label: "Balance at end of preceding taxation year", regular: "041", successor: "064" },
      { label: "Add: current year expenses excluding expenses incurred under look-back rule", regular: "043", shaded: ["successor"] },
      { label: "Add: current year expenses under look-back rule [federal subsection 66(12.66)]", regular: "044", shaded: ["successor"] },
      { label: "Add: reclassified Canadian development expenses [federal subsections 66.1(9) and 66.7(9)]", regular: "045", successor: "065" },
      { label: "Add: transferred on amalgamation or wind-up of subsidiary", regular: "047", successor: "067", footnoteMarks: [3] },
      { label: "Add: transferred other than on amalgamation or wind-up of subsidiary", successor: "069", shaded: ["regular"], footnoteMarks: [3] },
      { label: "Add: Canadian renewable and conservation expenses", regular: "049", shaded: ["successor"] },
      { label: "Add: other additions", regular: "051", shaded: ["successor"] },
      { label: "Deduct: government assistance and grants", regular: "053", shaded: ["successor"] },
      { label: "Deduct: other deductions or transfers", regular: "055", successor: "077" },
      { label: "Deduct: transferred on disposition of resource property to successor", regular: "059", successor: "079" },
      { label: "Deduct: current and previous year Canadian exploration expenses renounced in the year pursuant to a flow-through share agreement", regular: "058", shaded: ["successor"] },
      { label: "Deduct: expenses renounced under look-back rule [federal subsection 66(12.66)]", regular: "060", shaded: ["successor"] },
      { label: "Amount Available", unnumbered: true, footnoteMarks: [4] },
      { label: "Deduct: current year claim per federal subsections 66.1(2) and 66.7(3)", regular: "061", successor: "081", footnoteMarks: [5] },
      { label: "Closing balance", regular: "063", successor: "083" },
    ],
  },
  {
    section: "area-d",
    title: "AREA D - CUMULATIVE CANADIAN DEVELOPMENT EXPENSES",
    columnHeadings: ["Regular Expenses ($)", "Successor Expenses ($)"],
    carryForward: "Total lines 115 + 141 and carry this amount forward to Schedule 12, line 028.",
    carryForwardTo: { line: "012028001", claims: ["115", "141"] },
    rows: [
      { label: "Balance at end of preceding taxation year", regular: "091", successor: "119" },
      { label: "Add: current year expenses excluding expenses incurred under look-back rule", regular: "093", shaded: ["successor"] },
      { label: "Add: current year expenses under look-back rule [federal subsection 66(12.66)]", regular: "094", shaded: ["successor"] },
      { label: "Add: transferred on amalgamation or wind-up of subsidiary", regular: "095", successor: "121", footnoteMarks: [6] },
      { label: "Add: transferred other than on amalgamation or wind-up of subsidiary", successor: "123", shaded: ["regular"], footnoteMarks: [6] },
      { label: "Add: other additions", regular: "097", shaded: ["successor"] },
      { label: "Deduct: reclassified Canadian exploration expenses [federal subsections 66.1(9) and 66.7(9)]", regular: "099", successor: "127" },
      { label: "Deduct: government assistance and grants", regular: "101", shaded: ["successor"] },
      { label: "Deduct: receivable on disposition of underground oil and gas storage rights or mining property", regular: "103", shaded: ["successor"] },
      { label: "Deduct: credit balance in the cumulative Canadian oil and gas property expense pool", regular: "105", successor: "133" },
      { label: "Deduct: other deductions or transfers", regular: "107", successor: "135" },
      { label: "Deduct: transferred on disposition of resource property to successor", regular: "111", successor: "137" },
      { label: "Deduct: current and previous year Canadian development expenses renounced in the year pursuant to a flow-through share agreement", regular: "110", shaded: ["successor"] },
      { label: "Deduct: expenses renounced under look-back rule [federal subsection 66(12.66)]", regular: "112", shaded: ["successor"] },
      { label: "Amount Available", unnumbered: true, footnoteMarks: [7] },
      { label: "Deduct: current year claim per federal subsection 66.2(2)", regular: "115", successor: "141", footnoteMarks: [8] },
      { label: "Closing balance", regular: "117", successor: "143" },
    ],
  },
  {
    section: "area-e",
    title: "AREA E - CUMULATIVE CANADIAN OIL AND GAS PROPERTY EXPENSES (CCOGPE)",
    columnHeadings: ["Regular Expenses ($)", "Successor Expenses ($)"],
    carryForward: "Total lines 169 + 189 and carry this amount forward to Schedule 12, line 032.",
    carryForwardTo: { line: "012032001", claims: ["169", "189"] },
    rows: [
      { label: "Balance at the end of preceding taxation year", regular: "151", successor: "173" },
      { label: "Add: current year expenses", regular: "153", shaded: ["successor"] },
      { label: "Add: transferred on amalgamation or wind-up of subsidiary", regular: "155", successor: "175", footnoteMarks: [9] },
      { label: "Add: transferred other than on amalgamation or wind-up of subsidiary", successor: "177", shaded: ["regular"], footnoteMarks: [9] },
      { label: "Add: other additions", regular: "157", shaded: ["successor"] },
      { label: "Deduct: received or receivable on disposition of Canadian oil and gas property", regular: "159", successor: "181" },
      { label: "Deduct: government assistance and grants", regular: "161", shaded: ["successor"] },
      { label: "Deduct: transferred on disposition of resource property to successor", regular: "165", successor: "185" },
      { label: "Deduct: other deductions or transfers", regular: "167", successor: "187" },
      { label: "Amount Available", unnumbered: true, footnoteMarks: [10] },
      { label: "Deduct: current year claim per federal subsections 66.4(2) and 66.7(5)", regular: "169", successor: "189", footnoteMarks: [11] },
      { label: "Closing balance", regular: "171", successor: "191" },
    ],
  },
  {
    section: "area-f",
    title: "AREA F - FOREIGN EXPLORATION AND DEVELOPMENT EXPENSES",
    subtitle: "Foreign exploration and development expenses are those that are not in respect of a country. If they are in respect of a country, complete AREA G or H.",
    columnHeadings: ["Regular Expenses ($)", "Successor Expenses ($)"],
    rows: [
      { label: "Balance at end of preceding taxation year", regular: "201", successor: "213" },
      { label: "Add: transferred on amalgamation or wind-up of subsidiary", regular: "205", successor: "215" },
      { label: "Add: transferred other than on amalgamation or wind-up of subsidiary", successor: "217", shaded: ["regular"], footnoteMarks: [12] },
      { label: "Deduct: other deductions or transfers", regular: "207", successor: "219" },
      { label: "Amount Available", unnumbered: true, footnoteMarks: [13] },
      { label: "Deduct: current year claim per federal subsections 66(4) and 66.7(2)", regular: "209", successor: "221", footnoteMarks: [14] },
      { label: "Closing balance", regular: "211", successor: "223" },
      { label: "Foreign-source resource income", regular: "231", successor: "233", separateBox: true },
    ],
  },
];

export interface PerCountryColumn {
  /** The letter the page heads this column with. Absent on the country stub. */
  letter?: string;
  /** Verbatim, including any arithmetic it states. */
  heading: string;
  /** Absent on the four "Amount available" columns, which the page computes and numbers nowhere. */
  line?: string;
  kind: "code" | "money";
  role: "input" | "computed";
  footnoteMarks?: readonly number[];
}

export interface PerCountryTable {
  /** The page's sub-heading — "Regular Expenses" / "Successor Expenses". */
  title: string;
  columns: readonly PerCountryColumn[];
  /** The box the page prints under the table with a LETTER and no line number, totalling the claim column across every country. */
  grandTotal: { letter: string; ofColumn: string };
}

export interface PerCountryArea {
  section: string;
  title: string;
  /** The paragraph the page prints under the heading, verbatim. */
  subtitle: string;
  tables: readonly PerCountryTable[];
}

export const AT1_SCHEDULE_15_PER_COUNTRY: readonly PerCountryArea[] = [
  {
    section: "sfede",
    title: "AREA G - SPECIFIED FOREIGN EXPLORATION AND DEVELOPMENT EXPENSES",
    subtitle: "Specified foreign exploration and development expenses are those that are in respect of a specific country and have been incurred before 2001. If they are in respect of two or more countries, determine a reasonable allocation to each country and maintain a consistent allocation in the following years.",
    tables: [
      {
        title: "Regular Expenses",
        grandTotal: { letter: "I", ofColumn: "F" },
        columns: [
          { heading: "Country in which regular expenses were incurred", line: "241", kind: "code", role: "input" },
          { letter: "A", heading: "Balance at the end of the preceding taxation year", line: "243", kind: "money", role: "input" },
          { letter: "B", heading: "Amount transferred on amalgamation or wind-up of subsidiary", line: "247", kind: "money", role: "input", footnoteMarks: [15] },
          { letter: "C", heading: "Other additions", line: "249", kind: "money", role: "input" },
          { letter: "D", heading: "Other deductions or transfers", line: "251", kind: "money", role: "input" },
          { letter: "E", heading: "Amount available (A+B+C-D)", kind: "money", role: "computed", footnoteMarks: [16] },
          { letter: "F", heading: "Current year claim per federal subsection 66(4)", line: "253", kind: "money", role: "input", footnoteMarks: [17] },
          { letter: "G", heading: "Closing balance (E-F)", line: "255", kind: "money", role: "computed" },
          { letter: "H", heading: "Foreign resource income", line: "257", kind: "money", role: "input", footnoteMarks: [18] },
        ],
      },
      {
        title: "Successor Expenses",
        grandTotal: { letter: "R", ofColumn: "O" },
        columns: [
          { heading: "Country in which successor expenses were incurred", line: "261", kind: "code", role: "input" },
          { letter: "J", heading: "Balance at the end of the preceding taxation year", line: "263", kind: "money", role: "input" },
          { letter: "K", heading: "Amount transferred on amalgamation or wind-up of subsidiary", line: "265", kind: "money", role: "input" },
          { letter: "L", heading: "Amount transferred other than on amalgamation or wind-up of subsidiary", line: "267", kind: "money", role: "input" },
          { letter: "M", heading: "Other deductions or transfers", line: "269", kind: "money", role: "input" },
          { letter: "N", heading: "Amount available (J+K+L-M)", kind: "money", role: "computed", footnoteMarks: [16] },
          { letter: "O", heading: "Current year claim per federal subsection 66.7(2)", line: "273", kind: "money", role: "input", footnoteMarks: [17] },
          { letter: "P", heading: "Closing balance (N-O)", line: "275", kind: "money", role: "computed" },
          { letter: "Q", heading: "Foreign resource income", line: "277", kind: "money", role: "input" },
        ],
      },
    ],
  },
  {
    section: "cfre",
    title: "AREA H - CUMULATIVE FOREIGN RESOURCE EXPENSES",
    subtitle: "Foreign resource expenses are those that are in respect of a specific country and that have been incurred in a taxation year beginning in 2001 or after. If there are two or more countries, determine a reasonable allocation to each country and maintain a consistent allocation in the following years.",
    tables: [
      {
        title: "Regular Expenses",
        grandTotal: { letter: "JJ", ofColumn: "GG" },
        columns: [
          { heading: "Country in which regular expenses were incurred", line: "281", kind: "code", role: "input" },
          { letter: "AA", heading: "Balance at the end of the preceding taxation year", line: "283", kind: "money", role: "input" },
          { letter: "BB", heading: "Current year expenses", line: "285", kind: "money", role: "input" },
          { letter: "CC", heading: "Amount transferred on amalgamation or wind-up of subsidiary", line: "287", kind: "money", role: "input", footnoteMarks: [19] },
          { letter: "DD", heading: "Other additions", line: "289", kind: "money", role: "input" },
          { letter: "EE", heading: "Other deductions or transfers", line: "291", kind: "money", role: "input" },
          { letter: "FF", heading: "Amount available (AA+BB+CC+DD-EE)", kind: "money", role: "computed", footnoteMarks: [20] },
          { letter: "GG", heading: "Current year claim per federal subsection 66.21(4)", line: "293", kind: "money", role: "input", footnoteMarks: [21] },
          { letter: "HH", heading: "Closing balance (FF - GG)", line: "295", kind: "money", role: "computed" },
          { letter: "II", heading: "Foreign resource income(loss)", line: "297", kind: "money", role: "input", footnoteMarks: [22] },
        ],
      },
      {
        title: "Successor Expenses",
        grandTotal: { letter: "SS", ofColumn: "PP" },
        columns: [
          { heading: "Country in which successor expenses were incurred", line: "301", kind: "code", role: "input" },
          { letter: "KK", heading: "Balance at the end of the preceding taxation year", line: "303", kind: "money", role: "input" },
          { letter: "LL", heading: "Amount transferred on amalgamation or wind-up of subsidiary", line: "305", kind: "money", role: "input" },
          { letter: "MM", heading: "Amount transferred other than on amalgamation or wind-up of subsidiary", line: "307", kind: "money", role: "input" },
          { letter: "NN", heading: "Other deductions or transfers", line: "309", kind: "money", role: "input" },
          { letter: "OO", heading: "Amount available (KK+LL+MM-NN)", kind: "money", role: "computed", footnoteMarks: [20] },
          { letter: "PP", heading: "Current year claim per federal subsection 66.7(2.3)", line: "313", kind: "money", role: "input", footnoteMarks: [21] },
          { letter: "QQ", heading: "Closing balance (OO-PP)", line: "315", kind: "money", role: "computed" },
          { letter: "RR", heading: "Foreign resource income (loss)", line: "317", kind: "money", role: "input" },
        ],
      },
    ],
  },
];

/** The bold instruction at the foot of page 6. It belongs to no area: it totals Area F's two claims with the four per-country grand totals, and four of its six terms are LETTERS rather than line numbers. */
export const AT1_SCHEDULE_15_CLOSING_INSTRUCTION = {
  text: "Enter the total of lines 209, 221, I, R, JJ, and SS at line 030 of Schedule 12.",
  to: "012030001",
  lines: ["209", "221"] as readonly string[],
  letters: ["I", "R", "JJ", "SS"] as readonly string[],
};
