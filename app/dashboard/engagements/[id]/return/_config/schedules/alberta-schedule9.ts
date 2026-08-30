import { defineSchema, field, section } from "@classytic/formkit/server";
import { fieldsFor, money } from "../fields";
import { IEG_PRIMARY_FIELD_OPTIONS, YES_NO } from "../options";
import { defineSchedule } from "./define";

/**
 * AT1 Schedule 9 — Alberta Scientific Research & Experimental Development Tax
 * Credit.
 *
 * Alberta's OWN 10% investment tax credit on SR&ED spending — NOT Schedule 16
 * (`alberta-continuity.ts` has no equivalent here; Schedule 16 is the
 * expenditure POOL, a deduction against income) and NOT the federal Schedule
 * 31 ITC. See
 * `packages/ca-tax/src/t2/at1/schedules/schedule9-sred-tax-credit.ts` for the
 * full spec derivation (TRA spec §3.2.3.10, pp. 3-84 to 3-90) — this file
 * only lays out the same field-to-line mapping as a form.
 *
 * ── Field captions are VERBATIM from the spec's "Line Name" column ─────────
 *
 * Every field label below is `"<verbatim Line Name> (line NNN)"`, copied
 * character-for-character from the "Line Name" column of the TRA spec's own
 * MAPPINGS table (`research/sources/tra-spec/AT1-Chapter3-2025.2-full.txt`,
 * lines 7451-8093) — the same text AuraTax's certified rendering shows, and
 * the same convention federal T2 schedule captions already follow (see
 * `packages/ca-tax/src/t2/forms/generated/schedule1.captions.ts`'s own
 * docstring: "This module holds ONLY what the printed page states"). No
 * separate PDF exists for AT1 Schedule 9, so the MAPPINGS table's "Line
 * Name" column IS the source of truth here, not the "Business Rules and
 * Comments" column (which is paraphrased guidance, not the caption). Only
 * whitespace was normalized (the PDF extraction leaves occasional double
 * spaces, e.g. after "Deduct:" or "Allocated Amount."); no wording was
 * shortened or reworded.
 *
 * ── The credit is WOUND DOWN ─────────────────────────────────────────────
 *
 * Per the spec's own framing text, "eligible expenditures" are federal
 * SR&ED amounts carried out in Alberta BEFORE 2020-01-01 — the credit may
 * not be claimed for anything carried out in Alberta after that date. This
 * form does not filter dates itself; `albertaPortionOfExpenditures` (line
 * 005) must already exclude post-cutoff spending. `taxationYearEnd` only
 * drives a reminder when the return's own year end falls after the cutoff.
 *
 * ── Line 009031 has no confirmed formula, or caption, in the spec text ─────
 *
 * The engine DERIVES "Total eligible expenditures for Alberta purposes"
 * (031/106) from the Deduct/Add lines above it when `eligibleExpenditures`
 * is left blank here — see the engine module's docstring for the exact
 * derivation and why. Set `eligibleExpenditures` directly only when the
 * authoritative figure is known (e.g. from the Guide to Claiming the
 * Alberta SR&ED Tax Credit). Its caption below is taken from line 106
 * ("Eligible expenditures for Alberta purposes") — the spec's MAPPINGS
 * table has no row at all for 027/029/031 (it jumps from 025 straight to
 * 040), so there is no independent "Line Name" for 031 to verify against;
 * 106's business rule states the two must be equal, so 106's caption is
 * used for both.
 *
 * ── The associated-group allocation (page 3) ─────────────────────────────
 *
 * `group` mirrors `alberta-ieg.ts`'s associated-group array: one row per
 * associated corporation, INCLUDING this one — put the filing corporation
 * FIRST, since its own capped share becomes line 009102. Leave `group`
 * empty for a non-associated claim; the credit then uses the day-prorated
 * $4,000,000 limit from `daysInTaxYear` (line 104) instead. The spec's own
 * section header for this block is "Allocation of the Maximum Expenditure
 * Limit" — reproduced verbatim as this section's title.
 *
 * The longest-associated-year corporation's own CAN and taxation-year dates
 * (lines 200/202/204) are collected here too — `longestYearCan` /
 * `longestYearBegin` / `longestYearEnd` — and passed through to
 * `schedule9Values`'s `Schedule9GroupFilingInput` by the composer so page 3
 * files completely, not just the per-member allocation rows.
 */
export type AlbertaSredCredit9GroupMember = {
	/** Line 009220 — name of the associated corporation. */
	name?: string;
	/** Line 009230 — Alberta Corporate Account Number. */
	albertaCan?: string;
	/** Line 009240 — this member's agreed share of the expenditure limit. */
	allocated?: number;
};

