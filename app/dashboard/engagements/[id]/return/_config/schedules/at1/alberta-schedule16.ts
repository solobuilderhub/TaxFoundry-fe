import { defineSchema, section } from "@classytic/formkit/server";
import { createElement } from "react";
import type { AlbertaSred16Values } from "../../../_lib/return-input";
import { fieldsFor } from "../../fields";
import { defineSchedule } from "../shared/define";
import { Schedule16FormView } from "./paper/schedule16-form-view";

const f = fieldsFor<AlbertaSred16Values>();

/**
 * AT1 Schedule 16 — Alberta Scientific Research Expenditures.
 *
 * The Alberta SR&ED **expenditure pool**: the deduction against income, with
 * whatever is unclaimed carried forward indefinitely. Two things it is not,
 * both easy to confuse it with and both already in this editor:
 *
 *   • federal Schedule 31, which computes the SR&ED investment tax CREDIT; and
 *   • AT1 Schedule 29, the Alberta Innovation Employment Grant.
 *
 * ── Why the federal figures are typed in here ───────────────────────────────
 *
 * Lines 002, 004, 006, 008, 010 and 015 are specified as "must equal fed
 * 032nnn", and the form prints the federal source beside each box — "(federal
 * schedule 32 (T661) line 400)". This product models no T661: its one federal
 * SR&ED number (`credits.sredQualifiedExpenditures`) is the Schedule 31 ITC
 * base, which is none of the six. So the preparer transcribes them, exactly as
 * the paper form asks. When a federal T661 slice exists these become defaults
 * and this section keeps them only as overrides.
 *
 * Only the opening pool balance, the transfer and the claim are genuinely
 * Alberta-variable — which is why the form is required precisely "if the
 * opening balance or the claim for Alberta purposes differs from that for
 * federal purposes".
 *
 * ── Why this schedule did not exist in the app ──────────────────────────────
 *
 * The engine (`computeAlbertaSchedule16`) and the payload builder
 * (`schedule16Values`) were both complete and tested, and ca-tax's
 * `alberta-return.ts` already pushed the payload whenever
 * `schedules.scientificResearch` was present. Nothing ever built that input:
 * no contract slice, no composer, no editor, no registry entry. A corporation
 * with an Alberta SR&ED pool therefore could not enter or file the schedule at
 * all, and no test noticed, because every test called the builder directly.
 */
export const albertaSred16 = defineSchedule({
	key: "albertaSred16",
	num: "016",
	label: "Alberta Scientific Research Expenditures (S16)",
	hint: "SR&ED expenditure POOL — the deduction, not the ITC or the IEG",
	programs: ["AT1"],
	formView: (props) => createElement(Schedule16FormView, props),
	schema: defineSchema({
		sections: [
			section(
				"federal",
				"From federal T661 (line 002-010, 015)",
				[
					f.money(
						"currentYearExpenditures",
						"Allowable SR&ED expenditures (line 002)",
						{ description: "Federal T661 line 400." },
					),
					f.money(
						"assistance",
						"Deduct: government and non-government assistance (line 004)",
						{
							description:
								"Federal T661 line 430 for 2007 and earlier; the sum of lines 429, 431 and 432 from 2008 onward.",
						},
					),
					f.money(
						"priorYearItcClaimed",
						"Deduct: previous year's ITC claimed for SR&ED (line 006)",
						{ description: "Federal T661 line 435." },
					),
					f.money(
						"saleOfCapitalAssetsAndOther",
						"Deduct: sale of SR&ED capital assets and other deductions (line 008)",
						{ description: "Federal T661 line 440." },
					),
					f.money(
						"assistanceRepayments",
						"Add: repayments of assistance for SR&ED (line 010)",
						{ description: "Federal T661 line 445." },
					),
					f.money(
						"priorYearItcRecaptured",
						"Add: ITC recaptured in the previous tax year (line 015)",
						{ description: "Federal T661 line 453." },
					),
				],
				{
					variant: "card",
					cols: 2,
					description:
						"The specification requires these six to equal their federal counterparts, and the form names each source beside its box. This product does not model T661, so they are transcribed here — the same thing the paper form asks a preparer to do.",
				},
			),
			section(
				"alberta",
				"Alberta's own figures (line 012, 014, 020)",
				[
					f.money(
						"openingPoolBalance",
						"Add: unclaimed pool balance from the previous year (line 012)",
						{
							description:
								"Last year's line 022. MAY DIFFER from federal — one of the two divergences that make this schedule required.",
						},
					),
					f.money(
						"poolTransferredIn",
						"Add: pool transferred on amalgamation or wind-up of a wholly-owned subsidiary (line 014)",
						{ description: "May differ from federal." },
					),
					f.money(
						"amountClaimed",
						"Deduct: pool deduction claimed this year (line 020)",
						{
							description:
								"Blank claims the WHOLE available pool. The claim is discretionary, so a corporation with no income to shelter normally claims nil and carries the pool forward — enter 0 for that, not blank.",
						},
					),
				],
				{
					variant: "card",
					cols: 2,
					description:
						"The subtotal (016), the available pool (018) and the carry-forward balance (022) are computed from the above — see Form View.",
				},
			),
		],
	}),
});
