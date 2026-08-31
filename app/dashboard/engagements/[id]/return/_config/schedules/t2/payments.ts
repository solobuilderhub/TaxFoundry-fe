import { defineSchema, section } from "@classytic/formkit/server";
import type { PaymentsValues } from "../../../_lib/return-input";
import { fieldsFor } from "../../fields";
import { defineSchedule } from "../shared/define";

const f = fieldsFor<PaymentsValues>();

export const payments = defineSchedule({
  key: "payments",
  num: "840",
  label: "Payments & Instalments",
  hint: "Tax paid during the year",
  schema: defineSchema({
    sections: [
      section(
        "pay",
        "Payments & instalments",
        [
          f.money("instalmentsPaid", "Tax paid by instalments (line 840)", {
            description:
              "Total instalments + payments made during the year. Nets against tax payable to give the balance owing or refund (890/894)",
          }),
        ],
        { variant: "card" },
      ),
    ],
  }),
});
