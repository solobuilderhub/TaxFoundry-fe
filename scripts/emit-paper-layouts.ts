/**
 * Emit the return editor's form schema + paper Form View layouts from
 * @classytic/ca-tax's `FormDefinition`s.
 *
 * This app depends on `@classytic/ca-tax` as a real published package (a
 * devDependency — nothing here ships to the browser; this is a codegen tool,
 * like `prettier` or `eslint`, run manually and its OUTPUT checked in). It
 * used to be the other way around: `packages/ca-tax`'s own generator script
 * reached across the filesystem into this repo via relative `../../../apps/
 * web/...` paths and wrote files here directly. That only worked because
 * both repos happened to sit as sibling folders on one machine — it broke
 * the moment either repo was checked out anywhere else, and it is not how a
 * published npm package (`@classytic/ca-tax` is versioned and published
 * independently) should ever reach into a consumer. This script is the fix:
 * `@classytic/ca-tax` exports pure `FormDefinition` data, and this repo
 * alone decides what to do with it.
 *
 * One definition, two consumers: the engine reads `FormDefinition` directly,
 * and this writes the interface's schema from the same object. Neither can
 * drift, and both trace to the document named in the definition's own
 * provenance.
 *
 * Only `input` fields are rendered in the GUIDED editor. A paper Form View
 * shows the WHOLE form — computed and carried-in lines too — so every field
 * role is emitted there; the paper renderer, not this generator, is
 * responsible for keeping non-`input` lines read-only.
 *
 *   npx tsx scripts/emit-paper-layouts.ts
 */
import { writeFileSync } from "node:fs";
import {
	AT1_JACKET,
	AT1_JACKET_BLOCK_HEADINGS,
	AT1_JACKET_CODE_OPTIONS,
	AT1_JACKET_DAY_BANDS,
	AT1_JACKET_DEPARTMENT_USE,
	AT1_JACKET_LINES_NOT_PRINTED,
	AT1_JACKET_RATE_ROWS,
	AT1_SCHEDULE_1,
	AT1_SCHEDULE_1_AGREEMENT_COLUMNS,
	AT1_SCHEDULE_1_AGREEMENT_TOTALS_LABEL,
	AT1_SCHEDULE_1_AREA_B_LARGE_CORPORATIONS,
	AT1_SCHEDULE_1_AREA_B_PREAMBLE,
	AT1_SCHEDULE_1_AREA_B_STEPS,
	AT1_SCHEDULE_1_AREA_B_TITLE,
	AT1_SCHEDULE_1_BLOCK_HEADINGS,
	AT1_SCHEDULE_1_COLUMNS,
	AT1_SCHEDULE_1_RATE_PERIODS,
	AT1_SCHEDULE_1_TOTAL_DAYS_LABEL,
	AT1_SCHEDULE_2,
	AT1_SCHEDULE_2_FACTOR_DESTINATION,
	AT1_SCHEDULE_2_FORMULAS,
	AT1_SCHEDULE_3,
	AT1_SCHEDULE_3_VINTAGE_TABLES,
	AT1_SCHEDULE_3_VINTAGE_TOTALS_LABEL,
	AT1_SCHEDULE_4,
	AT1_SCHEDULE_4_COLUMNS,
	AT1_SCHEDULE_10,
	AT1_SCHEDULE_12,
	AT1_SCHEDULE_13,
	AT1_SCHEDULE_13_COLUMNS,
	AT1_SCHEDULE_15,
	AT1_SCHEDULE_15_AREAS,
	AT1_SCHEDULE_15_CLOSING_INSTRUCTION,
	AT1_SCHEDULE_15_PER_COUNTRY,
	AT1_SCHEDULE_16,
	AT1_SCHEDULE_17,
	AT1_SCHEDULE_17_RESERVES,
	AT1_SCHEDULE_18,
	AT1_SCHEDULE_18_ABIL_COLUMNS,
	AT1_SCHEDULE_18_ABIL_TOTALS_LABEL,
	AT1_SCHEDULE_18_BLOCK_HEADINGS,
	AT1_SCHEDULE_18_CATEGORIES,
	AT1_SCHEDULE_18_COLUMNS,
	AT1_SCHEDULE_18_GAIN_FORMULA,
	AT1_SCHEDULE_18_GRIDS,
	AT1_SCHEDULE_18_PRINTED_AFTER,
	AT1_SCHEDULE_20,
	AT1_SCHEDULE_21,
	AT1_SCHEDULE_21_CONTINUITY_CAPTIONS,
	AT1_SCHEDULE_21_CONTINUITY_ORDER,
	AT1_SCHEDULE_21_POOLS,
	AT1_SCHEDULE_29,
	AT1_SCHEDULE_29_ALLOCATION_COLUMNS,
	AT1_SCHEDULE_29_ALLOCATION_TOTALS_LABEL,
	AT1_SCHEDULE_29_BLOCK_HEADINGS,
	CO17_RETURN,
	FORM_FIELD_ROLES,
	type FormDefinition,
	type FormField,
	fieldsInSection,
	SCHEDULE_8_COLUMNS,
	scheduleTwentyOneLineId,
	T2_JACKET,
	T2_SCHEDULE_1,
	T2_SCHEDULE_2,
	T2_SCHEDULE_3,
	T2_SCHEDULE_4,
	T2_SCHEDULE_5,
	T2_SCHEDULE_6,
	T2_SCHEDULE_7,
	T2_SCHEDULE_8,
	T2_SCHEDULE_13,
	T2_SCHEDULE_21,
	T2_SCHEDULE_23,
	T2_SCHEDULE_24,
	T2_SCHEDULE_31,
	T2_SCHEDULE_33,
	T2_SCHEDULE_43,
	T2_SCHEDULE_50,
	T2_SCHEDULE_53,
	T2_SCHEDULE_55,
	T2_SCHEDULE_130,
	T2_SCHEDULE_141,
} from "@classytic/ca-tax/t2";

// ── Destinations — all local to THIS repo ────────────────────────────────

const DEST =
	"app/dashboard/engagements/[id]/return/_config/schedules/t2/net-income.ts";

const PAPER_DIR =
	"app/dashboard/engagements/[id]/return/_config/schedules/at1/paper/generated";
const JACKET_PAPER_DEST = `${PAPER_DIR}/jacket.layout.ts`;
const SCHEDULE_21_PAPER_DEST = `${PAPER_DIR}/schedule21.layout.ts`;
const SCHEDULE_13_PAPER_DEST = `${PAPER_DIR}/schedule13.layout.ts`;
const SCHEDULE_17_PAPER_DEST = `${PAPER_DIR}/schedule17.layout.ts`;
const SCHEDULE_29_PAPER_DEST = `${PAPER_DIR}/schedule29.layout.ts`;
const SCHEDULE_12_PAPER_DEST = `${PAPER_DIR}/schedule12.layout.ts`;
const SCHEDULE_18_PAPER_DEST = `${PAPER_DIR}/schedule18.layout.ts`;
const SCHEDULE_1_PAPER_DEST = `${PAPER_DIR}/schedule1.layout.ts`;
const SCHEDULE_2_PAPER_DEST = `${PAPER_DIR}/schedule2.layout.ts`;
const SCHEDULE_10_PAPER_DEST = `${PAPER_DIR}/schedule10.layout.ts`;
const SCHEDULE_20_PAPER_DEST = `${PAPER_DIR}/schedule20.layout.ts`;
const SCHEDULE_3_PAPER_DEST = `${PAPER_DIR}/schedule3.layout.ts`;
const SCHEDULE_15_PAPER_DEST = `${PAPER_DIR}/schedule15.layout.ts`;
const SCHEDULE_16_PAPER_DEST = `${PAPER_DIR}/schedule16.layout.ts`;
const SCHEDULE_4_PAPER_DEST = `${PAPER_DIR}/schedule4.layout.ts`;

// Federal T2 gets its OWN directory — `at1/paper/` is Alberta-only despite
// hosting the shared rendering primitives (jurisdiction-generic by design;
// T2's views import them from there rather than duplicating them). Sharing
// `at1/paper/generated` with federal output risks exactly the collision
// this comment warns about: `AT1_SCHEDULE_1` (Alberta's small business
// deduction) and federal `T2_SCHEDULE_1` (net income for tax) both
// stringify to `schedule1.layout.ts` — same filename, different forms.
const T2_PAPER_DIR =
	"app/dashboard/engagements/[id]/return/_config/schedules/t2/paper/generated";
const T2_SCHEDULE_1_PAPER_DEST = `${T2_PAPER_DIR}/schedule1.layout.ts`;
const T2_SCHEDULE_8_PAPER_DEST = `${T2_PAPER_DIR}/schedule8.layout.ts`;
const T2_SCHEDULE_2_PAPER_DEST = `${T2_PAPER_DIR}/schedule2.layout.ts`;
const T2_SCHEDULE_13_PAPER_DEST = `${T2_PAPER_DIR}/schedule13.layout.ts`;
const T2_SCHEDULE_50_PAPER_DEST = `${T2_PAPER_DIR}/schedule50.layout.ts`;
const T2_SCHEDULE_5_PAPER_DEST = `${T2_PAPER_DIR}/schedule5.layout.ts`;
const T2_SCHEDULE_33_PAPER_DEST = `${T2_PAPER_DIR}/schedule33.layout.ts`;
const T2_SCHEDULE_31_PAPER_DEST = `${T2_PAPER_DIR}/schedule31.layout.ts`;
const T2_SCHEDULE_130_PAPER_DEST = `${T2_PAPER_DIR}/schedule130.layout.ts`;
const T2_SCHEDULE_3_PAPER_DEST = `${T2_PAPER_DIR}/schedule3.layout.ts`;
const T2_SCHEDULE_4_PAPER_DEST = `${T2_PAPER_DIR}/schedule4.layout.ts`;
const T2_SCHEDULE_7_PAPER_DEST = `${T2_PAPER_DIR}/schedule7.layout.ts`;
const T2_JACKET_PAPER_DEST = `${T2_PAPER_DIR}/jacket.layout.ts`;
const T2_SCHEDULE_141_PAPER_DEST = `${T2_PAPER_DIR}/schedule141.layout.ts`;
const T2_SCHEDULE_6_PAPER_DEST = `${T2_PAPER_DIR}/schedule6.layout.ts`;
const T2_SCHEDULE_21_PAPER_DEST = `${T2_PAPER_DIR}/schedule21.layout.ts`;
const T2_SCHEDULE_23_PAPER_DEST = `${T2_PAPER_DIR}/schedule23.layout.ts`;
const T2_SCHEDULE_24_PAPER_DEST = `${T2_PAPER_DIR}/schedule24.layout.ts`;
const T2_SCHEDULE_43_PAPER_DEST = `${T2_PAPER_DIR}/schedule43.layout.ts`;
const T2_SCHEDULE_53_PAPER_DEST = `${T2_PAPER_DIR}/schedule53.layout.ts`;
const T2_SCHEDULE_55_PAPER_DEST = `${T2_PAPER_DIR}/schedule55.layout.ts`;

const CO17_PAPER_DIR =
	"app/dashboard/engagements/[id]/return/_config/schedules/co17/paper/generated";
const CO17_PAPER_DEST = `${CO17_PAPER_DIR}/co17.layout.ts`;

const KIND_TO_BUILDER: Record<string, string> = {
	money: "money",
	text: "field.text",
	date: "field.date",
	rate: "field.number",
	flag: "field.switch",
	code: "field.text",
};

const q = (s: string) => JSON.stringify(s);

// ── Guided-editor schema (input fields only) ─────────────────────────────

