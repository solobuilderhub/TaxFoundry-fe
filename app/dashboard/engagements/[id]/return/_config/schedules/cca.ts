import { defineSchema, field, section } from "@classytic/formkit/server";
import type { CcaValues } from "../../_lib/return-input";
import { fieldsFor, money } from "../fields";
import { CCA_CLASS_OPTIONS } from "../options";
import { defineSchedule } from "./define";

const f = fieldsFor<CcaValues>();

export const cca = defineSchedule({
  key: "cca",
  num: "008",
  label: "Capital Cost Allowance (S8)",
  hint: "Depreciable property, by class",
  schema: defineSchema({
    sections: [
      section(
        "cca",
        "Capital cost allowance",
        [
          f.array("classes", "CCA classes", [
            field.select("ccaClass", "Class (line 200)", CCA_CLASS_OPTIONS, { placeholder: "Select a CCA class" }),
            money("openingUCC", "Opening UCC (line 201)", { description: "Auto-filled from last year on compute" }),
            money("additions", "Additions — cost of acquisitions (line 203)"),
            money("dispositions", "Dispositions — proceeds (line 207)"),
            money("immediateExpensing", "Immediate expensing (DIEP)", {
              description: "100% first year, up to $1.5M",
            }),
            field.switch("aiip", "AIIP (accelerated investment)"),
            field.switch("classEmptied", "Class emptied (no assets left)"),
            money("claim", "CCA claim", { description: "Blank = maximum; 0 = claim nothing" }),
            money("albertaOpeningUCC", "Alberta opening UCC (S13 line 003)", {
              description: "Blank = same as federal",
            }),
            money("albertaClaim", "Alberta CCA claim (S13 line 019)", {
              description: "Blank = same as federal; 0 = claim nothing for Alberta",
            }),
          ]),
        ],
        {
          variant: "card",
          description:
            "Schedule 8. Depreciable property by class. The engine applies the half-year rule (or AIIP/immediate expensing), and computes recapture / terminal loss on dispositions. Closing UCC carries forward automatically.",
        },
      ),
    ],
  }),
});
