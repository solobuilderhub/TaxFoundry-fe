/**
 * Every RIFE line number the return editor shows is a real line on AT1
 * Schedule 21, page 5.
 *
 * `tests/ui-line-citations.test.ts` guards the `(line 410)` citations written
 * into schedule configs. The RIFE section's line numbers live as component
 * props instead, so that scan cannot see them — this test closes the gap by
 * checking the keys the component renders (`RIFE_LINE_KEYS`) against the
 * generated FormDefinition, which `forms-drift.test.ts` in turn holds to
 * `@classytic/ca-tax`'s own extracted form data. Same standard as the rest of
 * the editor: a number shown to a preparer is provably the form's.
 */
import { describe, expect, it } from "vitest";
import { FORMS } from "@classytic/ca-tax/forms";
import { RIFE_FIELD, RIFE_LINE_KEYS, rifeFormText } from "../app/dashboard/engagements/[id]/return/_config/schedules/at1/rife-lines";

const AT1SCH21 = FORMS.find((f) => f.id === "AT1SCH21");

describe("RIFE line numbers shown in the return editor", () => {
	it("has AT1 Schedule 21 to check against", () => {
		expect(AT1SCH21).toBeDefined();
	});

	for (const key of RIFE_LINE_KEYS) {
		it(`line ${key} exists on the generated form, in the RIFE section`, () => {
			const field = RIFE_FIELD.get(key);
			expect(field, `no RIFE field ${key} in the generated layout`).toBeDefined();
			expect(field?.section).toBe("rife");
			// …and the generated layout agrees with the package's own definition.
			expect(AT1SCH21?.fields.some((f) => f.line === `021${key}001`)).toBe(true);
		});
	}

	it("shows every RIFE line the form has — none are left out", () => {
		const onForm = [...RIFE_FIELD.keys()].sort();
		expect(onForm).toEqual([...RIFE_LINE_KEYS].sort());
	});

	it("carries the printed form's own caption for the hover text", () => {
		expect(rifeFormText("240")).toMatch(/RIFE deducted for the tax year/);
		expect(rifeFormText("240")).toMatch(/must not exceed line 350/);
		expect(rifeFormText("350")).toMatch(/111\(1\)\(a\.1\)/);
	});

	it("marks the three federally-sourced lines as carried in, naming their source", () => {
		expect(RIFE_FIELD.get("230")?.from).toMatchObject({ form: "T2SCH4", line: "710" });
		expect(RIFE_FIELD.get("320")?.from).toMatchObject({ form: "T2SCH130", line: "129" });
		expect(RIFE_FIELD.get("330")?.from).toMatchObject({ form: "T2SCH130", line: "130" });
		// …and line 240 says where it goes.
		expect(RIFE_FIELD.get("240")?.to).toMatchObject({ form: "AT1SCH12", line: "012130001" });
	});
});
