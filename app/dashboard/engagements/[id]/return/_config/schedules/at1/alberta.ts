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
		],
	}),
});
