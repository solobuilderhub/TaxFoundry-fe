import {
	defineSchema,
	type FormSchema,
	field,
	section,
} from "@classytic/formkit/server";
import { createElement } from "react";
import type { AlbertaSchedule18Values } from "../../../_lib/return-input";
import { fieldsFor, money } from "../../fields";
import { DISPOSITION_CATEGORY_OPTIONS, YES_NO } from "../../options";
import { defineSchedule } from "../shared/define";
import { Schedule18View } from "./paper/schedule18-view";

/**
 * AT1 Schedule 18, the Allowable Business Investment Loss section — the one
 * part of the schedule that has NO federal counterpart in this engine and
 * therefore no other place to be entered.
 *
 * Every other part of Schedule 18 (the six ordinary disposition categories —
 * shares, real estate, bonds, other properties, personal-use property, listed
 * personal property) is built from the SAME rows the federal Capital Gains
 * (S6) schedule already collects, tagged with a category so nothing is typed
 * twice — see `assemble-at1-schedules.ts`'s `scheduleEighteen`.
 *
 * ABIL cannot follow that path. §3.2.3.19's own model comment says so
 * directly: this engine has no federal ABIL schedule at all, and the row
 * shape here — a small business corporation's name, whether the disposition
 * was of shares or debt, and its acquisition date — is not one of the six
 * disposition categories to begin with. Before this schema existed, an
 * allowable business investment loss (ITA s.39(1)(c), deductible against ANY
 * income rather than only capital gains) had no field to be entered in at
 * all: `AlbertaSchedule18Input.abilEntries` was real, tested engine code that
 * nothing in the return editor could ever reach.
 *
 * 018094 (the allowable business investment loss, at the inclusion rate) is
 * NOT entered here — it is computed from these rows.
 */
const f = fieldsFor<AlbertaSchedule18Values>();

