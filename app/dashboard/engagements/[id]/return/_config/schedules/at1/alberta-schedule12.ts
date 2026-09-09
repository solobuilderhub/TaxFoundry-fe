import {
	defineSchema,
	type FormSchema,
	section,
} from "@classytic/formkit/server";
import { createElement } from "react";
import type { AlbertaSchedule12Values } from "../../../_lib/return-input";
import { money } from "../../fields";
import { defineSchedule } from "../shared/define";
import { Schedule12View } from "./paper/schedule12-view";

/**
 * AT1 Schedule 12, Area B — the items the form asks the preparer to copy off
 * the federal T2.
 *
 * Almost all of Schedule 12 is DERIVED: the engine reconciles each Alberta
 * schedule against its federal counterpart and files the difference, so there
 * is nothing to type. These five are the exception. The form says so directly:
 *
 *   "If the opening balance or the claim for the current year for donations,
 *    gifts or losses are different for Alberta purposes than for federal
 *    purposes, complete the applicable Alberta schedule(s) and enter the
 *    amount from those schedule(s) below. **Otherwise, enter the amounts from
 *    the federal T2 for these items and any other applicable line items.**"
 *
 * Every one is marked mandatory in TRA spec §3.2.3.13, and none had anywhere
 * to live before this schema: this engine models no Alberta schedule for them
 * and computes no federal equivalent either, so they were absent from the
 * filed Schedule 12 entirely. That both breaks the specification's "all
 * mandatory Field IDs must be output" rule and understates the Area B
 * deduction total for any corporation that has one.
 *
 * ── Why these are asked rather than defaulted ───────────────────────────────
 *
 * §3.2.3 says a mandatory field "must default to zero" when its value cannot
 * be determined. That rule is about a value the software genuinely cannot
 * reach — not a licence to file zero for anything inconvenient. A zero nobody
 * was asked for is a different statement from a zero the preparer entered, and
 * only the second one is true. Asking makes the value determined, and then the
 * zero is honest.
 *
 * ── The Alberta column ──────────────────────────────────────────────────────
 *
 * Each item is one federal figure that Alberta takes as well, so only the
 * federal amount is required. The Alberta override beside it is for the case
 * where the corporation genuinely claims a different amount provincially —
 * left blank, Alberta follows federal. An explicit Alberta 0 against a
 * non-zero federal amount is a real divergence and IS filed as one.
 */

export const albertaSchedule12Schema: FormSchema = defineSchema({
	sections: [
		section(
			"area-b",
			"Area B — deductions taken from the federal T2",
			[
				money(
					"taxableDividendsDeductible",
					"Taxable dividends deductible under ITA section 112, 113 or 138(6) (line 061)",
					{
						description:
							"Federal T2 line 320. Leave blank if the corporation has none.",
					},
				),
				money(
					"albertaTaxableDividendsDeductible",
					"Alberta amount, if different (line 060)",
					{
						description:
							"Leave blank when Alberta claims the same amount as federal.",
					},
				),
				money(
					"centralCreditUnionAllocation",
					"Taxable capital gains or taxable dividends allocated from a central credit union (line 075)",
					{ description: "Federal T2 line 340." },
				),
				money(
					"albertaCentralCreditUnionAllocation",
					"Alberta amount, if different (line 074)",
					{
						description:
							"Leave blank when Alberta claims the same amount as federal.",
					},
				),
				money(
					"prospectorsShares",
					"Prospector's and grubstaker's shares (line 079)",
					{ description: "Federal T2 line 350." },
				),
				money(
					"albertaProspectorsShares",
					"Alberta amount, if different (line 078)",
					{
						description:
							"Leave blank when Alberta claims the same amount as federal.",
					},
				),
				money(
					"nonQualifiedSecuritiesDeduction",
					"Employer deduction for non-qualified securities (line 141)",
					{ description: "Federal T2 line 352." },
				),
				money(
					"albertaNonQualifiedSecuritiesDeduction",
					"Alberta amount, if different (line 140)",
					{
						description:
							"Leave blank when Alberta claims the same amount as federal.",
					},
				),
			],
			{
				variant: "card",
				description:
					"Deductions Alberta takes from the federal return rather than from an Alberta schedule. Enter the federal amount; the Alberta box beside it is only for a corporation that genuinely claims a different amount provincially. Leaving an item blank files nothing for it — it does not file a zero.",
			},
		),
		section(
			"additions",
			"Area B — additions",
			[
				money(
					"section110_5Additions",
					"ITA section 110.5 and/or subparagraph 115(1)(a)(vii) additions (line 083)",
					{
						description:
							"Federal T2 line 355. The printed Schedule 12 annotates this box “T2 line 335”, which is a typo on TRA’s form — line 335 is limited partnership losses, already this schedule’s 072/073 pair, and a deduction rather than an addition. The specification’s own rule for 083 says it must equal federal 200355.",
					},
				),
				money(
					"albertaSection110_5Additions",
					"Alberta amount, if different (line 082)",
					{
						description:
							"From AT1 Schedule 21, line 017. Leave blank when it equals the federal amount.",
					},
				),
			],
			{
				variant: "card",
				description:
					"The one Area B item that ADDS to taxable income rather than deducting from it. It also drives the floor on lines 090/091: where the deductions exhaust income, taxable income is reported as these additions rather than as a negative.",
			},
		),
	],
});

export const albertaSchedule12 = defineSchedule({
	key: "albertaSchedule12",
	num: "012",
	label: "Alberta Income/Loss Reconciliation (S12)",
	hint: "Area B items taken from the federal T2",
	programs: ["AT1"],
	formView: (props) => createElement(Schedule12View, props),
	schema: albertaSchedule12Schema,
});
