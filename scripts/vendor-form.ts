/**
 * Vendor ONE form definition out of `@classytic/ca-tax` and into `forms/`.
 *
 *   npx tsx scripts/vendor-form.ts AT1SCH21
 *   npx tsx scripts/vendor-form.ts --list
 *
 * This is a MIGRATION tool, not part of the build. It runs once per form, and
 * the file it writes becomes hand-maintained from that moment on: corrections
 * against the published form live in the emitted file, never here. It therefore
 * refuses to overwrite a definition that already exists unless you pass
 * `--force`, because re-running it over a corrected form would silently restore
 * the upstream text you fixed.
 *
 * Contrast `emit-paper-layouts.ts`, which is the opposite: it re-emits its
 * output on every run and its output must never be hand-edited.
 *
 * Form definitions are pure data — no functions, no cycles — so the extraction
 * is lossless. `tests/forms-registry.test.ts` checks the result structurally.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { FORMS } from "@classytic/ca-tax/forms";
import * as CA_TAX from "@classytic/ca-tax/t2";
import type {
	FormDefinition,
	FormField,
	FormFormula,
	FormLineRef,
	FormProvenance,
	FormSection,
} from "../forms/types";

const DEFINITIONS_DIR = join(import.meta.dirname, "..", "forms", "definitions");

// ── TS literal emitters ─────────────────────────────────────────────────────
// One emitter per shape rather than a generic recursive serialiser: the output
// is read and edited by hand, so its formatting is part of the deliverable.
// Key order is fixed here (not taken from runtime key order) so re-extracting a
// form always produces a byte-identical file.

const TAB = "\t";
const str = (s: string) => JSON.stringify(s);

/** `key: value` pairs for the keys that are actually present, in a fixed order. */
function entries(
	source: Record<string, unknown>,
	order: readonly string[],
	render: (key: string, value: unknown) => string,
): string[] {
	return order
		.filter((key) => source[key] !== undefined)
		.map((key) => `${key}: ${render(key, source[key])}`);
}

/** A cross-form reference, always short enough to sit on one line. */
function refLiteral(ref: FormLineRef): string {
	const parts = entries({ ...ref }, ["form", "line", "note"], (_k, v) =>
		str(v as string),
	);
	return `{ ${parts.join(", ")} }`;
}

function fieldLiteral(field: FormField, indent: string): string {
	const inner = `${indent}${TAB}`;
	const parts = entries(
		{ ...field },
		[
			"line",
			"caption",
			"kind",
			"role",
			"section",
			"requirement",
			"side",
			"page",
			"formula",
			"note",
			"from",
			"to",
			"footnoteMarks",
		],
		(key, value) => {
			if (key === "from" || key === "to") return refLiteral(value as FormLineRef);
			if (key === "footnoteMarks") return `[${(value as number[]).join(", ")}]`;
			if (key === "page") return String(value);
			if (key === "formula") {
				const f = value as FormFormula;
				return `{\n${inner}${TAB}expression: ${str(f.expression)},\n${inner}${TAB}inputs: [${f.inputs.map(str).join(", ")}],\n${inner}}`;
			}
			return str(value as string);
		},
	);
	return `${indent}{\n${parts.map((p) => `${inner}${p},`).join("\n")}\n${indent}}`;
}

function sectionLiteral(section: FormSection, indent: string): string {
	const inner = `${indent}${TAB}`;
	const parts = entries(
		{ ...section },
		["id", "title", "page", "description", "secondary"],
		(key, value) =>
			key === "page" || key === "secondary" ? String(value) : str(value as string),
	);
	return `${indent}{\n${parts.map((p) => `${inner}${p},`).join("\n")}\n${indent}}`;
}

function provenanceLiteral(provenance: FormProvenance): string {
	const parts = entries(
		{ ...provenance },
		["document", "retrieved", "revision"],
		(_k, v) => str(v as string),
	);
	return `{\n${parts.map((p) => `${TAB}${TAB}${p},`).join("\n")}\n${TAB}}`;
}

// ── File emission ───────────────────────────────────────────────────────────

/**
 * The header is the whole safety mechanism for the "generated once, then
 * hand-maintained" arrangement — it is what tells the next reader that editing
 * this file is correct and re-running the extractor is not.
 */
