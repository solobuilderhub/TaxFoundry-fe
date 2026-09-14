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
import { join, sep } from "node:path";
import { describe, expect, it } from "vitest";
import { FORMS } from "@classytic/ca-tax/forms";
import { AT1_EDI_LINES } from "@classytic/ca-tax/t2";

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
 * `(line 410)`, `(line 000047)`, the plural `(lines 230 / 240)`, the range
 * `(line 037-047)` — and `(line EDI001)`.
 *
 * The plural is not laziness. Schedule 43 splits the same figure across two
 * lines by whether a subsection 191.2(1) election was made, and the editor
 * collects one number because the engine does not model the election. Naming
 * both lines is more honest than picking one, so the check validates every
 * number inside the citation rather than refusing the form.
 *
 * The `EDI` prefix is not decoration. TRA's Line-Item-ID scheme is nine
 * CHARACTERS, not nine digits, and the EDI schedule proves the leading
 * schedule field is not always numeric: its ids are `EDI` + field + occurrence.
 * The pattern required `[\d\s/,]+`, so every `(line EDI001)` in the editor was
 * silently UNCHECKED — this file's whole purpose, skipped for nineteen boxes,
 * on the one schedule with no `FormDefinition` to fall back on.
 *
 * The RANGE form was invisible for the same reason, and had been for much
 * longer. The editor cites a whole block of a form as `(line 037-047)` or
 * `(lines 120-130)` — a continuity table, a vintage table, a band of the
 * jacket — and there are dozens of them across the AT1 schedules. None was
 * checked, because a hyphen is not in `[\d\s/,]`. Both endpoints are now
 * validated, which is the useful half: a range whose ends both exist is
 * almost certainly right, and one that names a line the form does not have is
 * exactly the confidently-misleading label this file exists to catch.
 */
const CITATION = /\(lines? ((?:EDI)?[\d\s/,-]+)\)/g;

/**
 * Every number inside one citation — `230 / 240` → ['230','240'], and the range
 * `120-130` → ['120','130'].
 *
 * A range's ENDPOINTS are checked, not the lines between them: TRA numbering is
 * gapped (federal Schedule 1 skips 108 and 109 entirely, and this file's own
 * comment says so), so expanding `037-047` to every odd number in between would
 * reject correct citations for lines that were never printed.
 */
const numbersIn = (citation: string): string[] =>
	citation
		.split(/[\s/,-]+/)
		.filter((n) => /^(?:EDI)?\d{3,9}$/.test(n));

/** Every line number any registered form defines, in either scheme. */
const known = new Set<string>();
for (const form of FORMS) {
	for (const field of form.fields) {
		known.add(field.line);
		// TRA ids are `SSSFFFOOO`; the editor cites the FIELD half a preparer sees.
		if (/^\d{9}$/.test(field.line)) known.add(field.line.slice(3, 6));
	}
}

/*
 * The EDI schedule has no `FormDefinition` — it exists only in the Net File
 * XML, and TRA's §3.3.6.1 is not vendored into `@classytic/ca-tax`, so there is
 * no page to extract captions from. `AT1_EDI_LINES` is the renderer's own
 * line-item table, which IS the authority on which ids can be filed, and it is
 * what makes the editor's `(line EDI001)` claims checkable at all.
 *
 * Both spellings are accepted: `EDI001` as the editor writes it, and the bare
 * `001` field half, for consistency with how every other TRA schedule is cited.
 */
for (const id of AT1_EDI_LINES) {
	known.add(id);
	known.add(id.slice(0, 6)); // `EDI001001` → `EDI001`
	known.add(id.slice(3, 6)); // `EDI001001` → `001`
}

/**
 * Citations the editor makes that NO form definition can currently confirm.
 *
 * Found the moment range citations became visible to this check, and left here
 * named rather than quietly excluded: each one is a real promise the editor
 * makes to a preparer that nothing verifies. They are not citation typos —
 * they are two form DEFINITIONS that are short of their printed pages, which
 * is the same class of gap AT1 Schedules 1, 3 and 29 each had to be corrected
 * for.
 *
 *   alberta-continuity.ts   AT1 Schedule 21 ends at 350 in the definition, and
 *                           the editor cites 169, 181 and 187 as the closing
 *                           ends of three continuity bands.
 *   alberta-schedule15.ts   AT1 Schedule 15's definition holds FIVE lines
 *                           (241, 261, 281, 293, 301) while the editor collects
 *                           and cites a dozen more. Nearly the whole schedule
 *                           is untranscribed.
 *
 * Deliberately per-file AND per-line, so a NEW bad citation in either file
 * still fails. Delete an entry as its schedule is transcribed; the list going
 * empty is the goal.
 */
const KNOWN_GAPS: Record<string, readonly string[]> = {
	"at1/alberta-continuity.ts": ["169", "181", "187"],
	"at1/alberta-schedule15.ts": [
		"171",
		"173",
		"191",
		"223",
		"257",
		"277",
		"297",
		"317",
	],
};

/** `join()` gives backslashes on Windows; the keys above are POSIX. */
const gapsFor = (file: string): readonly string[] =>
	KNOWN_GAPS[file.split(sep).join("/")] ?? [];

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
			const unknown = [...new Set(cited)].filter(
				(line) => !known.has(line) && !gapsFor(file).includes(line),
			);
			expect(unknown).toEqual([]);
		});
	}

	it("rejects a citation that is not on any form", () => {
		// Non-vacuity: the check must actually discriminate.
		expect(known.has("410")).toBe(true);
		expect(known.has("999")).toBe(false);
	});

	it("reads every citation FORM the editor actually writes", () => {
		/*
		 * Non-vacuity of a different kind, and the one that matters most here:
		 * a pattern that silently fails to MATCH passes this whole file. Two
		 * forms were invisible for exactly that reason — `(line EDI001)`, and
		 * the range `(line 037-047)` that the AT1 schedules use dozens of
		 * times. Each is asserted to parse into the numbers it names.
		 */
		const parse = (text: string) =>
			[...text.matchAll(CITATION)].flatMap((m) => numbersIn(m[1] as string));
		expect(parse("Business limit (line 410)")).toEqual(["410"]);
		expect(parse("Split (lines 230 / 240)")).toEqual(["230", "240"]);
		expect(parse("SCC (line EDI001)")).toEqual(["EDI001"]);
		expect(parse("Continuity (line 037-047)")).toEqual(["037", "047"]);
		expect(parse("Vintages (lines 120-130)")).toEqual(["120", "130"]);
		// And a citation nobody writes stays unmatched rather than half-parsed.
		expect(parse("no citation here")).toEqual([]);
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
