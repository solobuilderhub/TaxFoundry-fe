import {
	defineSchema,
	type FormSchema,
	section,
} from "@classytic/formkit/server";
import { createElement } from "react";
import type { AlbertaManufacturing11Values } from "../../../_lib/return-input";
import { fieldsFor } from "../../fields";
import { YES_NO } from "../../options";
import { defineSchedule } from "../shared/define";
import { Schedule11FormView } from "./paper/schedule11-form-view";

/**
 * AT1 Schedule 11 — Alberta Manufacturing and Processing Profits Deduction.
 *
 * `ri.albertaManufacturing11` — this exact shape, read directly by
 * `apps/server/src/engine/at1-schedule-composers/schedule-11-compose.ts`'s
 * `assembleSchedule11`. `AlbertaManufacturing11Values` itself is now
 * generated from `apps/server/src/engine/contracts/at1-input.ts` — see
 * `_lib/return-input.ts`'s own header comment for why.
 *
 * ── A HISTORICAL schedule ────────────────────────────────────────────────
 *
 * The deduction only applies to a tax year beginning before 2001-04-01 — see
 * `packages/ca-tax/src/t2/at1/schedules/schedule11-manufacturing-processing.ts`
 * for the full derivation (TRA spec §3.2.3.12, lines 9082-9397). Essentially
 * no engagement filed today needs this form; every field here is optional and
 * the composer files nothing at all unless the preparer enters something.
 *
 * ── What is collected directly rather than derived ──────────────────────
 *
 * ADJUBI (fed 027130), Cost of Capital (fed 027140) and Cost of Labour (fed
 * 027160) are federal Schedule 27 PART 2 figures this codebase has no module
 * to compute — `schedule27-mp.ts` only has Part 2's OUTPUT
 * (Canadian M&P profits), not ADJUBI or the capital/labour cost bases that
 * produce it — so they are collected here as plain money fields, the same
 * way `alberta-schedule3.ts` collects its Maximum Allowable Deduction jacket
 * lines with no jacket composer to source them from yet.
 */
const f = fieldsFor<AlbertaManufacturing11Values>();

export const albertaSchedule11Schema: FormSchema = defineSchema({
	sections: [
		section(
			"eligibility",
			"Eligibility (line 011)",
			[
				f.money(
					"manufacturingGrossRevenue",
					"Gross revenue from manufacturing or processing for sale or lease",
				),
				f.money("totalGrossRevenue", "Total gross revenue for the year"),
			],
			{
				variant: "card",
				cols: 2,
				description:
					"This schedule only applies to a tax year BEGINNING BEFORE 2001-04-01, and only when manufacturing/processing gross revenue is at least 10% of total gross revenue. Leave this whole schedule blank for any current engagement — it is filed here purely for completeness on a historical return.",
			},
		),
		section(
			"smallManufacturer",
			"Small manufacturing corporations",
			[
				f.radio(
					"isSmallManufacturingCorp",
					"Does the corp qualify as a small manufacturing corp? (per the AT1 Guide criteria)",
					YES_NO,
				),
				f.money(
					"smallManufacturerAmpp",
					"Alberta Manufacturing and Processing Profits (line 042)",
					{
						description:
							"Enter directly per the AT1 Guide when the corp is a small manufacturer — the spec gives no proration formula for this case. Leave lines 031-039 below blank; the form itself says they must not exist here.",
					},
				),
			],
			{ variant: "card", cols: 2 },
		),
		section(
			"adjubi",
			"ADJUBI (line 001)",
			[
				f.money("federalAdjubi", "Federal ADJUBI (Schedule 27, line 130)"),
				f.money("albertaAdjubiLine112", "Schedule 12, line 112"),
				f.money("albertaAdjubiLine114", "Schedule 12, line 114"),
			],
			{
				variant: "card",
				cols: 2,
				description:
					'The AT1 spec\'s own wording for line 001: "If the ADJUBI is calculated differently for Alberta purposes, then enter the amount from Schedule 12, line 116" — the business rule beside that caption gives the actual formula as Schedule 12 line 112 plus line 114 instead (there is no Schedule 12 line 116 elsewhere in the spec). Leave the Schedule 12 lines blank to use the federal ADJUBI as-is; enter both only when the corp elects to calculate ADJUBI differently for Alberta purposes — line 001 then becomes line 112 plus line 114 (floored at nil) instead.',
			},
		),
		section(
			"ccpc",
			"Canadian-controlled Private Corporations Only: Aggregate investment income for the year (line 013)",
			[
				f.radio(
					"isCcpc",
					"Is the corp a Canadian-controlled private corporation?",
					YES_NO,
				),
				f.radio(
					"schedule12Exists",
					"Does an Alberta Schedule 12 exist for this return?",
					YES_NO,
				),
				f.money(
					"albertaAggregateInvestmentIncome",
					"Canadian-controlled Private Corporations Only: Aggregate investment income for the year (line 013)",
					{
						description: "The Alberta figure — used when a Schedule 12 exists.",
					},
				),
				f.money(
					"federalAggregateInvestmentIncome",
					"Canadian-controlled Private Corporations Only: Aggregate investment income for the year (line 013)",
					{
						description:
							"The federal figure (fed 200440) — used when no Alberta Schedule 12 exists.",
					},
				),
			],
			{
				variant: "card",
				cols: 2,
				description:
					"Disclosure only — the transcribed spec does not use this figure in the line 042 proration below. Applies to CCPCs only.",
			},
		),
		section(
			"capitalAndLabour",
			"Cost of Capital and Cost of Labour (line 031-039)",
			[
				f.money(
					"costOfCapital",
					"Cost of Capital: Calculate in accordance with the Cost of Capital calculation on federal Schedule 027 (line 031)",
					{
						description: "Federal Schedule 27, line 140.",
					},
				),
				f.money(
					"albertaCostOfCapital",
					'Alberta Cost of Manufacturing and Processing Capital: That portion of "Cost of Capital" (line 031) that reflects the extent to which each property included in the calc thereof was used directly in AB in "qualified activities" of the corporation or partnership during the year (line 033)',
					{
						description: "Cannot exceed line 031.",
					},
				),
				f.money(
					"costOfLabour",
					"Cost of Labour: Calculate in accordance with the Cost of Labour calculation on federal Schedule 27 (line 037)",
					{
						description: "Federal Schedule 27, line 160.",
					},
				),
				f.money(
					"albertaCostOfLabour",
					'Alberta Cost of Manufacturing and Processing Labour: That portion of "Cost of Labour" (line 037) that was paid or payable (line 039)',
					{
						description: "Cannot exceed line 037.",
					},
				),
			],
			{
				variant: "card",
				cols: 2,
				description:
					"Leave all four blank for a small manufacturing corp — see above. Otherwise these drive line 042: Alberta M&P profits = ADJUBI × the Alberta share of capital and labour, each capped at its own grossed-up Alberta portion.",
			},
		),
	],
});

export const albertaManufacturing11 = defineSchedule({
	key: "albertaManufacturing11",
	num: "011",
	label: "Alberta Manufacturing and Processing Profits Deduction (S11)",
	hint: "Historical — pre-2001-04-01 only",
	programs: ["AT1"],
	formView: (props) => createElement(Schedule11FormView, props),
	schema: albertaSchedule11Schema,
});
