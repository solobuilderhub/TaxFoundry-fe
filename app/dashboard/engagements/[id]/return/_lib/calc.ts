/**
 * Live previews over the working return — the numbers shown while the preparer
 * types, before a compute round-trip.
 *
 * These MIRROR the engine (`@classytic/ca-tax/t2`); they never replace it. The
 * engine's result is the authoritative figure and the only one that gets filed
 * (invariant: `provenance: engine`). Pure functions over `ReturnInput`, with no
 * React or formkit dependency, so the editor and the print surface can both use
 * them without pulling in the form schemas.
 */
import { ccaRate } from "./cca-rates";
import { n, type CcaClass, type ReturnInput } from "./return-input";

/** Book net income implied by the income statement (GIFI 9999). */
export function bookNetIncomeOf(ri: ReturnInput): number {
  const is = ri.incomeStatement ?? {};
  return (
    n(is.revenue) - n(is.costOfSales) - n(is.salariesAndWages) - n(is.amortization) - n(is.otherExpenses)
  );
}

export interface CcaPreview {
  rate: number;
  cca: number;
  closingUCC: number;
  recapture: number;
  terminalLoss: number;
}

/** Live per-class preview mirroring the engine (half-year / AIIP / immediate expensing). */
export function ccaClassPreview(c: CcaClass): CcaPreview {
  const rate = ccaRate(c.ccaClass);
  const opening = n(c.openingUCC);
  const additions = Math.max(0, n(c.additions));
  const dispositions = Math.max(0, n(c.dispositions));
  const uccBefore = opening + additions - dispositions;
  if (uccBefore < 0) return { rate, cca: 0, closingUCC: 0, recapture: -uccBefore, terminalLoss: 0 };
  if (c.classEmptied && uccBefore > 0) return { rate, cca: 0, closingUCC: 0, recapture: 0, terminalLoss: uccBefore };
  const net = Math.max(0, additions - dispositions);
  const ie = Math.min(Math.max(0, n(c.immediateExpensing)), net, uccBefore);
  const rem = net - ie;
  const adj = c.aiip ? rem * 0.5 : -rem * 0.5; // AIIP enhances, half-year reduces
  const base = Math.max(0, uccBefore - ie + adj);
  const max = Math.min(ie + Math.round(rate * base), uccBefore);
  const cca = c.claim != null && c.claim !== 0 ? Math.min(Math.max(0, n(c.claim)), max) : max;
  return { rate, cca, closingUCC: uccBefore - cca, recapture: 0, terminalLoss: 0 };
}

/** Total CCA across the Schedule 8 classes. */
export function ccaTotalOf(ri: ReturnInput): number {
  return (ri.cca?.classes ?? []).reduce((sum, c) => sum + ccaClassPreview(c).cca, 0);
}

/** Balance-sheet totals (for the GIFI balance check). */
export function balanceSheetTotals(ri: ReturnInput) {
  const b = ri.balanceSheet ?? {};
  const assets = n(b.cash) + n(b.accountsReceivable) + n(b.inventory) + n(b.capitalAssetsNet) + n(b.otherAssets);
  const liabilities = n(b.accountsPayable) + n(b.loansPayable) + n(b.otherLiabilities);
  const equity = n(b.shareCapital) + n(b.retainedEarnings);
  return { assets, liabilities, equity, balanced: assets === liabilities + equity };
}
