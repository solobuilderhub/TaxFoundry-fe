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
	AT1_SCHEDULE_1,
	AT1_SCHEDULE_2,
	AT1_SCHEDULE_3,
	AT1_SCHEDULE_4,
	AT1_SCHEDULE_5,
	AT1_SCHEDULE_6,
	AT1_SCHEDULE_7,
	AT1_SCHEDULE_8,
	AT1_SCHEDULE_9,
	AT1_SCHEDULE_10,
	AT1_SCHEDULE_12,
	AT1_SCHEDULE_13,
	AT1_SCHEDULE_13_COLUMNS,
	AT1_SCHEDULE_15,
	AT1_SCHEDULE_17,
	AT1_SCHEDULE_17_RESERVES,
	AT1_SCHEDULE_20,
	AT1_SCHEDULE_21,
	AT1_SCHEDULE_21_BLOCKS,
	AT1_SCHEDULE_21_CONTINUITY_ORDER,
	AT1_SCHEDULE_21_POOLS,
	AT1_SCHEDULE_29,
	CO17_RETURN,
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
<<<<<<< Updated upstream
	T2_SCHEDULE_53,
	T2_SCHEDULE_55,
	T2_SCHEDULE_130,
	T2_SCHEDULE_141,
} from "@classytic/ca-tax/t2";
=======
	T2_SCHEDULE_8,
	type FormDefinition,
	type FormField,
	AT1_SCHEDULE_12_PAIRS,
} from '../forms';
>>>>>>> Stashed changes

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
const SCHEDULE_1_PAPER_DEST = `${PAPER_DIR}/schedule1.layout.ts`;
const SCHEDULE_2_PAPER_DEST = `${PAPER_DIR}/schedule2.layout.ts`;
const SCHEDULE_10_PAPER_DEST = `${PAPER_DIR}/schedule10.layout.ts`;
const SCHEDULE_20_PAPER_DEST = `${PAPER_DIR}/schedule20.layout.ts`;
const SCHEDULE_3_PAPER_DEST = `${PAPER_DIR}/schedule3.layout.ts`;
const SCHEDULE_15_PAPER_DEST = `${PAPER_DIR}/schedule15.layout.ts`;
const SCHEDULE_8_PAPER_DEST = `${PAPER_DIR}/schedule8.layout.ts`;
const SCHEDULE_4_PAPER_DEST = `${PAPER_DIR}/schedule4.layout.ts`;
const SCHEDULE_6_PAPER_DEST = `${PAPER_DIR}/schedule6.layout.ts`;
const SCHEDULE_7_PAPER_DEST = `${PAPER_DIR}/schedule7.layout.ts`;
const SCHEDULE_5_PAPER_DEST = `${PAPER_DIR}/schedule5.layout.ts`;
const SCHEDULE_9_PAPER_DEST = `${PAPER_DIR}/schedule9.layout.ts`;

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
	if (f.formula) {
		parts.push(
			`formula: { expression: ${q(f.formula.expression)}, inputs: [${f.formula.inputs.map(q).join(', ')}] }`,
		);
	}
	if (f.note) parts.push(`note: ${q(f.note)}`);
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
	out.push(
		'export type PaperFieldRole = "input" | "computed" | "total" | "carried-in";',
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
<<<<<<< Updated upstream
	out.push("  note?: string;");
	out.push("  from?: { form: string; line: string; note?: string };");
	out.push("  to?: { form: string; line: string; note?: string };");
	out.push("  footnoteMarks?: readonly number[];");
	out.push("}");
	out.push("");
	out.push("export interface PaperSectionDef {");
	out.push("  id: string;");
	out.push("  title: string;");
	out.push("  description?: string;");
	out.push("}");
=======
	out.push('  /** How the form itself says this line is calculated, where it prints the arithmetic. */');
	out.push('  formula?: { expression: string; inputs: readonly string[] };');
	out.push('  note?: string;');
	out.push('  from?: { form: string; line: string; note?: string };');
	out.push('  to?: { form: string; line: string; note?: string };');
	out.push('  footnoteMarks?: readonly number[];');
	out.push('}');
	out.push('');
	out.push('export interface PaperSectionDef {');
	out.push('  id: string;');
	out.push('  title: string;');
	out.push('  description?: string;');
	out.push('}');
>>>>>>> Stashed changes
}

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

