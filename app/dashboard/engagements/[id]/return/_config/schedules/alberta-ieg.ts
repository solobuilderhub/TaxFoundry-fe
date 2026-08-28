import { defineSchema, field, section } from "@classytic/formkit/server";
import type { AlbertaIegValues } from "../../_lib/return-input";
import { fieldsFor, money } from "../fields";
import { defineSchedule } from "./define";

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
	hint: "Alberta SR&ED grant — associated-group figures",
	programs: ["AT1"],
	schema: defineSchema({
		sections: [
			section(
				"expenditures",
				"Eligible expenditures",
				[
					f.money(
						"eligibleExpenditures",
						"Current-year eligible SR&ED carried out in Alberta (line 031)",
					),
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
					description:
						"Every member's taxable capital drives the grind that reduces the grant; every member's prior-two-years spending sets the base level below which only the 8% base rate applies. Add just this corporation if it is not associated with anyone for IEG purposes.",
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
					f.date("agreementLongestYearBegin", "That member's tax year begin (line 202)"),
					f.date("agreementLongestYearEnd", "That member's tax year end (line 204)"),
					f.money("agreementDaysInLongestYear", "Days in that longest year (line 206)", {
						description: "Leave blank for a full, 365-day year.",
					}),
					f.array(
						"agreementMembers",
						"Agreement members — put the claiming corporation FIRST",
						[
							field.text("name", "Corporation name"),
							field.text("albertaCan", "Alberta CAN"),
							field.date("currentTaxationYearEnd", "This member's tax year end"),
							money("allocatedExpenditureLimit", "Allocated expenditure limit (line 240)"),
							money(
								"currentYearExpenditures",
								"Current-year eligible Alberta expenditures (line 245)",
							),
							money("priorYear1", "First-preceding-year expenditures (line 250)"),
							money("priorYear2", "Second-preceding-year expenditures (line 260)"),
							money(
								"taxableCapitalPriorYear",
								"Taxable capital, first preceding year (line 265)",
							),
							money("daysInTaxYear", "Days in this member's own tax year", {
								description: "Leave blank for a full, 365-day year.",
							}),
						],
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