export type AlbertaSredCredit9Values = {
	/** Line 009003 — federal total qualified SR&ED expenditures. Must equal fed T661 line 559. */
	federalQualifiedExpenditures?: number;
	/** Line 009005 — the portion of 003 incurred in Alberta, BEFORE 2020-01-01. Must not exceed 003. */
	albertaPortionOfExpenditures?: number;
	/** Line 009007 — deduct: federal prescribed proxy amount included in the Alberta portion. */
	federalProxyAmountInAlbertaPortion?: number;
	/** Line 009009 — add: Alberta proxy amount. */
	albertaProxyAmount?: number;
	/**
	 * Line 009011 — add: Alberta SR&ED credit that reduced the federal expense
	 * on fed T661 line 559 in the taxation year. The spec defers this
	 * calculation to the Guide to Claiming the Alberta SR&ED Tax Credit.
	 */
	albertaCreditReducingFederalExpense?: number;
	/** Line 009015 — federal ITC received in the immediately preceding year (fed T661 line 435). */
	priorYearFederalItcReceived?: number;
	/** Line 009017 — total Alberta-eligible expenditures for years in which incurred, all relevant years. */
	totalAlbertaExpendituresAllYears?: number;
	/** Line 009019 — total federal expenditures for those same years (fed T661 line 570, all years). */
	totalFederalExpendituresAllYears?: number;
	/** Line 009025 — add: Alberta portion of any repayment of assistance relating to line 005. */
	albertaPortionOfRepayments?: number;
	/**
	 * Lines 009031 / 009106 — "Eligible expenditures for Alberta purposes."
	 * Leave blank to use the engine's derived figure; set directly to
	 * override it with the authoritative amount.
	 */
	eligibleExpenditures?: number;
	/** Line 009040 — primary field of science or technology. Mandatory on the live form. */
	fieldOfScience?: "1" | "2" | "3" | "4";
	/** Line 009100 — associated with one or more corporations for SR&ED purposes? */
	isAssociated?: "yes" | "no";
	/**
	 * Line 009102 — this corporation's allocated share of the maximum
	 * expenditure limit, used ONLY when `group` below is empty. When `group`
	 * has at least one row, the filing corporation's (row 1) capped share is
	 * used instead and this field is ignored.
	 */
	allocatedExpenditureLimit?: number;
	/**
	 * Days in the corporation's own taxation year, for the NON-associated
	 * line 009104 proration. Leave blank for a full, 365-day year. Days
	 * before 2009-01-01 (when the Alberta SR&ED program began) must already
	 * be excluded.
	 */
	daysInTaxYear?: number;
	/** Line 009112 — recapture on disposal (or deemed disposal) of Alberta SR&ED property. */
	disposalRecapture?: number;
	/**
	 * Line 009116 — legacy adjustment from the Schedule 9 Supplemental line
	 * 428, applicable ONLY when the taxation year end is on or before
	 * 2012-03-31. Expected nil for a current return.
	 */
	priorYearFederalItcAdjustment?: number;
	/**
	 * The return's taxation year end, ISO `YYYY-MM-DD` — used only to flag a
	 * reminder when it falls after the 2019-12-31 wind-down date. NOT itself
	 * an AT1 Schedule 9 line item.
	 */
	taxationYearEnd?: string;
	/** 200 — the Alberta CAN of the associated corporation with the longest taxation year. Used only when `group` has at least one row. */
	longestYearCan?: string;
	/** 202 — that corporation's own tax year begin. */
	longestYearBegin?: string;
	/** 204 — that corporation's own tax year end. */
	longestYearEnd?: string;
	/**
	 * Days in the LONGEST associated taxation year (line 206), for the
	 * page-3 allocation's shared $4,000,000 ceiling. Leave blank for a full,
	 * 365-day year. Used only when `group` has at least one row.
	 */
	daysInLongestYear?: number;
	/**
	 * The associated-group allocation table (page 3, lines 220/230/240).
	 * Include this corporation as the FIRST row — its own allocated amount
	 * becomes line 009102. Leave empty for a non-associated claim.
	 */
	group?: AlbertaSredCredit9GroupMember[];
};

const f = fieldsFor<AlbertaSredCredit9Values>();

