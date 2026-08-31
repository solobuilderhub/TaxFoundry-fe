import { defineSchema, section } from "@classytic/formkit/server";
import type { CapitalValues } from "../../../_lib/return-input";
import { fieldsFor } from "../../fields";
import { defineSchedule } from "../shared/define";

const f = fieldsFor<CapitalValues>();

/**
 * Schedule 33 — Taxable Capital Employed in Canada (Large Corporations).
 * Feeds the small-business-deduction grind (taxable capital $10M→$50M reduces the
 * $500k business limit to nil). Leave blank for a small corporation — the grind
 * only bites above $10M. Line numbers match CRA T2 SCH33.
 */
export const capital = defineSchedule({
  key: "capital",
  num: "033",
  label: "Taxable Capital (S33)",
  hint: "Large-corporation SBD grind ($10M+)",
  schema: defineSchema({
    sections: [
      section(
        "capital",
        "Capital (Part 1)",
        [
          f.money("capitalStock", "Capital stock (line 103)"),
          f.money("retainedEarnings", "Retained earnings (line 104)"),
          f.money("contributedSurplus", "Contributed surplus (line 105)"),
          f.money("otherSurpluses", "Other surpluses (line 106)"),
          f.money("reservesNotDeducted", "Reserves not deducted for tax (line 101)"),
          f.money("loansAndAdvances", "Loans & advances to the corporation (line 108)"),
          f.money("bondsAndDebentures", "Bonds, debentures, notes, mortgages (line 109)"),
          f.money("dividendsDeclaredUnpaid", "Dividends declared but unpaid (line 110)"),
          f.money("otherLongTermDebt", "Other debt outstanding > 365 days (line 111)"),
          f.money("deferredForexGains", "Deferred unrealized FX gains (line 107)"),
        ],
        { variant: "card", cols: 2, description: "Year-end amounts added to arrive at capital (line 190)." },
      ),
      section(
        "deductions",
        "Capital. Deductions",
        [
          f.money("deferredTaxDebit", "Deferred tax debit balance (line 121)"),
          f.money("deficitInEquity", "Deficit deducted in equity (line 122)"),
          f.money("deferredForexLosses", "Deferred unrealized FX losses (line 124)"),
          f.money("patronageDeducted", "Patronage dividends deducted (s.135(1)) (line 123)"),
        ],
        { variant: "card", cols: 2 },
      ),
      section(
        "investmentAllowance",
        "Investment allowance (Part 2)",
        [
          f.money("sharesOfOtherCorporations", "Shares of other corporations (line 401)"),
          f.money("loansToOtherCorporations", "Loans / advances to other corporations (line 402)"),
          f.money("bondsOfOtherCorporations", "Bonds / debt of other corporations (line 403)"),
          f.money("longTermDebtOfFinancialInstitution", "Long-term debt of a financial institution (line 404)"),
          f.money("dividendsReceivable", "Dividends receivable from other corporations (line 405)"),
          f.money("partnershipObligations", "Qualifying-partnership obligations (line 406)"),
          f.money("partnershipInterestAsset", "Interest in a partnership (line 407)"),
        ],
        {
          variant: "card",
          cols: 2,
          description:
            "Carrying value of investments in other corporations. Deducted from capital to give taxable capital (line 500).",
        },
      ),
      section(
        "allocation",
        "Taxable capital employed in Canada (Part 4)",
        [f.money("taxableIncomeEarnedInCanada", "Taxable income earned in Canada (line 610)")],
        {
          variant: "card",
          cols: 1,
          description:
            "Leave blank for a wholly-Canadian corporation (all taxable capital is employed in Canada). Only enter this when the corporation has foreign-earned income. Taxable capital is then prorated by (income earned in Canada ÷ taxable income).",
        },
      ),
    ],
  }),
});