export function jacketPaperLayout(): string {
	const out: string[] = [];
	emitProvenanceComment(out, AT1_JACKET, [
		'Line 066 ("Amount Taxable in Alberta = 062 × 065") appears on the printed',
		"form but is absent from AT1_JACKET_CAPTIONS (generated from spec text, not",
		"the PDF) — a known gap in the captions generator, not fixed here.",
	]);
	emitPaperTypes(out);
	out.push("");
	out.push("export const AT1_JACKET_SECTIONS: readonly PaperSectionDef[] = [");
	for (const s of AT1_JACKET.sections) {
		out.push(
			`  { id: ${q(s.id)}, title: ${q(s.title)}${s.description ? `, description: ${q(s.description)}` : ""} },`,
		);
	}
	out.push("];");
	out.push("");
	out.push("export const AT1_JACKET_FIELDS: readonly PaperField[] = [");
	for (const f of AT1_JACKET.fields) out.push(emitField(f));
	out.push("];");
	out.push("");
	emitFootnotes(out, AT1_JACKET, "AT1_JACKET");
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
		out.push(
			`  { id: ${q(s.id)}, title: ${q(s.title)}${s.description ? `, description: ${q(s.description)}` : ""} },`,
		);
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

export function schedule29PaperLayout(): string {
	return emitFlatSchedule(AT1_SCHEDULE_29, "AT1_SCHEDULE_29");
}

export function schedule12PaperLayout(): string {
	return emitFlatSchedule(AT1_SCHEDULE_12, "AT1_SCHEDULE_12");
}

export function schedule1PaperLayout(): string {
	return emitFlatSchedule(AT1_SCHEDULE_1, "AT1_SCHEDULE_1");
}

export function schedule2PaperLayout(): string {
	return emitFlatSchedule(AT1_SCHEDULE_2, "AT1_SCHEDULE_2");
}

export function schedule10PaperLayout(): string {
	return emitFlatSchedule(AT1_SCHEDULE_10, "AT1_SCHEDULE_10");
}

export function schedule3PaperLayout(): string {
	return emitFlatSchedule(AT1_SCHEDULE_3, "AT1_SCHEDULE_3");
}

export function schedule15PaperLayout(): string {
	return emitFlatSchedule(AT1_SCHEDULE_15, "AT1_SCHEDULE_15");
}

export function schedule8PaperLayout(): string {
	return emitFlatSchedule(AT1_SCHEDULE_8, "AT1_SCHEDULE_8");
}

export function schedule4PaperLayout(): string {
	return emitFlatSchedule(AT1_SCHEDULE_4, "AT1_SCHEDULE_4");
}

export function schedule6PaperLayout(): string {
	return emitFlatSchedule(AT1_SCHEDULE_6, "AT1_SCHEDULE_6");
}

export function schedule7PaperLayout(): string {
	return emitFlatSchedule(AT1_SCHEDULE_7, "AT1_SCHEDULE_7");
}

export function schedule5PaperLayout(): string {
	return emitFlatSchedule(AT1_SCHEDULE_5, "AT1_SCHEDULE_5");
}

export function schedule9PaperLayout(): string {
	return emitFlatSchedule(AT1_SCHEDULE_9, "AT1_SCHEDULE_9");
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
		out.push(
			`  { id: ${q(s.id)}, title: ${q(s.title)}${s.description ? `, description: ${q(s.description)}` : ""} },`,
		);
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
		out.push(
			`  { id: ${q(s.id)}, title: ${q(s.title)}${s.description ? `, description: ${q(s.description)}` : ""} },`,
		);
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
		out.push(
			`  { id: ${q(s.id)}, title: ${q(s.title)}${s.description ? `, description: ${q(s.description)}` : ""} },`,
		);
	}
	out.push("];");
	out.push("");
	out.push("export const AT1_SCHEDULE_21_FIELDS: readonly PaperField[] = [");
	for (const f of AT1_SCHEDULE_21.fields) out.push(emitField(f));
	out.push("];");
	out.push("");
	emitFootnotes(out, AT1_SCHEDULE_21, "AT1_SCHEDULE_21");

<<<<<<< Updated upstream
	out.push("export interface Schedule21PoolRow {");
	out.push("  kind: string;");
	out.push("  caption: string;");
	out.push("  line: string;");
	out.push("  role: PaperFieldRole;");
	out.push(
		'  /** Where this row carries to on another schedule — printed on the form beside the "applied against income" row only. */',
	);
	out.push("  to?: { form: string; line: string; note?: string };");
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
=======
	out.push('export interface Schedule21PoolRow {');
	out.push('  kind: string;');
	out.push('  caption: string;');
	out.push('  line: string;');
	out.push('  role: PaperFieldRole;');
	out.push('  /** Where this row\'s figure arrives from, when the form names another schedule. */');
	out.push('  from?: { form: string; line: string; note?: string };');
	out.push('  /** Where this row carries to on another schedule — the form prints this beside the row. */');
	out.push('  to?: { form: string; line: string; note?: string };');
	out.push('  note?: string;');
	out.push('  footnoteMarks?: readonly number[];');
	out.push('}');
	out.push('');
	out.push('export interface Schedule21Pool {');
	out.push('  key: string;');
	out.push('  label: string;');
	out.push('  rows: readonly Schedule21PoolRow[];');
	out.push('}');
	out.push('');
>>>>>>> Stashed changes
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
			const field = pool.lines[kind];
			if (!field) continue;
			const line = scheduleTwentyOneLineId(field);
			const definedField = fieldsByLine.get(line);
<<<<<<< Updated upstream
			const role = definedField?.role ?? "input";
			const to =
				kind === "appliedAgainstIncome" && pool.toSchedule12
					? `, to: { form: "AT1SCH12", line: ${q(`012${pool.toSchedule12}001`)}${pool.toSchedule12Note ? `, note: ${q(pool.toSchedule12Note)}` : ""} }`
					: "";
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
=======
			if (!definedField) {
				throw new Error(
					`AT1SCH21 pool "${pool.key}" row "${kind}" points at line ${line}, which has no field in AT1_SCHEDULE_21. ` +
						'The pool table and the form definition have to agree — add the field, or drop the row.',
				);
			}
			// EVERYTHING below comes from the FormDefinition's own field, keyed by
			// line. The pool table supplies the line number and nothing else.
			//
			// It used to supply the caption too, from a per-ROW map shared across
			// every pool — which is why line 061 ("applied against current year
			// capital gain") and line 099 ("applied against farming income") both
			// rendered as "Applied against income". Two places describing one line
			// is how that happens; reading it from one place is how it stays fixed.
			const ref = (rel: 'from' | 'to') => {
				const r = definedField[rel];
				return r
					? `, ${rel}: { form: ${q(r.form)}, line: ${q(r.line)}${r.note ? `, note: ${q(r.note)}` : ''} }`
					: '';
			};
			const note = definedField.note ? `, note: ${q(definedField.note)}` : '';
			const footnoteMarks = definedField.footnoteMarks?.length
				? `, footnoteMarks: [${definedField.footnoteMarks.join(', ')}]`
				: '';
>>>>>>> Stashed changes
			out.push(
				`      { kind: ${q(kind)}, caption: ${q(definedField.caption)}, line: ${q(line)}, role: ${q(definedField.role)}${ref('from')}${ref('to')}${note}${footnoteMarks} },`,
			);
		}
		out.push("    ],");
		out.push("  },");
	}
