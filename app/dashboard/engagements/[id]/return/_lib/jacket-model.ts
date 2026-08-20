/**
 * The T2 / AT1 / CO-17 jacket MODEL — a pure projection of a computed return into
 * the CRA-style, section-by-section return "jacket".
 *
 * One model, two renderers: the on-screen jacket view and the printable PDF both
 * render this, so they can never drift. No tax logic lives here — it groups the
 * engine's already-computed `fields` (each carrying its provenance) into the CRA
 * income → taxable income → SBD → Part I → other taxes → provincial → total →
 * carryforward flow, and never lets a raw engine slug reach the UI (labels come
 * from `labelForLine`).
 */
import { FACTOR_LINES, HIDDEN_LINES, labelForLine } from "../_config/line-labels";
import type { ReturnInput } from "./return-input";

export type JacketProvenance = "engine" | "imported" | "human";

export interface JacketLine {
  /** CRA line / schedule reference for the mono chip (optional). */
  ref?: string;
  label: string;
  value: number | string;
  kind: "money" | "percent" | "text";
  provenance?: JacketProvenance;
  /** Visual weight — a section's result line or the grand total. */
  emphasis?: "total" | "subtotal";
}

export interface JacketSection {
  /** Stable anchor id for the outline nav. */
  id: string;
  /** CRA schedule / page / line chip. */
  num?: string;
  title: string;
  lines: JacketLine[];
  note?: string;
}

export interface JacketHeader {
  title: string;
  corporation: string;
  businessNumber: string;
  taxYearStart?: string;
  taxYearEnd?: string;
  status: string;
  program: string;
  draft: boolean;
}

export interface JacketDoc {
  header: JacketHeader;
  sections: JacketSection[];
  /** The headline figure surfaced as the summary card (balance owing / refund). */
  bottomLine: { label: string; value: number; kind: "money" };
}

interface Field {
  line: string;
  value: unknown;
  provenance: JacketProvenance;
}

interface BuildInput {
  program: string;
  status: string;
  taxYearStart?: string;
  taxYearEnd?: string;
  fields: Field[];
  returnInput: ReturnInput;
  identity: { corporation: string; businessNumber: string; corpType?: string };
}

const toNumber = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** Values are whole dollars EXCEPT `totalOwing`, which the engine emits in cents. */
const normalize = (line: string, value: unknown): number =>
  line === "totalOwing" ? toNumber(value) / 100 : toNumber(value);

/** Engine slugs that read as a section's result / total (heavier weight). */
const TOTAL_LINES = new Set([
  "netIncomeForTax",
  "taxableIncome",
  "partITaxPayable",
  "totalFederalTax",
  "totalOwing",
  "albertaTaxPayable",
  "quebecTaxPayable",
]);

type SectionSpec = { id: string; num?: string; title: string; slugs: string[]; prefixes?: string[]; note?: string };

/** Federal T2 jacket flow. */
const T2_SPECS: SectionSpec[] = [
  {
    id: "net-income",
    num: "S1",
    title: "Net income for income tax purposes",
    slugs: ["taxableCapitalGain", "netCapitalLossCreated", "ccaClaimed", "ccaRecapture", "ccaTerminalLoss", "reservesClosing", "netIncomeForTax"],
  },
  {
    id: "taxable-income",
    num: "360",
    title: "Taxable income (Division C)",
    slugs: ["donationsClaimed", "nonCapitalLossApplied", "netCapitalLossApplied", "lossCarriedBack", "taxableIncome"],
  },
  {
    id: "sbd",
    num: "S7",
    title: "Small business deduction",
    slugs: ["taxableCapitalEmployedInCanada", "sbdIncome", "sbdDeduction"],
  },
  {
    id: "part-1",
    num: "700",
    title: "Part I tax",
    slugs: ["partIBasicTax", "federalAbatement", "generalRateReduction", "zetmRateReduction", "foreignTaxCredit", "sredItcEarned", "sredItcRefundable", "partITaxPayable"],
  },
  {
    id: "other-taxes",
    title: "Other taxes and refundable credits",
    slugs: ["partIVTaxPayable", "dividendRefund", "excessiveEligibleDividend"],
  },
  {
    id: "provincial",
    num: "S5",
    title: "Provincial / territorial tax",
    slugs: ["provincialTax"],
    prefixes: ["provincialTax:"],
    note: "Alberta and Québec are self-administered — filed on their own AT1 / CO-17 returns.",
  },
  {
    id: "summary",
    num: "770",
    title: "Summary of tax payable",
    slugs: ["totalFederalTax", "totalOwing"],
  },
  {
    id: "carryforward",
    title: "Balances carried forward",
    slugs: ["nonCapitalLossClosing", "netCapitalLossClosing", "donationPoolClosing", "gripClosing", "itcPoolClosing", "businessFtcPoolClosing", "erdtohClosing", "nerdtohClosing"],
    prefixes: ["ccaClosingUCC:"],
    note: "These closing balances carry into next year's return automatically.",
  },
];

const AT1_SPECS: SectionSpec[] = [
  {
    id: "alberta",
    num: "AT1",
    title: "Alberta tax (AT1)",
    slugs: ["allocationFactor", "albertaTaxableIncome", "albertaSbdIncome", "albertaTaxPayable", "totalOwing"],
  },
];

