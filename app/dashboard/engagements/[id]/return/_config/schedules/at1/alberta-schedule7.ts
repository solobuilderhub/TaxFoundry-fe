import { defineSchema, field, section } from "@classytic/formkit/server";
import { createElement } from "react";
import type { AlbertaRoyaltySupplemental7Values } from "../../../_lib/return-input";
import { fieldsFor, money } from "../../fields";
import { defineSchedule } from "../shared/define";
import { Schedule7FormView } from "./paper/schedule7-form-view";

/**
 * AT1 Schedule 7 — Alberta Royalty Tax Credit/Deduction Supplemental
 * Information.
 *
 * TRA spec §3.2.3.8 (Chapter 3, lines 6654-7251). See
 * `packages/ca-tax/src/t2/at1/schedules/schedule7-royalty-supplemental.ts`
 * for the full derivation this schema mirrors field for field. Not itself a
 * claim — this is the disclosure schedule that supports BOTH Schedule 5
 * (Royalty Tax Deduction) and Schedule 6 (Royalty Tax Credit, above); per the
 * spec, omitting it disallows the credit entitlement outright even when
 * Schedule 5 and/or 6 are otherwise complete.
 *
 * Two figures this module computes have no defining row of their own
 * anywhere in the transcribed spec table (line 051 IS defined; line 061 is
 * cited only from Schedule 5's own field definition) — see the engine
 * module's docstring. Neither is collected here: both are wholly DERIVED
 * from the fields this form does collect, so there is nothing for a preparer
 * to enter for them.
 *
 * `AlbertaRoyaltySupplemental7Values` itself is now generated from
 * `apps/server/src/engine/contracts/at1-input.ts` — see
 * `_lib/return-input.ts`'s own header comment for why.
 */
const f = fieldsFor<AlbertaRoyaltySupplemental7Values>();

/** 007085 — source of a prior-year adjustment. */
const SOURCE_OF_ADJUSTMENT_OPTIONS = [
	{
		value: "1",
		label: "1 — Department of Resource Development (formerly Energy)",
	},
	{ value: "2", label: "2 — Operator" },
];

