/**
 * CO-17 — Déclaration de revenus des sociétés (CO17) — paper Form View layout.
 *
 * GENERATED from @classytic/ca-tax:
 *   npx tsx scripts/emit-paper-layouts.ts
 *
 * Ultimately from research/sources/rq-forms/pdf/CO-17-2025-12.pdf, retrieved 2026-08-20.
 *
 * Carries EVERY field, not just `input` ones — a paper view shows the whole
 * form. The paper renderer, not this file, is responsible for keeping
 * computed/carried-in lines read-only.
 */
export type PaperFieldRole = "input" | "computed" | "total" | "carried-in";
export type PaperFieldKind = "money" | "date" | "text" | "rate" | "flag" | "code";

export interface PaperField {
  line: string;
  caption: string;
  kind: PaperFieldKind;
  role: PaperFieldRole;
  section: string;
  requirement?: "mandatory" | "optional" | "conditional";
  note?: string;
  /** What the form prints over the box to say where the figure comes from, verbatim. Present even where `from` is not — a sum or a conditional has no single line to link to. */
  sourceText?: string;
  from?: { form: string; line: string; note?: string };
  to?: { form: string; line: string; note?: string };
  footnoteMarks?: readonly number[];
}

export interface PaperSectionDef {
  id: string;
  title: string;
  description?: string;
  /** Text the form prints immediately BEFORE this heading, verbatim. */
  printedBefore?: string;
}

export const CO17_RETURN_SECTIONS: readonly PaperSectionDef[] = [
  { id: "identity", title: "1 — Renseignements sur l'identité de la société" },
  { id: "taxable-income", title: "3 — Revenu imposable", description: "Net income per the financial statements, then the Québec deductions." },
  { id: "tax", title: "4.1 — Impôt à payer", description: "Taxable income, the Québec proportion of business done, then the credits." },
  { id: "balance", title: "5 — Solde à payer ou remboursement", description: "Instalments and amounts withheld, against the tax payable." },
];

export const CO17_RETURN_FIELDS: readonly PaperField[] = [
  { line: "01a", caption: "Numéro d'entreprise du Québec (NEQ)", kind: "text", role: "input", section: "identity" },
  { line: "01b", caption: "Numéro d'identification", kind: "text", role: "input", section: "identity" },
  { line: "01c", caption: "Numéro d'entreprise fédéral (NE)", kind: "text", role: "input", section: "identity", note: "The federal business number — the same corporation, filing twice." },
  { line: "250", caption: "Revenu net (états financiers ou formulaire CO-17.A.1)", kind: "money", role: "input", section: "taxable-income", note: "Where the Québec return starts, as line 300 is where the federal one starts." },
  { line: "250a", caption: "Addition au revenu net", kind: "money", role: "input", section: "taxable-income" },
  { line: "252", caption: "Revenu net après étalement du revenu (formulaire CO-726.PF)", kind: "money", role: "computed", section: "taxable-income", note: "Lines 250 and 250a, after the forestry-producer income averaging." },
  { line: "253", caption: "Déduction (formulaire CO-17S.2)", kind: "money", role: "input", section: "taxable-income" },
  { line: "261", caption: "Pertes autres que des pertes en capital", kind: "money", role: "input", section: "taxable-income" },
  { line: "262", caption: "Pertes nettes en capital", kind: "money", role: "input", section: "taxable-income" },
  { line: "263", caption: "Pertes agricoles", kind: "money", role: "input", section: "taxable-income" },
  { line: "264", caption: "Pertes comme membre à responsabilité limitée d'une société de personnes", kind: "money", role: "input", section: "taxable-income" },
  { line: "270", caption: "Total des déductions", kind: "money", role: "total", section: "taxable-income" },
  { line: "299", caption: "Revenu imposable", kind: "money", role: "total", section: "taxable-income", note: "Carried to line 420. The Québec figure is NOT the federal taxable income — it is that income allocated to Québec.", to: { form: "CO17", line: "420" } },
  { line: "420", caption: "Revenu imposable (montant de la ligne 299)", kind: "money", role: "carried-in", section: "tax", from: { form: "CO17", line: "299" } },
  { line: "420c", caption: "Revenu provenant d'une entreprise admissible (formulaire CO-771)", kind: "money", role: "input", section: "tax", note: "The small business deduction base. Computed on CO-771, not here — Québec applies a paid-hours test the federal return does not." },
  { line: "420d", caption: "Impôt (formulaire CO-771)", kind: "money", role: "input", section: "tax" },
  { line: "421", caption: "Proportion des affaires faites au Québec", kind: "rate", role: "input", section: "tax", note: "100% for a corporation operating only in Québec; otherwise percentage H of CO-771.R.3 or CO-771.R.14." },
  { line: "421a", caption: "Montant de la ligne 420d multiplié par le pourcentage de la ligne 421", kind: "money", role: "computed", section: "tax" },
  { line: "425", caption: "Impôt à payer", kind: "money", role: "total", section: "tax" },
  { line: "440", caption: "Acomptes provisionnels et paiements effectués (formulaire CO-1027.VE)", kind: "money", role: "input", section: "balance" },
  { line: "440b", caption: "Impôt retenu à la source", kind: "money", role: "input", section: "balance" },
  { line: "490", caption: "Montant imputé à un versement futur d'acompte provisionnel", kind: "money", role: "input", section: "balance" },
  { line: "491", caption: "Montant cédé à un tiers (formulaire CO-1055.2)", kind: "money", role: "input", section: "balance" },
];
