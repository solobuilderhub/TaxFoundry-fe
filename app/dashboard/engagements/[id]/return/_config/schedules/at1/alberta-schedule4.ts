import {
	defineSchema,
	type FormSchema,
	field,
	section,
} from "@classytic/formkit/server";
import { createElement } from "react";
import type { AlbertaForeignInvestment4Values } from "../../../_lib/return-input";
import { fieldsFor, money } from "../../fields";
import { defineSchedule } from "../shared/define";
import { Schedule4FormView } from "./paper/schedule4-form-view";

/**
 * AT1 Schedule 4 — Alberta Foreign Investment Income Tax Credit.
 *
 * `ri.albertaForeignInvestment4` — this exact shape, read directly by
 * `apps/server/src/engine/at1-schedule-composers/schedule-4-compose.ts`'s
 * `assembleSchedule4`. `AlbertaForeignInvestment4Values` itself is now
 * generated from `apps/server/src/engine/contracts/at1-input.ts` — see
 * `_lib/return-input.ts`'s own header comment for why.
 *
 * TRA spec §3.2.3.5 (Chapter 3, lines 4899-5082). See
 * `packages/ca-tax/src/t2/at1/schedules/schedule4-foreign-investment-tax-credit.ts`
 * for the full derivation this schema mirrors field for field. AB form 004
 * exists only if federal Schedule 21 (foreign tax credit) exists — one row
 * below per country in which the corporation earned foreign non-business
 * income, "in the same order as on the federal form" per the spec.
 *
 * The allowable credit itself (line 012, the lesser of two amounts) is NOT
 * entered here — the engine computes it from these rows plus four AT1 jacket
 * figures (Alberta taxable income, the royalty tax deduction, the allocation
 * factor, basic Alberta tax) the composer sources from elsewhere on the
 * return, not from this schedule.
 *
 * Field labels below are the spec's own "Line Name" column text, verbatim —
 * not a paraphrase — for every field that IS an AT1 line (002, 004, 008; 006
 * only reaches the AT1 line as a computed NET figure, so its two raw federal
 * inputs below are not themselves captioned lines — see their own comments).
 */
const f = fieldsFor<AlbertaForeignInvestment4Values>();

export const albertaSchedule4Schema: FormSchema = defineSchema({
	sections: [
		section(
			"countries",
			"Foreign Investment Credits (line 002-012)",
			[
				f.array("countries", "Countries", [
					field.text(
						"country",
						"Country in which foreign non-business income was earned (line 002)",
						{
							description:
								"Two-letter code. Must equal the matching occurrence on federal Schedule 21.",
						},
					),
					money(
						"netForeignInvestmentIncome",
						"Net Foreign investment income (line 004)",
					),
					money(
						"fedForeignTaxPaid",
						"Foreign investment income tax paid, gross (federal Schedule 21, line 120)",
						{
							description:
								"Not itself an AT1 line — nets against the ITA 20(12)/ACTA 8(2.2) deduction below to compute AT1 line 006. Before any deduction.",
						},
					),
					money(
						"fedIta2012Deduction",
						"ITA subsection 20(12) deduction claimed federally (federal Schedule 21, line 130)",
						{
							description:
								"Not itself an AT1 line — see line 006's derivation.",
						},
					),
					money(
						"albertaActa82Deduction",
						"Alberta ACTA 8(2.2) deduction, if computed differently than federal",
						{
							description:
								"Not itself an AT1 line. Leave blank when the Alberta and federal deductions are the same.",
						},
					),
					money(
						"fedNonBusinessForeignTaxCredit",
						"Federal non-business foreign tax credit (line 008)",
						{
							description:
								"Must equal the matching occurrence on federal Schedule 21, line 180.",
						},
					),
				]),
			],
			{
				variant: "card",
				// A card section defaults to a 2-column field grid — cols: 1 so the
				// array's row cards get the section's FULL width instead of being
				// squeezed into one grid cell.
				cols: 1,
				description:
					"One row per country the corporation earned foreign non-business income in. AB form 004 exists only if federal Schedule 21 exists — sort these rows in the same order as the federal form's own occurrences. The allowable credit (line 012) is computed by the engine, not entered here.",
			},
		),
	],
});

export const albertaForeignInvestment4 = defineSchedule({
	key: "albertaForeignInvestment4",
	num: "004",
	label: "Alberta Foreign Investment Income Tax Credit (S4)",
	hint: "Foreign non-business income tax credit",
	programs: ["AT1"],
	formView: (props) => createElement(Schedule4FormView, props),
	schema: albertaSchedule4Schema,
});