<<<<<<< Updated upstream
	out.push("];");
	out.push("");
	return out.join("\n");
=======
	out.push('];');
	out.push('');
	// The grid's row order and row labels, in PRINT order — emitted rather than
	// re-derived in the view. A view that derived it by walking the pools in
	// order got "first pool to mention a row wins", which puts a row only the
	// second pool has (the capital column's ABIL-expired, line 059) at the
	// BOTTOM of the grid instead of between the current-year loss and the
	// deductions where the form prints it.
	/** The caption the form prints beside a row, taken from the first pool that has it. */
	const captionFor = (kind: string, pools: readonly (typeof AT1_SCHEDULE_21_POOLS)[number][]) => {
		const owning = pools.find((p) => p.lines[kind as keyof typeof p.lines]);
		if (!owning) return undefined;
		return fieldsByLine.get(
			scheduleTwentyOneLineId(owning.lines[kind as keyof typeof owning.lines] as string),
		)?.caption;
	};

	out.push('/** Grid rows in print order, with the caption the form prints beside each. */');
	out.push('export const AT1_SCHEDULE_21_ROW_ORDER: readonly { kind: string; caption: string }[] = [');
	for (const kind of AT1_SCHEDULE_21_CONTINUITY_ORDER) {
		const caption = captionFor(kind, AT1_SCHEDULE_21_POOLS);
		if (!caption) continue;
		out.push(`  { kind: ${q(kind)}, caption: ${q(caption)} },`);
	}
	out.push('];');
	out.push('');

	// The printed form's THREE continuity blocks, each with only its own columns
	// and only the rows those columns actually have. Rendering all five pools as
	// one grid manufactured a cell for every (pool, row) pair and filled the
	// missing ones with "—" — most of the table, and unreadable against paper.
	out.push('export interface Schedule21Block {');
	out.push('  id: string;');
	out.push('  page: number;');
	out.push('  /** Column keys into `AT1_SCHEDULE_21_POOL_TABLE`, left to right. */');
	out.push('  poolKeys: readonly string[];');
	out.push('  /** Rows this block prints, already filtered to the ones its columns use. */');
	out.push('  rowOrder: readonly { kind: string; caption: string }[];');
	out.push('  /** Row after which the form prints its unnumbered "Subtotal" divider. */');
	out.push('  subtotalAfter: string;');
	out.push('}');
	out.push('');
	out.push('/** The continuity as three separate tables, exactly as the form prints it. */');
	out.push('export const AT1_SCHEDULE_21_BLOCK_TABLE: readonly Schedule21Block[] = [');
	for (const block of AT1_SCHEDULE_21_BLOCKS) {
		const pools = AT1_SCHEDULE_21_POOLS.filter((p) => block.poolKeys.includes(p.key));
		if (pools.length !== block.poolKeys.length) {
			throw new Error(
				`AT1SCH21 block "${block.id}" names a pool that does not exist: ${block.poolKeys.join(', ')}`,
			);
		}
		out.push('  {');
		out.push(`    id: ${q(block.id)},`);
		out.push(`    page: ${block.page},`);
		out.push(`    poolKeys: [${block.poolKeys.map(q).join(', ')}],`);
		out.push(`    subtotalAfter: ${q(block.subtotalAfter)},`);
		out.push('    rowOrder: [');
		for (const kind of AT1_SCHEDULE_21_CONTINUITY_ORDER) {
			const caption = captionFor(kind, pools);
			if (!caption) continue; // no column in this block has the row — the form omits it
			out.push(`      { kind: ${q(kind)}, caption: ${q(caption)} },`);
		}
		out.push('    ],');
		out.push('  },');
	}
	out.push('];');
	out.push('');
	return out.join('\n');
