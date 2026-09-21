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
						money(
							"diepAcquisitions",
							"Of which designated immediate expensing property (line 039)",
							{
								description:
									"A subset of line 005, not an addition to it. Blank = the same as federal.",
							},
						),
						money("netAdjustments", "Net adjustments (line 007)", {
							description:
								"Signed — a negative is entered with a minus sign and prints in brackets. Blank = the same as federal.",
						}),
						money(
							"assistanceReceived",
							"Of which assistance received after disposition (line 031)",
							{
								description:
									"A BREAKDOWN of line 007, not a further movement of the pool — enter the net adjustment at 007 as well. Shown separately because the AIIP arithmetic needs it broken out.",
							},
						),
						money(
							"assistanceRepaid",
							"Of which assistance repaid after disposition (line 033)",
							{
								description: "Also a breakdown of line 007, on the same terms.",
							},
						),
						money("dispositions", "Proceeds of dispositions (line 009)", {
							description:
								"Cannot exceed the asset's original capital cost. Blank = the same as federal.",
						}),
						money(
							"diepProceeds",
							"Of which proceeds of disposition of the DIEP (line 041)",
							{
								description:
									"A subset of line 009. Blank = the same as federal.",
							},
						),
						money("diepUcc", "UCC of the DIEP (line 043)", {
							description: "Blank = the same as federal.",
						}),
						money("immediateExpensing", "Immediate expensing (line 045)", {
							description:
								"The amount actually claimed at 100%. Capped at the pool. Blank = the same as federal.",
						}),
						money(
							"aiipAcquisitions",
							"Of which AIIP or class 54-56 acquisitions (line 029)",
							{
								description:
									"A dollar amount, so a class whose acquisitions are only PARTLY accelerated is stated exactly. Blank = the same as federal.",
							},
						),
						field.number("rate", "CCA rate % (line 013)", {
							description:
								"A PERCENT, as the form prints it — enter 20 for 20%, 10.5 for 10.5%. Blank takes the class's statutory rate; enter one only where the rate is elective.",
						}),
						money("claim", "Alberta CCA claim (line 019)", {
							description:
								"Blank claims the maximum the grid allows; an explicit 0 claims nothing for Alberta, which is a real answer. A claim above the maximum is refused rather than quietly reduced.",
						}),
						field.switch(
							"classEmptied",
							"Class emptied — no assets left at year-end",
						),
					]),
				],
				{
					variant: "card",
					cols: 1,
					description:
						"Add a row only for a class whose Alberta figures DIFFER from federal — anything omitted takes the federal figure. Terminal loss (017) is not entered: it is the residual balance of an emptied class, so the switch above is what states it and the amount is computed. The remaining printed columns are arithmetic on these; see Form View for the whole grid.",
				},
			),
			section(
				"class13",
				"Class 13 — leasehold interests",
				[
					f.money("class13OpeningUCC", "Opening UCC", {
						description:
							"Needed only when the T2 was prepared elsewhere — blank takes the federal figure.",
					}),
					f.money("class13Claim", "Alberta claim", {
						description:
							"Blank = the same as the federal claim, or the computed maximum where there is no federal Schedule 8.",
					}),
					f.array("class13Layers", "Leasehold layers added this year", [
						field.text("description", "Description"),
						money("capitalCost", "Capital cost"),
						field.date("leaseEnd", "Lease end date", {
							description:
								"The 12-month period count the calculation needs is derived from this and the tax year start — it is not typed in.",
						}),
						field.date("firstRenewalEnd", "First renewal end date", {
							description:
								"Where the lease grants renewal rights. Replaces the lease end date for the period count.",
						}),
						money("claimedToDate", "CCA already claimed in prior years"),
						money("proceeds", "Disposition proceeds for this layer"),
						field.switch("isFirstYear", "This is the layer's first tax year"),
						field.switch("aiip", "Accelerated investment incentive property"),
					]),
				],
				{
					variant: "card",
					cols: 2,
					description:
						"Straight-line, so class 13 is not a row of the grid above — no rate, no half-year rule, no AIIP uplift, no immediate expensing. Alberta cannot lease a different term on the same property, so the layers are shared with federal; enter them here only when there is no federal Schedule 8 to read them from.",
				},
			),
			section(
				"class14",
				"Class 14 — limited-life intangibles",
				[
					f.money("class14OpeningUCC", "Opening UCC", {
						description:
							"Needed only when the T2 was prepared elsewhere — blank takes the federal figure.",
					}),
					f.money("class14Claim", "Alberta claim", {
						description:
							"Blank = the same as the federal claim, or the computed maximum where there is no federal Schedule 8.",
					}),
					f.array("class14Properties", "Properties added this year", [
						field.text("description", "Description"),
						money("capitalCost", "Capital cost"),
						field.number(
							"lifeDaysAtAcquisition",
							"Days of life remaining at acquisition",
							{
								description:
									"Days the property had REMAINING when the cost was incurred — not its total life, and not the days left today.",
							},
						),
					]),
				],
				{
					variant: "card",
					cols: 2,
					description:
						"Also straight-line, and prorated per property by the life it had left when acquired.",
				},
			),
		],
	}),
});
