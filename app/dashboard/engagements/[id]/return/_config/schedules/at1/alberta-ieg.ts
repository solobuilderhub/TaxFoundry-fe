import { defineSchema, field, section } from "@classytic/formkit/server";
import { createElement } from "react";
import type { AlbertaIegValues } from "../../../_lib/return-input";
import { fieldsFor, money } from "../../fields";
import {
	IEG_JURISDICTION_OPTIONS,
	IEG_PRIMARY_FIELD_OPTIONS,
	YES_NO,
} from "../../options";
import { defineSchedule } from "../shared/define";
import { Schedule29FormView } from "./paper/schedule29-form-view";

const f = fieldsFor<AlbertaIegValues>();

/**
 * AT1 Schedule 29 — the Innovation Employment Grant.
 *
 * Entirely Alberta-only. Federal SR&ED tracking has no province split (a
 * corporation's federal T661 figure is Canada-wide), and the associated-group
 * figures — each member's taxable capital, each member's prior TWO years of
 * Alberta spending — have no federal source at all: they drive a grind and a
 * base level that only this schedule computes.
 *
 * ── Eligible expenditures (line 031) is DERIVED, not typed in directly ──────
 *
 * Schedule 29 page 1 builds line 031 from the federal T661 figure below,
 * adjusted by the AT4970 attachment's own totals — list every Alberta SR&ED
 * project and the Alberta-portion / proxy fields fill themselves in from
 * those totals automatically. Only override them directly when there is no
 * project to list, or the figures genuinely diverge from AT4970's totals.
 *
 * A group of one is still a group. Pass the claimant even when it has no
 * associated corporations — the engine fails closed on an EMPTY list (no
 * grant claimed) rather than treating "no group entered" as "no grind, no
 * base", which would silently produce the maximum possible grant on absent
 * data.
 */