>>>>>>> Stashed changes
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
		out.push(
			`  { id: ${q(s.id)}, title: ${q(s.title)}${s.description ? `, description: ${q(s.description)}` : ""} },`,
		);
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
	out.push("  line: string;");
	out.push("  caption: string;");
	out.push("  kind: PaperFieldKind;");
	out.push("  note?: string;");
	out.push("}");
	out.push("");
	out.push(
		"export const AT1_SCHEDULE_13_GRID_COLUMNS: readonly Schedule13GridColumn[] = [",
	);
	for (const c of AT1_SCHEDULE_13_COLUMNS) {
		if (!c.line) continue;
		const kind = c.column === 1 ? "code" : c.column === 20 ? "rate" : "money";
		out.push(
			`  { column: ${c.column}, line: ${q(id13(c.line))}, caption: ${q(c.caption)}, kind: ${q(kind)}${c.note ? `, note: ${q(c.note)}` : ""} },`,
		);
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
		out.push(
			`  { id: ${q(s.id)}, title: ${q(s.title)}${s.description ? `, description: ${q(s.description)}` : ""} },`,
		);
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

	writeFileSync(SCHEDULE_8_PAPER_DEST, schedule8PaperLayout(), "utf8");
	console.log(
		`${AT1_SCHEDULE_8.id}: ${AT1_SCHEDULE_8.fields.length} fields written to the paper layout`,
	);

	writeFileSync(SCHEDULE_4_PAPER_DEST, schedule4PaperLayout(), "utf8");
	console.log(
		`${AT1_SCHEDULE_4.id}: ${AT1_SCHEDULE_4.fields.length} fields written to the paper layout`,
	);

	writeFileSync(SCHEDULE_6_PAPER_DEST, schedule6PaperLayout(), "utf8");
	console.log(
		`${AT1_SCHEDULE_6.id}: ${AT1_SCHEDULE_6.fields.length} fields written to the paper layout`,
	);

	writeFileSync(SCHEDULE_7_PAPER_DEST, schedule7PaperLayout(), "utf8");
	console.log(
		`${AT1_SCHEDULE_7.id}: ${AT1_SCHEDULE_7.fields.length} fields written to the paper layout`,
	);

	writeFileSync(SCHEDULE_5_PAPER_DEST, schedule5PaperLayout(), "utf8");
	console.log(
		`${AT1_SCHEDULE_5.id}: ${AT1_SCHEDULE_5.fields.length} fields written to the paper layout`,
	);

	writeFileSync(SCHEDULE_9_PAPER_DEST, schedule9PaperLayout(), "utf8");
	console.log(
		`${AT1_SCHEDULE_9.id}: ${AT1_SCHEDULE_9.fields.length} fields written to the paper layout`,
	);
}