export function emit(
	form: FormDefinition,
	key: string,
	label: string,
	hint: string,
): string {
	const out: string[] = [];
	out.push(
		'import { defineSchema, section } from "@classytic/formkit/server";',
	);
	out.push('import { createElement } from "react";');
	out.push('import { money } from "../../fields";');
	out.push('import { defineSchedule } from "../shared/define";');
	out.push('import { Schedule1FormView } from "./paper/schedule1-form-view";');
	out.push("");
	out.push("/**");
	out.push(` * ${form.title} (${form.id}).`);
	out.push(" *");
	out.push(" * GENERATED from @classytic/ca-tax:");
	out.push(" *   npx tsx scripts/emit-paper-layouts.ts");
	out.push(" *");
	out.push(` * Ultimately from ${form.provenance.document},`);
	out.push(` * retrieved ${form.provenance.retrieved}.`);
	out.push(" *");
	out.push(
		" * Every field is a real line, captioned as the form captions it and named for",
	);
	out.push(
		" * the number it is transmitted under — so what a preparer types is already in",
	);
	out.push(
		" * filing shape, with no mapping step to get wrong. Totals and figures carried",
	);
	out.push(
		" * from other schedules are omitted: rendering them editable invites someone to",
	);
	out.push(
		" * overwrite a computed number, and the return then does not foot.",
	);
	out.push(" *");
	out.push(
		" * ── `lines.101` is an ARRAY index to react-hook-form ────────────────────────",
	);
	out.push(" *");
	out.push(
		" * A numeric path segment means an array index, so these names build a sparse",
	);
	out.push(
		" * `lines[]` one longer than the highest line here, rather than the record the",
	);
	out.push(
		" * contract stores — and `JSON.stringify` writes each hole as `null`, so an",
	);
	out.push(
		" * untouched Schedule 1 leaves the browser as a wall of nulls. That rejected",
	);
	out.push(
		" * EVERY save of a return that had rendered this schedule, in production, with",
	);
	out.push(" * `expected record, received array`.");
	out.push(" *");
	out.push(
		" * The names are deliberately NOT changed to dodge it. `lines.101` is the whole",
	);
	out.push(
		" * point of this schedule — the box is named for the line it files under — and",
	);
	out.push(
		" * renaming to something like `lines.L101` would move the mapping problem into",
	);
	out.push(
		" * the payload, where getting it wrong puts a figure on the wrong CRA line",
	);
	out.push(
		" * instead of failing loudly. The array index IS the line number, so the server",
	);
	out.push(
		" * normalizes it back to a record at the contract boundary, exactly and in one",
	);
	out.push(
		" * place (`NetIncomeValues` in apps/server's `contracts/t2-input.ts`, which",
	);
	out.push(" * carries the full reasoning and the regression test).");
	out.push(" *");
	out.push(
		" * Adding a line here is therefore safe and needs nothing else. What is NOT safe",
	);
	out.push(
		" * is adding numerically-named fields to a slice whose contract has no such",
	);
	out.push(
		" * normalization — this is currently the only schedule in the app using them.",
	);
	out.push(" */");
	out.push("export const netIncome = defineSchedule({");
	out.push(`  key: ${q(key)},`);
	out.push(`  num: "001",`);
	out.push(`  label: ${q(label)},`);
	out.push(`  hint: ${q(hint)},`);
	out.push("  formView: (props) => createElement(Schedule1FormView, props),");
	out.push("  schema: defineSchema({");
	out.push("    sections: [");

	for (const s of form.sections) {
		const entered = fieldsInSection(form, s.id).filter(
			(f) => f.role === "input",
		);
		if (entered.length === 0) continue;
		out.push("      section(");
		out.push(`        ${q(s.id)},`);
		out.push(`        ${q(s.title)},`);
		out.push("        [");
		for (const f of entered) {
			const builder = KIND_TO_BUILDER[f.kind] ?? "money";
			const props = f.note ? `, { description: ${q(f.note)} }` : "";
			// The line number goes in the LABEL, not only the field name. A preparer
			// reconciles against the printed form, and `lines.101` is invisible to
			// them — the number has to be on screen beside the caption to be useful.
			const label = `${f.caption} (line ${f.line})`;
			out.push(
				`          ${builder}(${q(`lines.${f.line}`)}, ${q(label)}${props}),`,
			);
		}
		out.push("        ],");
		out.push("        {");
		out.push('          variant: "card",');
		out.push("          cols: 2,");
		if (s.description) out.push(`          description: ${q(s.description)},`);
		if (s.secondary) {
			out.push("          collapsible: true,");
			out.push("          defaultCollapsed: true,");
		}
		out.push("        },");
		out.push("      ),");
	}

	out.push("    ],");
	out.push("  }),");
	out.push("});");
	out.push("");
	return out.join("\n");
}

export function netIncomeSchedule(): string {
	return emit(
		T2_SCHEDULE_1,
		"netIncome",
		"Net Income for Tax (S1)",
		"Book-to-tax reconciliation",
	);
}

// ── Paper Form View layouts ──────────────────────────────────────────────

function emitField(f: FormField): string {
	const parts = [
		`line: ${q(f.line)}`,
		`caption: ${q(f.caption)}`,
		`kind: ${q(f.kind)}`,
		`role: ${q(f.role)}`,
		`section: ${q(f.section)}`,
	];
	if (f.requirement) parts.push(`requirement: ${q(f.requirement)}`);
	if (f.note) parts.push(`note: ${q(f.note)}`);
	// What the page prints over the box to say where the figure comes from.
	// Carried separately from `from` because a quarter of them are sums or
	// conditionals no single line ref can state — see `FormField.sourceText`.
	if (f.sourceText) parts.push(`sourceText: ${q(f.sourceText)}`);
	if (f.from) {
		const fromParts = [`form: ${q(f.from.form)}`, `line: ${q(f.from.line)}`];
		if (f.from.note) fromParts.push(`note: ${q(f.from.note)}`);
		parts.push(`from: { ${fromParts.join(", ")} }`);
	}
	if (f.to) {
		const toParts = [`form: ${q(f.to.form)}`, `line: ${q(f.to.line)}`];
		if (f.to.note) toParts.push(`note: ${q(f.to.note)}`);
		parts.push(`to: { ${toParts.join(", ")} }`);
	}
	if (f.footnoteMarks?.length) {
		parts.push(`footnoteMarks: [${f.footnoteMarks.join(", ")}]`);
	}
	return `  { ${parts.join(", ")} },`;
}

function emitPaperTypes(out: string[]): void {
	/*
	 * Derived from ca-tax, NOT written out by hand.
	 *
	 * This union was a literal string here, so it silently drifted the moment
	 * `FormFieldRole` gained a member: adding `not-collected` emitted layouts
	 * that would not typecheck against the very type this same function had
	 * just written above them. A role REMOVED upstream would have been worse —
	 * nothing would have failed at all. `FORM_FIELD_ROLES` is the runtime
	 * mirror of that union and is exhaustiveness-checked against it in ca-tax.
	 */
	out.push(
		`export type PaperFieldRole = ${FORM_FIELD_ROLES.map((r) => `"${r}"`).join(" | ")};`,
	);
	out.push(
		'export type PaperFieldKind = "money" | "date" | "text" | "rate" | "flag" | "code";',
	);
	out.push("");
	out.push("export interface PaperField {");
	out.push("  line: string;");
	out.push("  caption: string;");
	out.push("  kind: PaperFieldKind;");
	out.push("  role: PaperFieldRole;");
	out.push("  section: string;");
	out.push('  requirement?: "mandatory" | "optional" | "conditional";');
	out.push("  note?: string;");
	out.push(
		"  /** What the form prints over the box to say where the figure comes from, verbatim. Present even where `from` is not — a sum or a conditional has no single line to link to. */",
	);
	out.push("  sourceText?: string;");
	out.push("  from?: { form: string; line: string; note?: string };");
	out.push("  to?: { form: string; line: string; note?: string };");
	out.push("  footnoteMarks?: readonly number[];");
	out.push("}");
	out.push("");
	out.push("export interface PaperSectionDef {");
	out.push("  id: string;");
	out.push("  title: string;");
	out.push("  description?: string;");
	out.push(
		"  /** Text the form prints immediately BEFORE this heading, verbatim. */",
	);
	out.push("  printedBefore?: string;");
	out.push(
		"  /** Text the form prints inside this box AFTER its last numbered line, verbatim. */",
	);
	out.push("  printedAfter?: string;");
	out.push("}");
}

/**
 * One `PaperSectionDef` literal.
 *
 * Was inlined at all seven call sites, which is how `printedBefore` would have
 * been added to six of them and missed on the seventh — the emitted layouts are
 * byte-compared, so the miss shows up as a drift failure on one schedule and
 * reads like the engine moved.
 */
function emitSectionDef(s: FormDefinition["sections"][number]): string {
	const parts = [`id: ${q(s.id)}`, `title: ${q(s.title)}`];
	if (s.description) parts.push(`description: ${q(s.description)}`);
	if (s.printedBefore) parts.push(`printedBefore: ${q(s.printedBefore)}`);
	if (s.printedAfter) parts.push(`printedAfter: ${q(s.printedAfter)}`);
	return `  { ${parts.join(", ")} },`;
}

/**
 * The footnote list, and where the page prints each one.
 *
 * Emitted together, and from the ONE function every schedule's emitter already
 * calls, so a form that gains `footnotePlacement` upstream gets it here without
 * anyone remembering to wire it. That is the `emitSectionDef` lesson: the
 * `printedBefore` field was nearly added to six inlined call sites and missed on
 * the seventh, which surfaces as a byte-compare failure on one schedule and
 * reads like the engine moved.
 *
 * Without the placement array a renderer can do exactly one thing with a flat
 * footnote list — print all of it at the bottom — and most forms print their
 * notes at the foot of the box they qualify, mid-page.
 */
function emitFootnotes(
	out: string[],
	form: FormDefinition,
	constPrefix: string,
): void {
	if (!form.footnotes || form.footnotes.length === 0) return;
	out.push(`export const ${constPrefix}_FOOTNOTES: readonly string[] = [`);
	for (const note of form.footnotes) out.push(`  ${q(note)},`);
	out.push("];");
	out.push("");
	if (!form.footnotePlacement || form.footnotePlacement.length === 0) return;
	out.push("export interface PaperFootnotePlacement {");
	out.push("  /** Index into the footnote list above. */");
	out.push("  footnote: number;");
	out.push("  /** The section id at whose foot the page prints it. */");
	out.push("  section: string;");
	out.push(
		"  /** The glyph the page prints. Absent where the page anchors the note by naming a line instead. */",
	);
	out.push("  mark?: string;");
	out.push("}");
	out.push("");
	out.push(
		`export const ${constPrefix}_FOOTNOTE_PLACEMENT: readonly PaperFootnotePlacement[] = [`,
	);
	for (const p of form.footnotePlacement) {
		const parts = [`footnote: ${p.footnote}`, `section: ${q(p.section)}`];
		if (p.mark) parts.push(`mark: ${q(p.mark)}`);
		out.push(`  { ${parts.join(", ")} },`);
	}
	out.push("];");
	out.push("");
}

function emitProvenanceComment(
	out: string[],
	form: FormDefinition,
	extra?: string[],
): void {
	out.push("/**");
	out.push(` * ${form.title} (${form.id}) — paper Form View layout.`);
	out.push(" *");
	out.push(" * GENERATED from @classytic/ca-tax:");
	out.push(" *   npx tsx scripts/emit-paper-layouts.ts");
	out.push(" *");
	out.push(
		` * Ultimately from ${form.provenance.document}, retrieved ${form.provenance.retrieved}.`,
	);
	if (extra) {
		out.push(" *");
		for (const line of extra) out.push(` * ${line}`);
	}
	out.push(" *");
	out.push(
		" * Carries EVERY field, not just `input` ones — a paper view shows the whole",
	);
	out.push(
		" * form. The paper renderer, not this file, is responsible for keeping",
	);
	out.push(" * computed/carried-in lines read-only.");
	out.push(" */");
}

