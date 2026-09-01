import { defineSchema, field, section } from "@classytic/formkit/server";
import { createElement } from "react";
import type { ReservesValues } from "../../../_lib/return-input";
import { fieldsFor, money } from "../../fields";
import { RESERVE_TYPE_OPTIONS } from "../../options";
import { defineSchedule } from "../shared/define";
import { Schedule17FormView } from "../at1/paper/schedule17-form-view";

const f = fieldsFor<ReservesValues>();

export const reserves = defineSchedule({
	key: "reserves",
	num: "013",
	label: "Continuity of Reserves (S13)",
	hint: "Tax reserves opening / closing",
	formView: (props) => createElement(Schedule17FormView, props),
	schema: defineSchema({
		sections: [
			section(
				"rows",
				"Other reserves (Schedule 13 Part 2)",
				[
					f.array("rows", "Reserves", [
						field.select("type", "Reserve type", RESERVE_TYPE_OPTIONS, {
							placeholder: "Select a reserve type",
							description:
								"A controlled list, not free text — Alberta Schedule 17 maps each row by this exact type.",
						}),
						money("opening", "Balance at beginning of year (line 002)"),
						money("transfer", "Transfer on amalgamation / wind-up (line 003)"),
						money("closing", "Balance at end of year (line 004)"),
						money("albertaOpening", "Alberta opening balance (S17)", {
							description:
								"Blank = same as federal. Insurance policy / bank reserves have no federal line, so federal always reads 0 here.",
						}),
						money("albertaTransfer", "Alberta transfer on wind-up (S17)", {
							description: "Blank = same as federal",
						}),
						money("albertaClosing", "Alberta closing balance (S17)", {
							description: "Blank = same as federal; 0 = no Alberta reserve",
						}),
					]),
				],
				{
					variant: "card",
					// A card section defaults to a 2-column field grid — cols: 1 so the
					// array's row cards get the section's FULL width instead of being
					// squeezed into one grid cell.
					cols: 1,
					description:
						"A tax reserve deducted last year is added back to income this year, and this year's reserve is re-deducted. Enter each reserve's opening and closing balance. The engine reverses the opening (an addition on Schedule 1) and deducts the closing. Capital-gains reserves belong on Schedule 6, not here.",
				},
			),
		],
	}),
});
