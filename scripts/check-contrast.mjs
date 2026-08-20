/**
 * Theme contrast gate — `npm run check:contrast`.
 *
 * Parses the real `oklch()` tokens out of app/globals.css (not a copy of the
 * palette kept alongside it, which would drift) and asserts every foreground /
 * background pairing that ships. Exits non-zero on:
 *   · any pair below its WCAG 2.1 floor — 4.5:1 for text, 3:1 for focus rings,
 *     1.4:1 for the border/background separation
 *   · any token whose chroma pushes it outside sRGB, where the browser silently
 *     clips and you get a different hue than the one written down
 *
 * Run it after touching :root or .dark. Contrast is a property of PAIRS, so
 * changing one token can break a pairing several lines away.
 */
import { readFileSync } from "node:fs";

const CSS = readFileSync(
  new URL("../app/globals.css", import.meta.url),
  "utf8",
);

function oklchToRgb(L, C, H) {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h), b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  const lr = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  const enc = (v) => {
    const c = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(v, 0), 1 / 2.4) - 0.055;
    return Math.min(1, Math.max(0, c));
  };
  const overflow = Math.max(0, ...[lr, lg, lb].map((v) => Math.max(-v, v - 1)));
  return { r: enc(lr), g: enc(lg), b: enc(lb), overflow };
}
const hex = ({ r, g, b }) =>
  "#" + [r, g, b].map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("");
const relLum = ({ r, g, b }) => {
  const f = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const wcag = (fg, bg) => {
  const a = relLum(fg), b = relLum(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};

/** Pull `--token: oklch(L C H);` pairs out of one CSS block. */
function parseBlock(selector) {
  const re = new RegExp(`${selector}\\s*\\{([\\s\\S]*?)\\n\\}`, "m");
  const m = CSS.match(re);
  if (!m) throw new Error(`block not found: ${selector}`);
  const out = {};
  for (const line of m[1].split("\n")) {
    const t = line.match(/--([a-z0-9-]+):\s*oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/i);
    if (t) out[t[1]] = oklchToRgb(+t[2], +t[3], +t[4]);
  }
  return out;
}

const PAIRS = [
  ["body text", "foreground", "background", 4.5],
  ["body on card", "foreground", "card", 4.5],
  ["muted text", "muted-foreground", "background", 4.5],
  ["muted on card", "muted-foreground", "card", 4.5],
  ["muted on muted", "muted-foreground", "muted", 4.5],
  ["primary text", "primary", "background", 4.5],
  ["primary on card", "primary", "card", 4.5],
  ["primary on muted", "primary", "muted", 4.5],
  ["CTA label", "primary-foreground", "primary", 4.5],
  ["brand text", "brand", "background", 4.5],
  ["brass text", "brand-accent", "background", 4.5],
  ["brass on card", "brand-accent", "card", 4.5],
  ["brass label", "brand-accent-foreground", "brand-accent", 4.5],
  ["success text", "success", "background", 4.5],
  ["warning text", "warning", "background", 4.5],
  ["info text", "info", "background", 4.5],
  ["destructive text", "destructive", "background", 4.5],
  ["accent-fg on accent", "accent-foreground", "accent", 4.5],
  ["secondary-fg on secondary", "secondary-foreground", "secondary", 4.5],
  ["sidebar-fg on sidebar", "sidebar-foreground", "sidebar", 4.5],
  ["sidebar-primary text", "sidebar-primary", "sidebar", 4.5],
  ["border vs bg (UI)", "border", "background", 1.4],
  ["ring vs bg (focus)", "ring", "background", 3.0],
];

let fails = 0, checked = 0;
for (const [label, sel] of [["LIGHT", ":root"], ["DARK", "\\.dark"]]) {
  const t = parseBlock(sel);
  console.log(`\n${"═".repeat(72)}\n${label}  (${Object.keys(t).length} oklch tokens parsed)\n${"═".repeat(72)}`);
  for (const [k, v] of Object.entries(t)) {
    if (v.overflow > 0.01) { console.log(`  ⚠ sRGB clip: --${k} by ${(v.overflow * 100).toFixed(1)}%`); fails++; }
  }
  for (const [name, f, b, min] of PAIRS) {
    if (!t[f] || !t[b]) { console.log(`  ? missing token for "${name}" (${f} / ${b})`); continue; }
    const r = wcag(t[f], t[b]);
    const ok = r >= min;
    checked++;
    if (!ok) fails++;
    console.log(
      `  ${name.padEnd(27)} ${hex(t[f])} on ${hex(t[b])}  ${r.toFixed(2).padStart(5)}:1  ` +
      `${ok ? "pass" : `FAIL (need ${min})`}`,
    );
  }
}
console.log(`\n${checked} pairs checked — ${fails ? `✗ ${fails} problem(s)` : "✓ all pass"}`);
process.exit(fails ? 1 : 0);
