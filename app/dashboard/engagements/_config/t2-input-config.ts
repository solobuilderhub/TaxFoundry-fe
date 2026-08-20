import { defineSchema, field, section } from "@classytic/formkit";

/**
 * Federal T2 return input (matches the engine's `FederalT2Input`). Whole
 * dollars, GIFI convention. `period` is injected from the engagement at submit
 * time, so the preparer only enters the financials.
 */
export type T2InputValues = {
  bookNetIncome: number;
  activeBusinessIncome: number;
  provincialAllocationIncome?: number;
  businessLimit?: number;
  taxableCapital?: number;
  aaii?: number;
};

/**
 * Preconfigured demo input — a simple CCPC: $200k book net income, all active
 * business income, full $500k business limit. Computes to ~$18,000 federal tax
 * (200,000 × 9% SBD rate), so a user can click Compute and immediately see a
 * real result without knowing the numbers.
 */
export const T2_DEMO_INPUT: T2InputValues = {
  bookNetIncome: 200000,
  activeBusinessIncome: 200000,
  businessLimit: 500000,
  taxableCapital: 0,
  aaii: 0,
};

export function getT2InputSchema() {
  return defineSchema<T2InputValues>({
    sections: [
      section<T2InputValues>("income", "Income (per financial statements)", [
        field.number<T2InputValues>(
          "bookNetIncome",
          "Net income (loss) per books",
          { required: true, fullWidth: true, placeholder: "e.g. 200000" },
        ),
        field.number<T2InputValues>(
          "activeBusinessIncome",
          "Active business income (ABI)",
          { required: true, placeholder: "e.g. 200000" },
        ),
        field.number<T2InputValues>(
          "provincialAllocationIncome",
          "Taxable income earned in the province",
          { placeholder: "defaults to taxable income" },
        ),
      ]),
      section<T2InputValues>("sbd", "Small business deduction (Schedule 7)", [
        field.number<T2InputValues>("businessLimit", "Business limit", {
          placeholder: "500000",
        }),
        field.number<T2InputValues>(
          "taxableCapital",
          "Taxable capital, prior year",
          { placeholder: "grinds the limit above $10M" },
        ),
        field.number<T2InputValues>(
          "aaii",
          "Adjusted aggregate investment income",
          { placeholder: "grinds the limit above $50k" },
        ),
      ]),
    ],
  });
}