/**
 * The AT1 jacket is flat PLUS four shapes a flat field list cannot hold.
 *
 * This function used to carry a comment saying line 066 ("Amount Taxable in
 * Alberta") "appears on the printed form but is absent from
 * AT1_JACKET_CAPTIONS … a known gap in the captions generator, not fixed
 * here". It is fixed upstream now, along with 079 and 088 — the two printed
 * subtotals 080 and 090 subtract — so the page's arithmetic closes.
 *
 * The four companion shapes:
 *
 *   - **The day-band table behind line 068.** Six lettered day counts (A-F)
 *     and five prorated amounts (G-K). None is numbered, and line 068's own
 *     caption — "Total (line G + line H + line I + line J + line K)" — names
 *     five letters that are defined nowhere else.
 *   - **The code lists.** Six fields are `kind: 'code'` and the page prints
 *     every option beside a tick box. A filed "3" at line 051 means bankruptcy
 *     and at 039 means a final return; without the lists neither the interface
 *     can offer the choice nor a reader decode the answer.
 *   - **Nine in-box headings**, three of which do real routing: the two
 *     stacked over line 062 decide whether Schedule 12 is required at all and
 *     which federal lines 062 must equal, and the paragraph over 101 is the
 *     certification the signature attests to.
 *   - **The "For Department Use" box**, including the one printed number this
 *     package deliberately does not model. Carried so the renderer can say so
 *     rather than silently showing two of three boxes.
 */
export function jacketPaperLayout(): string {
	const out: string[] = [];
	emitProvenanceComment(out, AT1_JACKET, [
		"Two documents: this PDF for what the form says and prints, and the AT1 Net",
		"File specification for what transmits (the Line-Item-IDs, the M/O/X",
		"requirement per field, and the nine lines the RSI still carries that this",
		"form no longer prints). See ca-tax's `jacket.ts` header.",
	]);
	emitPaperTypes(out);
	out.push("");
	out.push("export const AT1_JACKET_SECTIONS: readonly PaperSectionDef[] = [");
	for (const s of AT1_JACKET.sections) {
		out.push(emitSectionDef(s));
	}
	out.push("];");
	out.push("");
	out.push(
		"/** In the order the FORM prints them — not the specification's numeric order. The credits block runs 129, 082, 085, 110, 086, 115, 087. */",
	);
	out.push("export const AT1_JACKET_FIELDS: readonly PaperField[] = [");
	for (const f of AT1_JACKET.fields) out.push(emitField(f));
	out.push("];");
	out.push("");
	out.push(
		"/** The lines the RSI still carries that this form no longer prints anywhere — four of them mandatory, so they transmit even when nil. A paper Form View must not render these among the printed rows: they are indistinguishable there, on a view whose whole purpose is to be the page. */",
	);
	out.push(
		`export const AT1_JACKET_LINES_NOT_PRINTED: readonly string[] = [${AT1_JACKET_LINES_NOT_PRINTED.map((l) => q(l)).join(", ")}];`,
	);
	out.push("");
	emitFootnotes(out, AT1_JACKET, "AT1_JACKET");
	out.push("");
	out.push("export interface JacketBlockHeading {");
	out.push("  /** The printed line the heading stands immediately above. */");
	out.push("  aboveLine: string;");
	out.push("  text: string;");
	out.push("  footnoteMarks?: readonly number[];");
	out.push("}");
	out.push("");
	out.push(
		'/** Three share `aboveLine: "062"` — the page stacks the Schedule 12 warning, the box heading and the federal-equality instruction. Print every match, in order. */',
	);
	out.push(
		"export const AT1_JACKET_BLOCK_HEADINGS: readonly JacketBlockHeading[] = [",
	);
	for (const h of AT1_JACKET_BLOCK_HEADINGS) {
		const parts = [`aboveLine: ${q(h.aboveLine)}`, `text: ${q(h.text)}`];
		if (h.footnoteMarks?.length) {
			parts.push(`footnoteMarks: [${h.footnoteMarks.join(", ")}]`);
		}
		out.push(`  { ${parts.join(", ")} },`);
	}
	out.push("];");
	out.push("");
	out.push("export interface JacketDayBand {");
	out.push(
		"  /** The letter the page prints beside the box, parentheses included. */",
	);
	out.push("  letter: string;");
	out.push("  label: string;");
	out.push("}");
	out.push("");
	out.push("export interface JacketRateRow {");
	out.push("  letter: string;");
	out.push('  /** Verbatim, trailing "=" and capital X included. */');
	out.push("  formula: string;");
	out.push(
		"  /** Which day band the formula divides by (F) — never (F) itself. */",
	);
	out.push("  daysLetter: string;");
	out.push("  rate: number;");
	out.push("}");
	out.push("");
	out.push(
		"/** Six bands, five rates: (F) is the denominator, not a sixth band. */",
	);
	out.push("export const AT1_JACKET_DAY_BANDS: readonly JacketDayBand[] = [");
	for (const b of AT1_JACKET_DAY_BANDS) {
		out.push(`  { letter: ${q(b.letter)}, label: ${q(b.label)} },`);
	}
	out.push("];");
	out.push("");
	out.push("export const AT1_JACKET_RATE_ROWS: readonly JacketRateRow[] = [");
	for (const r of AT1_JACKET_RATE_ROWS) {
		out.push(
			`  { letter: ${q(r.letter)}, formula: ${q(r.formula)}, daysLetter: ${q(r.daysLetter)}, rate: ${r.rate} },`,
		);
	}
	out.push("];");
	out.push("");
	out.push("export interface JacketCodeOption {");
	out.push(
		"  /** The digit the page prints beside the tick box, and the value transmitted. */",
	);
	out.push("  code: string;");
	out.push("  label: string;");
	out.push("}");
	out.push("");
	out.push(
		"/** Printed line → its tick-box options. Line 028 is a code too and is absent: its value is a four-digit SIC code from a published classification, not a list of five. */",
	);
	out.push(
		"export const AT1_JACKET_CODE_OPTIONS: Readonly<Record<string, readonly JacketCodeOption[]>> = {",
	);
	for (const [line, options] of Object.entries(AT1_JACKET_CODE_OPTIONS)) {
		out.push(`  ${q(line)}: [`);
		for (const o of options) {
			out.push(`    { code: ${q(o.code)}, label: ${q(o.label)} },`);
		}
		out.push("  ],");
	}
	out.push("};");
	out.push("");
	out.push(
		"/** Page 1's top-right box. `unmodelled` is line 004: printed, uncaptioned, in no spec table and in no certification sample — so there is nothing to transcribe, and guessing a caption is how a real figure lands against the wrong box. */",
	);
	out.push("export const AT1_JACKET_DEPARTMENT_USE = {");
	out.push(`  heading: ${q(AT1_JACKET_DEPARTMENT_USE.heading)},`);
	out.push(`  preprinted: ${q(AT1_JACKET_DEPARTMENT_USE.preprinted)},`);
	out.push(
		`  lines: [${AT1_JACKET_DEPARTMENT_USE.lines.map((l) => q(l)).join(", ")}] as readonly string[],`,
	);
	out.push(
		`  unmodelled: [${AT1_JACKET_DEPARTMENT_USE.unmodelled.map((l) => q(l)).join(", ")}] as readonly string[],`,
	);
	out.push("};");
	out.push("");
	return out.join("\n");
}

function emitFlatSchedule(
	form: FormDefinition,
	constPrefix: string,
	provenanceExtra?: string[],
): string {
	const out: string[] = [];
	emitProvenanceComment(out, form, provenanceExtra);
	emitPaperTypes(out);
	out.push("");
	out.push(
		`export const ${constPrefix}_SECTIONS: readonly PaperSectionDef[] = [`,
	);
	for (const s of form.sections) {
		out.push(emitSectionDef(s));
	}
	out.push("];");
	out.push("");
	out.push(`export const ${constPrefix}_FIELDS: readonly PaperField[] = [`);
	for (const f of form.fields) out.push(emitField(f));
	out.push("];");
	out.push("");
	emitFootnotes(out, form, constPrefix);
	return out.join("\n");
}

/**
 * Schedule 29 is flat PLUS two shapes a flat list cannot hold.
 *
 * The headings first. Page 2 heads its grant calculation "Part I calculation …
 * at 8%", then "Part II calculation … at 12%" with "(a) Non-Associated" and
 * "(b) Associated" beneath it, and the expenditure-limit box above sets
 * 'If "Yes", complete page 3.' between lines 100 and 102. Lines 112 and 125 are
 * two mutually exclusive formulas for the same credit, and those headings are
 * the ONLY thing on the page that says so — without them the form reads as
 * three rates that all apply.
 *
 * Then the allocation grid on page 3: ten columns per associated member, and a
 * "Totals" row whose seven cells each carry their own printed line. The page
 * captions every one of those totals only "Totals", so the column heading is
 * what identifies them — emitting the field list alone gives a renderer seven
 * identical rows and no way to place them.
 */
export function schedule29PaperLayout(): string {
	const out: string[] = [];
	out.push(emitFlatSchedule(AT1_SCHEDULE_29, "AT1_SCHEDULE_29"));
	out.push("");
	out.push("export interface Schedule29BlockHeading {");
	out.push("  /** The printed line the heading stands immediately above. */");
	out.push("  aboveLine: string;");
	out.push("  text: string;");
	out.push("}");
	out.push("");
	out.push(
		"/** Two may share an `aboveLine` — the page stacks two over line 112. Print every match, in order. */",
	);
	out.push(
		"export const AT1_SCHEDULE_29_BLOCK_HEADINGS: readonly Schedule29BlockHeading[] = [",
	);
	for (const h of AT1_SCHEDULE_29_BLOCK_HEADINGS) {
		out.push(`  { aboveLine: ${q(h.aboveLine)}, text: ${q(h.text)} },`);
	}
	out.push("];");
	out.push("");
	out.push("export interface Schedule29AllocationColumn {");
	out.push(
		"  /** The printed line for each MEMBER's own cell in this column. */",
	);
	out.push("  line: string;");
	out.push("  heading: string;");
	out.push('  kind: "text" | "date" | "money";');
	out.push('  role: "input" | "computed";');
	out.push(
		"  /** The line the page prints in this column's cell of the Totals row — absent on the three it leaves untotalled. */",
	);
	out.push("  totalsLine?: string;");
	out.push("}");
	out.push("");
	out.push(
		"export const AT1_SCHEDULE_29_ALLOCATION_COLUMNS: readonly Schedule29AllocationColumn[] = [",
	);
	for (const c of AT1_SCHEDULE_29_ALLOCATION_COLUMNS) {
		const parts = [
			`line: ${q(c.line)}`,
			`heading: ${q(c.heading)}`,
			`kind: ${q(c.kind)}`,
			`role: ${q(c.role)}`,
		];
		if (c.totalsLine) parts.push(`totalsLine: ${q(c.totalsLine)}`);
		out.push(`  { ${parts.join(", ")} },`);
	}
	out.push("];");
	out.push("");
	out.push(
		`export const AT1_SCHEDULE_29_ALLOCATION_TOTALS_LABEL = ${q(AT1_SCHEDULE_29_ALLOCATION_TOTALS_LABEL)};`,
	);
	out.push("");
	return out.join("\n");
}

/**
 * Schedule 18 is flat PLUS the grid shape the flat list cannot hold.
 *
 * The page prints its six categories as TWO tables of four columns — shares on
 * their own, then the other five — with lines 053 and 054 struck between them.
 * A flat list of fields loses every part of that: which cells share a row,
 * which letter heads each column, and the fact that the shares table numbers
 * no column D at all. The renderer gets the tables as data and lays them out;
 * the field list stays the single source for captions and notes.
 */
