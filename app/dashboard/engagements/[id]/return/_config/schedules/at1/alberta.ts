import { defineSchema, section } from "@classytic/formkit/server";
import { createElement } from "react";
import type { AlbertaValues } from "../../../_lib/return-input";
import { fieldsFor } from "../../fields";
import { YES_NO } from "../../options";
import { defineSchedule } from "../shared/define";
import { AT1_JACKET_CODE_OPTIONS } from "./paper/generated/jacket.layout";
import { JacketFormView } from "./paper/jacket-form-view";

const f = fieldsFor<AlbertaValues>();

/**
 * A coded answer's options, taken from the GENERATED jacket layout rather than
 * retyped here.
 *
 * These lists are the printed form's own tick-box wording (ca-tax's
 * `AT1_JACKET_CODE_OPTIONS`, transcribed from TRA11722 and emitted into
 * `generated/jacket.layout.ts`). Restating them in this file would create a
 * second copy that a preparer could read while the engine filed the first —
 * and the codes are the payload, so a drifted label is a mislabelled answer,
 * not a cosmetic difference.
 */
const codeOptions = (line: string) =>
	(AT1_JACKET_CODE_OPTIONS[line] ?? []).map((o) => ({
		label: `${o.code} — ${o.label}`,
		value: o.code,
	}));

/**
 * The gates, and what each one makes mandatory.
 *
 * Declarative `condition` rules rather than predicate functions, so the schema
 * stays plain data and importable from a server component (see `fields.ts`).
 * The editor stores a radio's answer as the literal `"yes"` / `"no"`, which is
 * what these compare against — NOT Alberta's 1/2 encoding, which only exists
 * at the filing boundary.
 */
