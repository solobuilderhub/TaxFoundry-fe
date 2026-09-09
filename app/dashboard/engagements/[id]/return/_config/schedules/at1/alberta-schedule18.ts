import {
	defineSchema,
	type FormSchema,
	field,
	section,
} from "@classytic/formkit/server";
import { createElement } from "react";
import type { AlbertaSchedule18Values } from "../../../_lib/return-input";
import { fieldsFor, money } from "../../fields";
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
	],
});

export const albertaSchedule18Abil = defineSchedule({
	key: "albertaSchedule18",
	num: "018",
	label: "Alberta Dispositions of Capital Property (S18)",
	hint: "ABIL entries — the rest of the schedule comes from federal Capital Gains (S6)",
	programs: ["AT1"],
	// Form View shows the WHOLE schedule as TRA prints it, not just the ABIL
	// rows this schema edits: the six-category grid and its adjustments come
	// from the federal dispositions already entered on S6, and a preparer
	// checking Schedule 18 before filing needs to see all of it.
	formView: (props) => createElement(Schedule18View, props),
	schema: albertaSchedule18Schema,
});