export function schedule18PaperLayout(): string {
	const out: string[] = [];
	out.push(emitFlatSchedule(AT1_SCHEDULE_18, "AT1_SCHEDULE_18"));
	out.push("");
	out.push("export interface Schedule18Column {");
	out.push('  column: "A" | "B" | "C" | "D";');
	out.push("  heading: string;");
	out.push(
		'  key: "proceeds" | "adjustedCostBase" | "outlays" | "gainOrLoss";',
	);
	out.push("}");
	out.push("");
	out.push("export interface Schedule18Category {");
	out.push("  label: string;");
	out.push('  grid: "shares" | "properties";');
	out.push("  proceeds: string;");
	out.push("  adjustedCostBase: string;");
	out.push("  outlays: string;");
	out.push("  /** Absent on shares — that grid leaves column D unnumbered. */");
	out.push("  gainOrLoss?: string;");
	out.push("  lossRestricted?: boolean;");
	out.push("  restrictionNote?: string;");
	out.push("  footnoteMarks?: readonly number[];");
	out.push("}");
	out.push("");
	out.push("export interface Schedule18Grid {");
	out.push('  id: "shares" | "properties";');
	out.push("  /** Column D's heading on this grid — the two differ. */");
	out.push("  gainHeading: string;");
	out.push("}");
	out.push("");
	out.push(
		"export const AT1_SCHEDULE_18_COLUMNS: readonly Schedule18Column[] = [",
	);
	for (const c of AT1_SCHEDULE_18_COLUMNS) {
		out.push(
			`  { column: ${q(c.column)}, heading: ${q(c.heading)}, key: ${q(c.key)} },`,
		);
	}
	out.push("];");
	out.push("");
	out.push("export const AT1_SCHEDULE_18_GRIDS: readonly Schedule18Grid[] = [");
	for (const g of AT1_SCHEDULE_18_GRIDS) {
		out.push(`  { id: ${q(g.id)}, gainHeading: ${q(g.gainHeading)} },`);
	}
	out.push("];");
	out.push("");
	out.push(
		"export const AT1_SCHEDULE_18_CATEGORIES: readonly Schedule18Category[] = [",
	);
	for (const c of AT1_SCHEDULE_18_CATEGORIES) {
		const parts = [
			`label: ${q(c.label)}`,
			`grid: ${q(c.grid)}`,
			`proceeds: ${q(c.proceeds)}`,
			`adjustedCostBase: ${q(c.adjustedCostBase)}`,
			`outlays: ${q(c.outlays)}`,
		];
		if (c.gainOrLoss) parts.push(`gainOrLoss: ${q(c.gainOrLoss)}`);
		if (c.lossRestricted) parts.push("lossRestricted: true");
		if (c.restrictionNote)
			parts.push(`restrictionNote: ${q(c.restrictionNote)}`);
		if (c.footnoteMarks?.length) {
			parts.push(`footnoteMarks: [${c.footnoteMarks.join(", ")}]`);
		}
		out.push(`  { ${parts.join(", ")} },`);
	}
	out.push("];");
	out.push("");
	out.push(
		`export const AT1_SCHEDULE_18_GAIN_FORMULA = ${q(AT1_SCHEDULE_18_GAIN_FORMULA)};`,
	);
	out.push("");
	out.push("export interface Schedule18BlockHeading {");
	out.push("  /** The printed line the heading stands immediately above. */");
	out.push("  aboveLine: string;");
	out.push("  text: string;");
	out.push("}");
	out.push("");
	out.push(
		"export const AT1_SCHEDULE_18_BLOCK_HEADINGS: readonly Schedule18BlockHeading[] = [",
	);
	for (const h of AT1_SCHEDULE_18_BLOCK_HEADINGS) {
		out.push(`  { aboveLine: ${q(h.aboveLine)}, text: ${q(h.text)} },`);
	}
	out.push("];");
	out.push("");
	out.push("export interface Schedule18AbilColumn {");
	out.push(
		"  /** The letter the page heads this column with, where it heads one. */",
	);
	out.push('  column?: "A" | "B" | "C" | "D";');
	out.push("  heading: string;");
	out.push("  /** Absent on column D, which the page does not number. */");
	out.push("  line?: string;");
	out.push("}");
	out.push("");
	out.push(
		"export const AT1_SCHEDULE_18_ABIL_COLUMNS: readonly Schedule18AbilColumn[] = [",
	);
	for (const c of AT1_SCHEDULE_18_ABIL_COLUMNS) {
		const parts: string[] = [];
		if (c.column) parts.push(`column: ${q(c.column)}`);
		parts.push(`heading: ${q(c.heading)}`);
		if (c.line) parts.push(`line: ${q(c.line)}`);
		out.push(`  { ${parts.join(", ")} },`);
	}
	out.push("];");
	out.push("");
	out.push(
		`export const AT1_SCHEDULE_18_ABIL_TOTALS_LABEL = ${q(AT1_SCHEDULE_18_ABIL_TOTALS_LABEL)};`,
	);
	out.push("");
	out.push(
		"/** Printed line → the line the page prints it AFTER, where that is not line order. */",
	);
	out.push(
		"export const AT1_SCHEDULE_18_PRINTED_AFTER: Readonly<Record<string, string>> = {",
	);
	for (const [line, after] of Object.entries(AT1_SCHEDULE_18_PRINTED_AFTER)) {
		out.push(`  ${q(line)}: ${q(after)},`);
	}
	out.push("};");
	return out.join("\n");
}

export function schedule12PaperLayout(): string {
	return emitFlatSchedule(AT1_SCHEDULE_12, "AT1_SCHEDULE_12");
}

/**
 * Schedule 1 is flat PLUS three shapes a flat list cannot hold.
 *
 * The calculation table (seven lettered columns across six pre-printed rate
 * periods, none of them numbered), Area A's four columns and its totals row,
 * and the six headings and instructions the page sets inside a box. One of
 * those headings does real routing — "Corporations with permanent
 * establishments only in Alberta, ignore lines 019, 020 and 021 and go directly
 * to the table below" is the difference between three boxes a preparer fills
 * and three they skip, and no caption says it.
 */
export function schedule1PaperLayout(): string {
	const out: string[] = [];
	out.push(emitFlatSchedule(AT1_SCHEDULE_1, "AT1_SCHEDULE_1"));
	out.push("");
	out.push("export interface Schedule1BlockHeading {");
	out.push("  /** The printed line the heading stands immediately above. */");
	out.push("  aboveLine: string;");
	out.push("  text: string;");
	out.push(
		"  /** Which footnote the page marks INSIDE this text — Area A's asterisk sits in its opening paragraph, not on a numbered box. */",
	);
	out.push("  footnoteMarks?: readonly number[];");
	out.push("}");
	out.push("");
	out.push(
		"/** Two may share an `aboveLine` — the page stacks two over line 041. Print every match, in order. */",
	);
	out.push(
		"export const AT1_SCHEDULE_1_BLOCK_HEADINGS: readonly Schedule1BlockHeading[] = [",
	);
	for (const h of AT1_SCHEDULE_1_BLOCK_HEADINGS) {
		const parts = [`aboveLine: ${q(h.aboveLine)}`, `text: ${q(h.text)}`];
		if (h.footnoteMarks?.length) {
			parts.push(`footnoteMarks: [${h.footnoteMarks.join(", ")}]`);
		}
		out.push(`  { ${parts.join(", ")} },`);
	}
	out.push("];");
	out.push("");
	out.push("export interface Schedule1Column {");
	out.push('  column: "A" | "B" | "C" | "D" | "E" | "F" | "G";');
	out.push(
		"  /** Verbatim, arithmetic included. The page numbers none of them. */",
	);
	out.push("  heading: string;");
	out.push("  footnoteMarks?: readonly number[];");
	out.push("}");
	out.push("");
	out.push(
		"export const AT1_SCHEDULE_1_COLUMNS: readonly Schedule1Column[] = [",
	);
	for (const c of AT1_SCHEDULE_1_COLUMNS) {
		const parts = [`column: ${q(c.column)}`, `heading: ${q(c.heading)}`];
		if (c.footnoteMarks?.length) {
			parts.push(`footnoteMarks: [${c.footnoteMarks.join(", ")}]`);
		}
		out.push(`  { ${parts.join(", ")} },`);
	}
	out.push("];");
	out.push("");
	out.push("export interface Schedule1RatePeriod {");
	out.push("  /** Column A's row label, verbatim. */");
	out.push("  label: string;");
	out.push("  /** Column B, verbatim. */");
	out.push("  percentage: string;");
	out.push("  /** Column F, as printed. */");
	out.push("  sbdRate: number;");
	out.push("}");
	out.push("");
	out.push(
		"/** Pre-printed cell content, not preparer input — a view without these draws six blank rows. */",
	);
	out.push(
		"export const AT1_SCHEDULE_1_RATE_PERIODS: readonly Schedule1RatePeriod[] = [",
	);
	for (const p of AT1_SCHEDULE_1_RATE_PERIODS) {
		out.push(
			`  { label: ${q(p.label)}, percentage: ${q(p.percentage)}, sbdRate: ${p.sbdRate} },`,
		);
	}
	out.push("];");
	out.push("");
	out.push(
		`export const AT1_SCHEDULE_1_TOTAL_DAYS_LABEL = ${q(AT1_SCHEDULE_1_TOTAL_DAYS_LABEL)};`,
	);
	out.push("");
	out.push("export interface Schedule1AgreementColumn {");
	out.push("  line: string;");
	out.push("  heading: string;");
	out.push('  kind: "text" | "code" | "rate" | "money";');
	out.push(
		"  /** What the page PRE-PRINTS in this column's cell of the totals row — a constant, not a sum of the rows. */",
	);
	out.push("  total?: string;");
	out.push("}");
	out.push("");
	out.push(
		"export const AT1_SCHEDULE_1_AGREEMENT_COLUMNS: readonly Schedule1AgreementColumn[] = [",
	);
	for (const c of AT1_SCHEDULE_1_AGREEMENT_COLUMNS) {
		const parts = [
			`line: ${q(c.line)}`,
			`heading: ${q(c.heading)}`,
			`kind: ${q(c.kind)}`,
		];
		if (c.total) parts.push(`total: ${q(c.total)}`);
		out.push(`  { ${parts.join(", ")} },`);
	}
	out.push("];");
	out.push("");
	out.push(
		`export const AT1_SCHEDULE_1_AGREEMENT_TOTALS_LABEL = ${q(AT1_SCHEDULE_1_AGREEMENT_TOTALS_LABEL)};`,
	);
	out.push("");
	/*
	 * AREA B. Eleven lettered amounts, (a)-(k), and no line number anywhere — so
	 * it cannot be a section (one with no fields fails validation) and its amounts
	 * cannot be `PaperField`s (the scheme requires nine digits).
	 *
	 * It was omitted from the definition altogether on exactly that reasoning,
	 * which confused "not computed" with "not on the page". Line 015 feeds column
	 * C, which feeds the deduction, and for a short taxation year or a large
	 * associated group this cascade is the only route to it.
	 */
	out.push("export interface Schedule1AreaBStep {");
	out.push(
		"  /** The letter the page labels this amount with, parentheses included. */",
	);
	out.push("  letter: string;");
	out.push("  label: string;");
	out.push(
		"  /** The arithmetic printed beside the label, where the page prints any. */",
	);
	out.push("  formula?: string;");
	out.push("  /** A sub-heading printed immediately above this step. */");
	out.push("  heading?: string;");
	out.push(
		"  /** The bold instruction naming this amount as a place the cascade may STOP and line 015 be taken from. */",
	);
	out.push("  exitTo015?: string;");
	out.push("}");
	out.push("");
	out.push(
		`export const AT1_SCHEDULE_1_AREA_B_TITLE = ${q(AT1_SCHEDULE_1_AREA_B_TITLE)};`,
	);
	out.push("");
	out.push(
		"/** The rule, then the two adjustments by name — both conditions a preparer has to test against their own year. */",
	);
	out.push(
		"export const AT1_SCHEDULE_1_AREA_B_PREAMBLE: readonly string[] = [",
	);
	for (const line of AT1_SCHEDULE_1_AREA_B_PREAMBLE) out.push(`  ${q(line)},`);
	out.push("];");
	out.push("");
	out.push(
		"/** Twelve steps for eleven letters — the page labels TWO amounts (c), one per side of 2022-04-07. */",
	);
	out.push(
		"export const AT1_SCHEDULE_1_AREA_B_STEPS: readonly Schedule1AreaBStep[] = [",
	);
	for (const step of AT1_SCHEDULE_1_AREA_B_STEPS) {
		const parts = [`letter: ${q(step.letter)}`, `label: ${q(step.label)}`];
		if (step.formula) parts.push(`formula: ${q(step.formula)}`);
		if (step.heading) parts.push(`heading: ${q(step.heading)}`);
		if (step.exitTo015) parts.push(`exitTo015: ${q(step.exitTo015)}`);
		out.push(`  { ${parts.join(", ")} },`);
	}
	out.push("];");
	out.push("");
	out.push(
		"/** What A and B mean in the two (c) formulas. Without it those rows name two letters defined nowhere. */",
	);
	out.push(
		"export const AT1_SCHEDULE_1_AREA_B_LARGE_CORPORATIONS: readonly string[] = [",
	);
	for (const line of AT1_SCHEDULE_1_AREA_B_LARGE_CORPORATIONS) {
		out.push(`  ${q(line)},`);
	}
	out.push("];");
	out.push("");
	return out.join("\n");
}

