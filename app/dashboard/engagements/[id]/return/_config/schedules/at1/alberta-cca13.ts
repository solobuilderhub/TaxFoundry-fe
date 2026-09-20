import { defineSchema, field, section } from "@classytic/formkit/server";
import { createElement } from "react";
import type { AlbertaCca13Values } from "../../../_lib/return-input";
import { fieldsFor, money } from "../../fields";
import { CCA_CLASS_OPTIONS } from "../../options";
import { defineSchedule } from "../shared/define";
import { Schedule13FormView } from "./paper/schedule13-form-view";

const f = fieldsFor<AlbertaCca13Values>();

/**
 * AT1 Schedule 13 — Alberta Capital Cost Allowance.
 *
 * Alberta permits a different discretionary CCA claim from federal: a
 * corporation may claim a class federally and not provincially, or the
 * reverse. The opening UCC and the claim are what make the form REQUIRED —
 * §3.2.3.14 triggers on exactly those two, "if the opening UCC balance of any
 * asset or the CCA claim for any asset for Alberta purposes differs from that
 * for federal purposes" — but they are not the only columns that may diverge.
 * The specification gives acquisitions (005), net adjustments (007),
 * dispositions (009), the DIEP figures (039/045) and the AIIP designation
 * (029) the same "enter the Alberta amount, otherwise take the federal one"
 * rule, and all of them are collected below.
 *
 * ── Why this is its own schedule now ────────────────────────────────────────
 *
 * These two figures used to be extra fields on the FEDERAL CCA class
 * (`cca.classes[].albertaOpeningUCC` / `.albertaClaim`). One `ReturnInput` key
 * held both jurisdictions' forms, and the registry pins one nav entry per key
 * — so Alberta Schedule 13 could only ever be a second grid inside federal
 * Schedule 8's entry, invisible under the "AT1 only" filter and reachable only
 * by someone who already knew it was there.
 *
 * Rows pair back to the federal classes BY `ccaClass`, the class number, which
 * is the class's identity on both returns — never by position, so the two
 * lists can differ in length and order.
 *
 * Every row is an OVERRIDE: omit a class and Alberta takes the federal figure.
 * An explicit 0 is a real answer ("claim nothing for Alberta"), not a blank.
 *
 * TRA forbids the schedule outright unless jacket line 000060 or 000061 says
 * the return diverges — entering figures here is not enough on its own.
 */
export const albertaCca13 = defineSchedule({
	key: "albertaCca13",
	num: "013",
	label: "Alberta Capital Cost Allowance (S13)",
	hint: "Per-class overrides where Alberta's CCA figures differ from federal, plus the immediate expensing limit",
	programs: ["AT1"],
	formView: (props) => createElement(Schedule13FormView, props),
	schema: defineSchema({
		sections: [
			section(
				"limit",
				"Immediate expensing limit (line 125)",
				[
					f.money("immediateExpensingLimit", "Immediate expensing limit", {
						description:
							"Per RETURN, not per class. Relevant only where the corporation is associated with one or more eligible persons or partnerships (EPOPs) — leave blank when it is not.",
					}),
				],
				{
					cols: 1,
					description:
						"Sits above the class grid on the printed form, and applies to the return as a whole.",
				},
			),
			section(
				"classes",
				"Alberta CCA by class (lines 003-029)",
				[
					f.array("classes", "Classes that diverge", [
						field.select("ccaClass", "Class", CCA_CLASS_OPTIONS, {
							placeholder: "Select a CCA class",
							description:
								"Pairs this row to the federal class of the same number.",
						}),
						money("openingUCC", "Alberta opening UCC (line 003)", {
							description: "Blank = the same as federal.",
						}),
						money("additions", "Cost of acquisitions (line 005)", {
							description: "Blank = the same as federal.",
						}),
						money("netAdjustments", "Net adjustments (line 007)", {
							description:
								"Signed — a negative is entered with a minus sign and prints in brackets. Blank = the same as federal.",
						}),
						money("dispositions", "Proceeds of dispositions (line 009)", {
							description:
								"Cannot exceed the asset's original capital cost. Blank = the same as federal.",
						}),
						money(
							"immediateExpensing",
							"Immediate expensing / DIEP (lines 039, 045)",
							{
								description:
									"One figure drives both printed columns — the designated property and the resulting claim. Blank = the same as federal.",
							},
						),
						field.switch("aiip", "AIIP or class 54-56 acquisitions (line 029)"),
						money("claim", "Alberta CCA claim (line 019)", {
							description:
								"Blank = the same as federal; an explicit 0 claims nothing for Alberta, which is a real answer.",
						}),
						field.switch(
							"classEmptied",
							"Class emptied — no assets left (drives line 017)",
						),
					]),
				],
				{
					variant: "card",
					cols: 1,
					description:
						"Add a row only for a class whose Alberta figures DIFFER from federal — anything omitted takes the federal figure. The remaining printed columns are computed from these or taken from federal; see Form View for the whole grid.",
				},
			),
		],
	}),
});
