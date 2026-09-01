/**
 * Alberta Political Contributions Tax Credit (AT1SCH08) — paper Form View layout.
 *
 * GENERATED from the form definition in @classytic/ca-tax:
 *   npx tsx packages/ca-tax/scripts/emit-ui-schedule.ts
 *
 * Ultimately from research/sources/tra-spec/AT1-Chapter3-2025.2-full.txt, retrieved 2026-08-31.
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
  from?: { form: string; line: string; note?: string };
  to?: { form: string; line: string; note?: string };
}

export interface PaperSectionDef {
  id: string;
  title: string;
  description?: string;
}

export const AT1_SCHEDULE_8_SECTIONS: readonly PaperSectionDef[] = [
  { id: "contributions", title: "Political Contribution Details", description: "One occurrence per receipted contribution to a party, constituency association or candidate registered in Alberta." },
  { id: "partnership", title: "Alberta Political Contributions Through a Partnership", description: "Sourced from federal T5013 — not derivable from anything else on this schedule." },
];

export const AT1_SCHEDULE_8_FIELDS: readonly PaperField[] = [
  { line: "008002001", caption: "Name of Party, Constituency Association or Candidate", kind: "text", role: "input", section: "contributions", requirement: "mandatory" },
  { line: "008004001", caption: "Official Receipt Number", kind: "code", role: "input", section: "contributions", requirement: "mandatory" },
  { line: "008006001", caption: "Date of Donation", kind: "date", role: "input", section: "contributions", requirement: "mandatory", note: "The spec requires one for every receipted contribution — never left blank." },
  { line: "008008001", caption: "Donation Amount", kind: "money", role: "input", section: "contributions", requirement: "mandatory" },
  { line: "008012001", caption: "Alberta political contributions from a partnership made in 2003 or earlier", kind: "money", role: "input", section: "partnership", requirement: "optional", note: "Federal T5013 box 37." },
  { line: "008013001", caption: "Alberta political contributions from a partnership made in 2004 or later", kind: "money", role: "input", section: "partnership", requirement: "optional", note: "Federal T5013." },
];
