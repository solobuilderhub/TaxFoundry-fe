/**
 * Structural invariants every form definition must hold.
 *
 * These are the checks that survive the migration off `@classytic/ca-tax`:
 * they compare a definition against ITSELF and against the rest of the
 * registry, so they keep working once the package is gone. They are also the
 * checks that catch a hand-edit that went wrong — a field pointed at a section
 * that was renamed, a footnote marker left behind after a footnote was removed,
 * a line number pasted twice.
 *
 * What they deliberately do NOT check is whether a caption matches the printed
 * form. Nothing automated can: that is what `provenance` records and what the
 * per-form review in `forms/README.md` tracks.
 */
import { describe, expect, it } from "vitest";
import { FORMS } from "../forms";

const formIds = new Set(FORMS.map((f) => f.id));

/** `${form.id} line ${line}` — every failure names the form and the line. */
const at = (formId: string, line: string) => `${formId} line ${line}`;

describe("form registry", () => {
	it("has a unique id per form", () => {
		const seen = new Map<string, number>();
		for (const form of FORMS) seen.set(form.id, (seen.get(form.id) ?? 0) + 1);
		expect([...seen].filter(([, n]) => n > 1).map(([id]) => id)).toEqual([]);
	});

	it("gives every form at least one section and one field", () => {
		const empty = FORMS.filter(
			(f) => f.sections.length === 0 || f.fields.length === 0,
		).map((f) => f.id);
		expect(empty).toEqual([]);
	});
});

describe("fields reference real sections", () => {
	it("every field.section names a section on its own form", () => {
		const orphans: string[] = [];
		for (const form of FORMS) {
			const sectionIds = new Set(form.sections.map((s) => s.id));
			for (const field of form.fields) {
				if (!sectionIds.has(field.section)) {
					orphans.push(`${at(form.id, field.line)} → section "${field.section}"`);
				}
			}
		}
		expect(orphans).toEqual([]);
	});
});

describe("line numbers", () => {
	it("are unique within a form", () => {
		const duplicates: string[] = [];
		for (const form of FORMS) {
			const seen = new Set<string>();
			for (const field of form.fields) {
				if (seen.has(field.line)) duplicates.push(at(form.id, field.line));
				seen.add(field.line);
			}
		}
		expect(duplicates).toEqual([]);
	});

	/**
	 * Alberta's Net File schema keys every value by the 9-digit `SSSFFFOOO`
	 * composite. A short line id here would be silently dropped from the filed
	 * payload rather than rejected, so the shape is worth asserting.
	 */
	it("are the 9-digit composite on every tra-line-item-id form", () => {
		const malformed: string[] = [];
		for (const form of FORMS) {
			if (form.scheme !== "tra-line-item-id") continue;
			for (const field of form.fields) {
				if (!/^\d{9}$/.test(field.line)) malformed.push(at(form.id, field.line));
			}
		}
		expect(malformed).toEqual([]);
	});

	/**
	 * Every line on one AT1 form shares that form's 3-digit schedule prefix.
	 * Checked for internal consistency rather than against `schedule`, because
	 * the composite only reserves three digits and AT4970's schedule number is
	 * four (its lines are prefixed "497"). A line pasted in from the wrong
	 * schedule — the realistic hand-edit error — still fails here.
	 */
	it("share one schedule prefix within a tra-line-item-id form", () => {
		const mixed: string[] = [];
		for (const form of FORMS) {
			if (form.scheme !== "tra-line-item-id" || form.fields.length === 0) continue;
			const prefixes = new Set(form.fields.map((f) => f.line.slice(0, 3)));
			if (prefixes.size > 1) {
				mixed.push(`${form.id} mixes prefixes ${[...prefixes].sort().join(", ")}`);
			}
		}
		expect(mixed).toEqual([]);
	});
});

/**
 * Real CRA forms this app deliberately does not model. A field may carry a
 * figure in from one of these, and the editor renders that as a read-only line
 * with no navigation — correct, because there is nothing to navigate to.
 *
 * Keeping the list explicit means adding one of these forms to the registry is
 * a deliberate act, and a REFERENCE to a form nobody meant to exclude fails
 * instead of passing silently.
 */
const UNMODELLED_FORMS = new Set([
	"T661",
	"T2SCH15",
	"T2SCH16",
	"T2SCH20",
	"T2SCH38",
	"T2SCH56",
	"T2SCH67",
	"T2SCH68",
	"T2SCH73",
	"T2SCH74",
	"T2SCH75",
	"T2SCH76",
	"T2SCH78",
	"T2SCH92",
]);

