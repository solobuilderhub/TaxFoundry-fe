import {
	defineSchema,
	type FormSchema,
	section,
} from "@classytic/formkit/server";
import { createElement } from "react";
import type { AlbertaOtherCredits3Values } from "../../../_lib/return-input";
import { fieldsFor } from "../../fields";
import { defineSchedule } from "../shared/define";
import { Schedule3FormView } from "./paper/schedule3-form-view";

/**
 * AT1 Schedule 3 — Alberta Other Tax Deductions and Credits.
 *
 * `ri.albertaOtherCredits3` — this exact shape, read directly by
 * `apps/server/src/engine/at1-schedule-composers/schedule-3-compose.ts`'s
 * `assembleSchedule3`. `AlbertaOtherCredits3Values` itself is now generated
 * from `apps/server/src/engine/contracts/at1-input.ts` — see
 * `_lib/return-input.ts`'s own header comment for why.
 *
 * Three independent AB investment-tax-credit continuities sharing one ceiling
 * — see
 * `packages/ca-tax/src/t2/at1/schedules/schedule3-other-deductions-credits.ts`
 * for the full derivation (TRA spec §3.2.3.4, no matching form PDF exists).
 * Simplified from the engine's full `Schedule3Input` for a usable form:
 *   - the by-year-of-origin detail pages (AITC/ACITC, lines 120-130/220-230)
 *     are NOT collected — the engine module itself does not compute a
 *     per-vintage split for ITC/CITC (the spec gives those two no
 *     application order or percentage rule the way it gives APITC), so there
 *     is nothing here for such a table to feed;
 *   - APITC's per-vintage inputs ARE kept (the engine needs them for the
 *     20% / 30% / 50% caps), but as four flat named slots — current / 1st /
 *     2nd / 3rd-10th preceding — rather than a repeating `f.array` the way
 *     `cca.ts`'s CCA classes or `alberta-continuity.ts`'s limited
 *     partnerships are: the spec gives the first three vintages each their
 *     OWN percentage rule, so they are not interchangeable rows a preparer
 *     could add, remove or reorder;
 *   - MAD's shared-ceiling inputs (AT1 page 2 jacket lines
 *     068/070/071/072/074) are collected here directly — the same way
 *     `alberta-ieg.ts` collects figures with no jacket UI/composer to source
 *     them from yet.
 */
const f = fieldsFor<AlbertaOtherCredits3Values>();

export const albertaSchedule3Schema: FormSchema = defineSchema({
	sections: [
		section(
			"mad",
			"Maximum Allowable Deduction (line 600-604)",
			[
				f.money(
					"taxPayableBeforeDeduction",
					"Alberta tax payable before this deduction (AT1 page 2, line 068)",
				),
				f.money("line070", "AT1 page 2, line 070"),
				f.money("line071", "AT1 page 2, line 071"),
				f.money("line072", "AT1 page 2, line 072"),
				f.money("line074", "AT1 page 2, line 074"),
			],
			{
				variant: "card",
				cols: 2,
				description:
					"The shared ceiling all three credits below draw on: room = line 068 − (070+071+072+074). The Total Deduction (line 604) is the lesser of that room and the credits actually applied.",
			},
		),
		section(
			"itc",
			"Investor Tax Credit (line 100-108)",
			[
				f.money(
					"itcCertificatesIssued",
					"Total amounts shown on all Investor Tax Credit certificates issued to the corporation during the year (line 100)",
				),
				f.money(
					"itcCarryforwardFromPriorYear",
					"Total Investor Tax Credit amount carried forward from prior year(s) (line 102)",
				),
				f.money(
					"itcExpired",
					"Deduct: Total Investor Tax Credit Expired (line 106)",
				),
				f.money(
					"itcAmountApplied",
					"Amount applied to current taxation year (line 104)",
					{
						description:
							"Blank = claim the maximum the pool and shared room both allow.",
					},
				),
			],
			{ variant: "card", cols: 2 },
		),
		section(
			"citc",
			"Capital Investment Tax Credit (line 200-208)",
			[
				f.money(
					"citcCertificatesIssued",
					"Total amounts shown on all Capital Investment Tax Credit certificates issued to the corporation during the year (line 200)",
				),
				f.money(
					"citcCarryforwardFromPriorYear",
					"Total Capital Investment Tax Credit amount carried forward from prior year(s) (line 202)",
				),
				f.money(
					"citcExpired",
					"Deduct: Total Capital Investment Tax Credit Expired (line 206)",
				),
				f.money(
					"citcAmountApplied",
					"Amount applied to current taxation year (line 204)",
					{
						description:
							"Cannot be claimed while the Investor Tax Credit above still carries forward an unused balance.",
					},
				),
			],
			{ variant: "card", cols: 2 },
		),
		section(
			"apitc",
			"Agri-Processing Investment Tax Credit (line 300-316)",
			[
				f.money(
					"apitcCurrentReceived",
					"Total amounts shown on all Agri-Processing Investment Tax Credit certificates issued to the corporation during the year (line 300)",
				),
				f.money(
					"apitcCurrentApplied",
					"Amount applied from current taxation year (line 304)",
					{
						description: "Capped at 20% of this year's receipt.",
					},
				),
				f.money(
					"apitcFirstAvailable",
					"Agri-Processing Investment Tax Credit available for carry forward at beginning of the year (line 335, occurrence 1 — 1st preceding taxation year)",
				),
				f.money(
					"apitcFirstApplied",
					"Agri-Processing Investment Tax Credit applied from 1st preceding taxation year (line 306)",
					{
						description: "Capped at 30% of that vintage's balance.",
					},
				),
				f.money(
					"apitcSecondAvailable",
					"Agri-Processing Investment Tax Credit available for carry forward at beginning of the year (line 335, occurrence 2 — 2nd preceding taxation year)",
				),
				f.money(
					"apitcSecondApplied",
					"Agri-Processing Investment Tax Credit applied from 2nd preceding taxation year (line 308)",
					{
						description: "Capped at 50% of that vintage's balance.",
					},
				),
				f.money(
					"apitcThirdToTenthAvailable",
					"Agri-Processing Investment Tax Credit available for carry forward at beginning of the year (line 335, occurrences 3-10 — 3rd to 10th preceding taxation years, combined)",
				),
				f.money(
					"apitcThirdToTenthApplied",
					"Agri-Processing Investment Tax Credit applied from 3rd to 10th preceding taxation years (line 310)",
					{
						description:
							"No percentage cap — limited only by the combined balance and the shared room.",
					},
				),
				f.money(
					"apitcExpired",
					"Deduct: Total Agri-Processing Investment Tax Credit Expired (line 314)",
				),
			],
			{
				variant: "card",
				cols: 2,
				description:
					"Each vintage has its OWN percentage ceiling (20% / 30% / 50% / uncapped) before the shared room above applies. Amounts left blank claim the maximum each vintage's own cap and the remaining shared room allow, oldest vintage first.",
			},
		),
	],
});

export const albertaOtherCredits3 = defineSchedule({
	key: "albertaOtherCredits3",
	num: "003",
	label: "Alberta Other Tax Deductions and Credits (S3)",
	hint: "ITC / CITC / APITC investment tax credits",
	programs: ["AT1"],
	formView: (props) => createElement(Schedule3FormView, props),
	schema: albertaSchedule3Schema,
});
