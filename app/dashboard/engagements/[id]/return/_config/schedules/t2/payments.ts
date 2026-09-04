import { defineSchema, section } from "@classytic/formkit/server";
import { createElement } from "react";
import type { PaymentsValues } from "../../../_lib/return-input";
import { fieldsFor } from "../../fields";
import { defineSchedule } from "../shared/define";
import { PaymentsFormView } from "./paper/payments-form-view";

const f = fieldsFor<PaymentsValues>();

export const payments = defineSchedule({
  key: "payments",
  num: "840",
  label: "Payments & Instalments",
  hint: "Tax paid during the year",
  formView: (props) => createElement(PaymentsFormView, props),
  schema: defineSchema({
    sections: [
      section(
        "pay",
        "Payments & instalments",
        [
          f.money("instalmentsPaid", "Tax paid by instalments (line 840)", {
            description:
              "Total instalments + payments made during the year. Nets against total tax payable (line 770) to give the balance owing or refund — neither of which has its own printed line number on the return.",
          }),
        ],
        { variant: "card" },
      ),
    ],
  }),
});
