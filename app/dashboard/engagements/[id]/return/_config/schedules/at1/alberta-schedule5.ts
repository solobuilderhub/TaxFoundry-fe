import {
	defineSchema,
	type FormSchema,
	field,
	section,
} from "@classytic/formkit/server";
import { createElement } from "react";
import type { AlbertaRoyaltyDeduction5Values } from "../../../_lib/return-input";
import { fieldsFor, money } from "../../fields";
import { YES_NO } from "../../options";
import { defineSchedule } from "../shared/define";
import { Schedule5FormView } from "./paper/schedule5-form-view";

/**
 * AT1 Schedule 5 — Alberta Royalty Tax Deduction.
 *
 * `ri.albertaRoyaltyDeduction5` — this exact shape, read directly by
 * `apps/server/src/engine/at1-schedule-composers/schedule-5-compose.ts`'s
 * `assembleSchedule5`. `AlbertaRoyaltyDeduction5Values` itself is now
 * generated from `apps/server/src/engine/contracts/at1-input.ts` — see
 * `_lib/return-input.ts`'s own header comment for why.
 *
 * Two independent pool systems — see
 * `packages/ca-tax/src/t2/at1/schedules/schedule5-royalty-tax-deduction.ts`
 * for the full derivation (TRA spec §3.2.3.6):
 *   - the CRTD unsuccessored pool (line 001-025) — the corporation's own
 *     running royalty pool, with a DISCRETIONARY claim (line 016);
 *   - the successored pools (SSPI/FSPI, line 101-140) — per-vendor pools
 *     acquired on a change in control or an acquisition of substantially all
 *     Canadian resource properties, each occurrence's claim being MANDATORY
 *     arithmetic (min(pool base, property income)), not a preparer choice.
 *
 * Two cross-schedule figures are collected here directly rather than
 * derived — see the composer's own doc comment for why true cross-schedule
 * composition (reaching into Schedule 7's or Schedule 12's own slice) is a
 * follow-up, not this pass:
 *   - `crownChargesFromSchedule7` (line 001) — AT1 Schedule 7, line 061;
 *   - `resourceAllowanceFromSchedule12OrFederal` (line 005) — AT1 Schedule 12
 *     line 024, or federal Schedule 1 line 346 when Schedule 12 does not
 *     apply. Enter whichever figure is actually on hand; the engine's own
 *     precedence rule (Schedule 12 over federal) only matters when BOTH are
 *     independently known, which this single field does not distinguish.
 *
 * `albertaTaxableIncomeBeforeDeduction` (AT1 core line 062) is likewise
 * collected directly — there is no AT1 jacket composer for it yet, the same
 * reasoning `alberta-schedule3.ts` already documents for its own jacket-line
 * inputs (068/070/071/072/074).
 */
const POOL_TRANSFER_TYPE_OPTIONS = [
	{
		value: "1",
		label:
			"1 — disposition of all/substantially all Canadian resource properties (s.20(8))",
	},
	{
		value: "2",
		label: "2 — change in control, or ceasing to be exempt under s.20(14)",
	},
	{ value: "3", label: "3 — no transfer occurred" },
];

const f = fieldsFor<AlbertaRoyaltyDeduction5Values>();

