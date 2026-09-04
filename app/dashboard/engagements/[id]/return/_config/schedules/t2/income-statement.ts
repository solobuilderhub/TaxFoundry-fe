import { defineSchema, section } from "@classytic/formkit/server";
import { createElement } from "react";
import type { IncomeStatementValues } from "../../../_lib/return-input";
import { fieldsFor } from "../../fields";
import { defineSchedule } from "../shared/define";
import { IncomeStatementFormView } from "./paper/income-statement-form-view";

const f = fieldsFor<IncomeStatementValues>();

export const incomeStatement = defineSchedule({
  key: "incomeStatement",
  num: "125",
  label: "Income Statement (GIFI)",
  hint: "Revenue & expenses",
  formView: (props) => createElement(IncomeStatementFormView, props),
  schema: defineSchema({
    sections: [
      section(
        "rev",
        "Revenue",
        [f.money("revenue", "Total sales / revenue", { fullWidth: true, description: "GIFI 8299" })],
        { variant: "card", cols: 1 },
      ),
      section(
        "exp",
        "Operating expenses",
        [
          f.money("costOfSales", "Cost of sales", { description: "GIFI 8518 (Total Cost of Sales)" }),
          f.money("salariesAndWages", "Salaries & wages", { description: "GIFI 9060" }),
          f.money("amortization", "Amortization of tangible assets", {
            description: "GIFI 8670. Auto added back on S1",
          }),
          f.money("otherExpenses", "Other operating expenses"),
        ],
        { variant: "card", cols: 2 },
      ),
    ],
  }),
});
