import { defineSchema, section } from "@classytic/formkit/server";
import type { BalanceSheetValues } from "../../_lib/return-input";
import { fieldsFor } from "../fields";
import { defineSchedule } from "./define";

const f = fieldsFor<BalanceSheetValues>();

export const balanceSheet = defineSchedule({
  key: "balanceSheet",
  num: "100",
  label: "Balance Sheet (GIFI)",
  hint: "Assets, liabilities, equity",
  schema: defineSchema({
    sections: [
      section(
        "assets",
        "Assets",
        [
          f.money("cash", "Cash & equivalents", { description: "GIFI 1001" }),
          f.money("accountsReceivable", "Accounts receivable", { description: "GIFI 1060" }),
          f.money("inventory", "Inventory", { description: "GIFI 1120" }),
          f.money("capitalAssetsNet", "Capital assets, net", { description: "GIFI 2008/2009" }),
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