export const albertaSchedule18Schema: FormSchema = defineSchema({
	sections: [
		section(
			"election",
			"Transfer election (line 001)",
			[
				f.radio(
					"electingPropertyTransfer",
					"Is the corporation electing to transfer property as stated under ACTA section 14.1(3), 14.2(3) or 16.1(3)?",
					YES_NO,
					{
						description:
							'Leave blank for No. This is the one AT1 yes/no where blank is safe: §3.2.3.19 supplies the default itself ("Otherwise, default to 2 (No)"), unlike the jacket questions where an unanswered box would answer for the corporation. Answering Yes also requires form AT107, AT108 or AT109 to be filed with the return — this product does not produce it, and the review will say so.',
					},
				),
			],
			{
				variant: "card",
				cols: 1,
				description:
					"Mandatory on the wire, and absent from every Schedule 18 this product filed until now.",
			},
		),
		section(
			"categories",
			"Alberta category overrides (lines 002-032)",
			[
				f.array("albertaCategories", "Categories that diverge from federal", [
					field.select("category", "Category", DISPOSITION_CATEGORY_OPTIONS, {
						placeholder: "Select a category",
						description:
							"Pairs this row to the federal total for the same category.",
					}),
					money("proceeds", "Alberta proceeds of disposition (lines 002-012)", {
						description: "Blank = the federal total.",
					}),
					money("acb", "Alberta adjusted cost base (lines 022-032)", {
						description:
							"Signed — a negative adjusted cost base is possible. Blank = the federal total.",
					}),
				]),
			],
			{
				variant: "card",
				cols: 1,
				description:
					"Add a row ONLY for a category whose Alberta figures differ from the federal dispositions already entered on Capital Gains (S6) — anything omitted takes the federal total. Outlays and expenses are not here: the schedule states they always equal the federal figure.",
			},
		),
		section(
			"adjustments",
			"Adjustments (lines 060-078)",
			[
				money(
					"unappliedLppLosses",
					"Unapplied listed-personal-property losses from other years (line 060)",
					{
						description:
							"Capped by the schedule at the listed-personal-property gain, so an over-large figure cannot shelter ordinary gains.",
					},
				),
				money("capitalGainsDividends", "Capital gains dividends (line 064)", {
					description: "Federal line 006875.",
				}),
				money(
					"gainOnDonatedSecurities",
					"Gain on donation of listed securities (line 071)",
					{ description: "Federal line 006895." },
				),
				money(
					"gainOnDonatedEcologicalLand",
					"Gain on donation of ecologically sensitive land (line 073)",
					{ description: "Federal line 006896." },
				),
				money(
					"exemptionThreshold",
					"Exemption threshold at time of disposal (line 077)",
					{ description: "Federal line 006897." },
				),
				money(
					"capitalGainsFromActualProperty",
					"Capital gains from disposition of actual property (line 078)",
					{ description: "Federal line 006898." },
				),
			],
			{ cols: 2 },
		),
		section(
			"reserves",
			"Capital gain reserves (lines 066, 068)",
			[
				money("federalReserveOpening", "Federal opening balance (line 066)", {
					description: "Federal line 006880.",
				}),
				money("federalReserveClosing", "Federal closing balance (line 068)", {
					description: "Federal line 006885.",
				}),
				money("albertaReserveOpening", "Alberta opening balance (line 066)", {
					description: "Enter only when it differs from the federal figure.",
				}),
				money("albertaReserveClosing", "Alberta closing balance (line 068)", {
					description: "Enter only when it differs from the federal figure.",
				}),
			],
			{ cols: 2 },
		),
		section(
			"abil",
			"Allowable business investment loss (line 082-094)",
			[
				f.array(
					"abilEntries",
					"Small business corporations disposed of at a loss",
					[
						field.text("name", "Name of small business corporation (line 082)"),
						field.select("kind", "Shares or debt (line 084)", [
							{ label: "Shares", value: "shares" },
							{ label: "Debt", value: "debt" },
						]),
						field.date("dateOfAcquisition", "Date of acquisition (line 086)"),
						money("proceeds", "A — Proceeds of disposition (line 088)"),
						money("acb", "B — Adjusted cost base (line 090)"),
						money(
							"outlays",
							"C — Outlays and expenses, re dispositions (line 092)",
						),
					],
				),
			],
			{
				variant: "card",
				cols: 1,
				description:
					"One row per small business corporation. The allowable business investment loss (line 094, total of column D × the inclusion rate) is computed from these rows, not entered directly. Unlike an ordinary capital loss, an ABIL is deductible against any income.",
			},
		),
		section(
			"section342",
			"Section 34.2 of the federal Act (lines 096, 098)",
			[
				money(
					"section342TaxableCapitalGains",
					"Taxable capital gains under s.34.2 (line 096)",
					{
						description:
							"Federal Schedule 73 line 275, AS FILED. It is already at the ½ inclusion rate and this form grosses it back up (line 275 × 2) — entering a pre-doubled figure would count it twice.",
					},
				),
				money(
					"section342AllowableCapitalLosses",
					"Allowable capital losses under s.34.2 (line 098)",
					{
						description:
							"Federal Schedule 73 line 285, as filed. Same treatment as line 096 — the form doubles it.",
					},
				),
			],
			{ cols: 2 },
		),
	],
});

export const albertaSchedule18Abil = defineSchedule({
	key: "albertaSchedule18",
	num: "018",
	label: "Alberta Dispositions of Capital Property (S18)",
	hint: "ABIL entries, Alberta category overrides, reserves and the s.34.2 figures; category totals default to federal Capital Gains (S6)",
	programs: ["AT1"],
	// Form View shows the WHOLE schedule as TRA prints it, not just the ABIL
	// rows this schema edits: the six-category grid and its adjustments come
	// from the federal dispositions already entered on S6, and a preparer
	// checking Schedule 18 before filing needs to see all of it.
	formView: (props) => createElement(Schedule18View, props),
	schema: albertaSchedule18Schema,
});
