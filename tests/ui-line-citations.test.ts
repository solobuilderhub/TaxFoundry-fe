/**
 * Every line number the RETURN EDITOR shows a preparer must be a real line.
 *
 * The editor labels fields "Business limit (line 410)". That number is a
 * promise: it tells a preparer the figure they type lands on line 410 of the
 * return, and they will reconcile against the printed form on that basis.
 *
 * A wrong number is worse than no number. "(line 410)" beside the wrong box
 * is confidently misleading in a way a bare caption never is — and nothing
 * about the app would look broken. So every citation is checked here against
 * `@classytic/ca-tax`'s own form definitions, which are themselves extracted
 * from the CRA and TRA source documents rather than typed by hand.
 *
 * This is the check that lets the interface make the claim at all. Showing
 * line numbers is easy; showing line numbers that are provably the form's is
 * not.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FORMS } from "@classytic/ca-tax/forms";

const SCHEDULE_DIR = join(
	import.meta.dirname,
	"..",
	"app/dashboard/engagements/[id]/return/_config/schedules",
);
/**
 * The schedules directory is split by owning program (`t2/`, `at1/`, `co17/`,
 * plus `shared/` for the `define.ts` infrastructure this check already
 * excludes by name). Scanned non-recursively per subdir — `at1/paper/` and
 * `t2/paper/` are never walked, since those are GENERATED mirrors of the
 * same form definitions this check validates against, not hand-authored
 * citations.
 */
const SCHEDULE_SUBDIRS = ["t2", "at1", "co17"];

/**
 * `(line 410)`, `(line 000047)`, and the plural `(lines 230 / 240)`.
 *
 * The plural is not laziness. Schedule 43 splits the same figure across two
 * lines by whether a subsection 191.2(1) election was made, and the editor
 * collects one number because the engine does not model the election. Naming
 * both lines is more honest than picking one, so the check validates every
 * number inside the citation rather than refusing the form.
 */
const CITATION = /\(lines? ([\d\s/,]+)\)/g;

/** Every number inside one citation — `230 / 240` → ['230','240']. */
const numbersIn = (citation: string): string[] =>
	citation.split(/[\s/,]+/).filter((n) => /^\d{3,9}$/.test(n));

/** Every line number any registered form defines, in either scheme. */
const known = new Set<string>();
for (const form of FORMS) {
	for (const field of form.fields) {
		known.add(field.line);
		// TRA ids are `SSSFFFOOO`; the editor cites the FIELD half a preparer sees.
		if (/^\d{9}$/.test(field.line)) known.add(field.line.slice(3, 6));
	}
}

const files = SCHEDULE_SUBDIRS.flatMap((dir) =>
	readdirSync(join(SCHEDULE_DIR, dir))
		.filter((f) => f.endsWith(".ts"))
		.map((f) => join(dir, f)),
);

describe("line numbers shown in the return editor", () => {
	it("has form definitions to check against", () => {
		// Guards the whole file: if FORMS were empty every assertion below would
		// pass by finding nothing to reject.
		expect(FORMS.length).toBeGreaterThan(20);
		expect(known.size).toBeGreaterThan(400);
	});

	for (const file of files) {
		const src = readFileSync(join(SCHEDULE_DIR, file), "utf8");
		const cited = [...src.matchAll(CITATION)].flatMap((m) => numbersIn(m[1] as string));
		if (cited.length === 0) continue;

		it(`${file} cites only lines that exist on a real form`, () => {
			const unknown = [...new Set(cited)].filter((line) => !known.has(line));
			expect(unknown).toEqual([]);
		});
	}

	it("rejects a citation that is not on any form", () => {
		// Non-vacuity: the check must actually discriminate.
		expect(known.has("410")).toBe(true);
		expect(known.has("999")).toBe(false);
	});

	it("covers the schedules a preparer spends the most time in", () => {
		// Not every schedule can cite a line — GIFI is keyed by account code, and a
		// few forms are grids whose numbers live in column headings. These are the
		// ones where a preparer is reconciling against the printed form, so a
		// regression that strips their citations should fail rather than pass quietly.
		for (const file of ["t2/net-income.ts", "t2/sbd.ts", "t2/losses.ts", "at1/alberta.ts"]) {
			const src = readFileSync(join(SCHEDULE_DIR, file), "utf8");
			expect([...src.matchAll(CITATION)].length, `${file} cites no line`).toBeGreaterThan(0);
		}
	});
});
