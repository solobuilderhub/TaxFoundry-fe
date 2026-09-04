import { defineSchema, field, section } from "@classytic/formkit/server";
import { createElement } from "react";
import type { InternetBusinessValues } from "../../../_lib/return-input";
import { fieldsFor } from "../../fields";
import { defineSchedule } from "../shared/define";
import { InternetBusinessFormView } from "./paper/internet-business-form-view";

const f = fieldsFor<InternetBusinessValues>();

/**
 * NO LINE NUMBERS, and that is the form, not an omission.
 *
 * Schedule 88 numbers nothing: it asks how many sites earn income, gives five
 * URL slots, and asks what percentage of gross revenue they generate. Verified
 * against `research/sources/cra-forms/pdf/T2SCH88-internet-business.pdf` — there
 * is not a numbered box on it.
 *
 * Recorded here so the next person auditing line-number coverage does not go
 * looking for numbers that were never printed.
 */

export const internetBusiness = defineSchedule({
  key: "internetBusiness",
  num: "088",
  label: "Internet Business Activities (S88)",
  hint: "Income earned from web pages or websites",
  formView: (props) => createElement(InternetBusinessFormView, props),
  schema: defineSchema({
    sections: [
      section(
        "trigger",
        "Does the corporation earn income online?",
        [
          f.switch(
            "hasInternetBusiness",
            "The corporation earns income from one or more web pages or websites",
          ),
        ],
        {
          variant: "card",
          cols: 1,
          description:
            "This covers more than an online store. Taking orders, bookings or payments through a site counts, and so does earning advertising or affiliate revenue from one.",
        },
      ),
      section(
        "detail",
        "Sites and revenue share",
        [
          f.number("webPageCount", "Number of income-earning web pages / websites", {
            min: 0,
            placeholder: "0",
            condition: { watch: "hasInternetBusiness", operator: "truthy" },
          }),
          f.number("percentOfGrossRevenue", "Percentage of gross revenue from those sites", {
            min: 0,
            max: 100,
            placeholder: "0",
            description: "Of TOTAL gross revenue, not just online sales",
            condition: { watch: "hasInternetBusiness", operator: "truthy" },
          }),
          f.array(
            "urls",
            "Site addresses",
            [field.text("url", "URL", { placeholder: "https://example.com" })],
            {
              // The two scalar number fields above benefit from this section's
              // 2-column grid — fullWidth spans just this array across both
              // columns instead of squeezing it into one grid cell.
              fullWidth: true,
              description:
                "CRA asks for the five sites generating the most gross revenue. Extra rows are dropped on compute.",
              condition: { watch: "hasInternetBusiness", operator: "truthy" },
            },
          ),
        ],
        { variant: "card", cols: 2 },
      ),
    ],
  }),
});
