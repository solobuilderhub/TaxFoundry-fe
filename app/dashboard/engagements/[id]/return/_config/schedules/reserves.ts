import { defineSchema, field, section } from "@classytic/formkit/server";
import type { ReservesValues } from "../../_lib/return-input";
import { fieldsFor, money } from "../fields";
import { defineSchedule } from "./define";

const f = fieldsFor<ReservesValues>();

export const reserves = defineSchedule({
  key: "reserves",
  num: "013",
  label: "Continuity of Reserves (S13)",
  hint: "Tax reserves opening / closing",
  schema: defineSchema({
    sections: [
      section(
        "rows",
        "Other reserves (Schedule 13 Part 2)",
        [
          f.array("rows", "Reserves", [
            field.text("type", "Reserve type"),
            money("opening", "Balance at beginning of year (line 002)"),
            money("transfer", "Transfer on amalgamation / wind-up (line 003)"),
            money("closing", "Balance at end of year (line 004)"),
          ]),
        ],
        {
          variant: "card",
          description:
            "A tax reserve deducted last year is added back to income this year, and this year's reserve is re-deducted. Enter each reserve's opening and closing balance. The engine reverses the opening (an addition on Schedule 1) and deducts the closing. Common types: doubtful debts (s.20(1)(l)), undelivered goods & services (s.20(1)(m)), prepaid rent, returnable containers, unpaid amounts. Capital-gains reserves belong on Schedule 6, not here.",
        },
      ),
    ],
  }),
});
