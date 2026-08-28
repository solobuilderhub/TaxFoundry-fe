import { defineSchema, section } from "@classytic/formkit/server";
import type { AlbertaContinuityValues } from "../../_lib/return-input";
import { fieldsFor } from "../fields";
import { defineSchedule } from "./define";

const f = fieldsFor<AlbertaContinuityValues>();

/**
 * AT1 Schedule 21 — Alberta's own loss-pool continuity.
 *
 * Everything ELSE Schedule 21 needs — this year's loss, what was applied,
 * what expired — is derived from the federal return (Schedule 12's Alberta
 * net income drives the current-year figure; the federal Schedule 4 result
 * supplies the rest). The OPENING balance cannot be: it is Alberta's own
 * carried-forward balance from a prior AT1 filing, and federal has no
 * equivalent concept to default it from.
 *
 * Blank is not the same as zero. A corporation's first AT1 filing with real
 * supporting schedules genuinely has no Alberta loss history yet — that has
 * to be stated by leaving these blank, not assumed by defaulting to nil or to
 * the federal opening balance.
 */
export const albertaContinuity = defineSchedule({
	key: "albertaContinuity",
	num: "021",
	label: "Alberta Loss Continuity (S21)",
	hint: "Opening balances — cannot be derived from federal",
	programs: ["AT1"],
	schema: defineSchema({
		sections: [
			section(
				"openings",
				"Opening balances",
				[
					f.money(
						"nonCapitalOpening",
						"Non-capital loss pool, opening balance (line 031)",
					),
					f.money(
						"capitalOpening",
						"Net-capital loss pool, opening balance (line 051)",
					),
					f.money("farmOpening", "Farm loss pool, opening balance (line 071)"),
					f.money(
						"restrictedFarmOpening",
						"Restricted farm loss pool, opening balance (line 091)",
					),
				],
				{
					variant: "card",
					cols: 2,
					description:
						"The current year's activity for these four pools is derived from the federal return. Only the balance carried forward from Alberta's own prior filing has to be entered here.",
				},
			),
			section(
				"lpp",
				"Listed personal property (line 111)",
				[
					f.money("lppOpening", "Opening balance"),
					f.money("lppCurrentYearLoss", "Loss created this year"),
					f.money("lppApplied", "Applied against LPP gains this year"),
					f.money("lppExpired", "Expired this year"),
				],
				{
					variant: "card",
					cols: 2,
					description:
						"Listed personal property has no federal equivalent at all — the whole continuity is Alberta-only, not just the opening balance.",
				},
			),
		],
	}),
});
