import { defineSchema, section } from "@classytic/formkit/server";
import type { EifelValues } from "../../_lib/return-input";
import { fieldsFor } from "../fields";
import { defineSchedule } from "./define";

const f = fieldsFor<EifelValues>();

export const eifel = defineSchedule({
  key: "eifel",
  num: "18.2",
  label: "Interest Limitation (EIFEL)",
  hint: "Excluded-entity check, tax years from Oct 2023",
  schema: defineSchema({
    sections: [
      section(
        "status",
        "Does the interest limitation apply?",
        [
          f.money("netInterestAndFinancingExpenses", "Net interest and financing expenses", {
            description: "For the corporation and its group. $1,000,000 or less is exempt",
          }),
          f.money("groupTaxableCapital", "Group taxable capital employed in Canada", {
            description:
              "Only needed to override the figure already computed on the taxable capital schedule",
          }),
          f.switch(
            "domesticExceptionApplies",
            "All or substantially all business is carried on in Canada",
            { description: "The domestic exception. Requires the statutory conditions to be met" },
          ),
        ],
        {
          variant: "card",
          cols: 2,
          description:
            "Most returns need nothing here. A CCPC whose group taxable capital is under $50 million is an excluded entity and the engine determines that on its own from the corporation type and the taxable capital schedule. Complete this only if that does not apply — a non-CCPC, or a group at or above $50 million. Leaving the expense blank in those cases blocks the return rather than assuming it is small.",
        },
      ),
    ],
  }),
});
