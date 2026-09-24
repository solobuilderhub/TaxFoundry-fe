import { describe, expect, it } from "vitest";
import { FORM_ID_TO_SCHEDULE_KEY } from "../app/dashboard/engagements/[id]/return/_config/form-nav";
import {
	AT1_LINE_INDEX,
	findLines,
} from "../app/dashboard/engagements/[id]/return/_config/line-index";

/**
 * "Go to line" finds lines in the generated layouts and opens them through the
 * same form-id map the cross-reference badges use — so a hit that cannot be
 * opened would be a search result that does nothing when chosen.
 */
describe("go to line", () => {
	it("can open every form it indexes", () => {
		const unmapped = [...new Set(AT1_LINE_INDEX.map((h) => h.formId))].filter(
			(id) => !(id in FORM_ID_TO_SCHEDULE_KEY),
		);
		expect(unmapped).toEqual([]);
	});

	it("finds a bare line number on every form, the jacket first", () => {
		const hits = findLines("62");
		expect(hits[0]).toMatchObject({ formId: "AT1", line: "062" });
		expect(hits.every((h) => h.line === "062")).toBe(true);
	});

	it("narrows to one schedule when one is given", () => {
		for (const q of ["1 031", "S1-031", "sch 1 031", "schedule1/031"]) {
			const hits = findLines(q);
			expect(
				hits.map((h) => `${h.num}/${h.line}`),
				q,
			).toEqual(["001/031"]);
		}
	});

	it("matches every word of the caption", () => {
		const hits = findLines("taxable income alberta");
		expect(hits.length).toBeGreaterThan(0);
		for (const h of hits) {
			const c = h.caption.toLowerCase();
			expect(c).toContain("taxable");
			expect(c).toContain("alberta");
		}
	});

	it("finds nothing for nothing", () => {
		expect(findLines("   ")).toEqual([]);
	});
});
