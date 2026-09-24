import { defineSchema, field, section } from "@classytic/formkit/server";
import { createElement } from "react";
import type { AlbertaSbdValues } from "../../../_lib/return-input";
import { fieldsFor, money } from "../../fields";
import { defineSchedule } from "../shared/define";
import { Schedule1FormView } from "./paper/schedule1-form-view";

const AGREEMENT_DESCRIPTION =
	"Filed only when associated with one or more CCPCs (line 001, derived from the federal Schedule 23 group — see the SBD schedule's own \"Other associated CCPCs\" section). Put the corporation filing this return FIRST. The allocated amount must use the SAME percentage split as federal Schedule 23's own allocation.";

const f = fieldsFor<AlbertaSbdValues>();

/**
 * AT1 Schedule 1 — Alberta Small Business Deduction.
 *
 * Who may claim it is NOT asked here: TRA decides it from the jacket (029 type
 * of corporation, 030 special status — §3.2.3.2), and the server reads it from
 * there (`albertaSbdEligibility`). A separate "corporation status" question
 * used to live here, in the guided view only; Form View never showed it, so
 * Schedule 1 was never filed from there.
 */
export const albertaSbd = defineSchedule({
	key: "albertaSbd",
	num: "001",
	label: "Small Business Deduction (S1)",
	hint: "Computed from line 003, the jacket's 062 and the business limit",
	programs: ["AT1"],
	formView: (props) => createElement(Schedule1FormView, props),
	// Every field is editable on the form itself — the printed form is the only view.
	formOnly: true,
	schema: defineSchema({
		sections: [
			section(
				"eligibility",
				"Royalty tax deduction",
				[
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
						"Eligibility comes from the AT1 Jacket's line 029 (type of corporation) and 030 (special status), as TRA defines it.",
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
