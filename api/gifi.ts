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

/** Who a .cor file is for — shown against the engagement's client before anything is applied. */
export interface CorIdentification {
  corporationName?: string;
  corporationNumber?: string;
  businessNumber?: string;
  taxYearStart?: string;
  taxYearEnd?: string;
  taxYear?: number;
  address: { line1?: string; city?: string; province?: string; country?: string; postalCode?: string };
  provinceCode?: string;
  businessActivityCodes: string[];
  businessDescription?: string;
  fileVersion?: string;
  fileType?: string;
}

/** A .cor import is a GIFI import plus the corporation the file belongs to. */
export interface CorImportResult extends GifiImportResult {
  identification: CorIdentification;
  gifiAccountsInFile: number;
  parsingWarnings: string[];
  parsingErrors: string[];
}

/**
 * .cor import → the same `gifi` service resource. Reads a CRA Corporation
 * Internet Filing file (what every certified T2 package exports) and classifies
 * its GIFI accounts by the same path as a pasted trial balance.
 */
export function importCor(content: string): Promise<CorImportResult> {
  return gifiApi.invokeRoute<CorImportResult>({
    method: "POST",
    path: "/import-cor",
    data: { content },
  });
}
