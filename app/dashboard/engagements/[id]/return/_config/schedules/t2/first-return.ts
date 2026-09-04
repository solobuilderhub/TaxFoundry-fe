import { defineSchema, section } from "@classytic/formkit/server";
import { createElement } from "react";
import type { FirstReturnValues } from "../../../_lib/return-input";
import { fieldsFor } from "../../fields";
import { defineSchedule } from "../shared/define";
import { FirstReturnFormView } from "./paper/first-return-form-view";

const f = fieldsFor<FirstReturnValues>();

const EVENTS = [
  { value: "incorporation", label: "Incorporation" },
  { value: "amalgamation", label: "Amalgamation" },
  { value: "windUpOfSubsidiary", label: "Wind-up of a subsidiary into the parent" },
];

const shownWhenFirst = { watch: "isFirstReturn", operator: "truthy" } as const;

export const firstReturn = defineSchedule({
  key: "firstReturn",
  num: "101",
  label: "First Return (S101 / S24)",
  hint: "Opening balance sheet and first-filer details",
  formView: (props) => createElement(FirstReturnFormView, props),
  schema: defineSchema({
    sections: [
      section(
        "trigger",
        "Is this the corporation's first return?",
        [f.switch("isFirstReturn", "First return after incorporation, amalgamation or wind-up")],
        {
          variant: "card",
          cols: 1,
          description:
            "A first return has no prior year to carry forward from, so the opening position has to be filed rather than derived.",
        },
      ),
      section(
        "event",
        "The event (Schedule 24)",
        [
          f.select("event", "What made this the first return?", EVENTS, {
            condition: shownWhenFirst,
            description:
              "S24 line 100 is the corporation's industry-type code, not this — the event itself is recorded on the T2 jacket (lines 070/071/072), not on Schedule 24.",
          }),
          f.date("eventDate", "Date of the event", { condition: shownWhenFirst }),
          f.text("predecessorBusinessNumbers", "Predecessor / subsidiary Business Numbers (lines 300 / 500)", {
            placeholder: "Comma-separated",
            description:
              "Required for an amalgamation or a wind-up. Leave blank for a plain incorporation.",
            condition: shownWhenFirst,
          }),
        ],
        { variant: "card", cols: 2 },
      ),
      section(
        "opening",
        "Opening balance sheet (Schedule 101)",
        [
          f.money("openingAssets", "Total assets at the start of the year", {
            condition: shownWhenFirst,
          }),
          f.money("openingLiabilities", "Total liabilities", { condition: shownWhenFirst }),
          f.money("openingEquity", "Total equity", { condition: shownWhenFirst }),
        ],
        {
          variant: "card",
          cols: 2,
          description:
            "Assets must equal liabilities plus equity. An opening sheet that does not balance is the most common reason a first return is rejected, so the engine checks it before transmit.",
        },
      ),
    ],
  }),
});
