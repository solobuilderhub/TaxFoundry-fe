import { defineSchema, section } from "@classytic/formkit/server";
import { createElement } from "react";
import type { CreditsValues } from "../../../_lib/return-input";
import { fieldsFor } from "../../fields";
import { defineSchedule } from "../shared/define";
import { Schedule31FormView } from "./paper/schedule31-form-view";

const f = fieldsFor<CreditsValues>();

export const credits = defineSchedule({
  key: "credits",
  num: "031",
  label: "SR&ED Tax Credit (S31)",
  hint: "Investment tax credit on R&D",
  formView: (props) => createElement(Schedule31FormView, props),
  schema: defineSchema({
    sections: [
      section(
        "sred",
        "SR&ED investment tax credit (Schedule 31)",
        [
          f.money("sredQualifiedExpenditures", "Total qualified SR&ED expenditures (line 380)", {
            description: "Current + capital R&D expenditures qualifying for the ITC (from Form T661)",
          }),
          f.money("openingItcPool", "Opening ITC pool", {
            description: "Non-refundable credit carried forward. Auto-filled from last year on compute",
          }),
        ],
        {
          variant: "card",
          description:
            "A CCPC earns a 35% credit on qualified expenditures up to $3M (100% refundable); 15% above the limit and for non-CCPCs (non-refundable, offsets Part I tax then carries forward). CCPC status is taken from the Identification schedule.",
        },
      ),
    ],
  }),
});
