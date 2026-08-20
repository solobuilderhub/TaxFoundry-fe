"use client";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { FileUp, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogWrapper } from "@classytic/fluid/client/dialog-wrapper";
import { Textarea } from "@/components/ui/textarea";
import { importGifi, type GifiImportResult } from "@/api/gifi";

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
 * GIFI import — paste, upload, or download-and-fill a GIFI-coded trial balance;
 * preview how it classifies against the CRA GIFI chart into the balance sheet +
 * income statement, then apply it to the return (populates both in one step).
 */
export function GifiImportDialog({
  open,
  onOpenChange,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (result: GifiImportResult) => void;
}) {
  const [text, setText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const preview = useMutation<GifiImportResult, Error, string>({
    mutationFn: importGifi,
  });
  const result = preview.data;

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
    setText(content);
    preview.reset();
    toast.success(`Loaded ${file.name}. Click Preview to classify`);
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
      title="Import GIFI trial balance"
      description="Paste your GIFI-coded trial balance, upload a CSV, or download the sample to fill in. Each code is classified against the CRA GIFI chart into the balance sheet and income statement."
      contentClassName="flex max-h-[85vh] flex-col overflow-y-auto"
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!result}
            onClick={() => {
              if (!result) return;
              onApply(result);
              toast.success("Balance sheet & income statement populated from GIFI");
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
            accept=".csv,.txt,text/csv,text/plain"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload className="size-4" /> Upload CSV
          </Button>
          <Button variant="outline" size="sm" onClick={downloadSample}>
            <Download className="size-4" /> Download sample
          </Button>
          <span className="text-xs text-muted-foreground">CSV or plain text. One account per line.</span>
        </div>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={PLACEHOLDER}
          className="min-h-40 font-mono text-xs"
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!text.trim() || preview.isPending}
            onClick={() => preview.mutate(text)}
          >
            {preview.isPending ? "Classifying…" : "Preview classification"}
          </Button>
          {preview.isError && (
            <span className="text-sm text-destructive">
              {preview.error instanceof Error ? preview.error.message : "Import failed"}
            </span>
          )}
        </div>

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