export function schedule2PaperLayout(): string {
	const out = [emitFlatSchedule(AT1_SCHEDULE_2, "AT1_SCHEDULE_2")];
	/*
	 * Column I — the allocation factor — has no line number on any row, so it
	 * is not a `FormField` and `emitFlatSchedule` cannot carry it. It is still
	 * printed on the page for every formula, and the grid is unreadable without
	 * it: A, B, C and D are inputs to arithmetic the preparer cannot otherwise
	 * see. Emitted from ca-tax's own companion export.
	 */
	out.push(
		"/** Column I per formula — the arithmetic the page prints, with no line number on any row. See `AT1_SCHEDULE_2_FACTOR_DESTINATION` for where every factor goes. */",
	);
	out.push("export interface Schedule2Formula {");
	out.push("  section: string;");
	out.push("  regulation: string;");
	out.push("  factor: string;");
	out.push(
		"  /** Which printed line each letter in `factor` stands for — the page heads its columns A-H and prints those letters nowhere else. */",
	);
	out.push("  columns: Readonly<Record<string, string>>;");
	out.push("  note?: string;");
	out.push("}");
	out.push("");
	out.push(
		"export const AT1_SCHEDULE_2_FORMULAS: readonly Schedule2Formula[] = [",
	);
	for (const f of AT1_SCHEDULE_2_FORMULAS) {
		const cols = Object.entries(f.columns)
			.map(([letter, line]) => `${letter}: ${q(line)}`)
			.join(", ");
		const parts = [
			`section: ${q(f.section)}`,
			`regulation: ${q(f.regulation)}`,
			`factor: ${q(f.factor)}`,
			`columns: { ${cols} }`,
		];
		if (f.note) parts.push(`note: ${q(f.note)}`);
		out.push(`  { ${parts.join(", ")} },`);
	}
	out.push("];");
	out.push("");
	out.push(
		"/** Where every factor is filed, whichever formula produced it — the AT1 jacket. */",
	);
	out.push(
		`export const AT1_SCHEDULE_2_FACTOR_DESTINATION = { form: ${q(AT1_SCHEDULE_2_FACTOR_DESTINATION.form)}, line: ${q(AT1_SCHEDULE_2_FACTOR_DESTINATION.line)}${AT1_SCHEDULE_2_FACTOR_DESTINATION.note ? `, note: ${q(AT1_SCHEDULE_2_FACTOR_DESTINATION.note)}` : ""} };`,
	);
	out.push("");
	return out.join("\n");
}

export function schedule10PaperLayout(): string {
	return emitFlatSchedule(AT1_SCHEDULE_10, "AT1_SCHEDULE_10");
}

/**
 * Schedule 3 is flat PLUS the three carry-forward-by-year-of-origin tables.
 *
 * Pages 2 and 3 are nothing but those tables, and they were absent from the
 * definition entirely — `computeSchedule3` has a good reason not to COMPUTE the
 * ITC/CITC split, which was never a reason to leave two printed pages out of a
 * transcription of the form.
 *
 * The flat field list cannot hold two things the tables say. Which cells the
 * page SHADES OUT — a shaded cell states that the quantity does not exist for
 * that vintage, which is not the same as an empty one — and how DEEP each table
 * runs: four preceding years for the Investor Tax Credit, ten for the other two.
 */
export function schedule3PaperLayout(): string {
	const out: string[] = [];
	out.push(emitFlatSchedule(AT1_SCHEDULE_3, "AT1_SCHEDULE_3"));
	out.push("");
	out.push("export interface Schedule3VintageColumn {");
	out.push(
		"  /** The printed line. Each row of the table is one OCCURRENCE of it. */",
	);
	out.push("  line: string;");
	out.push(
		"  /** The column heading, verbatim, including any arithmetic it states. */",
	);
	out.push("  heading: string;");
	out.push('  kind: "code" | "date" | "money";');
	out.push('  role: "input" | "computed";');
	out.push(
		"  /** Year-of-origin indexes the page SHADES OUT for this column — 0 is the current year. A shaded cell says the quantity does not exist for that vintage, which is not an empty box. */",
	);
	out.push("  shadedYears?: readonly number[];");
	out.push(
		"  /** True where the page prints a cell for this column in its Totals row. */",
	);
	out.push("  totalled?: boolean;");
	out.push("  footnoteMarks?: readonly number[];");
	out.push("}");
	out.push("");
	out.push("export interface Schedule3VintageTable {");
	out.push("  /** Matches the section id its columns belong to. */");
	out.push('  section: "itc-vintage" | "citc-vintage" | "apitc-vintage";');
	out.push("  title: string;");
	out.push(
		"  /** The deepest preceding-year row the page prints — FOUR for the Investor Tax Credit, TEN for the other two. Rendering all three alike invents rows the form has no boxes for. */",
	);
	out.push("  maxPrecedingYear: number;");
	out.push("  columns: readonly Schedule3VintageColumn[];");
	out.push("}");
	out.push("");
	out.push(
		"export const AT1_SCHEDULE_3_VINTAGE_TABLES: readonly Schedule3VintageTable[] = [",
	);
	for (const t of AT1_SCHEDULE_3_VINTAGE_TABLES) {
		out.push(`  {`);
		out.push(`    section: ${q(t.section)},`);
		out.push(`    title: ${q(t.title)},`);
		out.push(`    maxPrecedingYear: ${t.maxPrecedingYear},`);
		out.push(`    columns: [`);
		for (const c of t.columns) {
			const parts = [
				`line: ${q(c.line)}`,
				`heading: ${q(c.heading)}`,
				`kind: ${q(c.kind)}`,
				`role: ${q(c.role)}`,
			];
			if (c.shadedYears?.length) {
				parts.push(`shadedYears: [${c.shadedYears.join(", ")}]`);
			}
			if (c.totalled) parts.push("totalled: true");
			if (c.footnoteMarks?.length) {
				parts.push(`footnoteMarks: [${c.footnoteMarks.join(", ")}]`);
			}
			out.push(`      { ${parts.join(", ")} },`);
		}
		out.push(`    ],`);
		out.push(`  },`);
	}
	out.push("];");
	out.push("");
	out.push(
		`export const AT1_SCHEDULE_3_VINTAGE_TOTALS_LABEL = ${q(AT1_SCHEDULE_3_VINTAGE_TOTALS_LABEL)};`,
	);
	out.push("");
	out.push(
		"/** The row label for one year-of-origin index, as the page prints it. */",
	);
	out.push(
		"export function albertaVintageRowLabel(yearIndex: number): string {",
	);
	out.push('  if (yearIndex === 0) return "Current";');
	out.push("  const suffix =");
	out.push("    yearIndex % 10 === 1 && yearIndex !== 11");
	out.push('      ? "st"');
	out.push("      : yearIndex % 10 === 2 && yearIndex !== 12");
	out.push('        ? "nd"');
	out.push("        : yearIndex % 10 === 3 && yearIndex !== 13");
	out.push('          ? "rd"');
	out.push('          : "th";');
	out.push("  return `${yearIndex}${suffix} preceding taxation year`;");
	out.push("}");
	out.push("");
	return out.join("\n");
}

/**
 * Schedule 15 is flat PLUS the two-column continuity grid every one of its
 * areas prints.
 *
 * The flat field list loses three things, and each of them changes what a
 * preparer should do:
 *
 *   - **Which cells the page SHADES OUT.** A shaded cell says the quantity
 *     does not exist on that side of the pool — Regulation 1201 applies to
 *     regular expenses and 1202(2) to successor expenses, and the page shades
 *     each column out on the other's row to say so. Without it a renderer
 *     draws sixteen open boxes where Area A has nine.
 *   - **The "Amount Available" rows**, printed with a box in both columns and
 *     a line number in neither. Nothing transmits them, and each is where its
 *     area's whole negative-balance rule is anchored.
 *   - **Which two cells share a row.** Nothing about lines 001 and 011 says
 *     they are one quantity on two sides of one pool; both carry the same
 *     caption precisely because the page prints one label between them.
 *
 * Also emitted: the carry-forward instruction each area prints beneath its
 * table, verbatim, because it states the arithmetic that reaches AT1
 * Schedule 12.
 */
