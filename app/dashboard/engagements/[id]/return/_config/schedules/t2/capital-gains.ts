import { defineSchema, field, section } from "@classytic/formkit/server";
import type { CapitalGainsValues } from "../../../_lib/return-input";
import { fieldsFor, money } from "../../fields";
import { DISPOSITION_CATEGORY_OPTIONS } from "../../options";
import { defineSchedule } from "../shared/define";

const f = fieldsFor<CapitalGainsValues>();

export const capitalGains = defineSchedule({
	key: "capitalGains",
	num: "006",
	label: "Capital Gains (S6)",
	hint: "Dispositions of capital property",
	schema: defineSchema({
		sections: [
			section(
				"cap",
				"Dispositions of capital property (Schedule 6)",
				[
					f.array("dispositions", "Dispositions", [
						field.text("description", "Property", {
							placeholder: "e.g. Land, shares of X Co.",
						}),
						money("proceeds", "Proceeds of disposition (line 120)"),
						money("acb", "Adjusted cost base (line 130)"),
						money("outlays", "Outlays & expenses (line 140)"),
						field.select("category", "Category", DISPOSITION_CATEGORY_OPTIONS, {
							placeholder: "Select a category",
							description:
								"Federal Schedule 6 does not need this — it feeds Alberta Schedule 18 only, if filed.",
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
						"Gain (loss) = proceeds − ACB − outlays. The engine applies the ½ inclusion rate: a net gain is taxed; a net loss becomes a net-capital loss that carries forward (Schedule 4) to offset future capital gains.",
				},
			),
		],
	}),
});