export const albertaIeg = defineSchedule({
	key: "albertaIeg",
	num: "029",
	label: "Innovation Employment Grant (S29)",
	hint: "Alberta SR&ED grant — eligible expenditures, associated group, agreement",
	programs: ["AT1"],
	formView: (props) => createElement(Schedule29FormView, props),
	schema: defineSchema({
		sections: [
			section(
				"eligible",
				"Eligible expenditures (Schedule 29, page 1)",
				[
					f.money(
						"federalAmount",
						"Federal qualified/current SR&ED expenditures (line 003)",
						{
							description:
								"Federal T661 line 559 for a taxation year ending on or before 2024-12-15; T661 line 557 (a different federal figure) for a taxation year ending on or after 2024-12-16.",
						},
					),
					f.money(
						"albertaPortion",
						"Portion carried out in Alberta — override (line 005)",
						{
							description:
								"Leave blank once projects are listed below — it defaults to their total. Set it only to override, or when there is nothing to list.",
						},
					),
					f.money(
						"federalProxyAmount",
						"Deduct: federal prescribed proxy amount — override (line 007)",
						{ description: "Leave blank to default from the projects' total." },
					),
					f.money(
						"albertaProxyAmount",
						"Add: Alberta proxy amount — override (line 009)",
						{ description: "Leave blank to default from the projects' total." },
					),
					f.money(
						"iegReducingFederalExpenditure",
						"Add: IEG that reduced the federal expenditure this year (line 011)",
						{
							description:
								"Leave blank for a first-time current-year claim reported on the pre-deduction federal figures — the ordinary case.",
						},
					),
					f.money(
						"repaymentOrContractPayment",
						"Add: repayment of assistance or a contract payment (line 025)",
						{
							description:
								"The Alberta portion of a repayment of government assistance (other than an IEG) or a contract payment, from this year or any preceding taxation year.",
						},
					),
					f.select(
						"primaryFieldCode",
						"Primary field of science or technology (line 040)",
						IEG_PRIMARY_FIELD_OPTIONS,
					),
				],
				{ variant: "card", cols: 2 },
			),
			section(
				"projects",
				"AT4970 — Listing of Innovation Employment Grant Projects",
				[
					f.array("projects", "Alberta SR&ED projects", [
						field.text("title", "Project title (line 101)"),
						field.text("projectCode", "Project code (line 103)"),
						money(
							"albertaPortion",
							"Portion in Alberta, before IEG (line 105)",
						),
						money("otherPortion", "Portion NOT in Alberta (line 107)"),
						money(
							"salariesAndWages",
							"Salaries and wages re Alberta SR&ED (line 109)",
						),
						money(
							"federalProxyAmount",
							"Federal prescribed proxy amount (line 111)",
						),
						money("albertaProxyAmount", "Alberta proxy amount (line 113)"),
					]),
					f.array("jurisdictions", "Jurisdiction breakdown (informational)", [
						field.select(
							"jurisdiction",
							"Jurisdiction",
							IEG_JURISDICTION_OPTIONS,
						),
						money("amountIncurred", "Amount incurred"),
					]),
				],
				{
					variant: "card",
					// A card section defaults to a 2-column field grid — cols: 1 so
					// these two arrays' row cards get the section's FULL width instead
					// of being squeezed into one grid cell each.
					cols: 1,
					description:
						"A separate attachment required whenever the IEG is claimed. The project rows' totals feed the eligible-expenditures section above automatically. The jurisdiction table is informational and does not affect the credit calculation.",
				},
			),
			section(
				"limit",
				"Expenditure limit",
				[
					f.money(
						"allocatedLimit",
						"This corporation's share of the group's expenditure limit",
						{
							description:
								"Leave blank to take the whole $4,000,000 limit — correct only when no other member is claiming.",
						},
					),
					f.money("recapture", "Recapture (line 132)", {
						description:
							"Where property funded by an earlier grant was sold or converted to commercial use this year.",
					}),
				],
				{ variant: "card", cols: 2 },
			),
			section(
				"group",
				"Associated group",
				[
					f.array("group", "Members (include this corporation)", [
						field.text("name", "Corporation name"),
						money("taxableCapital", "Taxable capital employed in Canada", {
							description:
								"Last taxation year ending in the preceding calendar year (federal Schedule 33, line 690).",
						}),
						money(
							"priorYear1",
							"Eligible Alberta SR&ED — first preceding taxation year",
						),
						money(
							"priorYear2",
							"Eligible Alberta SR&ED — second preceding taxation year",
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
						"Every member's taxable capital drives the grind that reduces the grant; every member's prior-two-years spending sets the base level below which only the 8% base rate applies (non-associated claims only — see the Agreement below for associated ones). Add just this corporation if it is not associated with anyone for IEG purposes.",
				},
			),
			section(
				"agreement",
				"Agreement Among Associated Corporations (Schedule 29, page 3)",
				[
					f.text(
						"agreementLongestYearCan",
						"Alberta CAN of the member with the longest taxation year (line 200)",
					),
					f.date(
						"agreementLongestYearBegin",
						"That member's tax year begin (line 202)",
					),
					f.date(
						"agreementLongestYearEnd",
						"That member's tax year end (line 204)",
					),
					f.money(
						"agreementDaysInLongestYear",
						"Days in that longest year (line 206)",
						{
							description: "Leave blank for a full, 365-day year.",
						},
					),
					f.array(
						"agreementMembers",
						"Agreement members — put the claiming corporation FIRST",
						[
							field.text("name", "Corporation name"),
							field.text("albertaCan", "Alberta CAN"),
							field.date(
								"currentTaxationYearEnd",
								"This member's tax year end",
							),
							money(
								"allocatedExpenditureLimit",
								"Allocated expenditure limit (line 240)",
							),
							money(
								"currentYearExpenditures",
								"Current-year eligible Alberta expenditures (line 245)",
							),
							money(
								"priorYear1",
								"First-preceding-year expenditures (line 250)",
							),
							money(
								"priorYear2",
								"Second-preceding-year expenditures (line 260)",
							),
							money(
								"taxableCapitalPriorYear",
								"Taxable capital, first preceding year (line 265)",
							),
							money("daysInTaxYear", "Days in this member's own tax year", {
								description: "Leave blank for a full, 365-day year.",
							}),
							field.radio(
								"hasAlbertaPermanentEstablishment",
								"Has a permanent establishment in Alberta",
								YES_NO,
								{
									description:
										"A member without one is not eligible for the IEG at all — its allocated allowed amount is nil even when its own figures would otherwise allow one. Leave blank only when genuinely unknown; it is then treated as No.",
								},
							),
						],
						// The 4 scalar fields above this array benefit from this section's
						// 2-column grid — fullWidth spans just the array across both
						// columns instead of squeezing it into one grid cell.
						{ fullWidth: true },
					),
				],
				{
					variant: "card",
					description:
						"Filing this agreement switches the enhanced-rate credit to the ASSOCIATED formula (line 125): 12% of the agreement's allocated allowed amount, in place of 12% of spending above base (line 112) — a different calculation, not a variant of it. Leave the member table empty for a non-associated claim, or for an associated group that has not filed an agreement.",
				},
			),
		],
	}),
});