const CO17_SPECS: SectionSpec[] = [
  {
    id: "quebec",
    num: "CO-17",
    title: "Québec tax (CO-17)",
    slugs: ["allocationFactor", "quebecTaxableIncome", "quebecSbdIncome", "quebecTaxAtSmallBusinessRate", "quebecTaxAtGeneralRate", "quebecTaxPayable", "totalOwing"],
  },
];

const specsFor = (program: string): SectionSpec[] =>
  program === "AT1" ? AT1_SPECS : program === "CO17" ? CO17_SPECS : T2_SPECS;

const JACKET_TITLE: Record<string, string> = {
  T2: "T2 — Corporation Income Tax Return",
  AT1: "AT1 — Alberta Corporate Income Tax Return",
  CO17: "CO-17 — Déclaration de revenus des sociétés (Québec)",
};

const fieldToLine = (f: Field): JacketLine => {
  const isFactor = FACTOR_LINES.has(f.line);
  return {
    ref: refFor(f.line),
    label: labelForLine(f.line),
    value: isFactor ? toNumber(f.value) : normalize(f.line, f.value),
    kind: isFactor ? "percent" : "money",
    provenance: f.provenance,
    ...(TOTAL_LINES.has(f.line) ? { emphasis: "total" as const } : {}),
  };
};

/** Pull a CRA line number out of the label's "(line NNN)" / "(SNN)" suffix for the chip. */
function refFor(slug: string): string | undefined {
  const label = labelForLine(slug);
  const m = label.match(/\(line (\d+)\)/i) ?? label.match(/\((S\d+[A-Za-z0-9.]*)\)/);
  return m?.[1];
}

export function buildJacket(input: BuildInput): JacketDoc {
  const { program, fields, returnInput, identity } = input;
  // Drop hidden duplicates, and de-dupe by line (last write wins) so a line that
  // the engine emitted more than once can never render twice in the jacket.
  const byLine = new Map<string, Field>();
  for (const f of fields) {
    if (HIDDEN_LINES.has(f.line)) continue;
    byLine.set(f.line, f);
  }
  const visible = [...byLine.values()];
  const used = new Set<string>();

  const matches = (spec: SectionSpec, line: string) =>
    spec.slugs.includes(line) || (spec.prefixes ?? []).some((p) => line.startsWith(p));

  const sections: JacketSection[] = [];

  // Identification (from the engagement / client, not the computed fields).
  const ident = returnInput.identification ?? {};
  const identLines: JacketLine[] = [
    { ref: "040", label: "Type of corporation", value: ident.corpType ?? identity.corpType ?? "—", kind: "text" },
    { ref: "750", label: "Province of permanent establishment", value: ident.province ?? "—", kind: "text" },
  ];
  if (ident.quebecId) identLines.push({ ref: "NEQ", label: "Québec enterprise number", value: ident.quebecId, kind: "text" });
  sections.push({ id: "identification", num: "200", title: "Identification", lines: identLines });

  // Computed sections, in CRA flow order.
  for (const spec of specsFor(program)) {
    const lines: JacketLine[] = [];
    // Keep the spec's declared order first, then any prefix matches in field order.
    for (const slug of spec.slugs) {
      const f = visible.find((x) => x.line === slug && !used.has(x.line));
      if (f) {
        used.add(f.line);
        lines.push(fieldToLine(f));
      }
    }
    for (const f of visible) {
      if (used.has(f.line)) continue;
      if ((spec.prefixes ?? []).some((p) => f.line.startsWith(p))) {
        used.add(f.line);
        lines.push(fieldToLine(f));
      }
    }
    if (lines.length) sections.push({ id: spec.id, ...(spec.num ? { num: spec.num } : {}), title: spec.title, lines, ...(spec.note ? { note: spec.note } : {}) });
  }

  // Settlement — total tax vs instalments → balance owing / refund.
  const totalOwingField = visible.find((f) => f.line === "totalOwing");
  const totalTax = totalOwingField ? normalize("totalOwing", totalOwingField.value) : 0;
  const instalments = toNumber(returnInput.payments?.instalmentsPaid);
  const net = totalTax - instalments;
  const settlement: JacketLine[] = [
    { ref: "770", label: "Total tax payable", value: totalTax, kind: "money", emphasis: "subtotal" },
  ];
  if (instalments > 0) settlement.push({ ref: "840", label: "Tax paid by instalments", value: instalments, kind: "money", provenance: "human" });
  settlement.push(
    net >= 0
      ? { ref: "590", label: "Balance owing", value: net, kind: "money", emphasis: "total" }
      : { ref: "784", label: "Refund", value: -net, kind: "money", emphasis: "total" },
  );
  sections.push({ id: "settlement", title: "Balance owing or refund", lines: settlement });

  // Any unmatched computed line — never drop it silently.
  const leftovers = visible.filter((f) => !used.has(f.line) && f.line !== "totalOwing");
  if (leftovers.length) {
    sections.push({ id: "other", title: "Other computed amounts", lines: leftovers.map(fieldToLine) });
  }

  return {
    header: {
      title: JACKET_TITLE[program] ?? `${program} return`,
      corporation: identity.corporation || "—",
      businessNumber: identity.businessNumber || "—",
      ...(input.taxYearStart ? { taxYearStart: input.taxYearStart } : {}),
      ...(input.taxYearEnd ? { taxYearEnd: input.taxYearEnd } : {}),
      status: input.status,
      program,
      draft: input.status !== "filed",
    },
    sections,
    bottomLine:
      net >= 0
        ? { label: "Balance owing", value: net, kind: "money" }
        : { label: "Refund", value: -net, kind: "money" },
  };
}
