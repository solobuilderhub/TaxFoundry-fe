import { defineSchema, field, section } from "@classytic/formkit/server";
import { createElement } from "react";
import type { ProvincialAllocationValues } from "../../../_lib/return-input";
import { fieldsFor, money } from "../../fields";
import { PROVINCE_OPTIONS } from "../../options";
import { defineSchedule } from "../shared/define";
import { Schedule5FormView } from "./paper/schedule5-form-view";

const f = fieldsFor<ProvincialAllocationValues>();

export const provincialAllocation = defineSchedule({
  key: "provincialAllocation",
  num: "005",
  label: "Provincial Allocation (S5 Part 1)",
  hint: "Permanent establishments in multiple provinces",
  formView: (props) => createElement(Schedule5FormView, props),
  schema: defineSchema({
    sections: [
      section(
        "pe",
        "Permanent establishments",
        [
          f.array("establishments", "Provinces with a permanent establishment", [
            field.select("province", "Province / territory", PROVINCE_OPTIONS),
            money("grossRevenue", "Gross revenue in province (column D)"),
            money("salariesWages", "Salaries & wages in province (column B)"),
          ]),
        ],
        {
          variant: "card",
          // A card section defaults to a 2-column field grid — cols: 1 so the
          // array's row cards get the section's FULL width instead of being
          // squeezed into one grid cell.
          cols: 1,
          description:
            "For a corporation with establishments in more than one province, taxable income is allocated by Regulation 402. The average of each province's share of gross revenue and of salaries & wages. Each province is then taxed at its own rate. Alberta and Quebec shares are allocated here but filed on their own AT1 / CO-17 returns. Leave empty for a single-province return (uses the province on Identification). On Schedule 5 each jurisdiction has its own boxes: the tick is the jurisdiction code (Ontario 013, Alberta 019, BC 021), salaries are that code plus 100, and gross revenue is that code plus 140 — so Ontario's payroll is line 113 and its revenue line 153.",
        },
      ),
    ],
  }),
});
