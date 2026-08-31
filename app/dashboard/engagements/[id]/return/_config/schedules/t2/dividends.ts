import { defineSchema, section } from "@classytic/formkit/server";
import type { DividendsValues } from "../../../_lib/return-input";
import { fieldsFor } from "../../fields";
import { defineSchedule } from "../shared/define";

const f = fieldsFor<DividendsValues>();

export const dividends = defineSchedule({
  key: "dividends",
  num: "003",
  label: "Dividends (S3)",
  hint: "Received (s.112) & paid",
  schema: defineSchema({
    sections: [
      section(
        "recv",
        "Dividends received (Schedule 3)",
        [
          f.money("taxableReceivedConnected", "From connected corporations", {
            description: "Deductible under s.112",
          }),
          f.money("taxableReceivedPortfolio", "Portfolio (non-connected)", {
            description: "Subject to Part IV tax",
          }),
          f.money("eligibleDividendsReceived", "Of which eligible (→ GRIP)", {
            description: "Eligible dividends received add to GRIP",
          }),
        ],
        { variant: "card", cols: 2 },
      ),
      section(
        "paid",
        "Dividends paid",
        [
          f.money("taxableDividendsPaid", "Total taxable dividends paid (line 460)"),
          f.money("eligibleDividendsPaid", "Eligible dividends designated (line 465)"),
        ],
        { variant: "card", cols: 2 },
      ),
      section(
        "grip",
        "General Rate Income Pool (Schedule 53)",
        [
          f.money("openingGrip", "Opening GRIP", {
            description: "Auto-filled from last year on compute",
          }),
        ],
        {
          variant: "card",
          description:
            "GRIP caps eligible dividends: closing GRIP = opening + 72% of general-rate income + eligible dividends received − eligible dividends designated. Designating more than the pool is an excessive designation (Part III.1 tax).",
        },
      ),
    ],
  }),
});
