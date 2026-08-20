import { defineSchema, field, section } from "@classytic/formkit/server";
import type { LossesValues } from "../../_lib/return-input";
import { fieldsFor, money } from "../fields";
import { defineSchedule } from "./define";

const f = fieldsFor<LossesValues>();

export const losses = defineSchedule({
  key: "losses",
  num: "004",
  label: "Losses (S4)",
  hint: "Non-capital & net-capital continuity",
  schema: defineSchema({
    sections: [
      section(
        "noncap",
        "Non-capital losses (Schedule 4)",
        [
          f.money("nonCapitalOpening", "Opening balance (line 102)"),
          f.money("nonCapitalApplied", "Applied this year (line 130)", {
            description: "Deducted from taxable income",
          }),
        ],
        { variant: "card", cols: 2 },
      ),
      section(
        "netcap",
        "Net-capital losses (Schedule 4)",
        [
          f.money("netCapitalOpening", "Opening balance (line 200)"),
          f.money("netCapitalApplied", "Applied this year (line 225)", {
            description: "Against taxable capital gains",
          }),
        ],
        { variant: "card", cols: 2 },
      ),
      section(
        "farm",
        "Farm losses (s.111(1)(d))",
        [
          f.money("farmOpening", "Opening balance"),
          f.money("farmApplied", "Applied this year", {
            description: "Deductible against any income. Blank claims the maximum",
          }),
        ],
        {
          variant: "card",
          cols: 2,
          description:
            "A farm loss arises where farming IS a chief source of income. It offsets any income and carries forward 20 years.",
        },
      ),
      section(
        "restrictedFarm",
        "Restricted farm losses (s.111(1)(c))",
        [
          f.money("restrictedFarmOpening", "Opening balance"),
          f.money("farmingIncome", "Farming income this year", {
            description: "The ceiling — a restricted farm loss can offset nothing else",
          }),
          f.money("restrictedFarmApplied", "Applied this year", {
            description: "Blank claims the maximum the farming income allows",
          }),
        ],
        {
          variant: "card",
          cols: 2,
          description:
            "Arises where farming is NOT a chief source of income. Recoverable ONLY against farming income, so the engine caps it at the amount entered above no matter what is claimed.",
        },
      ),
      section(
        "limitedPartnership",
        "Limited partnership losses (s.111(1)(e))",
        [
          f.money("limitedPartnershipOpening", "Opening balance"),
          f.money("partnershipIncome", "Income from that partnership this year"),
          f.money("atRiskAmount", "At-risk amount (s.96(2.2))", {
            description: "Required — leaving this blank means nothing can be applied",
          }),
          f.money("limitedPartnershipApplied", "Applied this year", {
            description: "Blank claims the maximum the caps allow",
          }),
        ],
        {
          variant: "card",
          cols: 2,
          description:
            "Deductible only against income from the SAME partnership, and capped by the at-risk amount for its fiscal period ending in the year. Carries forward indefinitely.",
        },
      ),
      section(
        "carryback",
        "Loss carry-back (Schedule 4 request)",
        [
          f.array("carrybacks", "Carry back to prior years", [
            field.date("taxYearEnd", "Prior year-end"),
            money("amount", "Amount"),
          ]),
        ],
        {
          variant: "card",
          description:
            "Carry this year's non-capital loss back to up to 3 preceding years (s.111(1)) to recover tax paid. The total reduces the loss that carries forward.",
        },
      ),
    ],
  }),
});
