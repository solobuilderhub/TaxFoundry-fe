import { defineSchema, section } from "@classytic/formkit/server";
import type { ForeignValues } from "../../_lib/return-input";
import { fieldsFor } from "../fields";
import { defineSchedule } from "./define";

const f = fieldsFor<ForeignValues>();

export const foreign = defineSchedule({
  key: "foreign",
  num: "021",
  label: "Foreign Tax Credit (S21)",
  hint: "Foreign income & tax paid",
  schema: defineSchema({
    sections: [
      section(
        "nonbiz",
        "Foreign non-business income (Schedule 21)",
        [
          f.money("foreignNonBusinessIncome", "Net foreign non-business income (line 110)", {
            description: "Foreign property/investment income (gross, in CAD)",
          }),
          f.money("foreignNonBusinessTaxPaid", "Foreign non-business income tax paid (line 120)"),
        ],
        { variant: "card", cols: 2 },
      ),
      section(
        "biz",
        "Foreign business income",
        [
          f.money("foreignBusinessIncome", "Net foreign business income (line 210)", { description: "In CAD" }),
          f.money("foreignBusinessTaxPaid", "Foreign business income tax (line 220)"),
          f.money("openingBusinessFtcPool", "Unused business FTC carried forward (line 348)", {
            description: "From prior years (10-yr limit). Auto-filled from last year on compute",
          }),
        ],
        {
          variant: "card",
          cols: 2,
          description:
            "The credit is limited to the Canadian tax on the foreign income (s.126). Unused business FTC carries forward 10 years; non-business FTC is not carried forward.",
        },
      ),
    ],
  }),
});