export function schedule15PaperLayout(): string {
	const out: string[] = [];
	out.push(emitFlatSchedule(AT1_SCHEDULE_15, "AT1_SCHEDULE_15"));
	out.push("");
	out.push("export interface ResourceContinuityRow {");
	out.push(
		"  /** The row label, verbatim, as the page prints it once for both columns. */",
	);
	out.push("  label: string;");
	out.push("  regular?: string;");
	out.push("  successor?: string;");
	out.push(
		"  /** Columns the page SHADES OUT: the quantity does not exist on that side, which is not the same as an empty box. */",
	);
	out.push('  shaded?: readonly ("regular" | "successor")[];');
	out.push(
		'  /** The page prints an open box in both columns and numbers neither — the "Amount Available" subtotals. */',
	);
	out.push("  unnumbered?: boolean;");
	out.push(
		"  /** Printed in a BOX OF ITS OWN below the area's footnotes, column headings repeated. Only \"Foreign-source resource income\" (231/233) does this — it caps Area F's claim rather than moving the pool. */",
	);
	out.push("  separateBox?: boolean;");
	out.push("  footnoteMarks?: readonly number[];");
	out.push("}");
	out.push("");
	out.push("export interface ResourceContinuityArea {");
	out.push("  /** Matches the section id its lines belong to. */");
	out.push("  section: string;");
	out.push("  title: string;");
	out.push(
		"  /** The line the page prints immediately under the box heading, verbatim. Area F's is routing: a country-specific expense belongs in Area G or H instead. */",
	);
	out.push("  subtitle?: string;");
	out.push(
		"  /** Absent on Area B, which prints ONE unheaded column — it has no successor side at all. */",
	);
	out.push("  columnHeadings?: readonly [string, string];");
	out.push("  rows: readonly ResourceContinuityRow[];");
	out.push(
		"  /** The bold instruction printed beneath the table, verbatim. */",
	);
	out.push("  carryForward?: string;");
	out.push(
		"  /** The same instruction structured: the claim lines it names, and the AT1 Schedule 12 line they total to. */",
	);
	out.push("  carryForwardTo?: { line: string; claims: readonly string[] };");
	out.push("}");
	out.push("");
	out.push(
		"export const AT1_SCHEDULE_15_AREAS: readonly ResourceContinuityArea[] = [",
	);
	for (const a of AT1_SCHEDULE_15_AREAS) {
		out.push("  {");
		out.push(`    section: ${q(a.section)},`);
		out.push(`    title: ${q(a.title)},`);
		if (a.subtitle) out.push(`    subtitle: ${q(a.subtitle)},`);
		if (a.columnHeadings) {
			out.push(
				`    columnHeadings: [${a.columnHeadings.map((h) => q(h)).join(", ")}],`,
			);
		}
		if (a.carryForward) out.push(`    carryForward: ${q(a.carryForward)},`);
		if (a.carryForwardTo) {
			out.push(
				`    carryForwardTo: { line: ${q(a.carryForwardTo.line)}, claims: [${a.carryForwardTo.claims.map((c) => q(c)).join(", ")}] },`,
			);
		}
		out.push("    rows: [");
		for (const r of a.rows) {
			const parts = [`label: ${q(r.label)}`];
			if (r.regular) parts.push(`regular: ${q(r.regular)}`);
			if (r.successor) parts.push(`successor: ${q(r.successor)}`);
			if (r.shaded?.length) {
				parts.push(`shaded: [${r.shaded.map((s) => q(s)).join(", ")}]`);
			}
			if (r.unnumbered) parts.push("unnumbered: true");
			if (r.separateBox) parts.push("separateBox: true");
			if (r.footnoteMarks?.length) {
				parts.push(`footnoteMarks: [${r.footnoteMarks.join(", ")}]`);
			}
			out.push(`      { ${parts.join(", ")} },`);
		}
		out.push("    ],");
		out.push("  },");
	}
	out.push("];");
	out.push("");
	/*
	 * Pages 5 and 6 are a THIRD shape. Areas G and H are per-country tables
	 * whose printed lines are COLUMNS, not rows — lettered A-I / J-R and
	 * AA-JJ / KK-SS, with one row per country. Four columns the page computes
	 * and numbers nowhere (E, N, FF, OO) are the four its negative-balance
	 * footnotes are entirely about, and four grand totals it identifies only by
	 * letter (I, R, JJ, SS) are four of the six terms that reach AT1 Schedule
	 * 12 line 030. None of that fits a row-shaped grid.
	 */
	out.push("export interface PerCountryColumn {");
	out.push(
		"  /** The letter the page heads this column with. Absent on the country stub. */",
	);
	out.push("  letter?: string;");
	out.push("  /** Verbatim, including any arithmetic it states. */");
	out.push("  heading: string;");
	out.push(
		'  /** Absent on the four "Amount available" columns, which the page computes and numbers nowhere. */',
	);
	out.push("  line?: string;");
	out.push('  kind: "code" | "money";');
	out.push('  role: "input" | "computed";');
	out.push("  footnoteMarks?: readonly number[];");
	out.push("}");
	out.push("");
	out.push("export interface PerCountryTable {");
	out.push(
		'  /** The page\'s sub-heading — "Regular Expenses" / "Successor Expenses". */',
	);
	out.push("  title: string;");
	out.push("  columns: readonly PerCountryColumn[];");
	out.push(
		"  /** The box the page prints under the table with a LETTER and no line number, totalling the claim column across every country. */",
	);
	out.push("  grandTotal: { letter: string; ofColumn: string };");
	out.push("}");
	out.push("");
	out.push("export interface PerCountryArea {");
	out.push("  section: string;");
	out.push("  title: string;");
	out.push(
		"  /** The paragraph the page prints under the heading, verbatim. */",
	);
	out.push("  subtitle: string;");
	out.push("  tables: readonly PerCountryTable[];");
	out.push("}");
	out.push("");
	out.push(
		"export const AT1_SCHEDULE_15_PER_COUNTRY: readonly PerCountryArea[] = [",
	);
	for (const a of AT1_SCHEDULE_15_PER_COUNTRY) {
		out.push("  {");
		out.push(`    section: ${q(a.section)},`);
		out.push(`    title: ${q(a.title)},`);
		out.push(`    subtitle: ${q(a.subtitle)},`);
		out.push("    tables: [");
		for (const t of a.tables) {
			out.push("      {");
			out.push(`        title: ${q(t.title)},`);
			out.push(
				`        grandTotal: { letter: ${q(t.grandTotal.letter)}, ofColumn: ${q(t.grandTotal.ofColumn)} },`,
			);
			out.push("        columns: [");
			for (const c of t.columns) {
				const parts: string[] = [];
				if (c.letter) parts.push(`letter: ${q(c.letter)}`);
				parts.push(`heading: ${q(c.heading)}`);
				if (c.line) parts.push(`line: ${q(c.line)}`);
				parts.push(`kind: ${q(c.kind)}`, `role: ${q(c.role)}`);
				if (c.footnoteMarks?.length) {
					parts.push(`footnoteMarks: [${c.footnoteMarks.join(", ")}]`);
				}
				out.push(`          { ${parts.join(", ")} },`);
			}
			out.push("        ],");
			out.push("      },");
		}
		out.push("    ],");
		out.push("  },");
	}
	out.push("];");
	out.push("");
	out.push(
		"/** The bold instruction at the foot of page 6. It belongs to no area: it totals Area F's two claims with the four per-country grand totals, and four of its six terms are LETTERS rather than line numbers. */",
	);
	out.push("export const AT1_SCHEDULE_15_CLOSING_INSTRUCTION = {");
	out.push(`  text: ${q(AT1_SCHEDULE_15_CLOSING_INSTRUCTION.text)},`);
	out.push(`  to: ${q(AT1_SCHEDULE_15_CLOSING_INSTRUCTION.to)},`);
	out.push(
		`  lines: [${AT1_SCHEDULE_15_CLOSING_INSTRUCTION.lines.map((l) => q(l)).join(", ")}] as readonly string[],`,
	);
	out.push(
		`  letters: [${AT1_SCHEDULE_15_CLOSING_INSTRUCTION.letters.map((l) => q(l)).join(", ")}] as readonly string[],`,
	);
	out.push("};");
	out.push("");
	return out.join("\n");
}

/**
 * Schedule 4 is flat PLUS its eight printed columns.
 *
 * Three of those columns — C, D and G — have no line number and so no
 * `PaperField`, and they are the whole derivation: the allocation factor, the
 * prorated income, and the tax net of the federal credit. H is the lesser of
 * two of them. A view built from the fields alone shows an "Allowable Credit"
 * with nothing behind it.
 */
/** AT1 Schedule 16 — the SR&ED pool. Twelve lines, no grid. */
export function schedule16PaperLayout(): string {
	return emitFlatSchedule(AT1_SCHEDULE_16, "AT1_SCHEDULE_16");
}

export function schedule4PaperLayout(): string {
	const out: string[] = [];
	out.push(emitFlatSchedule(AT1_SCHEDULE_4, "AT1_SCHEDULE_4"));
	out.push("");
	out.push("export interface Schedule4Column {");
	out.push('  column: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";');
	out.push("  heading: string;");
	out.push("  /** Absent on C, D and G, which the page does not number. */");
	out.push("  line?: string;");
	out.push("  footnoteMarks?: readonly number[];");
	out.push("}");
	out.push("");
	out.push(
		"export const AT1_SCHEDULE_4_COLUMNS: readonly Schedule4Column[] = [",
	);
	for (const c of AT1_SCHEDULE_4_COLUMNS) {
		const parts = [`column: ${q(c.column)}`, `heading: ${q(c.heading)}`];
		if (c.line) parts.push(`line: ${q(c.line)}`);
		if (c.footnoteMarks?.length) {
			parts.push(`footnoteMarks: [${c.footnoteMarks.join(", ")}]`);
		}
		out.push(`  { ${parts.join(", ")} },`);
	}
	out.push("];");
	return out.join("\n");
}

/** Federal T2 Schedule 1 — its own directory (see `T2_PAPER_DIR` above). */
export function t2Schedule1PaperLayout(): string {
	return emitFlatSchedule(T2_SCHEDULE_1, "T2_SCHEDULE_1");
}

export function t2Schedule2PaperLayout(): string {
	return emitFlatSchedule(T2_SCHEDULE_2, "T2_SCHEDULE_2");
}

/**
 * Federal T2 Schedule 13's paper layout — Part 2 (six named "other" reserves)
 * plus Part 1/the totals. Part 2's rows are FIXED by reserve type (unlike
 * T2SCH8's free-form CCA classes), so — unlike that schedule — there's no
 * grid-column table to emit here; the paper view matches each of
 * `T2_SCHEDULE_13`'s named rows against `reserves.rows` by `type` directly,
 * the same way AT1 Schedule 17's view already does for its own 8 kinds (see
 * `schedule17-form-view.tsx`).
 */
export function t2Schedule13PaperLayout(): string {
	return emitFlatSchedule(T2_SCHEDULE_13, "T2_SCHEDULE_13");
}

export function t2Schedule50PaperLayout(): string {
	return emitFlatSchedule(T2_SCHEDULE_50, "T2_SCHEDULE_50");
}

export function t2Schedule5PaperLayout(): string {
	return emitFlatSchedule(T2_SCHEDULE_5, "T2_SCHEDULE_5");
}

export function t2Schedule33PaperLayout(): string {
	return emitFlatSchedule(T2_SCHEDULE_33, "T2_SCHEDULE_33");
}

export function t2Schedule31PaperLayout(): string {
	return emitFlatSchedule(T2_SCHEDULE_31, "T2_SCHEDULE_31");
}

/**
 * Federal T2 Schedule 130's paper layout — the excessive interest and
 * financing expenses limitation (EIFEL, ITA s.18.2).
 *
 * The largest schedule in the federal return: 20 lettered sub-parts over 162
 * lines. Its `FormDefinition` is hand-authored rather than extracted, because
 * this form puts its line numbers in column headings rather than beside the
 * captions and `pdftotext -layout` cannot pair them — see the module's own
 * note. Emitting it here still matters: the interface then renders the parts
 * and captions the engine itself is defined against, instead of a third
 * transcription of the same PDF.
 */
export function t2Schedule130PaperLayout(): string {
	return emitFlatSchedule(T2_SCHEDULE_130, "T2_SCHEDULE_130");
}

/**
 * Québec CO-17 — Déclaration de revenus des sociétés.
 *
 * The one form here whose line identifiers are not CRA line numbers: Revenu
 * Québec numbers its own boxes, and some carry a letter suffix (420c, 440b).
 * The definition records that as `lineScheme: 'rq-box'`; nothing downstream may
 * assume a three-digit numeric line. Captions stay in French, as printed.
 */
export function t2Schedule3PaperLayout(): string {
	return emitFlatSchedule(T2_SCHEDULE_3, "T2_SCHEDULE_3");
}

/**
 * Federal T2 Schedule 4's paper layout — five loss types running in parallel
 * with near-identical rows, which is exactly why the section a line lands in
 * matters more here than on any other schedule.
 */
export function t2Schedule4PaperLayout(): string {
	return emitFlatSchedule(T2_SCHEDULE_4, "T2_SCHEDULE_4");
}

/**
 * The T2 jacket. Its identification block (page 1) is hand-authored in the
 * definition because the jacket extractor cannot read a two-column page; the
 * rest is pages 3 to 9, the computational spine.
 */
export function t2JacketPaperLayout(): string {
	return emitFlatSchedule(T2_JACKET, "T2_JACKET");
}

/** Schedule 141 — the notes checklist, the one GIFI schedule that is a real form. */
export function t2Schedule141PaperLayout(): string {
	return emitFlatSchedule(T2_SCHEDULE_141, "T2_SCHEDULE_141");
}

export function t2Schedule6PaperLayout(): string {
	return emitFlatSchedule(T2_SCHEDULE_6, "T2_SCHEDULE_6");
}

/**
 * Federal T2 Schedule 21 — foreign income tax credits. NOT to be confused with
 * AT1's own Schedule 21, which is loss continuity; the two share a number and
 * nothing else, which is why the emitted constants carry the T2_ prefix and
 * live in the federal directory.
 */
export function t2Schedule21PaperLayout(): string {
	return emitFlatSchedule(T2_SCHEDULE_21, "T2_SCHEDULE_21");
}

