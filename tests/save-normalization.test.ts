import { describe, expect, it } from "vitest";
import {
	normalizeSchedule2,
	withoutNulls,
} from "../app/dashboard/engagements/[id]/return/_lib/save-normalize";

/**
 * A cleared box is `null` in the form — `undefined` made react-hook-form fall
 * back to the value the form opened with, so clearing a saved figure silently
 * restored it. These are the save-time steps that turn the form's values back
 * into what the contract accepts.
 */
describe("saving a form", () => {
	it("drops cleared boxes, at any depth, but keeps array positions", () => {
		expect(
			withoutNulls({
				a: null,
				b: 1,
				nested: { c: null, d: "x" },
				rows: [{ amount: null }, { amount: 5 }],
			}),
		).toEqual({ b: 1, nested: { d: "x" }, rows: [{}, { amount: 5 }] });
	});

	it("Schedule 2: a blank formula is Area A, and cleared Area B boxes go", () => {
		expect(
			normalizeSchedule2({
				specialAllocationFormula: "",
				allocationAreaB: { l082: 20, l084: null },
				legalName: "Kept",
			}),
		).toEqual({ allocationAreaB: { l082: 20 }, legalName: "Kept" });
		expect(normalizeSchedule2({ allocationAreaB: { l082: null } })).toEqual({});
	});
});

describe("holes in arrays", () => {
	it("become empty rows in a list of rows", () => {
		expect(withoutNulls({ rows: [null, { amount: 5 }] })).toEqual({
			rows: [{}, { amount: 5 }],
		});
	});

	it("stay null in an array of plain values — Schedule 1's line-number index", () => {
		const lines: (number | null)[] = [];
		lines[3] = 120;
		expect(
			withoutNulls({ lines: Array.from(lines, (x) => x ?? null) }),
		).toEqual({
			lines: [null, null, null, 120],
		});
	});
});
