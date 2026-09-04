import { defineSchema, section } from "@classytic/formkit/server";
import { createElement } from "react";
import type { BalanceSheetValues } from "../../../_lib/return-input";
import { fieldsFor } from "../../fields";
import { defineSchedule } from "../shared/define";
import { BalanceSheetFormView } from "./paper/balance-sheet-form-view";

const f = fieldsFor<BalanceSheetValues>();

export const balanceSheet = defineSchedule({
  key: "balanceSheet",
  num: "100",
  label: "Balance Sheet (GIFI)",
  hint: "Assets, liabilities, equity",
  formView: (props) => createElement(BalanceSheetFormView, props),
  schema: defineSchema({
    sections: [
      section(
        "assets",
        "Assets",
        [
          f.money("cash", "Cash & equivalents", { description: "GIFI 1001" }),
          f.money("accountsReceivable", "Accounts receivable", { description: "GIFI 1060" }),
          f.money("inventory", "Inventory", { description: "GIFI 1120" }),
          f.money("capitalAssetsNet", "Capital assets, net", {
            description:
              "Net of amortization. Filed as GIFI 2008 (Total Tangible Capital Assets, a GROSS-cost code) plus whatever you enter below for accumulated amortization — leave that blank and this figure alone files under 2008, still net.",
          }),
          f.money("accumulatedAmortization", "Accumulated amortization on capital assets", {
            description:
              "GIFI 2009. Optional — added back to the net figure above to file the true gross total at 2008, and filed separately at 2009. Leave blank if unknown; it doesn't affect this return's own balance-sheet totals either way.",
          }),
          f.money("otherAssets", "Other assets"),
        ],
        { variant: "card", cols: 2 },
      ),
      section(
        "liab",
        "Liabilities",
        [
          f.money("accountsPayable", "Accounts payable", { description: "GIFI 2620" }),
          f.money("loansPayable", "Loans & long-term debt", { description: "GIFI 2700" }),
          f.money("otherLiabilities", "Other liabilities"),
        ],
        { variant: "card", cols: 2 },
      ),
      section(
        "equity",
        "Shareholder equity",
        [
          f.money("shareCapital", "Share capital", { description: "GIFI 3500" }),
          f.money("retainedEarnings", "Retained earnings", { description: "GIFI 3600" }),
        ],
        { variant: "card", cols: 2 },
      ),
    ],
  }),
});
