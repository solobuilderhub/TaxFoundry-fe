/**
 * Human labels for the engine's computed-return lines.
 *
 * The computed return's `fields[].line` are internal engine slugs
 * (`donationPoolClosing`, `partIBasicTax`, `ccaClosingUCC:8`). Those must NEVER
 * reach a user — every surface (summary, detail, print, export) renders through
 * `labelForLine`, which maps to a plain-English label + CRA line/schedule ref and
 * falls back to a humanised slug so a new engine line can never leak raw.
 *
 * `HIDDEN_LINES` are internal duplicates kept out of the user-facing summary
 * (e.g. the cents-denominated obligation total, which is shown as dollars).
 */
export const LINE_LABEL: Record<string, string> = {
  // Income & taxable income
  netIncomeForTax: "Net income for tax",
  taxableCapitalGain: "Taxable capital gain (S6)",
  netCapitalLossCreated: "Net capital loss created (S6)",
  ccaClaimed: "Capital cost allowance (S8)",
  ccaRecapture: "CCA recapture (S8)",
  ccaTerminalLoss: "Terminal loss (S8)",
  donationsClaimed: "Charitable donations claimed (S2)",
  nonCapitalLossApplied: "Non-capital loss applied (S4)",
  netCapitalLossApplied: "Net-capital loss applied (S4)",
  lossCarriedBack: "Loss carried back to prior years (S4)",
  taxableIncome: "Taxable income",
  reservesClosing: "Reserves deducted this year (S13)",
  taxableCapitalEmployedInCanada: "Taxable capital employed in Canada (S33)",
  // Small business & Part I build-up
  sbdIncome: "Small-business-rate income",
  sbdDeduction: "Small-business deduction (line 430)",
  partIBasicTax: "Basic Part I tax, 38% (line 550)",
  federalAbatement: "Federal abatement (line 608)",
  generalRateReduction: "General rate reduction (line 638)",
  partITaxPayable: "Part I tax payable (line 700)",
  // Credits & other Parts
  zetmRateReduction: "Zero-emission tech mfg reduction (S27)",
  foreignTaxCredit: "Foreign tax credit (S21)",
  sredItcEarned: "SR&ED investment tax credit (S31)",
  sredItcRefundable: "SR&ED refundable credit (S31)",
  partIVTaxPayable: "Part IV tax payable (refundable)",
  dividendRefund: "Dividend refund",
  excessiveEligibleDividend: "Excessive eligible dividend (Part III.1)",
  // Totals
  totalFederalTax: "Federal tax (net of credits)",
  federalTax: "Federal tax",
  provincialTax: "Provincial/territorial tax (S5)",
  totalTaxPayable: "Total tax payable (line 770)",
  totalOwing: "Total tax payable",
  // Alberta AT1 (provincial return)
  albertaTaxableIncome: "Alberta taxable income",
  albertaSbdIncome: "Alberta small-business-rate income",
  albertaTaxPayable: "Alberta tax payable (AT1)",
  // Québec CO-17 (provincial return)
  allocationFactor: "Québec / provincial allocation factor",
  quebecTaxableIncome: "Québec taxable income",
  quebecSbdIncome: "Québec small-business-rate income",
  quebecTaxAtSmallBusinessRate: "Québec tax at small-business rate (3.2%)",
  quebecTaxAtGeneralRate: "Québec tax at general rate (11.5%)",
  quebecTaxPayable: "Québec tax payable (CO-17)",
  // Carryforward closing balances
  nonCapitalLossClosing: "Non-capital loss carried forward",
  netCapitalLossClosing: "Net-capital loss carried forward",
  donationPoolClosing: "Donations carried forward",
  itcPoolClosing: "SR&ED credit carried forward",
  businessFtcPoolClosing: "Foreign tax credit carried forward",
  gripClosing: "GRIP balance carried forward (S53)",
  erdtohClosing: "Eligible RDTOH carried forward",
  nerdtohClosing: "Non-eligible RDTOH carried forward",
};

/** Internal/duplicate lines kept OUT of the user-facing summary. */
export const HIDDEN_LINES = new Set(["totalTaxPayable"]);

/** Lines that are ratios (0–1), not dollar amounts — rendered as a factor, not money. */
export const FACTOR_LINES = new Set(["allocationFactor"]);

/** Turn a camelCase engine slug into a readable fallback label. */
function humanise(slug: string): string {
  const s = slug
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_:]/g, " ")
    .trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Human label for a computed-return line — never returns a raw slug. */
export function labelForLine(line: string): string {
  if (LINE_LABEL[line]) return LINE_LABEL[line];
  // Per-class CCA closing UCC, e.g. "ccaClosingUCC:8".
  if (line.startsWith("ccaClosingUCC:")) {
    return `Class ${line.slice("ccaClosingUCC:".length)}. Closing UCC (S8)`;
  }
  return humanise(line);
}
