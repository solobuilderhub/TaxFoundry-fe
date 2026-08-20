import { createCrudApi } from "@classytic/arc-next/api";

export interface GifiImportResult {
  balanceSheet: {
    cash: number;
    accountsReceivable: number;
    inventory: number;
    capitalAssetsNet: number;
    otherAssets: number;
    accountsPayable: number;
    loansPayable: number;
    otherLiabilities: number;
    shareCapital: number;
    retainedEarnings: number;
  };
  incomeStatement: {
    revenue: number;
    costOfSales: number;
    salariesAndWages: number;
    amortization: number;
    otherExpenses: number;
  };
  bookNetIncome: number;
  totals: { assets: number; liabilitiesEquity: number; balanced: boolean };
  invalidCodes: string[];
  skippedTotals: string[];
  mappedLines: number;
}

/**
 * GIFI import → server `gifi` service resource. Classifies a pasted GIFI trial
 * balance into balance-sheet + income-statement figures using @classytic/ledger-ca.
 */
const gifiApi = createCrudApi("gifi", { basePath: "/api" });

export function importGifi(text: string): Promise<GifiImportResult> {
  return gifiApi.invokeRoute<GifiImportResult>({
    method: "POST",
    path: "/import",
    data: { text },
  });
}
