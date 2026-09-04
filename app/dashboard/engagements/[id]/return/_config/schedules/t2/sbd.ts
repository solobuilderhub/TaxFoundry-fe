import { defineSchema, field, section } from "@classytic/formkit/server";
import { createElement } from "react";
import type { SbdValues } from "../../../_lib/return-input";
import { fieldsFor, money } from "../../fields";
import { defineSchedule } from "../shared/define";
import { Schedule7FormView } from "./paper/schedule7-form-view";

const f = fieldsFor<SbdValues>();

export const sbd = defineSchedule({
  key: "sbd",
  num: "007",
  label: "Small Business Deduction (S7)",
  hint: "ABI, business limit, grinds",
  formView: (props) => createElement(Schedule7FormView, props),
  schema: defineSchema({
    sections: [
      section(
        "sbd",
        "Small business deduction",
        [
          f.money("activeBusinessIncome", "Active business income (ABI) (line 400)", { fullWidth: true }),
          f.money("businessLimit", "Business limit (line 410)", {
            description: "This corp's share of $500,000 (see associated corps below)",
          }),
          f.money("taxableCapital", "Taxable capital, prior year", {
            description: "Group combined. Grinds the limit above $10M",
          }),
          f.money("aaii", "Adjusted aggregate investment income, PRIOR year (Schedule 7 line 745)", {
            description:
              "Group combined. Grinds the business limit $5 per $1 above $50,000, gone at $150,000 (s.125(5.1)(b)). This is the s.125(7) ADJUSTED figure from the PRIOR year — not this year's line 440. If you leave 'Aggregate investment income — current year' below blank, this value is also used there as an approximation.",
          }),
          f.money(
            "aggregateInvestmentIncome",
            "Aggregate investment income — current year (line 440)",
            {
              description:
                "This year's plain AII (Schedule 7 Part 1, line 092 / jacket line 440) — feeds the refundable Part I tax / RDTOH calculation. Leave blank to approximate it with the prior-year adjusted figure above (the two are only the same by coincidence), or leave BOTH this and the figure above blank and fill in the Part 1/Part 2 detail sections instead.",
            },
          ),
        ],
        {
          variant: "card",
          cols: 2,
          description: "Inputs to the SBD calculation and its grinds (Schedule 7).",
        },
      ),
      section(
        "aiiDetail",
        "Schedule 7 Part 1 detail — derive AII instead of typing it in",
        [
          f.money("aiiDetail.taxableCapitalGains", "Eligible taxable capital gains (002)"),
          f.money("aiiDetail.allowableCapitalLosses", "Eligible allowable capital losses, incl. ABILs (012)"),
          f.money("aiiDetail.netCapitalLossesClaimed", "Net capital losses of previous years claimed — T2 line 332 (022)"),
          f.money("aiiDetail.incomeFromProperty", "Total income from property (032)"),
          f.money("aiiDetail.exemptIncome", "Exempt income (042)"),
          f.money("aiiDetail.agriInvestFundReceived", "AgriInvest Fund No. 2 received (052)"),
          f.money("aiiDetail.taxableDividendsDeductible", "Taxable dividends deductible, s.113(1)(c) (062)"),
          f.money("aiiDetail.trustPropertyIncome", "Business income from a trust interest, s.108(5)(a) (072)"),
          f.money("aiiDetail.lossesFromProperty", "Total losses from property (082)"),
        ],
        {
          variant: "card",
          cols: 2,
          description:
            "Optional. Leave 'Aggregate investment income — current year' above blank and fill these in instead, and AII is computed from them the way the real Schedule 7 Part 1 does (line 092), rather than typed in as one number. Leave everything here blank to keep using the figure above.",
        },
      ),
      section(
        "aaiiDetail",
        "Schedule 7 Part 2 detail — derive AAII instead of typing it in",
        [
          f.money(
            "aaiiDetail.taxableCapitalGains",
            "Eligible taxable capital gains, excl. active-asset dispositions (705)",
          ),
          f.money(
            "aaiiDetail.allowableCapitalLosses",
            "Eligible allowable capital losses, excl. active-asset dispositions (710)",
          ),
          f.money("aaiiDetail.incomeFromProperty", "Total income from property (715)"),
          f.money("aaiiDetail.exemptIncome", "Exempt income (720)"),
          f.money("aaiiDetail.agriInvestFundReceived", "AgriInvest Fund No. 2 received (725)"),
          f.money("aaiiDetail.dividendsFromConnectedCorporations", "Dividends from connected corporations (730)"),
          f.money("aaiiDetail.trustPropertyIncome", "Business income from a trust interest, s.108(5)(a) (735)"),
          f.money("aaiiDetail.lossesFromProperty", "Total losses from property (740)"),
          f.money("aaiiDetail.subsection91_4Deduction", "Amount deducted under s.91(4) — FAPI (741)"),
        ],
        {
          variant: "card",
          cols: 2,
          description:
            "Optional. Leave 'Adjusted aggregate investment income, PRIOR year' above blank and fill these in instead, and AAII is computed from them the way the real Schedule 7 Part 2 does (line 745) — a genuinely different base from Part 1 above (705/710 exclude active-asset dispositions; 730 is connected-corporation dividends, not 062's broader figure). Leave everything here blank to keep using the figure above.",
        },
      ),
      section(
        "zetm",
        "Zero-emission technology manufacturing (Schedule 27)",
        [
          f.money("zetmIncome", "ZETM income", {
            description:
              "Income from qualifying clean-tech manufacturing. Taxed at half rate (7.5% / 4.5%), s.125.2",
          }),
        ],
        {
          variant: "card",
          description:
            "For 2022–2031, income from zero-emission technology manufacturing is taxed at reduced rates. Enter the qualifying portion of ABI; the engine applies the rate reduction to Part I tax.",
        },
      ),
      section(
        "assoc",
        "Associated corporations (Schedule 23)",
        [
          f.array("associated", "Other associated CCPCs", [
            field.text("name", "Corporation name", { placeholder: "e.g. Holdco Ltd." }),
            money("allocatedLimit", "Allocated limit"),
          ]),
        ],
        {
          variant: "card",
          // A card section defaults to a 2-column field grid — cols: 1 so the
          // array's row cards get the section's FULL width instead of being
          // squeezed into one grid cell.
          cols: 1,
          description:
            "List the OTHER associated corporations and their share of the $500k limit. This corp's share is the 'Business limit' above; the total across the group can't exceed $500,000.",
        },
      ),
    ],
  }),
});
