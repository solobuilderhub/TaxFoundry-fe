import { defineSchema, field, section } from "@classytic/formkit/server";
import type { AlbertaValues } from "../../_lib/return-input";
import { fieldsFor, money } from "../fields";
import { CORPORATION_STATUS_OPTIONS, YES_NO } from "../options";
import { defineSchedule } from "./define";

const f = fieldsFor<AlbertaValues>();

/**
 * Alberta AT1 jacket — the mandatory fields nothing else on the return carries.
 *
 * Almost the whole AT1 is derived: Alberta taxable income, the allocation
 * factor, basic tax, the small business deduction and every schedule total come
 * from the federal return and the engine. The client record supplies the contact
 * and business codes. What is left is this block, and it exists because TRA
 * states a requirement per field and §3.2.3 makes "mandatory" an obligation on
 * the OUTPUT — every mandatory field must be filed.
 *
 * ── Why these are radios and not switches ───────────────────────────────────
 *
 * TRA encodes the answers as **1 = Yes, 2 = No**. "No" is therefore a positive
 * assertion the corporation makes, and it is a different thing from an
 * unanswered question. A switch is off until touched, so a preparer who never
 * opened this block would file "No" to all nine — silently, and on the
 * corporation's behalf.
 *
 * A radio with no preselection cannot do that. Left alone it stays blank, the
 * line is dropped, and the filing path refuses with the field named. Slower to
 * fill in, and the only version that cannot answer for someone.
 *
 * The same reasoning governs gross revenue and total assets: they are mandatory
 * money fields, but nil is a *false* figure rather than an absent one, so they
 * are collected rather than defaulted to zero.
 */
export const alberta = defineSchedule({
	key: "alberta",
	num: "AT1",
	label: "Alberta AT1 jacket",
	hint: "Mandatory answers TRA requires",
	programs: ["AT1"],
	schema: defineSchema({
		sections: [
			section(
				"financials",
				"Financial statement figures",
				[
					f.money("grossRevenue", "Gross revenue (line 047)", {
						required: true,
						description: "Per the financial statements, before any deduction.",
					}),
					f.money("totalAssets", "Total assets (line 048)", {
						required: true,
						description: "Must equal federal GIFI 2599.",
					}),
				],
				{
					variant: "card",
					cols: 2,
					description:
						"Mandatory on the Alberta return. These are not defaulted to zero — a corporation has revenue, and filing nil would state something untrue rather than leave a gap.",
				},
			),
			section(
				"status",
				"Corporate status",
				[
					f.radio(
						"associatedWithCcpcs",
						"Associated with one or more CCPCs? (line 001)",
						YES_NO,
						{
							required: true,
						},
					),
					f.radio(
						"windUpOfSubsidiary",
						"Wind-up of a subsidiary under ITA s.88? (line 031)",
						YES_NO,
						{
							required: true,
						},
					),
					f.radio(
						"firstYearAfterAmalgamation",
						"First year of filing after an amalgamation? (line 032)",
						YES_NO,
						{ required: true },
					),
					f.radio(
						"taxYearEndChanged",
						"Tax year end changed since the last return? (line 038)",
						YES_NO,
						{
							required: true,
						},
					),
					f.radio(
						"finalReturn",
						"Is this the final return? (line 050)",
						YES_NO,
						{ required: true },
					),
					f.radio(
						"transferOfProperty",
						"Transfer of property under ITA 85(1), 85(2) or 97(2)? (line 054)",
						YES_NO,
						{ required: true },
					),
				],
				{
					variant: "card",
					cols: 1,
					description:
						'Every one is mandatory. Left blank the return cannot be filed — which is deliberate: TRA records "No" as an answer given, so nothing here is assumed for you.',
				},
			),
			section(
				"divergence",
				"Alberta vs federal divergence",
				[
					f.radio(
						"reportsDifferentAlbertaIncome",
						"Reporting different taxable income for Alberta than federally? (line 060)",
						YES_NO,
						{ required: true },
					),
					f.radio(
						"electsDifferentDiscretionaryAmounts",
						"Elected different discretionary amounts, or do opening balances differ? (line 061)",
						YES_NO,
						{ required: true },
					),
				],
				{
					variant: "card",
					cols: 1,
					description:
						"These two decide whether Alberta's CCA schedule may be filed at all: TRA FORBIDS Schedule 13 when both are \"No\", and requires it when any class's opening balance or claim differs from federal.",
				},
			),
			section(
				"preparer",
				"Preparer",
				[
					f.radio(
						"preparedByTaxPreparerForFee",
						"Was this return prepared by a tax preparer for a fee? (line 095)",
						YES_NO,
						{ required: true },
					),
				],
				{ variant: "card", cols: 1 },
			),
			section(
				"sbdEligibility",
				"Small business deduction eligibility (Schedule 1)",
				[
					field.select(
						"corporationStatus",
						"Corporation status",
						CORPORATION_STATUS_OPTIONS,
						{
							description:
								"Only the first two may claim the deduction at all; a section 149 exempt corporation is barred outright.",
						},
					),
					f.radio(
						"wasCcpcThroughoutYear",
						"Was CCPC status held THROUGHOUT the taxation year?",
						YES_NO,
						{
							description:
								"Only consulted when the status above is CCPC. A mid-year change bars the claim for the year.",
						},
					),
					money(
						"royaltyTaxDeduction",
						"Royalty Tax Deduction for the year (Schedule 5, line 021)",
						{
							description:
								"Oil & gas only. Leave blank if the corporation has none.",
						},
					),
				],
				{
					variant: "card",
					cols: 2,
					description:
						"Everything else Schedule 1 needs (active business income, Alberta taxable income) comes from the federal return and the allocation factor. These three cannot be derived from anywhere else.",
				},
			),
		],
	}),
});
