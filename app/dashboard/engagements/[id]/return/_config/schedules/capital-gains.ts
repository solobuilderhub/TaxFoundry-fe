import { defineSchema, field, section } from "@classytic/formkit/server";
import type { CapitalGainsValues } from "../../_lib/return-input";
import { fieldsFor, money } from "../fields";
import { defineSchedule } from "./define";

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
            field.text("description", "Property", { placeholder: "e.g. Land, shares of X Co." }),
            money("proceeds", "Proceeds of disposition (line 120)"),
            money("acb", "Adjusted cost base (line 130)"),
            money("outlays", "Outlays & expenses (line 140)"),
          ]),
        ],
        {
          variant: "card",
          description:
            "Gain (loss) = proceeds − ACB − outlays. The engine applies the ½ inclusion rate: a net gain is taxed; a net loss becomes a net-capital loss that carries forward (Schedule 4) to offset future capital gains.",
        },
      ),
    ],
  }),
});
