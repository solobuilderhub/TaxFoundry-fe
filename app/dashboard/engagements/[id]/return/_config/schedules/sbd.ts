import { defineSchema, field, section } from "@classytic/formkit/server";
import type { SbdValues } from "../../_lib/return-input";
import { fieldsFor, money } from "../fields";
import { defineSchedule } from "./define";

const f = fieldsFor<SbdValues>();

export const sbd = defineSchedule({
  key: "sbd",
  num: "007",
  label: "Small Business Deduction (S7)",
  hint: "ABI, business limit, grinds",
  schema: defineSchema({
    sections: [
      section(
        "sbd",
        "Small business deduction",
        [
          f.money("activeBusinessIncome", "Active business income (ABI) (line 400)", { fullWidth: true }),
          f.money("businessLimit", "Business limit (line 410)", {
            description: "This corp's share of $500,000 (see associated corps below)",
          }),
          f.money("taxableCapital", "Taxable capital, prior year", {
            description: "Group combined. Grinds the limit above $10M",
          }),
          f.money("aaii", "Adjusted aggregate investment income (line 440)", {
            description: "Group combined. Grinds the limit above $50k",
          }),
        ],
        {
          variant: "card",
          cols: 2,
          description: "Inputs to the SBD calculation and its grinds (Schedule 7).",
        },
      ),
      section(
        "zetm",
        "Zero-emission technology manufacturing (Schedule 27)",
        [
          f.money("zetmIncome", "ZETM income", {
            description:
              "Income from qualifying clean-tech manufacturing. Taxed at half rate (7.5% / 4.5%), s.125.2",
          }),
        ],
        {
          variant: "card",
          description:
            "For 2022–2031, income from zero-emission technology manufacturing is taxed at reduced rates. Enter the qualifying portion of ABI; the engine applies the rate reduction to Part I tax.",
        },
      ),
      section(
        "assoc",
        "Associated corporations (Schedule 23)",
        [
          f.array("associated", "Other associated CCPCs", [
            field.text("name", "Corporation name", { placeholder: "e.g. Holdco Ltd." }),
            money("allocatedLimit", "Allocated limit"),
          ]),
        ],
        {
          variant: "card",
          description:
            "List the OTHER associated corporations and their share of the $500k limit. This corp's share is the 'Business limit' above; the total across the group can't exceed $500,000.",
        },
      ),
    ],
  }),
});
