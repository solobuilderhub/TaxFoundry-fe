/**
 * Landing-page copy, as data.
 *
 * Kept out of the JSX so the marketing surface is one file to edit, and so the
 * FAQ can feed BOTH the visible accordion and the `FAQPage` JSON-LD from a
 * single source (duplicating them is how the two silently drift apart).
 *
 * No React import — this stays a plain data module.
 */

export const SITE = {
  name: "TaxFoundry",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://taxfoundry.ca",
  tagline: "Canadian corporate tax filing, with the numbers under control.",
  description:
    "Prepare, review and file federal T2 and Alberta AT1 corporate returns. A deterministic engine computes every filed figure; agents assist but never emit a number.",
} as const;

/**
 * Certification status — single source of truth.
 *
 * IMPORTANT: TaxFoundry is not certified yet. Claiming certification on a
 * public page would be a
 * materially false statement about a regulated filing product, so the copy
 * below is forward-looking. Flip `certified` to true — and update the label —
 * only once TRA/CRA certification actually lands.
 */
export const CERTIFICATION = {
  certified: false,
  label: "Certification in progress",
  detail: "Alberta TRA Net File and CRA T2, targeting the Fall-2025 test suite",
} as const;

export const NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#coverage", label: "Coverage" },
  { href: "#trust", label: "Why trust it" },
  { href: "#faq", label: "FAQ" },
] as const;

/** Headline proof points. Deliberately capability claims, not performance claims. */
export const HERO_STATS = [
  { value: "T2 + AT1", label: "Filed in parallel", hint: "Federal and Alberta from one set of facts" },
  { value: "9-page", label: "Full T2 jacket", hint: "Never the T2 Short" },
  { value: "100%", label: "Engine-computed figures", hint: "No filed number originates from a model" },
] as const;

export const PIPELINE = [
  {
    title: "Ingest the books",
    description:
      "Pull a trial balance straight from QuickBooks, Xero, Plaid or CSV, import a prior-year .COR return, or map GIFI codes by hand.",
  },
  {
    title: "Facts, not a document",
    description:
      "Every input lands in an append-only fact ledger, each stamped engine, imported or human. That log is your due-diligence record.",
  },
  {
    title: "Compute deterministically",
    description:
      "A pure, version-pinned engine derives Schedule 1 through the jacket: CCA, SBD grinds, Part IV, RDTOH, loss continuity, foreign credits.",
  },
  {
    title: "Review with an agent, decide as a human",
    description:
      "Agents raise cited review flags for a preparer to clear. They propose; they never file. Out-of-scope returns route to a CPA rather than being attempted.",
  },
  {
    title: "File and keep the evidence",
    description:
      "Generate the Net File payload and T183 authorization, transmit, and retain the engine version and fact log behind every figure.",
  },
] as const;

export const FEATURES = [
  {
    icon: "Calculator",
    title: "A deterministic engine",
    body: "Filed figures come from a pure function of facts and tax-year rules. No I/O, and no model in the path. The engine version is stamped on every computation and prior years stay pinned to the engine that produced them.",
  },
  {
    icon: "ShieldCheck",
    title: "Provenance on every line",
    body: "Each filed field carries engine, imported or human provenance. A serializer assertion blocks transmit outright if anything model-authored reaches the payload.",
  },
  {
    icon: "History",
    title: "An append-only return",
    body: "A return is an event ledger, not a document you overwrite. Every change is attributable and replayable. It is the control record a review actually needs.",
  },
  {
    icon: "FileSpreadsheet",
    title: "Books in, GIFI mapped",
    body: "Connect an accounting system or drop a trial balance. GIFI codes come from a maintained registry, so Schedule 100 and 125 are not hand-typed.",
  },
  {
    icon: "GitCompare",
    title: "Golden-return replay",
    body: "Previously filed .COR returns are replayed through the engine and must reproduce byte for byte. Regressions surface before a client's return does.",
  },
  {
    icon: "Lock",
    title: "Records held in Canada",
    body: "Client records stay resident in Canada, with month-end-to-month-end date math and the balance-due and instalment tests on separate code paths.",
  },
] as const;

export const COVERAGE = {
  included: {
    title: "In scope today",
    items: [
      "Alberta-resident CCPCs with a single permanent establishment",
      "Full 9-page federal T2 jacket, never the T2 Short",
      "Alberta AT1 prepared in parallel from the same facts",
      "Always-on schedules: S1, S100, S125, S141, S50",
      "Triggered schedules: S3, S5, S7, S8, S53, S101",
      "Standard fiscal year-ends",
    ],
  },
  gated: {
    title: "Routed to a CPA partner",
    items: [
      "Associated groups and business-limit allocation (S9 / S23)",
      "Foreign reporting (T1134, T1135, T106)",
      "Multi-jurisdiction income allocation",
      "SR&ED claims (S31 / T661)",
      "Amended returns (T2-ADJ) and Quebec CO-17",
    ],
    note: "The complexity gate fails closed. A return outside scope is handed off, never attempted.",
  },
} as const;

export const FAQS = [
  {
    id: "llm",
    question: "Does an AI model produce the numbers you file?",
    answer:
      "No. Agents read documents, draft explanations and raise review flags, but every figure on a filed return is computed by the deterministic engine and carries engine provenance. A serializer assertion blocks transmission if a model-authored value ever reaches the payload.",
  },
  {
    id: "certified",
    question: "Is TaxFoundry certified by the CRA and Alberta TRA?",
    answer:
      "Not yet. The engine is built against the Alberta AT1 Net File specification and the CRA T2 requirements, and is validated against the published certification test cases, but certification is still in progress. We will not accept filings through the product until it is certified.",
  },
  {
    id: "review",
    question: "Who actually files the return?",
    answer:
      "You do. TaxFoundry operates draft-then-review: it prepares the return and surfaces cited review flags, a preparer clears them and signs off, and only then is a Net File payload generated and transmitted.",
  },
  {
    id: "books",
    question: "What do I need to get started?",
    answer:
      "A trial balance is enough. Connect QuickBooks, Xero or Plaid, upload a CSV, or import a prior-year .COR file to carry forward opening balances, loss pools, UCC and GRIP automatically.",
  },
  {
    id: "priors",
    question: "How are prior-year balances carried forward?",
    answer:
      "Opening UCC, non-capital and net-capital loss pools, the donation carryforward, GRIP, RDTOH and unused foreign tax credits are auto-filled from the previous year on compute, and the preparer keeps the final say on how much to apply.",
  },
  {
    id: "scope",
    question: "What happens if my return is too complex?",
    answer:
      "The complexity gate fails closed. Associated groups, foreign reporting, multi-jurisdiction allocation, SR&ED and amendments route to a CPA partner instead of being attempted. The share of returns gated out is something we track deliberately.",
  },
] as const;
