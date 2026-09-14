import { defineSchema, section } from "@classytic/formkit/server";
import { createElement } from "react";
import type { AlbertaValues } from "../../../_lib/return-input";
import { fieldsFor } from "../../fields";
import { YES_NO } from "../../options";
import { defineSchedule } from "../shared/define";
import { JacketFormView } from "./paper/jacket-form-view";

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
 * opened this block would file "No" to all eight — silently, and on the
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
	label: "Alberta AT1 — required fields",
	hint: "Not the full return — see the Jacket button above",
	programs: ["AT1"],
	formView: (props) => createElement(JacketFormView, props),
	schema: defineSchema({
		sections: [
			section(
				"financials",
				"Financial statement figures",
				[
					f.money("grossRevenue", "Gross Revenue (to nearest thousand) (line 047)", {
						required: true,
						description:
							"Per the financial statements, before any deduction. Enter the full dollar amount: the printed form pre-prints three trailing zeros because it is completed in thousands, but this product transmits whole dollars like every other money field on the return.",
					}),
					f.money(
						"totalAssets",
						"Total Assets (book value per balance sheet, to nearest thousand) (line 048)",
						{
							required: true,
							description: "Must equal federal GIFI 2599.",
						},
					),
					/*
					 * ── Jacket lines 071 and 074 are NOT collected, and must not be ─
					 *
					 * Two money fields sat here, moved off Schedule 3 with the comment
					 * "these two live here, where the form prints them". The form
					 * prints them NOWHERE. Reading TRA11722 Rev. 2025-07 end to end
					 * found no box for either on page 1 or page 2, and the reason is
					 * that both programmes are closed:
					 *
					 *   071  Alberta M&P profits deduction — pre-2001-04-01 only
					 *   074  political contributions credit — corporate political
					 *        contributions have been prohibited in Alberta since
					 *        2015-06-15 (Bill 1), so the contribution the credit
					 *        rewards cannot lawfully be made
					 *
					 * Both are still MANDATORY Field IDs in the Net File
					 * specification, so the return transmits them — as a constant
					 * zero, which is what §3.2.3 prescribes for a mandatory field
					 * whose value cannot be determined. ca-tax types both
					 * `role: 'computed'` and the paper Form View lists them in its
					 * "Filed, but not printed on this form" block.
					 *
					 * Why this was worth removing rather than relabelling: 071 and 074
					 * are subtracted from AT1 Schedule 3's shared ceiling. A figure
					 * typed into either box would silently reduce a live ITC, CITC or
					 * APITC claim — the same failure mode that got the five MAD rows
					 * deleted from Schedule 3, arrived at from the other direction.
					 *
					 * `AlbertaValues` keeps both optional fields. They are the
					 * engine's named terms for the ceiling derivation
					 * (`SCHEDULE_3_ROOM` in ca-tax's `alberta-return.ts`) and the only
					 * route by which a future reassessment of a pre-2001 or pre-2015
					 * year could supply one. Nothing writes them, so both are nil.
					 */
				],
				{
					variant: "card",
					cols: 2,
					description:
						"This schedule is only the handful of Alberta-specific answers nothing else on the return supplies — not the full AT1 return. For the complete document (identification, tax calculation, credits, everything derived), use the Jacket button in the toolbar above, or open it after computing. These two fields are mandatory on the Alberta return and are not defaulted to zero — a corporation has revenue, and filing nil would state something untrue rather than leave a gap.",
				},
			),
			section(
				"status",
				"Corporate status",
				[
					f.radio(
						"associatedWithCcpcs",
						"Associated with one or more Canadian-controlled private corporations? (line 001)",
						YES_NO,
						{
							required: true,
						},
					),
					f.radio(
						"windUpOfSubsidiary",
						"Has there been a wind-up of a subsidiary under federal Income Tax Act (ITA) section 88 during the current taxation year? (line 031)",
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
					/*
					 * The DATE qualifier is not decoration, and it was missing.
					 *
					 * This label read "Transfer of property under ITA 85(1), 85(2)
					 * or 97(2)?", which is the Net File specification's own
					 * abbreviation of the field. The printed AT1 asks about a
					 * transfer "that occurred after May 30, 2001, and during the
					 * taxation year being reported" — a narrower question, and a
					 * preparer answering the short version can answer "Yes" to a
					 * transfer the form is not asking about.
					 */
					f.radio(
						"transferOfProperty",
						"Was there a transfer of property under federal ITA subsection 85(1), 85(2) or 97(2) that occurred after May 30, 2001, and during the taxation year being reported? (line 054)",
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
						"Is the corporation reporting different taxable income for Alberta and federal purposes? (line 060)",
						YES_NO,
						{ required: true },
					),
					/*
					 * "discrectionary" is the printed form's typo, kept because the
					 * label is the page's words and a preparer reconciling against
					 * the paper should find the same string. ca-tax's `jacket.ts`
					 * carries it too, with a test asserting it survives.
					 */
					f.radio(
						"electsDifferentDiscretionaryAmounts",
						"Has the corporation elected to use any different discrectionary amounts for the current year claim or do opening balances differ for federal and Alberta purposes? (line 061)",
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
		],
	}),
});
