import {
	defineSchema,
	type FormSchema,
	field,
	section,
} from "@classytic/formkit/server";
import { createElement } from "react";
import type { AlbertaPoliticalContributions8Values } from "../../../_lib/return-input";
import { fieldsFor, money } from "../../fields";
import { defineSchedule } from "../shared/define";
import { Schedule8FormView } from "./paper/schedule8-form-view";

/**
 * AT1 Schedule 8 — Alberta Political Contributions Tax Credit.
 *
 * `ri.albertaPoliticalContributions8` — this exact shape, read directly by
 * `apps/server/src/engine/at1-schedule-composers/schedule-8-compose.ts`'s
 * `assembleSchedule8`. `AlbertaPoliticalContributions8Values` itself is now
 * generated from `apps/server/src/engine/contracts/at1-input.ts` — see
 * `_lib/return-input.ts`'s own header comment for why.
 *
 * TRA spec §3.2.3.9 (Chapter 3, lines 7252-7450) for the detail lines below;
 * §3.2.3.1 (the AT1 jacket, line 000074) for the tiered credit formula the
 * engine computes from them. See
 * `packages/ca-tax/src/t2/at1/schedules/schedule8-political-contributions.ts`
 * for the full derivation this schema mirrors field for field.
 *
 * Field labels below are the spec's own "Line Name" column text, verbatim —
 * not a paraphrase — for every field. `taxYearBegin`/`taxYearEnd` are the
 * one exception: they are NOT AT1 lines at all (see their own comment).
 */
const f = fieldsFor<AlbertaPoliticalContributions8Values>();

export const albertaSchedule8Schema: FormSchema = defineSchema({
	sections: [
		section(
			"contributions",
			"Political Contribution Details (line 002-008)",
			[
				f.array("contributions", "Contributions", [
					field.text(
						"name",
						"Name of Party, Constituency Association or Candidate (line 002)",
					),
					field.text("receiptNumber", "Official Receipt Number (line 004)"),
					field.date("dateOfDonation", "Date of Donation (line 006)"),
					money("amount", "Donation Amount (line 008)"),
				]),
			],
			{
				variant: "card",
				cols: 1,
				description:
					"One row per receipted contribution to a party, constituency association or candidate registered in Alberta. Retain the original receipts in case Treasury Board and Finance requests them.",
			},
		),
		section(
			"partnership",
			"Alberta Political Contributions (line 012-013)",
			[
				f.money(
					"partnershipContributionsTo2003",
					"Alberta political contributions from a partnership made in 2003 or earlier (line 012)",
					{ description: "From federal T5013 box 37. Leave blank if none." },
				),
				f.money(
					"partnershipContributionsFrom2004",
					"Alberta political contributions from a partnership made in 2004 or later (line 013)",
					{ description: "From federal T5013. Leave blank if none." },
				),
			],
			{ variant: "card", cols: 2 },
		),
		section(
			"straddle",
			"Straddling 2003/2004 tax year (rare)",
			[
				f.date("taxYearBegin", "This corporation's tax year begin date"),
				f.date("taxYearEnd", "This corporation's tax year end date"),
			],
			{
				variant: "card",
				cols: 2,
				description:
					"Not an AT1 line — only needed when contributions were made in BOTH 2003-or-earlier and 2004-or-later, AND this corporation's own tax year began in 2003 and ended in 2004 — a one-time rate-transition formula. Leave both blank otherwise; the credit is computed from the 2003-or-earlier or 2004-or-later rate table instead.",
			},
		),
	],
});

export const albertaPoliticalContributions8 = defineSchedule({
	key: "albertaPoliticalContributions8",
	num: "008",
	label: "Alberta Political Contributions Tax Credit (S8)",
	hint: "Receipted party/candidate contributions",
	programs: ["AT1"],
	formView: (props) => createElement(Schedule8FormView, props),
	schema: albertaSchedule8Schema,
});