export function t2Schedule23PaperLayout(): string {
	return emitFlatSchedule(T2_SCHEDULE_23, "T2_SCHEDULE_23");
}

export function t2Schedule24PaperLayout(): string {
	return emitFlatSchedule(T2_SCHEDULE_24, "T2_SCHEDULE_24");
}

export function t2Schedule43PaperLayout(): string {
	return emitFlatSchedule(T2_SCHEDULE_43, "T2_SCHEDULE_43");
}

export function t2Schedule53PaperLayout(): string {
	return emitFlatSchedule(T2_SCHEDULE_53, "T2_SCHEDULE_53");
}

export function t2Schedule55PaperLayout(): string {
	return emitFlatSchedule(T2_SCHEDULE_55, "T2_SCHEDULE_55");
}

export function t2Schedule7PaperLayout(): string {
	return emitFlatSchedule(T2_SCHEDULE_7, "T2_SCHEDULE_7");
}

export function co17PaperLayout(): string {
	return emitFlatSchedule(CO17_RETURN, "CO17_RETURN");
}

/**
 * Federal T2 Schedule 8's paper layout — the flat field list plus the
 * 22-column grid definition (`SCHEDULE_8_COLUMNS`, mirroring how AT1
 * Schedule 13's `schedule13PaperLayout` emits its own grid; the two share
 * one compute primitive so the shapes are deliberately similar). Columns
 * with no `line` (10-16) are the form's own unnumbered arithmetic and are
 * omitted here, as they were from the FormDefinition.
 */
export function t2Schedule8PaperLayout(): string {
	const out: string[] = [];
	emitProvenanceComment(out, T2_SCHEDULE_8);
	emitPaperTypes(out);
	out.push("");
	out.push(
		"export const T2_SCHEDULE_8_SECTIONS: readonly PaperSectionDef[] = [",
	);
	for (const s of T2_SCHEDULE_8.sections) {
		out.push(emitSectionDef(s));
	}
	out.push("];");
	out.push("");
	out.push("export const T2_SCHEDULE_8_FIELDS: readonly PaperField[] = [");
	for (const f of T2_SCHEDULE_8.fields) out.push(emitField(f));
	out.push("];");
	out.push("");
	out.push("export interface Schedule8GridColumn {");
	out.push("  column: number;");
	out.push("  line: string;");
	out.push("  caption: string;");
	out.push("  kind: PaperFieldKind;");
	out.push("  note?: string;");
	out.push("}");
	out.push("");
	out.push(
		"export const T2_SCHEDULE_8_GRID_COLUMNS: readonly Schedule8GridColumn[] = [",
	);
	for (const c of SCHEDULE_8_COLUMNS) {
		if (!c.line) continue;
		const kind = c.column === 1 ? "code" : c.column === 18 ? "rate" : "money";
		out.push(
			`  { column: ${c.column}, line: ${q(c.line)}, caption: ${q(c.caption)}, kind: ${q(kind)}${c.note ? `, note: ${q(c.note)}` : ""} },`,
		);
	}
	out.push("];");
	out.push("");
	return out.join("\n");
}

export function schedule20PaperLayout(): string {
	const out: string[] = [];
	emitProvenanceComment(out, AT1_SCHEDULE_20);
	emitPaperTypes(out);
	out.push("");
	out.push(
		"export const AT1_SCHEDULE_20_SECTIONS: readonly PaperSectionDef[] = [",
	);
	for (const s of AT1_SCHEDULE_20.sections) {
		out.push(emitSectionDef(s));
	}
	out.push("];");
	out.push("");
	out.push("export const AT1_SCHEDULE_20_FIELDS: readonly PaperField[] = [");
	for (const f of AT1_SCHEDULE_20.fields) out.push(emitField(f));
	out.push("];");
	out.push("");
	emitFootnotes(out, AT1_SCHEDULE_20, "AT1_SCHEDULE_20");
	// Deliberately no pools/rows table here — unlike Schedule 21's five loss
	// pools, Schedule 20's paper view renders straight off the flat
	// `AT1_SCHEDULE_20_FIELDS` list via `PaperLeaderRow` (see
	// `schedule20-form-view.tsx`'s own doc comment). A `Schedule20Pool`/
	// `AT1_SCHEDULE_20_POOL_TABLE` structure used to be emitted here anyway —
	// dead output nothing imported, AND it recomputed `role` with its own
	// blanket rule instead of reading the FormDefinition's real per-field
	// role, so it would have silently disagreed with `AT1_SCHEDULE_20_FIELDS`
	// if anything ever had consumed it.
	return out.join("\n");
}

export function schedule21PaperLayout(): string {
	const out: string[] = [];
	emitProvenanceComment(out, AT1_SCHEDULE_21, [
		"Not in AT1_SCHEDULE_21, and so not here: the per-partnership",
		"limited-partnership grid (lines 131-141) and the two by-year-of-origin",
		"ledgers (151-169, 181-187) — repeating tables keyed by occurrence, which",
		"FormField has no shape for. Page 5 (RIFE, lines 200-350) IS carried.",
	]);
	emitPaperTypes(out);
	out.push("");
	out.push(
		"export const AT1_SCHEDULE_21_SECTIONS: readonly PaperSectionDef[] = [",
	);
	for (const s of AT1_SCHEDULE_21.sections) {
		out.push(emitSectionDef(s));
	}
	out.push("];");
	out.push("");
	out.push("export const AT1_SCHEDULE_21_FIELDS: readonly PaperField[] = [");
	for (const f of AT1_SCHEDULE_21.fields) out.push(emitField(f));
	out.push("];");
	out.push("");
	emitFootnotes(out, AT1_SCHEDULE_21, "AT1_SCHEDULE_21");

	out.push("export interface Schedule21PoolRow {");
	out.push("  kind: string;");
	out.push("  caption: string;");
	out.push("  line: string;");
	out.push("  role: PaperFieldRole;");
	out.push(
		"  /** Where this row carries to on another schedule, when the form says so. */",
	);
	out.push("  to?: { form: string; line: string; note?: string };");
	out.push(
		"  /** Where this row's figure arrives from, for a `carried-in` row. */",
	);
	out.push("  from?: { form: string; line: string; note?: string };");
	out.push("  note?: string;");
	out.push("  footnoteMarks?: readonly number[];");
	out.push("}");
	out.push("");
	out.push("export interface Schedule21Pool {");
	out.push("  key: string;");
	out.push("  label: string;");
	out.push("  rows: readonly Schedule21PoolRow[];");
	out.push("}");
	out.push("");
	// Role comes from `AT1_SCHEDULE_21.fields` — the FormDefinition already
	// built above — NOT recomputed here. Two places deciding "is this row
	// input or computed" is exactly how this drifted before this generator
	// was migrated: `continuityFields` in ca-tax's `schedule21.ts` got a real
	// per-pool audit (opening/current-year-loss are computed/carried-in, not
	// input), but this loop had its own blanket rule and never noticed.
	const fieldsByLine = new Map(AT1_SCHEDULE_21.fields.map((f) => [f.line, f]));
	out.push(
		"export const AT1_SCHEDULE_21_POOL_TABLE: readonly Schedule21Pool[] = [",
	);
	for (const pool of AT1_SCHEDULE_21_POOLS) {
		out.push("  {");
		out.push(`    key: ${q(pool.key)},`);
		out.push(`    label: ${q(pool.label)},`);
		out.push("    rows: [");
		for (const kind of AT1_SCHEDULE_21_CONTINUITY_ORDER) {
			const field = pool[kind];
			if (!field) continue;
			const line = scheduleTwentyOneLineId(field as string);
			const definedField = fieldsByLine.get(line);
			const role = definedField?.role ?? "input";
			// `to`/`from` come from the FormDefinition's own field, for the same
			// reason `role` and `note` do. This used to re-derive `to` from
			// `pool.toSchedule12` under a `kind === "appliedAgainstIncome"`
			// guard, which meant every OTHER cross-schedule link on a continuity
			// row was invisible in the grid — the non-capital pool's 017 → AT1
			// Schedule 12 line 082 among them — and `from` was never emitted at
			// all, so a carried-in row could not say where it came from. That is
			// precisely the 21 → 17 / 12 / 10 chain a preparer follows.
			const ref = (
				key: "to" | "from",
				v: { form: string; line: string; note?: string } | undefined,
			) =>
				v
					? `, ${key}: { form: ${q(v.form)}, line: ${q(v.line)}${v.note ? `, note: ${q(v.note)}` : ""} }`
					: "";
			const to = ref("to", definedField?.to);
			const from = ref("from", definedField?.from);
			// Sourced from the FormDefinition's own field, same as `role` above —
			// NOT recomputed per-kind here. A narrower per-kind rule (only
			// `appliedAgainstIncome`, from `pool.appliedAgainstIncomeNote`) used to
			// live here and silently dropped every other field-level note
			// (carryBack's included) that `continuityFields` in ca-tax's
			// `schedule21.ts` already attaches to `definedField.note` — the exact
			// "two places decide this" drift the `role` comment above already
			// warns about, just for `note` instead of `role`.
			const note = definedField?.note ? `, note: ${q(definedField.note)}` : "";
			const footnoteMarks = definedField?.footnoteMarks?.length
				? `, footnoteMarks: [${definedField.footnoteMarks.join(", ")}]`
				: "";
			out.push(
				`      { kind: ${q(kind)}, caption: ${q(pool.captions[kind] ?? AT1_SCHEDULE_21_CONTINUITY_CAPTIONS[kind])}, line: ${q(line)}, role: ${q(role)}${to}${from}${note}${footnoteMarks} },`,
			);
		}
		out.push("    ],");
		out.push("  },");
	}
	out.push("];");
	out.push("");
	return out.join("\n");
}

export function schedule13PaperLayout(): string {
	const id13 = (field: string) => `013${field}001`;
	const out: string[] = [];
	emitProvenanceComment(out, AT1_SCHEDULE_13);
	emitPaperTypes(out);
	out.push("");
	out.push(
		"export const AT1_SCHEDULE_13_SECTIONS: readonly PaperSectionDef[] = [",
	);
	for (const s of AT1_SCHEDULE_13.sections) {
		out.push(emitSectionDef(s));
	}
	out.push("];");
	out.push("");
	out.push("export const AT1_SCHEDULE_13_FIELDS: readonly PaperField[] = [");
	for (const f of AT1_SCHEDULE_13.fields) out.push(emitField(f));
	out.push("];");
	out.push("");
	emitFootnotes(out, AT1_SCHEDULE_13, "AT1_SCHEDULE_13");
	out.push("export interface Schedule13GridColumn {");
	out.push("  column: number;");
	out.push(
		"  /** Absent on columns 10, 13 and 15-17 — arithmetic the page shows and does not number. */",
	);
	out.push("  line?: string;");
	out.push("  caption: string;");
	out.push("  kind: PaperFieldKind;");
	out.push("  note?: string;");
	out.push(
		"  /** The column heading as the form prints it — longer than `caption`, and carrying the column's own arithmetic. Shown on hover. */",
	);
	out.push("  printedHeading?: string;");
	out.push("}");
	out.push("");
	out.push(
		"export const AT1_SCHEDULE_13_GRID_COLUMNS: readonly Schedule13GridColumn[] = [",
	);
	/*
	 * ALL 24 columns, numbered or not.
	 *
	 * This skipped `!c.line`, so the emitted grid had nineteen columns and the
	 * view jumped 9 → 11, 12 → 14 and 14 → 18 while the headings that survived
	 * went on citing the missing ones ("column 10 minus column 12"). The five
	 * unnumbered columns are the whole path from the entered figures to the CCA
	 * claim at column 23, and a renderer needs them to draw the form.
	 *
	 * They stay unfilable: no `line` means no field to bind and nothing to
	 * transmit, which was the real concern behind dropping them.
	 */
	for (const c of AT1_SCHEDULE_13_COLUMNS) {
		const kind = c.column === 1 ? "code" : c.column === 20 ? "rate" : "money";
		const parts = [`column: ${c.column}`];
		if (c.line) parts.push(`line: ${q(id13(c.line))}`);
		parts.push(`caption: ${q(c.caption)}`, `kind: ${q(kind)}`);
		if (c.note) parts.push(`note: ${q(c.note)}`);
		if (c.printedHeading && c.printedHeading !== c.caption) {
			parts.push(`printedHeading: ${q(c.printedHeading)}`);
		}
		out.push(`  { ${parts.join(", ")} },`);
	}
	out.push("];");
	out.push("");
	return out.join("\n");
}

