import { defineSchema, section } from "@classytic/formkit/server";
import { createElement } from "react";
import type { DonationsValues } from "../../../_lib/return-input";
import { fieldsFor } from "../../fields";
import { defineSchedule } from "../shared/define";
import { Schedule2FormView } from "./paper/schedule2-form-view";

const f = fieldsFor<DonationsValues>();

export const donations = defineSchedule({
  key: "donations",
  num: "002",
  label: "Donations & Gifts (S2)",
  hint: "Charitable / cultural / ecological",
  formView: (props) => createElement(Schedule2FormView, props),
  schema: defineSchema({
    sections: [
      section(
        "don",
        "Donations & gifts (Schedule 2)",
        [
          f.money("charitable", "Charitable donations (line 210)", { description: "75% of net income cap" }),
          f.money("cultural", "Cultural gifts (line 410)"),
          f.money("ecological", "Ecological gifts (line 520)"),
          f.money("openingDonationPool", "Unclaimed donations carried forward (line 240)", {
            description: "From prior years (5-yr limit). Auto-filled from last year on compute",
          }),
        ],
        {
          variant: "card",
          cols: 2,
          description:
            "Claim capped at 75% of net income for tax; the excess carries forward up to 5 years (Schedule 2, s.110.1).",
        },
      ),
    ],
  }),
});
