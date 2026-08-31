import { defineSchema, field, section } from "@classytic/formkit/server";
import { createElement } from "react";
import type { AlbertaRoyaltyCredit6Values } from "../../../_lib/return-input";
import { fieldsFor, money } from "../../fields";
import { YES_NO } from "../../options";
import { defineSchedule } from "../shared/define";
import { Schedule6FormView } from "./paper/schedule6-form-view";

/**
 * AT1 Schedule 6 — Alberta Royalty Tax Credit.
 *
 * TRA spec §3.2.3.7 (Chapter 3, lines 6292-6653). See
 * `packages/ca-tax/src/t2/at1/schedules/schedule6-royalty-tax-credit.ts` for
 * the full derivation this schema mirrors field for field. Required whenever
 * the corporation incurred Alberta Crown Royalty under a petroleum / natural
 * gas lease or licence, and — per the spec — Schedule 7 (below) must be
 * completed FIRST or the credit entitlement is disallowed outright.
 *
 * ── This schedule has no credit dollar amount to compute — by design ────────
 *
 * Confirmed against the AT1 jacket's own balance-owing formula (spec
 * §3.2.3.1): `090 = 080 − (081+082+085+086+087)` never references a Schedule
 * 6 total the way it references Schedule 9's SR&ED credit (081) or Schedule
 * 8's political credit (074). The Alberta Royalty Tax Credit is administered
 * as an INSTALMENT PROGRAM — TRA pays/credits instalments during the year
 * based on estimated entitlement, and the corporation just reports what it
 * received at AT1 jacket line 000082 ("Instalments and other payments and
 * ARTC instalments" — see the "Payments & Instalments" schedule). Schedule
 * 6/7 exist to establish the royalty amount, shelter and rate TRA uses for
 * that determination, not to produce a number this return deducts.
 *
 * ── Two mutually exclusive shelter paths ─────────────────────────────────────
 *
 * "Is the corporation associated..." (006002) gates which of the two sections
 * below applies: NOT associated uses only `taxationYearDays`; associated
 * requires both "Aggregate of the Crown Royalty Shelter" (ACRS) and
 * "Allocation of the Aggregate of the Crown Royalty Shelter" (AACRS), with
 * the FIRST allocation row expected to be this filing corporation.
 *
 * `AlbertaRoyaltyCredit6Values` itself is now generated from
 * `apps/server/src/engine/contracts/at1-input.ts` — see
 * `_lib/return-input.ts`'s own header comment for why.
 */
const f = fieldsFor<AlbertaRoyaltyCredit6Values>();

export const albertaRoyaltyCredit6Schema = defineSchema({
	sections: [
		section(
			"association",
			"Alberta Royalty Tax Credit (line 002-004)",
			[
				f.radio(
					"associatedWithCrownRoyaltyCorporations",
					"Is the corporation associated with one or more corporations that have incurred Alberta Crown Royalty in the year? (line 002)",
					YES_NO,
					{
						description:
							"Leave unanswered only if genuinely unknown — it then reads as No, same as the AT1 jacket's own default.",
					},
				),
				f.money(
					"albertaCrownRoyaltyIncurred",
					"Alberta Crown Royalty incurred in the taxation year (line 004)",
					{
						description:
							"= Schedule 7, line 003 + Σ line 077 − Σ line 087 + Σ line 089. Enter the figure from Schedule 7 below.",
					},
				),
				f.money(
					"taxationYearDays",
					"Days in this corporation's own taxation year",
					{
						description:
							"Used only when NOT associated (line 002 = No). Blank = a full 365-day year.",
					},
				),
			],
			{
				variant: "card",
				cols: 2,
				description:
					"Required whenever the corporation incurred Alberta Crown Royalty under a petroleum, natural gas, or petroleum-and-natural-gas lease or licence. Schedule 7 (Royalty Tax Credit/Deduction Supplemental Information) must be completed and filed alongside this schedule or the credit entitlement is disallowed.",
			},
		),
		section(
			"acrs",
			"Aggregate of the Crown Royalty Shelter (line 022-028)",
			[
				f.text(
					"longestAssociatedYearCan",
					"The Corporate Account Number of the associated corporation with the longest taxation year (line 022)",
				),
				f.date(
					"longestAssociatedYearBeginning",
					"Taxation Year Beginning (line 024)",
				),
				f.date(
					"longestAssociatedYearEnding",
					"Taxation Year Ending (line 026)",
				),
				f.money(
					"longestAssociatedYearDays",
					"Number of days in the longest year (line 028)",
					{
						description: "Blank = a full 365-day year. Capped at 365.",
					},
				),
			],
			{
				variant: "card",
				cols: 2,
				description:
					"Complete only when associated (line 002 = Yes). Identifies the associated corporation whose taxation year is longest — the $2,000,000 shelter pool below is prorated by ITS days, not this filer's own.",
			},
		),
		section(
			"aacrs",
			"Allocation of the Aggregate of the Crown Royalty Shelter (line 030-034)",
			[
				f.array(
					"allocations",
					"Allocation of the Aggregate of the Crown Royalty Shelter",
					[
						field.text("name", "Name of Corporation (line 030)"),
						field.text(
							"albertaCan",
							"Alberta Corporate Account Number (line 032)",
						),
						money(
							"allocatedAmount",
							"Allocated Amount. Enter the amount allocated to the corporation on line 006 on the reverse. (line 034)",
						),
					],
				),
			],
			{
				variant: "card",
				cols: 1,
				description:
					"Complete only when associated (line 002 = Yes). Put THIS filing corporation FIRST — its own allocation becomes line 006 (Crown Royalty Shelter) directly. Each row, and the total, is capped at $2,000,000 × (days in the longest associated year ÷ 365).",
			},
		),
		section(
			"rate",
			"Weighted Average Rate (line 008)",
			[
				f.array("quarters", "Calendar quarters the taxation year spans", [
					field.number(
						"days",
						"Days in the taxation year that fall within this calendar quarter",
					),
					field.number(
						"rate",
						"Published RTC quarterly rate for this quarter",
						{
							description:
								"Enter as a decimal to 4 places, e.g. .0473 — not a percentage.",
						},
					),
				]),
			],
			{
				variant: "card",
				cols: 1,
				description:
					"One row per calendar quarter the taxation year spans. The engine weights each quarter's rate by its share of the taxation year. Rates are published by Alberta Treasury Board and Finance (finance.alberta.ca/publications/tax_rebates/rates/rtc1.html) — this form does not look them up.",
			},
		),
	],
});

export const albertaRoyaltyCredit6 = defineSchedule({
	key: "albertaRoyaltyCredit6",
	num: "006",
	label: "Alberta Royalty Tax Credit (S6)",
	hint: "Royalty amount, shelter & rate — ARTC is paid as instalments, not claimed here",
	programs: ["AT1"],
	formView: (props) => createElement(Schedule6FormView, props),
	schema: albertaRoyaltyCredit6Schema,
});
