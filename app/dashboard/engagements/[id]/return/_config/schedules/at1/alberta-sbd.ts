import { defineSchema, field, section } from "@classytic/formkit/server";
import { createElement } from "react";
import type { AlbertaSbdValues } from "../../../_lib/return-input";
import { fieldsFor, money } from "../../fields";
import { CORPORATION_STATUS_OPTIONS, YES_NO } from "../../options";
import { defineSchedule } from "../shared/define";
import { Schedule1FormView } from "./paper/schedule1-form-view";

const AGREEMENT_DESCRIPTION =
	"Filed only when associated with one or more CCPCs (line 001, derived from the federal Schedule 23 group — see the SBD schedule's own \"Other associated CCPCs\" section). Put the corporation filing this return FIRST. The allocated amount must use the SAME percentage split as federal Schedule 23's own allocation.";

const f = fieldsFor<AlbertaSbdValues>();

/**
 * AT1 Schedule 1 — Alberta Small Business Deduction eligibility.
 *
 * Split out of the jacket schedule into its own nav entry: everything else
 * Schedule 1 needs (active business income, Alberta taxable income) is
 * already derived from the federal return and the allocation factor. These
 * three eligibility answers cannot be derived from anywhere else, and this
 * schedule exists so they have a proper "Schedule 01" entry in the nav
 * instead of being buried inside the jacket's own required-fields block.
 */
export const albertaSbd = defineSchedule({
	key: "albertaSbd",
	num: "001",
	label: "Small Business Deduction (S1)",
	hint: "Eligibility — the deduction itself is computed from federal figures",
	programs: ["AT1"],
	formView: (props) => createElement(Schedule1FormView, props),
	schema: defineSchema({
		sections: [
			section(
				"eligibility",
				"Eligibility",
				[
					field.select(
						"corporationStatus",
						"Corporation status",
						CORPORATION_STATUS_OPTIONS,
						{
							description:
								"Only the first two may claim the deduction at all; a section 149 exempt corporation is barred outright.",
						},
					),
					f.radio(
						"wasCcpcThroughoutYear",
						"Was CCPC status held THROUGHOUT the taxation year?",
						YES_NO,
						{
							description:
								"Only consulted when the status above is CCPC. A mid-year change bars the claim for the year.",
						},
					),
					money(
						"royaltyTaxDeduction",
						"Royalty Tax Deduction for the year (Schedule 5, line 021)",
						{
							description:
								"Oil & gas only. Leave blank if the corporation has none.",
						},
					),
				],
				{
					variant: "card",
					cols: 2,
					description:
						"Everything else Schedule 1 needs (active business income, Alberta taxable income) comes from the federal return and the allocation factor. These three cannot be derived from anywhere else.",
				},
			),
			section(
				"agreement",
				"Area A — Agreement Among Associated Corporations (line 041-045)",
				[
					f.array("associatedCorpAgreement", "Associated corporations", [
						field.text("name", "Corporation name (line 041)"),
						field.text("albertaCan", "Alberta CAN (line 043)"),
						money("allocatedAmount", "Allocated amount (line 045)"),
					]),
				],
				{ variant: "card", cols: 1, description: AGREEMENT_DESCRIPTION },
			),
		],
	}),
});
