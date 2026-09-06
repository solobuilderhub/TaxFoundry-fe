"use client";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { FileUp, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogWrapper } from "@classytic/fluid/client/dialog-wrapper";
import { Textarea } from "@/components/ui/textarea";
import { type CorImportResult, type GifiImportResult, importCor, importGifi } from "@/api/gifi";

/** A .cor file, held until Preview parses it server-side. */
interface LoadedCor {
  name: string;
  content: string;
}

type PreviewRequest = { kind: "gifi"; text: string } | { kind: "cor"; content: string };
type PreviewResult = GifiImportResult | CorImportResult;

const isCorResult = (r: PreviewResult): r is CorImportResult => "identification" in r;

/** Business numbers compare on their digits — "123456789 RC0001" and "123456789RC0001" are the same BN. */
const bnDigits = (bn: string | undefined) => (bn ?? "").replace(/\D/g, "").slice(0, 9);

const money = (n: number) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(n);

const PLACEHOLDER = `Paste your GIFI trial balance. One account per line, e.g.

1000  Cash and deposits        50000
1060  Accounts receivable      30000
2620  Accounts payable         25000
8299  Total revenue            400000
8518  Cost of sales            180000
9060  Salaries and wages       90000

Tip: paste, upload a CSV, or download the sample below to start from.`;

/** A ready-to-fill sample the preparer can download, edit in Excel, and re-upload. */
const SAMPLE_CSV = `Code,Description,Amount
1000,Cash and deposits,50000
1060,Accounts receivable,30000
1120,Inventory,20000
1740,Capital assets (net),40000
2620,Accounts payable,25000
2700,Loans payable,35000
3500,Share capital,10000
3600,Retained earnings,70000
8299,Total revenue,400000
8320,Cost of sales,180000
9060,Salaries and wages,90000
8670,Amortization,10000
9270,Other operating expenses,30000
`;

/**
 * GIFI import — paste, upload, or download-and-fill a GIFI-coded trial balance,
 * OR upload a CRA .cor file (what every certified T2 package exports); preview
 * how it classifies against the CRA GIFI chart into the balance sheet + income
 * statement, then apply it to the return (populates both in one step).
 *
 * A .cor also names the corporation it belongs to, which is shown — and checked
 * against this engagement's client — before Apply, because the most likely
 * mistake with a file picker is the wrong corporation's file and nothing about
 * a balance sheet reveals that.
 */