function header(form: FormDefinition, exportName: string, version: string): string {
	return `/**
 * ${form.title} (${form.id}).
 *
 * HAND-MAINTAINED. Extracted once from @classytic/ca-tax@${version} by
 * \`npx tsx scripts/vendor-form.ts ${form.id}\`; corrections against the published
 * form belong HERE. Do not re-run the extractor over this file — it would
 * restore the upstream text and undo them.
 *
 * Source: ${form.provenance.document} (retrieved ${form.provenance.retrieved}).
 * Captions are copied from the form as printed, including the instructions the
 * form states inside them — see \`../types.ts\`.
 *
 * Exported as \`${exportName}\` to match the name the registry and the paper-layout
 * emitter already use.
 */`;
}

function toModule(
	form: FormDefinition,
	exportName: string,
	version: string,
): string {
	const sections = form.sections
		.map((s) => sectionLiteral(s, `${TAB}${TAB}`))
		.join(",\n");
	const fields = form.fields
		.map((f) => fieldLiteral(f, `${TAB}${TAB}`))
		.join(",\n");
	const footnotes = form.footnotes
		?.map((n) => `${TAB}${TAB}${str(n)},`)
		.join("\n");

	return `${header(form, exportName, version)}
import type { FormDefinition } from "../types";

export const ${exportName}: FormDefinition = {
${TAB}id: ${str(form.id)},
${TAB}program: ${str(form.program)},
${TAB}schedule: ${str(form.schedule)},
${TAB}title: ${str(form.title)},
${TAB}scheme: ${str(form.scheme)},
${TAB}taxYears: { from: ${form.taxYears.from} },
${TAB}provenance: ${provenanceLiteral(form.provenance)},
${TAB}sections: [
${sections},
${TAB}],
${TAB}fields: [
${fields},
${TAB}],${footnotes ? `\n${TAB}footnotes: [\n${footnotes}\n${TAB}],` : ""}
};
`;
}

// ── Lookup ──────────────────────────────────────────────────────────────────

/**
 * The package exports each form under a name that doesn't follow from its id
 * (`AT1SCH21` → `AT1_SCHEDULE_21`, `AT1` → `AT1_JACKET`), so resolve it by
 * object identity rather than guessing a transform.
 */
function findExportName(form: FormDefinition): string {
	for (const [name, value] of Object.entries(CA_TAX)) {
		if (value === form) return name;
	}
	throw new Error(
		`${form.id} has no named export in @classytic/ca-tax/t2 — cannot pick a stable export name.`,
	);
}

function fail(message: string): never {
	console.error(message);
	process.exit(1);
}

// ── Entry point ─────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const force = args.includes("--force");
const formId = args.find((a) => !a.startsWith("--"));
const upstream = FORMS as unknown as FormDefinition[];

if (args.includes("--list") || !formId) {
	console.log("Available forms:\n");
	for (const f of [...upstream].sort((a, b) => a.id.localeCompare(b.id))) {
		const target = join(DEFINITIONS_DIR, `${f.id.toLowerCase()}.ts`);
		const mark = existsSync(target) ? "vendored" : "        ";
		console.log(
			`  ${mark}  ${f.id.padEnd(10)} ${String(f.fields.length).padStart(4)} fields  ${f.provenance.document}`,
		);
	}
	console.log("\nUsage: npx tsx scripts/vendor-form.ts <FORM_ID> [--force]");
	process.exit(0);
}

const form = upstream.find((f) => f.id === formId);
if (!form) {
	fail(`Unknown form "${formId}". Run with --list to see the 42 available ids.`);
}

const target = join(DEFINITIONS_DIR, `${form.id.toLowerCase()}.ts`);
if (existsSync(target) && !force) {
	fail(
		`${form.id} is already vendored at forms/definitions/${form.id.toLowerCase()}.ts.\n` +
			`That file is hand-maintained — re-extracting would discard any corrections made to it.\n` +
			`Pass --force only if you genuinely want the upstream text back.`,
	);
}

/** Stamped into the header so a reader knows exactly which upstream text this was. */
const version: string = JSON.parse(
	readFileSync(
		join(import.meta.dirname, "..", "node_modules/@classytic/ca-tax/package.json"),
		"utf8",
	),
).version;
const exportName = findExportName(form);

mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, toModule(form, exportName, version), "utf8");

console.log(
	`Vendored ${form.id} → forms/definitions/${form.id.toLowerCase()}.ts\n` +
		`  export   ${exportName}\n` +
		`  fields   ${form.fields.length} in ${form.sections.length} sections\n` +
		`  source   ${form.provenance.document}\n\n` +
		`Next: add it to VENDORED in forms/index.ts, then run \`npm test\`.`,
);
