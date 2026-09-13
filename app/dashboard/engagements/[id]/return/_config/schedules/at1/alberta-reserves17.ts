import { defineSchema, field, section } from "@classytic/formkit/server";
import { createElement } from "react";
import type { AlbertaReserves17Values } from "../../../_lib/return-input";
import { fieldsFor, money } from "../../fields";
import { RESERVE_TYPE_OPTIONS } from "../../options";
import { defineSchedule } from "../shared/define";
import { Schedule17FormView } from "./paper/schedule17-form-view";

const f = fieldsFor<AlbertaReserves17Values>();

/**
 * AT1 Schedule 17 — Alberta Reserves.
 *
 * Eight reserve kinds across three columns: the balance at the beginning of
 * the year, the transfer on an amalgamation or wind-up of a subsidiary, and the
 * balance at the end of the year. Line 091 (opening + transfer) carries to
 * Schedule 12 line 036 and line 081 (the closing total) to Schedule 12 line
 * 038 — the two halves of the same swing, which is why filing one without the
 * other misstates Alberta income.
 *
 * ── Why this is its own schedule now ────────────────────────────────────────
 *
 * These three columns used to be three extra fields on the FEDERAL reserve row
 * (`reserves.rows[].albertaOpening/albertaTransfer/albertaClosing`). One
 * `ReturnInput` key held both jurisdictions' forms, and since the registry
 * pins one nav entry per key, Alberta Schedule 17 could only ever be a second
 * grid inside federal Schedule 13's entry — invisible under the "AT1 only"
 * filter, and reached by a preparer only if they already knew it was there.
 *
 * Every row is an OVERRIDE: leave a kind out entirely and Alberta takes the
 * federal figure, so a corporation whose reserves match federally files
 * nothing here. An explicit 0 is a real answer, not an absent one.
 *
 * Rows pair back to the federal reserves BY `type`, the fixed enum of the
 * eight printed kinds — never by position, so reordering either list cannot
 * attach an Alberta figure to the wrong reserve.
 *
 * `insurancePolicyReserves` and `bankReserves` have no federal Part 2
 * equivalent at all, so for those two this schedule is the ONLY source of the
 * figure rather than an override of anything.
 */
export const albertaReserves17 = defineSchedule({
	key: "albertaReserves17",
	num: "017",
	label: "Alberta Reserves (S17)",
	hint: "Eight reserve kinds — overrides where Alberta differs from federal",
	programs: ["AT1"],
	formView: (props) => createElement(Schedule17FormView, props),
	schema: defineSchema({
		sections: [
			section(
				"rows",
				"Reserves (line 001-017, 031-047, 061-077)",
				[
					f.array("rows", "Reserve kinds", [
						field.select("type", "Reserve kind", RESERVE_TYPE_OPTIONS, {
							placeholder: "Select a reserve kind",
							description:
								"Pairs this row to the federal reserve of the same kind. Bank reserves and insurance policy reserves have no federal equivalent — for those, this is the only place the figure exists.",
						}),
						money("opening", "Balance at the beginning of the year"),
						money(
							"transfer",
							"Transfer on amalgamation or wind-up of subsidiary",
						),
						money("closing", "Balance at the end of the year"),
					]),
				],
				{
					variant: "card",
					cols: 1,
					description:
						"Add a row only for a reserve kind whose Alberta figures DIFFER from federal — a kind omitted here takes the federal figure, which is what the form's own \"required if the opening balance or the claim differs\" instruction means. An explicit 0 is a real answer. Bank reserves and insurance policy reserves have no federal equivalent at all, so for those this is the only source. The totals (021/051/081) and line 091 are computed; see Form View.",
				},
			),
		],
	}),
});
