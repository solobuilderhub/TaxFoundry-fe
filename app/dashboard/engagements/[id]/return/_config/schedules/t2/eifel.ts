import { defineSchema, field, section } from "@classytic/formkit/server";
import { createElement } from "react";
import type { EifelValues } from "../../../_lib/return-input";
import { fieldsFor, money } from "../../fields";
import { EIFEL_COUNTERPARTY_OPTIONS, RESOURCE_IFE_POOL_OPTIONS } from "../../options";
import { defineSchedule } from "../shared/define";
import { Schedule130FormView } from "./paper/schedule130-form-view";

const f = fieldsFor<EifelValues>();

export const eifel = defineSchedule({
  key: "eifel",
  num: "18.2",
  label: "Interest Limitation (EIFEL)",
  hint: "Excluded-entity check, tax years from Oct 2023",
  formView: (props) => createElement(Schedule130FormView, props),
  schema: defineSchema({
    sections: [
      section(
        "status",
        "Does the interest limitation apply?",
        [
          f.money("netInterestAndFinancingExpenses", "Net interest and financing expenses", {
            description: "For the corporation and its group. $1,000,000 or less is exempt",
          }),
          f.money("groupTaxableCapital", "Group taxable capital employed in Canada", {
            description:
              "Only needed to override the figure already computed on the taxable capital schedule",
          }),
          f.switch(
            "domesticExceptionApplies",
            "All or substantially all business is carried on in Canada",
            { description: "The domestic exception. Requires the statutory conditions to be met" },
          ),
        ],
        {
          variant: "card",
          cols: 2,
          description:
            "Most returns need nothing here. A CCPC whose group taxable capital is under $50 million is an excluded entity and the engine determines that on its own from the corporation type and the taxable capital schedule. Complete this only if that does not apply — a non-CCPC, or a group at or above $50 million. Leaving the expense blank in those cases blocks the return rather than assuming it is small.",
        },
      ),
      section(
        "limitation",
        "Schedule 130 — the limitation itself (lines 045, 072, 128)",
        [
          f.money("interestAndFinancingExpenses", "Interest and financing expenses (045)", {
            description:
              "The corporation's GROSS IFE, from Schedule 130 Part 2A — not the group net figure above. Without it nothing can be denied.",
          }),
          f.money("interestAndFinancingRevenues", "Interest and financing revenues (072)", {
            description: "Schedule 130 Part 2D. Shelters the expenses dollar for dollar.",
          }),
          f.money("rifeFromPreviousYears", "RIFE carried forward from previous years (128)", {
            description:
              "Restricted interest and financing expenses from earlier years, claimable this year to the extent capacity allows.",
          }),
          f.money("partnershipIfeAddBack", "Partnership IFE add-back (158)", {
            description: "Schedule 130 Part 2N — flows to Schedule 1 line 252.",
          }),
        ],
        {
          variant: "card",
          cols: 2,
          description:
            "Complete only when the section above leaves the corporation inside the regime. Adjusted taxable income (Part 2F) is derived from this return — taxable income plus the IFE, capital cost allowance, resource deductions, terminal loss and Part VI.1 deduction it already computes — so it is not asked for here.",
        },
      ),
      section(
        "groupRatio",
        "Group ratio election (subsection 18.21(2))",
        [
          f.switch("hasGroupRatioElection", "A group ratio election was made", {
            description:
              "Replaces the fixed 30% ceiling with the group's own ratio — and makes excess capacity nil for the year.",
          }),
          f.money("groupRatioAmount", "Allocated group ratio amount (118/132)"),
          f.money("adjustedTaxableIncome", "Adjusted taxable income override (106)", {
            description:
              "Leave blank. Supply only to override the engine's own Part 2F derivation — for a figure it cannot see, such as foreign affiliate or partnership components.",
          }),
        ],
        { variant: "card", cols: 2 },
      ),
      section(
        "capacity",
        "Received capacity (Part 1A, line 130)",
        [
          f.array("receivedCapacity", "Capacity received from group entities", [
            field.text("entityName", "Eligible group entity"),
            field.text("accountNumber", "Account number"),
            field.date("taxYearEnd", "Their tax year end"),
            money("amount", "Amount received"),
          ]),
        ],
        {
          variant: "card",
          cols: 1,
          description:
            "Capacity transferred to this corporation by eligible group entities under subsection 18.2(4). The column total is line 130, which shelters the denial and feeds AT1 Schedule 21 line 330.",
        },
      ),
      section(
        "vintages",
        "Excess capacity carried forward (Part 2I, lines 122-125)",
        [
          f.array("priorYearExcessCapacity", "Preceding years", [
            field.number("yearsAgo", "Years ago (1-3)"),
            money("excessCapacity", "Excess capacity (122)"),
            money("previouslyTransferred", "Previously transferred (123)"),
            money("previouslyAbsorbed", "Previously absorbed (124)"),
          ]),
        ],
        {
          variant: "card",
          cols: 1,
          description:
            "Unused excess capacity from the three immediately preceding years, net of what has already been transferred away or absorbed. It is absorbed against this year's expenses before anything is denied — the form carries three years only, because that is how long unused capacity lives.",
        },
      ),
      section(
        "borrowings",
        "Borrowings and other financings (Part 1C, lines 012-016)",
        [
          f.array("borrowings", "Borrowings", [
            field.select("relationship", "Relationship", EIFEL_COUNTERPARTY_OPTIONS),
            money("principalAmount", "Principal (012)"),
            money("derivativeNotional", "Derivative notional (013)"),
            money("interestPaidOrPayable", "Interest paid or payable (014)"),
            money("fundingCostAmounts", "Other funding-cost amounts (015)"),
            money("costReducingAmounts", "Amounts reducing the cost of funding (016)"),
          ]),
        ],
        {
          variant: "card",
          cols: 1,
          description:
            "The interest side of the IFE build-up. Column 4 totals to line 027, column 5 to line 033, and column 6 nets off against them as variable B.",
        },
      ),
      section(
        "loans",
        "Loans and other financings (Part 1D, lines 017-020)",
        [
          f.array("loans", "Loans", [
            field.select("relationship", "Relationship", EIFEL_COUNTERPARTY_OPTIONS),
            money("principalAmount", "Principal (017)"),
            money("derivativeNotional", "Derivative notional (018)"),
            money("returnAmounts", "Amounts included in the return (019)"),
            money("returnReducingAmounts", "Amounts reducing the return (020)"),
          ]),
        ],
        {
          variant: "card",
          cols: 1,
          description: "The revenue side — these total to Part 2D lines 061 and 066.",
        },
      ),
      section(
        "partnershipIfe",
        "IFE allocated from a partnership (Part 1E, lines 021-026)",
        [
          f.array("partnershipIfe", "Partnerships", [
            field.text("partnershipName", "Partnership"),
            field.text("accountNumber", "Account number"),
            money("shareOfPartnershipIfe", "Share of the partnership's IFE (023)"),
            money("portionUnderParagraph12_1_l1", "Portion under 12(1)(l.1) (024)"),
            money("portionDeniedBySubsection96_2_1", "Portion denied by 96(2.1) (025)"),
          ]),
        ],
        {
          variant: "card",
          cols: 1,
          description:
            "This share sits inside IFE and therefore inside the ceiling, but it is denied through paragraph 12(1)(l.2) rather than subsection 18.2(2) — so it is excluded from the Schedule 1 line 251 base and added back on line 252 instead. Entering it here is what keeps those two apart.",
        },
      ),
      section(
        "capitalizedIfe",
        "IFE capitalized into depreciable property (Part 2B, lines 046-052)",
        [
          f.array("capitalizedIfe", "By CCA class", [
            field.text("ccaClass", "Class"),
            money("ifeInOpeningUcc", "IFE in opening UCC (047)"),
            money("ifeInAcquisitionsAndDispositions", "IFE in additions/dispositions (048)"),
            money("ifeInTerminalLoss", "IFE in the terminal loss (050)"),
            money("ifeInCca", "IFE in the CCA claimed (051)"),
          ]),
        ],
        {
          variant: "card",
          cols: 1,
          description:
            "Interest paid on or after 4 February 2022 that went into the capital cost of depreciable property rather than being expensed. The portion claimed as CCA this year comes back into IFE on line 030, and the terminal-loss portion on line 032.",
        },
      ),
      section(
        "resourceIfe",
        "IFE inside resource expense pools (Part 2C, lines 053-057)",
        [
          f.array("resourceIfe", "By pool", [
            field.select("pool", "Pool", RESOURCE_IFE_POOL_OPTIONS),
            money("ifeInOpeningBalance", "IFE in the opening balance (053)"),
            money("ifeAddedOrDeducted", "IFE added or deducted (054)"),
            money("ifeInCurrentYearClaim", "IFE in this year's claim (056)"),
          ]),
        ],
        {
          variant: "card",
          cols: 1,
          description:
            "The same idea as capitalized interest, for the resource pools: interest that went into a pool rather than being expensed comes back into IFE (line 031) as the pool is claimed.",
        },
      ),
      section(
        "exemptIfe",
        "Exempt IFE (Part 1B, lines 006-011)",
        [
          f.array("exemptIfe", "Public-sector agreements", [
            field.text("authorityName", "Public sector authority"),
            money("principalAmount", "Principal (008)"),
            money("ifeIncurred", "IFE incurred (009)"),
            money("incomeFromFundedActivities", "Income from funded activities (010)"),
            money("lossFromFundedActivities", "Loss from funded activities (011)"),
          ]),
        ],
        {
          variant: "card",
          cols: 1,
          description:
            "Exempt IFE is left out of the IFE total altogether, but the income and losses of the activities it funded still move adjusted taxable income — income reduces it (line 104), losses add to it (line 092).",
        },
      ),
      section(
        "lossPortionFromIfe",
        "IFE-derived portion of a loss claim (Part 2E, lines 073-078)",
        [
          f.array("lossPortionFromIfe", "By loss vintage", [
            field.date("taxYearOfOrigin", "Year the loss arose"),
            money("nonCapitalLoss", "Non-capital loss (074)"),
            money("variableJSecondAmount", "Variable J, second amount (075)"),
            money("amountDeducted", "Amount deducted this year (077)"),
          ]),
        ],
        {
          variant: "card",
          cols: 1,
          description:
            "Complete only where a non-capital loss deducted this year under paragraph 111(1)(a) is not a specified pre-regime loss. The portion of it derived from interest is added back to adjusted taxable income (line 089), apportioned by variable J over the loss.",
        },
      ),
      section(
        "ifeDetail",
        "Other IFE lines (Part 2A)",
        [
          f.money("ifeDetail.otherInterest", "Interest paid or payable — other (028)"),
          f.money("ifeDetail.subsection20_1_eAmounts", "Subsection 20(1)(e) series (029)"),
          f.money("ifeDetail.fundingCostLoss", "Deductible loss under the arrangement (034)"),
          f.money("ifeDetail.fundingCostCapitalLoss", "Capital loss under the arrangement (035)"),
          f.money("ifeDetail.feeGivingRiseToIfe", "Fee giving rise to IFE (036)"),
          f.money("ifeDetail.feeReducingIfe", "Fee reducing IFE (037)"),
          f.money("ifeDetail.leaseFinancingAmount", "Lease financing amount (038)"),
          f.money("ifeDetail.reinstatedPartnershipLoss", "Reinstated 111(1)(e) claim (040)"),
          f.money("ifeDetail.affiliateRaife", "Affiliate relevant IFE — RAIFE (041)"),
          f.money("ifeDetail.costReducingGain", "Gain reducing the cost of funding (043)"),
          f.money("ifeDetail.costReducingPartnershipShare", "Partnership share of such an amount (044)"),
        ],
        {
          variant: "card",
          cols: 2,
          description:
            "The Part 2A lines that no table above feeds. Lines 027, 030, 031, 032, 033, 039 and 042 come from Parts 1C, 1E, 2B and 2C — do not repeat them here.",
        },
      ),
      section(
        "ifrDetail",
        "Other IFR lines (Part 2D)",
        [
          f.money("ifrDetail.interestReceived", "Interest received or receivable (058)"),
          f.money("ifrDetail.subsection12_9Amounts", "Subsection 12(9) / section 17.1 (059)"),
          f.money("ifrDetail.guaranteeFees", "Guarantee or credit-support fees (060)"),
          f.money("ifrDetail.returnGain", "Gain included in income (062)"),
          f.money("ifrDetail.leaseFinancingAmount", "Lease financing amount (063)"),
          f.money("ifrDetail.partnershipShare", "Share of a partnership's IFR (064)"),
          f.money("ifrDetail.affiliateRaifr", "Affiliate relevant IFR (065)"),
          f.money("ifrDetail.returnReducingLoss", "Deductible loss (067)"),
          f.money("ifrDetail.returnReducingCapitalLoss", "Capital loss (068)"),
          f.money("ifrDetail.returnReducingPartnershipShare", "Partnership share of such an amount (069)"),
          f.money("ifrDetail.shelteredByForeignTaxRelief", "Sheltered by foreign tax relief (070)"),
          f.money("ifrDetail.exemptFromPartITax", "Exempt from Part I tax (071)"),
        ],
        {
          variant: "card",
          cols: 2,
          description:
            "The Part 2D lines that Part 1D does not feed — it supplies lines 061 and 066.",
        },
      ),
      section(
        "clause95",
        "Controlled foreign affiliates — clause 95(2)(f.11)(ii)(D) (Part 2M)",
        [
          f.array("clause95Denied", "Denied under subclause (D)(I)", [
            field.text("affiliateName", "Affiliate"),
            money("variableAForAffiliate", "Variable A of the affiliate's IFE (145)"),
            field.number("specifiedParticipatingPercentage", "Participating share, as a decimal (148)"),
          ]),
          f.array("clause95Included", "Included under subclause (D)(II)", [
            field.text("affiliateName", "Affiliate"),
            money("amountInAffiliateFapi", "Amount in the affiliate's FAPI (152)"),
            field.number("specifiedParticipatingPercentage", "Participating share, as a decimal (153)"),
          ]),
        ],
        {
          variant: "card",
          cols: 1,
          description:
            "Both totals join the RIFE that carries forward (Part 2O lines 161 and 162). Enter the participating share as a decimal — 0.4 for 40%. The first table is measured at the same proportion the corporation's own expenses are denied at, so it cannot be computed until the limitation has run.",
        },
      ),
    ],
  }),
});
