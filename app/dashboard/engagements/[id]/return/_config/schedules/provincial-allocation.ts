import { defineSchema, field, section } from "@classytic/formkit/server";
import type { ProvincialAllocationValues } from "../../_lib/return-input";
import { fieldsFor, money } from "../fields";
import { PROVINCE_OPTIONS } from "../options";
import { defineSchedule } from "./define";

const f = fieldsFor<ProvincialAllocationValues>();

export const provincialAllocation = defineSchedule({
  key: "provincialAllocation",
  num: "005",
  label: "Provincial Allocation (S5 Part 1)",
  hint: "Permanent establishments in multiple provinces",
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
          description:
            "For a corporation with establishments in more than one province, taxable income is allocated by Regulation 402. The average of each province's share of gross revenue and of salaries & wages. Each province is then taxed at its own rate. Alberta and Quebec shares are allocated here but filed on their own AT1 / CO-17 returns. Leave empty for a single-province return (uses the province on Identification). On Schedule 5 each jurisdiction has its own boxes: the tick is the jurisdiction code (Ontario 013, Alberta 019, BC 021), salaries are that code plus 100, and gross revenue is that code plus 140 — so Ontario's payroll is line 113 and its revenue line 153.",
        },
      ),
    ],
  }),
});
