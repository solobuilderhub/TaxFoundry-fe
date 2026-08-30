import { defineSchema, section } from "@classytic/formkit/server";
import { createElement } from "react";
import type { AlbertaContinuityValues } from "../../_lib/return-input";
import { fieldsFor } from "../fields";
import {
	LimitedPartnershipTable,
	NonCapitalVintageTable,
	OtherLossVintageTable,
} from "./alberta-loss-vintage-tables";
import { defineSchedule } from "./define";

const f = fieldsFor<AlbertaContinuityValues>();

/**
 * One pool's advanced adjustment fields — applied/expired default to
 * federal's own figure when left blank; wind-up transfer / s.80 adjustment /
 * other adjustments have no federal equivalent at all, so they default to
 * nil, not to a federal figure that doesn't exist.
 */
function poolAdjustmentFields(
	prefix: "nonCapital" | "capital" | "farm" | "restrictedFarm",
) {
	return [
		f.money(
			`${prefix}Applied` as keyof AlbertaContinuityValues,
			"Applied against income",
			{
				description: "Blank = same as federal",
			},
		),
		f.money(
			`${prefix}Expired` as keyof AlbertaContinuityValues,
			"Expired this year",
			{
				description: "Blank = same as federal",
			},
		),
		f.money(
			`${prefix}WindUpTransfer` as keyof AlbertaContinuityValues,
			"Transfer on wind-up or amalgamation",
			{ description: "No federal equivalent — blank = nil" },
		),
		f.money(
			`${prefix}Section80Adjustment` as keyof AlbertaContinuityValues,
			"ITA section 80 adjustment",
			{ description: "No federal equivalent — blank = nil" },
		),
		f.money(
			`${prefix}OtherAdjustments` as keyof AlbertaContinuityValues,
			"Other adjustments",
			{ description: "No federal equivalent — blank = nil" },
		),
	];
}

/**
 * AT1 Schedule 21 — Alberta's own loss-pool continuity.
 *
 * The current year's LOSS AMOUNT is derived from the federal return for
 * every pool except non-capital, which uses Schedule 12's own Alberta
 * reconciliation (the two can genuinely differ — CCA/reserve/disposition
 * claims that diverge from federal are exactly what Schedule 12 reconciles).
 * Applied-against-income and expired default to federal's own figure too,
 * but per the spec are overridable per pool when Alberta's actually differs
 * — see each pool's "advanced adjustments" section below. Wind-up transfer,
 * the s.80 adjustment and other adjustments have NO federal equivalent at
 * all, so those are plain Alberta-only entries, not overrides of anything.
 *
 * The OPENING balance can never be derived: it is Alberta's own
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
						"The current year's activity for these four pools is derived from the federal return by default. Only the balance carried forward from Alberta's own prior filing has to be entered here — leave the advanced adjustment sections below blank unless Alberta genuinely diverges from federal.",
				},
			),
			section(
				"nonCapitalAdjustments",
				"Non-capital losses — advanced adjustments (line 037-047)",
				poolAdjustmentFields("nonCapital"),
				{ variant: "card", cols: 2 },
			),
			section(
				"capitalAdjustments",
				"Net-capital losses — advanced adjustments (line 057-067)",
				poolAdjustmentFields("capital"),
				{ variant: "card", cols: 2 },
			),
			section(
				"farmAdjustments",
				"Farm losses — advanced adjustments (line 077-085)",
				poolAdjustmentFields("farm"),
				{ variant: "card", cols: 2 },
			),
			section(
				"restrictedFarmAdjustments",
				"Restricted farm losses — advanced adjustments (line 097-105)",
				poolAdjustmentFields("restrictedFarm"),
				{ variant: "card", cols: 2 },
			),
			section(
				"lpp",
				"Listed personal property (line 111)",
				[
					f.money("lppOpening", "Opening balance"),
					f.money("lppCurrentYearLoss", "Loss created this year"),
					f.money("lppApplied", "Applied against LPP gains this year"),
					f.money("lppExpired", "Expired this year"),
					f.money("lppOtherAdjustments", "Other adjustments"),
				],
				{
					variant: "card",
					cols: 2,
					description:
						"Listed personal property has no federal equivalent at all — the whole continuity is Alberta-only, not just the opening balance.",
				},
			),
			section(
				"limitedPartnerships",
				"Continuity of limited partnership losses (line 131-141)",
				[
					f.custom("limitedPartnerships", "Limited partnerships", (props) =>
						createElement(LimitedPartnershipTable, props),
					),
				],
				{
					variant: "card",
					// A card section's fields sit in a 2-column grid by default (see
					// fluid's `FormGrid`) — `cols: 1` here so the table below gets the
					// card's FULL width instead of being squeezed into one grid cell.
					cols: 1,
					description:
						"A SIXTH pool, laid out per partnership rather than by jurisdiction — the live form's own section, separate from the five pools above. Leave empty if the corporation has no limited partnership loss interests.",
				},
			),
			section(
				"nonCapitalVintages",
				"Non-capital losses by year of origin (line 151-169)",
				[
					f.custom(
						"nonCapitalVintages",
						"Non-capital losses by year of origin",
						(props) => createElement(NonCapitalVintageTable, props),
					),
				],
				{
					variant: "card",
					cols: 1,
					description:
						"The SEVENTH section — the non-capital loss pool broken out by the taxation year each vintage arose in. The current year's row is derived automatically from figures entered above; only prior vintages (1st through 20th preceding year) are entered here.",
				},
			),
			section(
				"otherLossVintages",
				"Farm, restricted farm & listed personal property losses by year of origin (line 181-187)",
				[
					f.custom("otherLossVintages", "Losses by year of origin", (props) =>
						createElement(OtherLossVintageTable, props),
					),
				],
				{
					variant: "card",
					cols: 1,
					description:
						"The EIGHTH section — farm, restricted farm and listed personal property losses broken out by year of origin (current year through the 20th preceding year). Listed personal property losses expire after 7 years, so that column is disabled beyond the 7th preceding year.",
				},
			),
		],
	}),
});
