/**
 * Live previews over the working return — the numbers shown while the preparer
 * types, before a compute round-trip.
 *
 * Simple arithmetic ONLY (sums of entered fields) — anything that is an actual
 * TAX RULE (declining-balance CCA, credit grinds, loss continuity, …) is
 * deliberately NOT reimplemented here. A second hand-written copy of a tax
 * rule drifts from the engine's; the CCA preview that used to live in this
 * file was exactly that, and it has moved to `use-cca-preview.ts`, which asks
 * the real engine (`apps/server`'s `preview-cca` action, backed by
 * `computeCcaClass`) instead of re-deriving the half-year/AIIP/immediate-
 * expensing rules client-side. Pure functions over `ReturnInput`, with no
 * React or formkit dependency, so the editor and the print surface can both
 * use them without pulling in the form schemas.
 */
import { n, type ReturnInput } from "./return-input";

/** Book net income implied by the income statement (GIFI 9999). */
export function bookNetIncomeOf(ri: ReturnInput): number {
  const is = ri.incomeStatement ?? {};
  return (
    n(is.revenue) - n(is.costOfSales) - n(is.salariesAndWages) - n(is.amortization) - n(is.otherExpenses)
  );
}

/** Balance-sheet totals (for the GIFI balance check). */
export function balanceSheetTotals(ri: ReturnInput) {
  const b = ri.balanceSheet ?? {};
  const assets = n(b.cash) + n(b.accountsReceivable) + n(b.inventory) + n(b.capitalAssetsNet) + n(b.otherAssets);
  const liabilities = n(b.accountsPayable) + n(b.loansPayable) + n(b.otherLiabilities);
  const equity = n(b.shareCapital) + n(b.retainedEarnings);
  return { assets, liabilities, equity, balanced: assets === liabilities + equity };
}
