"use client";

import { useState } from "react";
import { Printer } from "lucide-react";
import { toast } from "sonner";
import { SchemaFormDialog } from "@classytic/fluid/formkit";
import { DocumentPage, DocumentSection } from "@classytic/fluid/document";
import "@classytic/fluid/document/print.css";
import { Button } from "@/components/ui/button";
import { FORM_COMPONENTS } from "@/components/form/money-field";
import { useEngagement, useEngagementActions } from "@/hooks/query/use-engagements";
import { getT183Schema, type T183Values } from "../../../_config/t183-config";
import { useLatestComputedReturn } from "@/hooks/query/use-computed-returns";
import { useClients } from "@/hooks/query/use-clients";

const money = (v: number) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(v || 0);
const d = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("en-CA") : "—");

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, borderBottom: "1px solid #999", paddingBottom: 2 }}>{value}</div>
    </div>
  );
}

/**
 * T183 CORP — Information Return for Corporations Filing Electronically.
 * The authorization the corporation's signing officer signs so the preparer may
 * transmit; a signed copy must be retained (6 years). Fields mirror the CRA form.
 */
export function T183Print({ id }: { id: string }) {
  const { data: engagement, isLoading } = useEngagement(id);
  const { latest: computed } = useLatestComputedReturn(id);
  const { items: clients } = useClients({ limit: 200 });
  // EVERY hook stays above the early return below. React counts hooks per render,
  // so one declared after it changes the count as soon as loading finishes — the
  // page then crashes to an error boundary the moment the data arrives.
  const [recordOpen, setRecordOpen] = useState(false);
  const { authorizeT183 } = useEngagementActions();

  if (isLoading || !engagement) {
    return <div className="p-6 text-muted-foreground">Loading…</div>;
  }

  const client = (clients ?? []).find((c) => c._id === engagement.clientId);
  const foldVal = (line: string) => {
    const f = (computed?.fields ?? []).find((x) => x.line === line);
    return f ? Number(f.value) : 0;
  };
  const totalTax = foldVal("totalOwing") / 100; // cents → dollars

  /**
   * Record what the officer actually signed. Nothing is defaulted: the server
   * refuses a missing signing time or method rather than inventing them, because
   * a signing moment nobody observed is a fabricated attestation.
   */
  const onRecord = async (values: T183Values) => {
    try {
      await authorizeT183.mutateAsync({
        id,
        input: {
          officerName: values.officerName,
          officerPosition: values.officerPosition,
          signedAt: new Date(values.signedAt).toISOString(),
          authorizationMethod: values.authorizationMethod as never,
          ...(values.evidenceRef ? { evidenceRef: values.evidenceRef } : {}),
          ...(values.formVersion ? { formVersion: values.formVersion } : {}),
        },
      });
      setRecordOpen(false);
      toast.success("T183 authorization recorded — the return can now be transmitted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not record the authorization");
    }
  };

  return (
    <div>
      <div className="no-print mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Print it, have the officer sign it, then record the signature here. Filing is
          blocked until it is recorded, and a recompute invalidates it.
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="size-4" /> Print / Save PDF
          </Button>
          <Button onClick={() => setRecordOpen(true)} disabled={authorizeT183.isPending}>
            Record signature
          </Button>
        </div>
      </div>

      <SchemaFormDialog
        open={recordOpen}
        onOpenChange={(open: boolean) => !open && setRecordOpen(false)}
        title="Record the officer's T183 authorization"
        submitLabel="Record"
        submitLoading={authorizeT183.isPending}
        schema={getT183Schema()}
        // The host registry — without it the dialog renders fluid's defaults and
        // the typed datetime override never applies. Only the return editor was
        // passing this.
        components={FORM_COMPONENTS}
        onSubmit={onRecord}
      />

      <DocumentPage size="A4">
        <div style={{ color: "#1f2937" }}>
          <div style={{ borderBottom: "2px solid #111", paddingBottom: 8, marginBottom: 14 }}>
            <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
              T183 CORP: Information Return for Corporations Filing Electronically
            </h1>
            <p style={{ fontSize: 12, color: "#555", marginTop: 2 }}>
              Tax year {d(engagement.taxYearStart)} to {d(engagement.taxYearEnd)}
            </p>
          </div>

          <DocumentSection>
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 8px" }}>Part 1: Identification</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Corporation's name" value={client?.name ?? "—"} />
              <Field label="Business Number (BN)" value={client?.businessNumber ?? "—"} />
              <Field label="Tax year start" value={d(engagement.taxYearStart)} />
              <Field label="Tax year end" value={d(engagement.taxYearEnd)} />
            </div>
          </DocumentSection>

          <DocumentSection breakRule="keep-together">
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: "14px 0 8px" }}>Part 2: Amounts reported on the return</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Taxable income" value={money(foldVal("taxableIncome"))} />
              <Field label="Part I tax payable" value={money(foldVal("partITaxPayable"))} />
              <Field label="Part IV tax payable" value={money(foldVal("partIVTaxPayable"))} />
              <Field label="Total federal tax owing" value={money(totalTax)} />
            </div>
          </DocumentSection>

          <DocumentSection breakRule="keep-together">
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: "14px 0 8px" }}>Part 3: Certification and authorization</h2>
            <p style={{ fontSize: 12, color: "#333", marginBottom: 20 }}>
              I am an authorized signing officer of the corporation. I certify that the information given on this form and
              on the return being filed electronically is correct, complete, and fully discloses the corporation's income
              from all sources, and I authorize the electronic filer to file this return.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginTop: 24 }}>
              <div style={{ borderTop: "1px solid #111", paddingTop: 4, fontSize: 12 }}>Name of signing officer</div>
              <div style={{ borderTop: "1px solid #111", paddingTop: 4, fontSize: 12 }}>Position / title</div>
              <div style={{ borderTop: "1px solid #111", paddingTop: 4, fontSize: 12 }}>Signature</div>
              <div style={{ borderTop: "1px solid #111", paddingTop: 4, fontSize: 12 }}>Date</div>
            </div>
          </DocumentSection>

          <p style={{ fontSize: 10, color: "#777", marginTop: 24 }}>
            The signing officer must sign before the return is transmitted. Keep the signed T183 for six years.
          </p>
        </div>
      </DocumentPage>
    </div>
  );
}
