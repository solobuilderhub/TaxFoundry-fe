import { defineSchema, section } from "@classytic/formkit/server";
import type { PreferredSharesValues } from "../../../_lib/return-input";
import { fieldsFor } from "../../fields";
import { defineSchedule } from "../shared/define";

const f = fieldsFor<PreferredSharesValues>();

export const preferredShares = defineSchedule({
  key: "preferredShares",
  num: "043",
  label: "Preferred Share Dividends (S43)",
  hint: "Part VI.1 tax on taxable preferred shares",
  schema: defineSchema({
    sections: [
      section(
        "dividends",
        "Dividends paid on taxable preferred shares",
        [
          f.money("shortTermPreferredDividends", "On short-term preferred shares (line 220)", {
            description: "Taxed at 40% above the allowance",
          }),
          f.money("otherPreferredDividends", "On other taxable preferred shares (lines 230 / 240)", {
            description: "Taxed at 25% above the allowance, or 40% with the election below",
          }),
          f.switch(
            "electedUnder191_2",
            "The corporation elected under s.191.2 (raises its own rate to 40%)",
            {
              description:
                "The election exempts the shareholder from the 10% Part IV.1 tax on the dividend",
            },
          ),
        ],
        {
          variant: "card",
          cols: 2,
          description:
            "Leave blank if the corporation has no preferred shares outstanding. Worth checking after an estate freeze: freeze preferreds commonly meet the taxable-preferred-share definition, and this tax applies to CCPCs.",
        },
      ),
      section(
        "allowance",
        "Dividend allowance (s.191.1(2))",
        [
          f.money("priorYearPreferredDividends", "Preferred dividends paid LAST year", {
            description:
              "Amount 1B in Part 1 — a working figure with no line number of its own. " +
              "The excess over $1,000,000 lands on line 110, and line 115 is then the " +
              "$500,000 basic allowance less that excess.",
          }),
          f.switch("isAssociated", "Associated with one or more other corporations"),
          f.money("allocatedAllowance", "Allowance allocated to this corporation (line 140)", {
            description: "From the group's filed allocation agreement",
            condition: { watch: "isAssociated", operator: "truthy" },
          }),
        ],
        {
          variant: "card",
          cols: 2,
          description:
            "A standalone corporation gets the full $500,000. An associated corporation gets NOTHING unless the group files an allocation agreement — that is the statute's own default, so the whole dividend is taxable without one.",
        },
      ),
    ],
  }),
});