export function GifiImportDialog({
  open,
  onOpenChange,
  onApply,
  clientBusinessNumber,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (result: GifiImportResult) => void;
  /** This engagement's client BN, to catch a .cor for a different corporation. */
  clientBusinessNumber?: string;
}) {
  const [text, setText] = useState("");
  const [cor, setCor] = useState<LoadedCor | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const preview = useMutation<PreviewResult, Error, PreviewRequest>({
    mutationFn: (req) => (req.kind === "cor" ? importCor(req.content) : importGifi(req.text)),
  });
  const result = preview.data;
  const identification = result && isCorResult(result) ? result.identification : undefined;
  const bnMismatch =
    identification?.businessNumber && clientBusinessNumber
      ? bnDigits(identification.businessNumber) !== bnDigits(clientBusinessNumber)
      : false;

  const downloadSample = () => {
    const url = URL.createObjectURL(new Blob([SAMPLE_CSV], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "gifi-trial-balance-sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const content = await file.text();
    preview.reset();
    if (/\.cor$/i.test(file.name)) {
      setCor({ name: file.name, content });
      setText("");
      toast.success(`Loaded ${file.name}. Click Preview to read the return`);
      return;
    }
    setCor(null);
    setText(content);
    toast.success(`Loaded ${file.name}. Click Preview to classify`);
  };

  const runPreview = () => {
    if (cor) preview.mutate({ kind: "cor", content: cor.content });
    else preview.mutate({ kind: "gifi", text });
  };

  const rows: { label: string; value: number }[] = result
    ? [
        { label: "Revenue", value: result.incomeStatement.revenue },
        { label: "Cost of sales", value: result.incomeStatement.costOfSales },
        { label: "Salaries & wages", value: result.incomeStatement.salariesAndWages },
        { label: "Amortization", value: result.incomeStatement.amortization },
        { label: "Other expenses", value: result.incomeStatement.otherExpenses },
      ]
    : [];

  return (
    <DialogWrapper
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title="Import financial statements"
      description="Paste a GIFI-coded trial balance, upload a CSV, or upload the .cor file from a filed return. Each code is classified against the CRA GIFI chart into the balance sheet and income statement."
      contentClassName="flex max-h-[85vh] flex-col overflow-y-auto"
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!result || bnMismatch}
            title={bnMismatch ? "This file is for a different business number than this client" : undefined}
            onClick={() => {
              if (!result || bnMismatch) return;
              onApply(result);
              toast.success(
                isCorResult(result)
                  ? "Balance sheet & income statement populated from the .cor file"
                  : "Balance sheet & income statement populated from GIFI",
              );
              onOpenChange(false);
            }}
          >
            <FileUp className="size-4" /> Apply to return
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.txt,.cor,text/csv,text/plain"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload className="size-4" /> Upload CSV or .cor
          </Button>
          <Button variant="outline" size="sm" onClick={downloadSample}>
            <Download className="size-4" /> Download sample
          </Button>
          <span className="text-xs text-muted-foreground">CSV or plain text, one account per line — or a .cor file.</span>
        </div>

        {cor ? (
          <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2 text-sm">
            <span>
              <span className="font-medium">{cor.name}</span>
              <span className="text-muted-foreground"> — .cor file, read on Preview</span>
            </span>
            <Button variant="ghost" size="sm" onClick={() => { setCor(null); preview.reset(); }}>
              Remove
            </Button>
          </div>
        ) : (
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={PLACEHOLDER}
            className="min-h-40 font-mono text-xs"
          />
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={(!cor && !text.trim()) || preview.isPending}
            onClick={runPreview}
          >
            {preview.isPending ? (cor ? "Reading…" : "Classifying…") : cor ? "Preview return" : "Preview classification"}
          </Button>
          {preview.isError && (
            <span className="text-sm text-destructive">
              {preview.error instanceof Error ? preview.error.message : "Import failed"}
            </span>
          )}
        </div>

        {identification && (
          <div className="space-y-2 rounded-lg border p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{identification.corporationName ?? "Corporation not named in file"}</span>
              {identification.businessNumber && <Badge variant="outline">BN {identification.businessNumber}</Badge>}
              {(identification.taxYearStart || identification.taxYearEnd) && (
                <Badge variant="outline">
                  {identification.taxYearStart ?? "?"} → {identification.taxYearEnd ?? "?"}
                </Badge>
              )}
              {identification.provinceCode && <Badge variant="outline">{identification.provinceCode}</Badge>}
            </div>
            {bnMismatch ? (
              <p className="text-destructive">
                This file is for business number {identification.businessNumber}, but this engagement's client is{" "}
                {clientBusinessNumber}. Apply is disabled — check you have the right corporation's file.
              </p>
            ) : (
              clientBusinessNumber &&
              identification.businessNumber && (
                <p className="text-muted-foreground">Business number matches this client.</p>
              )
            )}
            {result && isCorResult(result) && result.parsingErrors.length > 0 && (
              <p className="text-xs text-destructive">
                {result.parsingErrors.length} line(s) could not be read: {result.parsingErrors.slice(0, 3).join("; ")}
                {result.parsingErrors.length > 3 ? "…" : ""}
              </p>
            )}
          </div>
        )}

        {result && (
          <div className="space-y-3 rounded-lg border p-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="secondary">{result.mappedLines} lines mapped</Badge>
              <Badge variant={result.totals.balanced ? "default" : "destructive"}>
                {result.totals.balanced ? "Balances" : "Out of balance"}
              </Badge>
              <span className="text-muted-foreground">
                Book net income <span className="font-medium text-foreground tabular-nums">{money(result.bookNetIncome)}</span>
              </span>
            </div>

            <div className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              {rows.map((r) => (
                <div key={r.label} className="flex justify-between border-b py-1 last:border-0">
                  <span className="text-muted-foreground">{r.label}</span>
                  <span className="tabular-nums">{money(r.value)}</span>
                </div>
              ))}
              <div className="flex justify-between border-b py-1">
                <span className="text-muted-foreground">Total assets</span>
                <span className="tabular-nums">{money(result.totals.assets)}</span>
              </div>
              <div className="flex justify-between border-b py-1">
                <span className="text-muted-foreground">Liabilities + equity</span>
                <span className="tabular-nums">{money(result.totals.liabilitiesEquity)}</span>
              </div>
            </div>

            {(result.skippedTotals.length > 0 || result.invalidCodes.length > 0) && (
              <p className="text-xs text-muted-foreground">
                {result.skippedTotals.length > 0 &&
                  `Skipped ${result.skippedTotals.length} rollup total(s) (${result.skippedTotals.join(", ")}) to avoid double-counting. `}
                {result.invalidCodes.length > 0 &&
                  `Unknown code(s) ignored: ${result.invalidCodes.join(", ")}.`}
              </p>
            )}
          </div>
        )}
      </div>
    </DialogWrapper>
  );
}