export const albertaSchedule9Schema = defineSchema({
	sections: [
		section(
			"eligibleExpenditures",
			"Eligible expenditures (Schedule 9, lines 003-025)",
			[
				f.money(
					"federalQualifiedExpenditures",
					"Federal amount of total qualified SR & ED expenditures (from Federal form T661, line 559) (line 003)",
				),
				f.money(
					"albertaPortionOfExpenditures",
					"Portion of line 559 incurred in Alberta (line 005)",
					{
						description:
							"The credit may not be claimed for Alberta SR&ED spending carried out on or after 2020-01-01 — exclude any post-cutoff amounts here.",
					},
				),
				f.money(
					"federalProxyAmountInAlbertaPortion",
					"Deduct: Federal prescribed proxy amount included in the Alberta portion of Federal form T661, line 559 (line 007)",
				),
				f.money("albertaProxyAmount", "Add: Alberta proxy amount (line 009)"),
				f.money(
					"albertaCreditReducingFederalExpense",
					"Add: Alberta SR & ED Tax Credit that reduced the federal expense on Federal form T661, line 559 in the taxation year (line 011)",
					{
						description:
							"See the Guide to Claiming the Alberta SR&ED Tax Credit for this calculation.",
					},
				),
				f.money(
					"priorYearFederalItcReceived",
					"Federal Investment Tax Credit received by the corporation in the immediately preceding taxation year (Federal form T661 line 435) (line 015)",
				),
				f.money(
					"totalAlbertaExpendituresAllYears",
					"Total eligible expenditures for Alberta purposes of the corporation for years in which the expenditure was incurred (line 017)",
				),
				f.money(
					"totalFederalExpendituresAllYears",
					"Total federal expenditures of the corporation in the years in which the expenditure was incurred (line 019)",
				),
				f.money(
					"albertaPortionOfRepayments",
					"Add: Alberta portion of any repayment of assistance and contract payments made in the year that relates to amounts included in line 009005 made in the year or any prior year (line 025)",
				),
				f.money(
					"eligibleExpenditures",
					"Eligible expenditures for Alberta purposes (line 031 / 106)",
					{
						description:
							"Leave blank to use the derived figure (005 − 007 + 009 + 011 − 023 + 025). Set directly only with the authoritative amount.",
					},
				),
				f.select(
					"fieldOfScience",
					"Primary field of science or technology the corporation is involved in (line 040)",
					IEG_PRIMARY_FIELD_OPTIONS,
				),
			],
			{ variant: "card", cols: 2 },
		),
		section(
			"expenditureLimit",
			"Expenditure limit (lines 100-120)",
			[
				f.radio(
					"isAssociated",
					"Is the corporation associated with one or more corporations for SR & ED purposes? (line 100)",
					YES_NO,
					{
						description:
							"Set automatically to Yes when the associated group below has at least one row.",
					},
				),
				f.money(
					"allocatedExpenditureLimit",
					"If the corporation is associated (line 100 = Yes) enter the allocated amount from applicable line 240 on page 3 (line 102)",
					{
						description:
							"Used only when the associated group below is empty — otherwise the group allocation determines this corporation's share.",
					},
				),
				f.money(
					"daysInTaxYear",
					"If the corporation is not associated (line 100 = No), calculate Maximum Expenditure Limit (line 104)",
					{
						description:
							"Enter the number of days in this corporation's own taxation year — leave blank for a full, 365-day year. The maximum expenditure limit is calculated as $4,000,000 x (days / 365); days before 2009-01-01 must already be excluded.",
					},
				),
				f.money(
					"disposalRecapture",
					"If the corporation disposed of any Alberta SR & ED property or is deemed to have disposed of property during the taxation year, enter the amount of recapture (line 112)",
				),
				f.money(
					"priorYearFederalItcAdjustment",
					"Less: Alberta portion of prior year federal investment tax credit (line 116)",
					{
						description:
							"Schedule 9 Supplemental line 428 — applicable only when the taxation year end is on or before 2012-03-31.",
					},
				),
				f.date("taxationYearEnd", "Taxation year end", {
					description:
						"Not itself an AT1 Schedule 9 line — used only to flag a reminder when it falls after 2019-12-31, the date the credit was wound down.",
				}),
			],
			{ variant: "card", cols: 2 },
		),
		section(
			"group",
			"Allocation of the Maximum Expenditure Limit (Schedule 9, page 3)",
			[
				f.text(
					"longestYearCan",
					"The Corporate Account Number of the associated corporation with the longest taxation year (line 200)",
				),
				f.date("longestYearBegin", "Taxation Year Beginning (line 202)"),
				f.date("longestYearEnd", "Taxation Year Ending (line 204)"),
				f.money(
					"daysInLongestYear",
					"Number of days in the longest year (line 206)",
					{
						description: "Leave blank for a full, 365-day year.",
					},
				),
				f.array(
					"group",
					"Associated corporations — include this corporation FIRST",
					[
						field.text("name", "Name of Corporation (line 220)"),
						field.text(
							"albertaCan",
							"Alberta Corporate Account Number (line 230)",
						),
						money(
							"allocated",
							"Allocated Amount. Enter the amount allocated to the corporation on line 102 on page 2 (line 240)",
						),
					],
					// The 4 fields above this array are scalar and benefit from the
					// section's 2-column grid — fullWidth spans just the array across
					// both columns instead of squeezing it into one.
					{ fullWidth: true },
				),
			],
			{
				variant: "card",
				description:
					"Required whenever line 100 is Yes. Each occurrence, and the group's total, are capped at $4,000,000 x line 206, divided by 365 — an over-allocated row or total is flagged, not silently rewritten. Leave empty for a non-associated claim.",
			},
		),
	],
});

export const albertaSredCredit9 = defineSchedule({
	key: "albertaSredCredit9",
	num: "009",
	label: "SR&ED Tax Credit (S9)",
	hint: "Alberta's own SR&ED credit",
	programs: ["AT1"],
	schema: albertaSchedule9Schema,
});