export const albertaRoyaltySupplemental7Schema = defineSchema({
	sections: [
		section(
			"cpi",
			"Crown Payment Information (line 003-013)",
			[
				f.money(
					"eligibleCrownRoyalty",
					"Alberta crown royalty eligible for Royalty Tax Credit (line 003)",
				),
				f.money(
					"otherRoyaltiesNotEligible",
					"Other royalties paid to Alberta not eligible for Royalty Tax Credit (line 005)",
				),
				f.money(
					"royaltyPaidToOtherJurisdictions",
					"Crown royalty paid to other provincial or federal jurisdictions (line 007)",
				),
				f.money(
					"nonDeductibleCrownLeaseRentals",
					"Non-deductible crown lease rentals (line 009)",
				),
				f.money("mineralTaxes", "Mineral taxes (line 011)"),
				f.money(
					"saskatchewanResourcesSurcharge",
					"Saskatchewan resources surcharge (non-deductible portion only) (line 013)",
				),
			],
			{
				variant: "card",
				cols: 2,
				description:
					"Transcribed directly from the income statement (federal form 125).",
			},
		),
		section(
			"otherCharges",
			"Other non-deductible crown charges (line 014-017)",
			[
				f.text(
					"otherNonDeductibleCrownChargeType1",
					"Other non-deductible crown charges type (line 014)",
				),
				f.text(
					"otherNonDeductibleCrownChargeType2",
					"Other non-deductible crown charges type (line 015)",
				),
				f.text(
					"otherNonDeductibleCrownChargeType3",
					"Other non-deductible crown charges type (line 016)",
				),
				f.money(
					"otherNonDeductibleCrownCharges",
					"Other non-deductible crown charges (line 017)",
					{
						description: "Blank or zero when no charge type is named.",
					},
				),
			],
			{ variant: "card", cols: 2 },
		),
		section(
			"balanceSheet",
			"Other balance sheet eligible deductions (line 025-029)",
			[
				f.money(
					"crownLeaseRentalsCapitalized",
					"Crown lease rentals capitalized during the taxation year on non-producing properties (non-deductible portion) (line 025)",
				),
				f.text(
					"otherBalanceSheetDeductionName",
					"Other balance sheet eligible deductions (line 027)",
				),
				f.money("otherBalanceSheetDeduction", "Other, specify: (line 029)", {
					description: "Blank or zero when no deduction is named.",
				}),
			],
			{
				variant: "card",
				cols: 2,
				description:
					"Transcribed directly from the balance sheet (federal form 100).",
			},
		),
		section(
			"piti",
			"Partnership Income Tax Information (line 071-081)",
			[
				f.array(
					"partnerships",
					"Partnerships this corporation is a member of",
					[
						field.text("name", "Partnership name (line 071)"),
						field.number(
							"interestPercent",
							"Corporation's % interest in partnership (line 073)",
							{
								description:
									"Decimal to 4 places, e.g. .7500 for 75% — not a whole percentage.",
							},
						),
						field.date(
							"fiscalPeriodEnd",
							"Partnership fiscal period end (line 075)",
						),
						money(
							"shareEligibleForCredit",
							"Corporations Share of Alberta Crown Royalties eligible for Royalty Tax Credit (line 077)",
						),
						money(
							"shareOtherRoyaltiesNotEligible",
							"Corporations Share of Other Royalties paid to Alberta not eligible for Royalty Tax Credit (line 079)",
						),
						money(
							"shareOtherCrownChargesEligibleForDeduction",
							"Corporation's share of other Crown charges eligible for Royalty Tax Deduction (line 081)",
						),
					],
				),
			],
			{
				variant: "card",
				cols: 1,
				description:
					"One row per partnership. Line 081 feeds Schedule 5 (Royalty Tax Deduction), not this schedule's own arithmetic — still enter it here since it is disclosed on this form.",
			},
		),
		section(
			"acra",
			"Adjustments to ACR Reported in the Current taxation year, but Relating to Prior Taxation Years (line 083-091)",
			[
				f.array(
					"priorYearAdjustments",
					"Prior-year adjustments reported this year",
					[
						field.date(
							"priorProductionPeriodEnd",
							"Prior production period from where the adjustment arose (line 083)",
						),
						field.select(
							"sourceOfAdjustment",
							"Source of Adjustment: 1=Dept. of Resource Development; 2=Operator (line 085)",
							SOURCE_OF_ADJUSTMENT_OPTIONS,
							{
								placeholder: "Select a source",
							},
						),
						money(
							"increase",
							"Adjustments that increased crown royalties in applicable tax year (line 087)",
						),
						money(
							"decrease",
							"Adjustments that decreased crown royalties in applicable tax year (line 089)",
						),
						money(
							"adjustmentNotEligibleForCredit",
							"Adjustment to amount not eligible for royalty tax credit in the applicable tax year (line 091)",
						),
					],
				),
			],
			{
				variant: "card",
				cols: 1,
				description:
					"One row per correction relating to a prior production year but reported in this accounting period. The engine totals these into line 051, and separately into the royalty-incurred figure feeding Schedule 6 line 004 — note the two totals apply opposite signs to the same increase/decrease fields, both transcribed exactly as the specification states them.",
			},
		),
	],
});

export const albertaRoyaltySupplemental7 = defineSchedule({
	key: "albertaRoyaltySupplemental7",
	num: "007",
	label: "Royalty Tax Credit / Deduction Supplemental Information (S7)",
	hint: "Crown payment & partnership detail",
	programs: ["AT1"],
	formView: (props) => createElement(Schedule7FormView, props),
	schema: albertaRoyaltySupplemental7Schema,
});