const whenYearEndChanged = {
	watch: "taxYearEndChanged",
	operator: "===",
	value: "yes",
} as const;
const whenFinalReturn = {
	watch: "finalReturn",
	operator: "===",
	value: "yes",
} as const;

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
	num: "000",
	label: "AT1 Jacket (Schedule 000)",
	hint: "Identification, questions, tax and balance — the AT1 itself",
	programs: ["AT1"],
	formView: (props) => createElement(JacketFormView, props),
	// Every field is editable on the form itself — the printed form is the only view.
	formOnly: true,
	schema: defineSchema({
		sections: [
			/*
			 * Identification, typed on the return — as every tax package does it.
			 * A blank box files the client profile's value, so a client that
			 * already holds these needs nothing re-entered.
			 */
			section(
				"identification",
				"Identification",
				[
					f.text("legalName", "Legal name of corporation (line 010)"),
					f.text("businessNumber", "Business Number (BN) (line 035)", {
						placeholder: "9 digits",
					}),
					f.text(
						"corporateAccountNumber",
						"Alberta Corporate Account Number (CAN) (line 034)",
					),
					f.text("addressStreet", "Mailing address (line 012)"),
					f.text("addressCity", "City/Town (line 014)"),
					f.text("addressProvince", "Province/State (line 015)", {
						placeholder: "AB",
					}),
					f.text("addressPostalCode", "Postal/ZIP code (line 017)"),
					f.text(
						"contactPerson",
						"Contact person to discuss return (line 025)",
					),
					f.text("contactTelephone", "Contact person's telephone (line 026)", {
						placeholder: "10 digits",
					}),
					f.text("authorizedEmail", "CIT authorized email (line 105)"),
					f.text(
						"natureOfBusiness",
						"Nature of business — SIC code (line 028)",
						{
							placeholder: "4 digits, e.g. 0198",
						},
					),
					f.select(
						"typeOfCorporation",
						"Type of corporation (line 029)",
						codeOptions("029"),
					),
				],
				{
					variant: "card",
					cols: 2,
					description: "Leave a box blank to use the client profile's value.",
				},
			),
			section(
				"financials",
				"Financial statement figures",
				[
					f.money(
						"grossRevenue",
						"Gross Revenue (to nearest thousand) (line 047)",
						{
							required: true,
							description:
								"Per the financial statements, before any deduction. Enter the full dollar amount: the printed form pre-prints three trailing zeros because it is completed in thousands, but this product transmits whole dollars like every other money field on the return.",
						},
					),
					f.money(
						"albertaTaxableIncome",
						"Alberta taxable income or (loss), if the T2 was prepared elsewhere (line 062)",
						{
							description:
								"Leave BLANK on a return whose federal T2 is prepared in this app — the engine computes 062 as federal taxable income times the Alberta allocation factor, and that is the normal path. Fill it in only when the T2 was prepared in another package: there is then nothing to derive from, and without it basic tax (068), the small business deduction (070) and tax payable (080) all read $0. Enter the ALBERTA figure, already allocated — the allocation factor is not applied again. A figure entered here is reported in review as entered rather than computed.",
						},
					),
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
						"Switch to Form View to see the whole jacket, line by line. These two fields are mandatory on the Alberta return and are not defaulted to zero — a corporation has revenue, and filing nil would state something untrue rather than leave a gap.",
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
					/*
					 * 030 and 041 (below) are the two conditional codes with no
					 * gate on this return, so neither can be prompted for: the
					 * spec conditions 030 on federal line 218 / federal Schedule
					 * 18, and 041 on a federal functional-currency election, and
					 * this engine models none of the three. Offered as optional
					 * answers rather than derived — and left absent they are
					 * dropped, which is right for almost every corporation.
					 */
					f.select(
						"specialCorporationStatus",
						"Special Corporation Status, if applicable (line 030)",
						codeOptions("030"),
						{
							description:
								'Leave blank unless one of these describes the corporation. The specification requires 1 or 2 here for an investment or mutual fund corporation ("if fed 200218=1 or federal form 018 exists"); the rest of the list is the printed form\'s own.',
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
					f.select(
						"taxYearEndChangeReason",
						'If "Yes", specify the reason (line 039)',
						codeOptions("039"),
						{
							condition: whenYearEndChanged,
							description:
								'Required once line 038 is "Yes" — the specification says "If 000038=1, must be a valid code", and equally "If 000038=2, then value must be blank". Choosing "3 — Final Return" means line 050 below must also be "Yes".',
						},
					),
					f.radio(
						"finalReturn",
						"Is this the final return? (line 050)",
						YES_NO,
						{ required: true },
					),
					f.select(
						"finalReturnReason",
						'If "Yes", specify the reason (line 051)',
						codeOptions("051"),
						{
							condition: whenFinalReturn,
							description:
								'Required once line 050 is "Yes". Two of the five reasons need a date as well, and the box for it appears when you pick one.',
						},
					),
					f.date("dateOfAmalgamation", "Date of amalgamation (line 052)", {
						condition: {
							rules: [
								whenFinalReturn,
								{ watch: "finalReturnReason", operator: "===", value: "1" },
							],
							logic: "and",
						},
						description:
							"Must be the tax year end or the day after it. Reason 1 means the corporation ceased to exist BY amalgamating, so this is the predecessor's final return and its year ended the day before the amalgamation. This is not line 032 above, which asks the SUCCESSOR whether this is its first year after one.",
					}),
					f.date("dateOperationsCeased", "Date operations ceased (line 053)", {
						condition: {
							rules: [
								whenFinalReturn,
								{ watch: "finalReturnReason", operator: "===", value: "5" },
							],
							logic: "and",
						},
						description:
							"Required when the reason is dissolution of the corporation.",
					}),
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
					f.select(
						"functionalCurrency",
						"Functional currency used, if other than Canadian (line 041)",
						codeOptions("041"),
						{
							description:
								"Leave blank for Canadian dollars, which is the answer for all but a corporation that has elected a functional currency federally.",
						},
					),
				],
				{
					variant: "card",
					cols: 1,
					description:
						'The yes/no questions are all mandatory: left blank the return cannot be filed — which is deliberate, because TRA records "No" as an answer given, so nothing here is assumed for you. The coded answers between them are conditional, and each appears only when the question above it makes one necessary.',
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