export function schedule17PaperLayout(): string {
	const id17 = (field: string) => `017${field}001`;
	const out: string[] = [];
	emitProvenanceComment(out, AT1_SCHEDULE_17);
	emitPaperTypes(out);
	out.push("");
	out.push(
		"export const AT1_SCHEDULE_17_SECTIONS: readonly PaperSectionDef[] = [",
	);
	for (const s of AT1_SCHEDULE_17.sections) {
		out.push(emitSectionDef(s));
	}
	out.push("];");
	out.push("");
	out.push("export const AT1_SCHEDULE_17_FIELDS: readonly PaperField[] = [");
	for (const f of AT1_SCHEDULE_17.fields) out.push(emitField(f));
	out.push("];");
	out.push("");
	emitFootnotes(out, AT1_SCHEDULE_17, "AT1_SCHEDULE_17");
	out.push("export interface Schedule17ReserveKind {");
	out.push("  label: string;");
	out.push("  opening: string;");
	out.push("  transfer: string;");
	out.push("  closing: string;");
	out.push("}");
	out.push("");
	out.push(
		"export const AT1_SCHEDULE_17_RESERVE_KINDS: readonly Schedule17ReserveKind[] = [",
	);
	for (const r of AT1_SCHEDULE_17_RESERVES) {
		out.push(
			`  { label: ${q(r.label)}, opening: ${q(id17(r.opening))}, transfer: ${q(id17(r.transfer))}, closing: ${q(id17(r.closing))} },`,
		);
	}
	out.push("];");
	out.push("");
	return out.join("\n");
}

// ── Write ─────────────────────────────────────────────────────────────────

if (process.argv[1]?.endsWith("emit-paper-layouts.ts")) {
	writeFileSync(DEST, netIncomeSchedule(), "utf8");
	const shown = T2_SCHEDULE_1.fields.filter((f) => f.role === "input").length;
	const hidden = T2_SCHEDULE_1.fields.length - shown;
	console.log(`${T2_SCHEDULE_1.id}: ${shown} enterable fields written`);
	console.log(
		`  ${hidden} omitted (totals, and figures carried from other schedules)`,
	);

	writeFileSync(T2_SCHEDULE_1_PAPER_DEST, t2Schedule1PaperLayout(), "utf8");
	console.log(
		`${T2_SCHEDULE_1.id}: ${T2_SCHEDULE_1.fields.length} fields written to the paper layout`,
	);

	writeFileSync(T2_SCHEDULE_8_PAPER_DEST, t2Schedule8PaperLayout(), "utf8");
	console.log(
		`${T2_SCHEDULE_8.id}: ${T2_SCHEDULE_8.fields.length} fields + ${SCHEDULE_8_COLUMNS.filter((c) => c.line).length} grid columns written to the paper layout`,
	);

	writeFileSync(T2_SCHEDULE_2_PAPER_DEST, t2Schedule2PaperLayout(), "utf8");
	console.log(
		`${T2_SCHEDULE_2.id}: ${T2_SCHEDULE_2.fields.length} fields written to the paper layout`,
	);

	writeFileSync(T2_SCHEDULE_13_PAPER_DEST, t2Schedule13PaperLayout(), "utf8");
	console.log(
		`${T2_SCHEDULE_13.id}: ${T2_SCHEDULE_13.fields.length} fields written to the paper layout`,
	);

	writeFileSync(T2_SCHEDULE_50_PAPER_DEST, t2Schedule50PaperLayout(), "utf8");
	console.log(
		`${T2_SCHEDULE_50.id}: ${T2_SCHEDULE_50.fields.length} fields written to the paper layout`,
	);

	writeFileSync(T2_SCHEDULE_5_PAPER_DEST, t2Schedule5PaperLayout(), "utf8");
	console.log(
		`${T2_SCHEDULE_5.id}: ${T2_SCHEDULE_5.fields.length} fields written to the paper layout`,
	);

	writeFileSync(T2_SCHEDULE_33_PAPER_DEST, t2Schedule33PaperLayout(), "utf8");
	console.log(
		`${T2_SCHEDULE_33.id}: ${T2_SCHEDULE_33.fields.length} fields written to the paper layout`,
	);

	writeFileSync(T2_SCHEDULE_31_PAPER_DEST, t2Schedule31PaperLayout(), "utf8");
	console.log(
		`${T2_SCHEDULE_31.id}: ${T2_SCHEDULE_31.fields.length} fields written to the paper layout`,
	);

	writeFileSync(T2_SCHEDULE_130_PAPER_DEST, t2Schedule130PaperLayout(), "utf8");
	console.log(
		`${T2_SCHEDULE_130.id}: ${T2_SCHEDULE_130.fields.length} fields written to the paper layout`,
	);

	writeFileSync(T2_SCHEDULE_3_PAPER_DEST, t2Schedule3PaperLayout(), "utf8");
	console.log(
		`${T2_SCHEDULE_3.id}: ${T2_SCHEDULE_3.fields.length} fields written to the paper layout`,
	);

	writeFileSync(T2_SCHEDULE_4_PAPER_DEST, t2Schedule4PaperLayout(), "utf8");
	console.log(
		`${T2_SCHEDULE_4.id}: ${T2_SCHEDULE_4.fields.length} fields written to the paper layout`,
	);

	writeFileSync(T2_SCHEDULE_7_PAPER_DEST, t2Schedule7PaperLayout(), "utf8");
	console.log(
		`${T2_SCHEDULE_7.id}: ${T2_SCHEDULE_7.fields.length} fields written to the paper layout`,
	);

	for (const [dest, emit, form] of [
		[T2_JACKET_PAPER_DEST, t2JacketPaperLayout, T2_JACKET],
		[T2_SCHEDULE_141_PAPER_DEST, t2Schedule141PaperLayout, T2_SCHEDULE_141],
		[T2_SCHEDULE_6_PAPER_DEST, t2Schedule6PaperLayout, T2_SCHEDULE_6],
		[T2_SCHEDULE_21_PAPER_DEST, t2Schedule21PaperLayout, T2_SCHEDULE_21],
		[T2_SCHEDULE_23_PAPER_DEST, t2Schedule23PaperLayout, T2_SCHEDULE_23],
		[T2_SCHEDULE_24_PAPER_DEST, t2Schedule24PaperLayout, T2_SCHEDULE_24],
		[T2_SCHEDULE_43_PAPER_DEST, t2Schedule43PaperLayout, T2_SCHEDULE_43],
		[T2_SCHEDULE_53_PAPER_DEST, t2Schedule53PaperLayout, T2_SCHEDULE_53],
		[T2_SCHEDULE_55_PAPER_DEST, t2Schedule55PaperLayout, T2_SCHEDULE_55],
	] as const) {
		writeFileSync(dest, emit(), "utf8");
		console.log(
			`${form.id}: ${form.fields.length} fields written to the paper layout`,
		);
	}

	writeFileSync(CO17_PAPER_DEST, co17PaperLayout(), "utf8");
	console.log(
		`${CO17_RETURN.id}: ${CO17_RETURN.fields.length} fields written to the paper layout`,
	);

	writeFileSync(JACKET_PAPER_DEST, jacketPaperLayout(), "utf8");
	console.log(
		`${AT1_JACKET.id}: ${AT1_JACKET.fields.length} fields written to the paper layout`,
	);

	writeFileSync(SCHEDULE_21_PAPER_DEST, schedule21PaperLayout(), "utf8");
	console.log(
		`${AT1_SCHEDULE_21.id}: ${AT1_SCHEDULE_21.fields.length} fields + ${AT1_SCHEDULE_21_POOLS.length} pools written to the paper layout`,
	);

	writeFileSync(SCHEDULE_13_PAPER_DEST, schedule13PaperLayout(), "utf8");
	console.log(
		`${AT1_SCHEDULE_13.id}: ${AT1_SCHEDULE_13.fields.length} fields + ${AT1_SCHEDULE_13_COLUMNS.filter((c) => c.line).length} grid columns written to the paper layout`,
	);

	writeFileSync(SCHEDULE_17_PAPER_DEST, schedule17PaperLayout(), "utf8");
	console.log(
		`${AT1_SCHEDULE_17.id}: ${AT1_SCHEDULE_17.fields.length} fields + ${AT1_SCHEDULE_17_RESERVES.length} reserve kinds written to the paper layout`,
	);

	writeFileSync(SCHEDULE_29_PAPER_DEST, schedule29PaperLayout(), "utf8");
	console.log(
		`${AT1_SCHEDULE_29.id}: ${AT1_SCHEDULE_29.fields.length} fields written to the paper layout`,
	);

	writeFileSync(SCHEDULE_12_PAPER_DEST, schedule12PaperLayout(), "utf8");
	console.log(
		`${AT1_SCHEDULE_12.id}: ${AT1_SCHEDULE_12.fields.length} fields written to the paper layout`,
	);

	writeFileSync(SCHEDULE_18_PAPER_DEST, schedule18PaperLayout(), "utf8");
	console.log(
		`${AT1_SCHEDULE_18.id}: ${AT1_SCHEDULE_18.fields.length} fields written to the paper layout`,
	);

	writeFileSync(SCHEDULE_1_PAPER_DEST, schedule1PaperLayout(), "utf8");
	console.log(
		`${AT1_SCHEDULE_1.id}: ${AT1_SCHEDULE_1.fields.length} fields written to the paper layout`,
	);

	writeFileSync(SCHEDULE_2_PAPER_DEST, schedule2PaperLayout(), "utf8");
	console.log(
		`${AT1_SCHEDULE_2.id}: ${AT1_SCHEDULE_2.fields.length} fields written to the paper layout`,
	);

	writeFileSync(SCHEDULE_10_PAPER_DEST, schedule10PaperLayout(), "utf8");
	console.log(
		`${AT1_SCHEDULE_10.id}: ${AT1_SCHEDULE_10.fields.length} fields written to the paper layout`,
	);

	writeFileSync(SCHEDULE_20_PAPER_DEST, schedule20PaperLayout(), "utf8");
	console.log(
		`${AT1_SCHEDULE_20.id}: ${AT1_SCHEDULE_20.fields.length} fields written to the paper layout`,
	);

	writeFileSync(SCHEDULE_3_PAPER_DEST, schedule3PaperLayout(), "utf8");
	console.log(
		`${AT1_SCHEDULE_3.id}: ${AT1_SCHEDULE_3.fields.length} fields written to the paper layout`,
	);

	writeFileSync(SCHEDULE_15_PAPER_DEST, schedule15PaperLayout(), "utf8");
	console.log(
		`${AT1_SCHEDULE_15.id}: ${AT1_SCHEDULE_15.fields.length} fields written to the paper layout`,
	);

	console.log();

	writeFileSync(SCHEDULE_16_PAPER_DEST, schedule16PaperLayout(), "utf8");
	console.log(
		`${AT1_SCHEDULE_16.id}: ${AT1_SCHEDULE_16.fields.length} fields written to the paper layout`,
	);
	writeFileSync(SCHEDULE_4_PAPER_DEST, schedule4PaperLayout(), "utf8");
	console.log(
		`${AT1_SCHEDULE_4.id}: ${AT1_SCHEDULE_4.fields.length} fields written to the paper layout`,
	);

	console.log();

	console.log();

	console.log();

	console.log();
}