export const albertaSchedule5Schema: FormSchema = defineSchema({
	sections: [
		section(
			"crtdInputs",
			"Calculation of the Royalty Tax Deduction (line 001-007)",
			[
				f.money(
					"crownChargesFromSchedule7",
					"Crown charges under section 20(6)(a) to (e) with reference to section 20(13) if applicable. Enter the amount from Schedule 7, line 061. (line 001)",
					{
						description: "From AT1 Schedule 7, line 061.",
					},
				),
				f.money(
					"resourceAllowanceFromSchedule12OrFederal",
					"Deduct: Resource allowance claimed under section 20(6)(g). Amount from Schedule 12, line 024 or amount from federal Schedule 1, line 346. (line 005)",
					{
						description:
							"AT1 Schedule 12, line 024 — or federal Schedule 1, line 346.",
					},
				),
				f.money(
					"reimbursementsForCrownCharges",
					"Deduct: Reimbursements received under the terms of a contract in respect of amounts included on line 001 under section 20(6)(f). (line 007)",
					{
						description:
							"Under s.20(6)(f). Excludes ARTC and other government rebates.",
					},
				),
			],
			{
				variant: "card",
				cols: 2,
				description:
					"Form 007 (AT1 Schedule 7) must be completed and filed alongside this schedule, or the Royalty Tax Credit entitlement is disallowed.",
			},
		),
		section(
			"crtdPool",
			"Calculation of the Royalty Tax Deduction (line 011-025)",
			[
				f.money(
					"openingUnsuccessoredPoolBalance",
					"Corporation's unsuccessored pool amounts C/F from the preceding taxation year (line 043)",
					{ description: "Normally last year's line 017." },
				),
				f.money(
					"crtdAmountClaimed",
					"Royalty tax deduction claim amount in respect of the pool for the year. Cannot exceed the lesser of line 013 and (line 015 minus line 140 from AREA D) (line 016)",
					{
						description:
							"Blank = claim the maximum the pool and Alberta taxable income both allow.",
					},
				),
				f.money(
					"transferredOnDisposal",
					"Deduct: Transfers of Attributed Royalty Income to another corporation at any time during the taxation year due to disposal of substantially all of the corps Canadian Resource Properties. (line 023)",
				),
				f.array(
					"predecessorTransfers",
					"Unsuccessored Pool Amount C/F (line 031-037)",
					[
						field.text("predecessorName", "Predecessor's Name (line 031)"),
						field.text(
							"albertaCorporateAccountNumber",
							"Alberta Corporate Account Number (line 033)",
						),
						field.date("dateOfEvent", "Date of Event (line 035)"),
						money("amountTransferred", "C/F Amount Transferred (line 037)"),
					],
					// This section's other fields are scalar money inputs that benefit
					// from the section's 2-column grid — fullWidth spans just this
					// array across both columns instead of squeezing it into one.
					{ fullWidth: true },
				),
			],
			{
				variant: "card",
				cols: 2,
				description:
					"Predecessor transfers arise from an amalgamation under s.20(10), or the wind-up of a wholly-owned subsidiary under s.20(11).",
			},
		),
		section(
			"successoredPools",
			"Calculation of Successored Pool Balances (line 100-140)",
			[
				field.radio(
					"hasSuccessoredPools",
					"Does the corporation have any successored pools to report? (line 200)",
					YES_NO,
				),
				field.radio(
					"changeInControlEndedPrecedingYear",
					"Was there a change in control that created the immediately preceding taxation year end? (line 100)",
					YES_NO,
				),
				field.group(
					"poolTransfer",
					"Was there a transfer of the resource pools during the year? (line 026-027)",
					[
						field.select(
							"type",
							"Was there a transfer of the resource pools during the year? (line 026)",
							POOL_TRANSFER_TYPE_OPTIONS,
						),
						field.text(
							"acquirerName",
							"If there was a transfer of resource pools during the year, enter the legal name of the corporation who acquired the resource pools. (line 027)",
						),
					],
				),
				f.array(
					"secondSuccessoredPools",
					"Second Successored Pool Information (line 101-115)",
					[
						field.text(
							"vendorName",
							"Legal name as identified by the vendor, predecessor or corporation if there was a change in control (line 101)",
						),
						field.date("dateOfEvent", "Date of Event (line 103)"),
						money(
							"poolBroughtForward",
							"Pool amount available for carry-forward at the end of the preceding year (line 105)",
							{
								description:
									"Mutually exclusive with the acquisition amount for this occurrence.",
							},
						),
						money(
							"acquisitionAmount",
							"Acquisition of all or substantially all Canadian resource properties or change in control under section 20(8) or 20(14) (line 107)",
							{
								description:
									"Mutually exclusive with the pool-brought-forward amount for this occurrence.",
							},
						),
						money(
							"propertyIncome",
							"Property income under section 20(1)(c) (line 109)",
						),
					],
					{ fullWidth: true },
				),
				f.array(
					"firstSuccessoredPools",
					"First Successored Pool Information (line 121-135)",
					[
						field.text(
							"vendorName",
							"Legal name of vendor, predecessor or corporation if there was a change in control (line 121)",
						),
						field.date("dateOfEvent", "Date of Event (line 123)"),
						money(
							"poolBroughtForward",
							"Pool amount available for carry-forward at the end of the preceding year (line 125)",
							{
								description:
									"Mutually exclusive with the acquisition amount for this occurrence.",
							},
						),
						money(
							"acquisitionAmount",
							"Acquisition of all or substantially all Canadian resource properties or change in control under section 20(8) or 20(14) (line 127)",
							{
								description:
									"Mutually exclusive with the pool-brought-forward amount for this occurrence.",
							},
						),
						money(
							"propertyIncome",
							"Property income under section 20(1)(c) (line 129)",
						),
					],
					{ fullWidth: true },
				),
			],
			{
				variant: "card",
				description:
					"Leave the pool tables empty when line 200 is No — per the spec, 005101-005140 must not exist. Each occurrence's claim is mandatory arithmetic (the lesser of its pool base and its property income), not a preparer choice.",
			},
		),
		section(
			"jacket",
			"Alberta taxable income",
			[
				f.money(
					"albertaTaxableIncomeBeforeDeduction",
					"Alberta Taxable Income or (Loss) (AT1 line 062)",
				),
			],
			{
				variant: "card",
				cols: 1,
				description:
					"Caps both the CRTD claim (line 016) and the combined Royalty Tax Deduction (AT1 line 064).",
			},
		),
	],
});

export const albertaRoyaltyDeduction5 = defineSchedule({
	key: "albertaRoyaltyDeduction5",
	num: "005",
	label: "Royalty Tax Deduction (S5)",
	hint: "Crown Royalty Tax Deduction pools",
	programs: ["AT1"],
	formView: (props) => createElement(Schedule5FormView, props),
	schema: albertaSchedule5Schema,
});
