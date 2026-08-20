"use client";

import { DocumentPage, DocumentSection } from "@classytic/fluid/document";
import "@classytic/fluid/document/print.css";
import type { JacketDoc, JacketLine, JacketProvenance } from "../return/_lib/jacket-model";

const money = (v: number) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(v || 0);
const date = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("en-CA") : "—");

const PROV_STYLE: Record<JacketProvenance, { bg: string; fg: string; label: string }> = {
  engine: { bg: "#eef2ff", fg: "#3730a3", label: "computed" },
  imported: { bg: "#f1f5f9", fg: "#334155", label: "imported" },
  human: { bg: "#fef3c7", fg: "#92400e", label: "entered" },
};

function Provenance({ p }: { p?: JacketProvenance }) {
  if (!p) return null;
  const s = PROV_STYLE[p];
  return (
    <span
      style={{
        marginLeft: 8,
        fontSize: 10,
        fontWeight: 600,
        padding: "1px 6px",
        borderRadius: 999,
        background: s.bg,
        color: s.fg,
        verticalAlign: "middle",
      }}
    >
      {s.label}
    </span>
  );
}

function LineRow({ line }: { line: JacketLine }) {
  const isTotal = line.emphasis === "total";
  const isSub = line.emphasis === "subtotal";
  const rendered =
    line.kind === "money" ? money(line.value as number) : line.kind === "percent" ? `${((line.value as number) * 100).toFixed(2)}%` : String(line.value);
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 16,
        padding: isTotal ? "8px 0 4px" : "4px 0",
        borderTop: isTotal ? "2px solid #111" : "none",
        borderBottom: isTotal ? "none" : "1px solid #eee",
        fontWeight: isTotal ? 800 : isSub ? 700 : 400,
        fontSize: isTotal ? 15 : 13,
      }}
    >
      <span>
        {line.ref && (
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              color: "#666",
              background: "#f1f1f1",
              borderRadius: 4,
              padding: "0 5px",
              marginRight: 8,
            }}
          >
            {line.ref}
          </span>
        )}
        {line.label}
        <Provenance p={line.provenance} />
      </span>
      <span style={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{rendered}</span>
    </div>
  );
}

/**
 * Renders a jacket model as an A4 document. Shared by the on-screen jacket view
 * and the printable PDF, so the two never drift. Section ids double as scroll
 * anchors for the outline nav.
 */
export function JacketDocument({ doc }: { doc: JacketDoc }) {
  const h = doc.header;
  return (
    <DocumentPage size="A4" watermark={h.draft ? "DRAFT" : undefined} showPageNumbers>
      <div style={{ color: "#1f2937" }}>
        <div style={{ borderBottom: "2px solid #111", paddingBottom: 10, marginBottom: 6 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{h.title}</h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginTop: 6, fontSize: 13 }}>
            <span><strong>Corporation:</strong> {h.corporation}</span>
            <span><strong>Business Number:</strong> {h.businessNumber}</span>
            <span><strong>Tax year:</strong> {date(h.taxYearStart)} → {date(h.taxYearEnd)}</span>
            <span><strong>Status:</strong> {h.status.replace("_", " ")}</span>
          </div>
        </div>

        {doc.sections.map((s) => (
          <DocumentSection key={s.id} breakRule="keep-together">
            <h2 id={`jacket-${s.id}`} style={{ fontSize: 15, fontWeight: 700, margin: "18px 0 6px", display: "flex", gap: 8, alignItems: "center", scrollMarginTop: 80 }}>
              {s.num && (
                <span style={{ fontFamily: "monospace", background: "#f1f1f1", padding: "0 6px", borderRadius: 4, fontSize: 12 }}>{s.num}</span>
              )}
              {s.title}
            </h2>
            {s.lines.map((l, i) => (
              <LineRow key={`${s.id}-${i}`} line={l} />
            ))}
            {s.note && <p style={{ fontSize: 11, color: "#666", marginTop: 6 }}>{s.note}</p>}
          </DocumentSection>
        ))}

        <DocumentSection breakRule="keep-together">
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: "18px 0 6px" }}>Certification</h2>
          <p style={{ fontSize: 12, color: "#333", marginBottom: 24 }}>
            I certify that the information given on this return and in any documents attached is correct, complete, and fully
            discloses all the income of the corporation.
          </p>
          <div style={{ display: "flex", gap: 40 }}>
            <div style={{ flex: 1, borderTop: "1px solid #111", paddingTop: 4, fontSize: 12 }}>Authorized signing officer</div>
            <div style={{ flex: 1, borderTop: "1px solid #111", paddingTop: 4, fontSize: 12 }}>Date</div>
          </div>
        </DocumentSection>
      </div>
    </DocumentPage>
  );
}
