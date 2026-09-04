import { defineSchema, field, section } from "@classytic/formkit/server";
import { createElement } from "react";
import type { ShareholdersValues } from "../../../_lib/return-input";
import { fieldsFor } from "../../fields";
import { defineSchedule } from "../shared/define";
import { Schedule50FormView } from "./paper/schedule50-form-view";

const f = fieldsFor<ShareholdersValues>();

export const shareholders = defineSchedule({
  key: "shareholders",
  num: "050",
  label: "Shareholder Information (S50)",
  hint: "Shareholders holding ≥ 10%",
  formView: (props) => createElement(Schedule50FormView, props),
  schema: defineSchema({
    sections: [
      section(
        "sh",
        "Shareholders (Schedule 50)",
        [
          f.array("list", "Shareholders holding ≥ 10%", [
            field.text("name", "Name (line 100)", { placeholder: "Full legal name" }),
            field.text("bnOrSin", "BN / SIN (line 200 / 300)"),
            field.number("percentCommon", "% common shares (line 400)", { placeholder: "0" }),
            field.number("percentPreferred", "% preferred shares (line 500)", { placeholder: "0" }),
          ]),
        ],
        {
          variant: "card",
          // A card section defaults to a 2-column field grid — cols: 1 so the
          // array's row cards get the section's FULL width instead of being
          // squeezed into one grid cell.
          cols: 1,
          description: "Any shareholder holding 10% or more of any class of shares.",
        },
      ),
    ],
  }),
});