/**
 * KNOWN DEFECT, not an exclusion — these are forms the registry HAS, referenced
 * under a differently-padded id.
 *
 * AT1 schedule ids are inconsistently zero-padded upstream: `AT1SCH1` and
 * `AT1SCH2` are unpadded, `AT1SCH03`–`AT1SCH09` are padded, and the AT1 jacket
 * cross-references the single-digit ones unpadded. The consequence is visible:
 * `FORM_ID_TO_SCHEDULE_KEY` in `return-editor.tsx` is keyed on the PADDED ids,
 * so the jacket's "→ Schedule 5, line 064" badges (lines 000064001, 000072001,
 * 000076001, 000081001) fail their lookup and render inert instead of
 * navigating.
 *
 * Fix when the AT1 jacket is vendored — settle on the padded spelling, which is
 * what the editor and the schedule files already use — and delete this list.
 */
const KNOWN_ID_PADDING_DEFECTS = new Set([
	"AT1SCH3",
	"AT1SCH4",
	"AT1SCH5",
	"AT1SCH9",
]);

describe("cross-form references", () => {
	it("resolve to a form in the registry, or to a documented unmodelled one", () => {
		const dangling: string[] = [];
		for (const form of FORMS) {
			for (const field of form.fields) {
				for (const [rel, ref] of [
					["from", field.from],
					["to", field.to],
				] as const) {
					if (!ref) continue;
					if (formIds.has(ref.form)) continue;
					if (UNMODELLED_FORMS.has(ref.form)) continue;
					if (KNOWN_ID_PADDING_DEFECTS.has(ref.form)) continue;
					dangling.push(`${at(form.id, field.line)} ${rel} → ${ref.form}`);
				}
			}
		}
		expect(dangling).toEqual([]);
	});

	it("still has the known AT1 id-padding defect — delete this when fixed", () => {
		const unresolved = [...KNOWN_ID_PADDING_DEFECTS].filter((id) => !formIds.has(id));
		// Each of these IS in the registry under a zero-padded id, which is what
		// makes them a defect rather than an omission. If this ever empties, the
		// upstream ids were reconciled and both lists above can go.
		expect(unresolved.map((id) => `${id} → ${id.replace(/(\d)$/, "0$1")}`)).toEqual([
			"AT1SCH3 → AT1SCH03",
			"AT1SCH4 → AT1SCH04",
			"AT1SCH5 → AT1SCH05",
			"AT1SCH9 → AT1SCH09",
		]);
		for (const padded of ["AT1SCH03", "AT1SCH04", "AT1SCH05", "AT1SCH09"]) {
			expect(formIds.has(padded)).toBe(true);
		}
	});
});

describe("formulas", () => {
	/**
	 * A formula naming a line that doesn't exist is worse than no formula: it
	 * reads as the form's own rule. This is the check that keeps
	 * `formula.inputs` honest when lines get renumbered or removed.
	 */
	it("only reference lines that exist on the same form", () => {
		const dangling: string[] = [];
		for (const form of FORMS) {
			const lines = new Set(form.fields.map((f) => f.line));
			for (const field of form.fields) {
				for (const input of field.formula?.inputs ?? []) {
					if (!lines.has(input)) {
						dangling.push(`${at(form.id, field.line)} formula → ${input}`);
					}
				}
			}
		}
		expect(dangling).toEqual([]);
	});

	it("never has a field's formula reference itself", () => {
		const cycles: string[] = [];
		for (const form of FORMS) {
			for (const field of form.fields) {
				if (field.formula?.inputs.includes(field.line)) {
					cycles.push(at(form.id, field.line));
				}
			}
		}
		expect(cycles).toEqual([]);
	});

	it("are only attached to lines the form derives, never to inputs", () => {
		const misplaced: string[] = [];
		for (const form of FORMS) {
			for (const field of form.fields) {
				if (field.formula && field.role === "input") {
					misplaced.push(`${at(form.id, field.line)} (role: input)`);
				}
			}
		}
		expect(misplaced).toEqual([]);
	});
});

describe("footnotes", () => {
	it("every footnoteMark indexes a footnote that exists", () => {
		const dangling: string[] = [];
		for (const form of FORMS) {
			const count = form.footnotes?.length ?? 0;
			for (const field of form.fields) {
				for (const mark of field.footnoteMarks ?? []) {
					if (!Number.isInteger(mark) || mark < 0 || mark >= count) {
						dangling.push(
							`${at(form.id, field.line)} mark ${mark} (form has ${count} footnotes)`,
						);
					}
				}
			}
		}
		expect(dangling).toEqual([]);
	});
});
