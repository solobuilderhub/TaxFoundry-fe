import { ImageResponse } from "next/og";

/**
 * Social card, rendered at build time by `next/og`.
 *
 * Generated rather than shipped as a PNG: the copy stays in sync with the page,
 * there is no binary in the repo, and no `sharp` step to maintain. Edge-case to
 * remember — this runs in the OG runtime, NOT the app: no Tailwind, no CSS
 * variables, so colours are literals and every element needs an explicit
 * `display` (satori requires it on any node with multiple children).
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "TaxFoundry: Canadian corporate tax filing, with the numbers under control";

// Literal hex of the dark-theme tokens (satori has no CSS variables). Keep in
// sync with `.dark` in globals.css: background / foreground / muted-foreground
// / brand (teal) / brand-accent (brass).
const BG = "#0b141a";
const FG = "#f1f5f7";
const MUTED = "#a6b4bd";
const ACCENT = "#34b6d2";
const BRASS = "#ecad59";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BG,
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand row. The logomark rebuilt as plain divs (satori has no SVG rect stack). */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 6,
              width: 56,
              height: 56,
              padding: 12,
              borderRadius: 16,
              border: `2px solid ${MUTED}55`,
            }}
          >
            <div style={{ width: 30, height: 5, borderRadius: 3, background: ACCENT }} />
            <div style={{ width: 22, height: 5, borderRadius: 3, background: BRASS }} />
            <div style={{ width: 13, height: 5, borderRadius: 3, background: `${FG}66` }} />
          </div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 600, color: FG }}>
            Tax<span style={{ color: ACCENT }}>Foundry</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 66,
              lineHeight: 1.1,
              fontWeight: 600,
              color: FG,
              letterSpacing: -1.5,
              maxWidth: 940,
            }}
          >
            Canadian corporate tax filing, with the numbers under control
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 28, color: MUTED, maxWidth: 900 }}>
            Federal T2 and Alberta AT1. A deterministic engine computes every filed figure. Agents
            assist, but never emit a number.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {["T2 + AT1", "Full 9-page jacket", "Provenance on every line"].map((chip) => (
            <div
              key={chip}
              style={{
                display: "flex",
                fontSize: 22,
                color: MUTED,
                padding: "10px 20px",
                borderRadius: 999,
                border: `1px solid ${MUTED}44`,
              }}
            >
              {chip}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
