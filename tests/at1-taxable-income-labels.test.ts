import { describe, expect, it } from "vitest";
import { labelForLine } from "../app/dashboard/engagements/[id]/return/_config/line-labels";

/**
 * AT1 line 062 vs line 066, labelled distinctly.
 *
 * `albertaTaxableIncome` (062) is taxable income on an Alberta basis BEFORE
 * allocation; `amountTaxableInAlberta` (066, "062 × 065") is the income
 * actually taxed. Labelled identically ("Alberta taxable income") with no
 * qualifier, a return with a permanent establishment outside Alberta showed
 * the full pre-allocation figure under the summary's single most
 * load-bearing caption — at a 60% allocation factor, $200,000 labelled
 * "Alberta taxable income" while only $120,000 was ever taxed in Alberta
 * (TF_DEV_BUG_LIST_2026-09-18.md, BUG-108).
 */
describe("AT1 taxable income — before vs after allocation", () => {
	it("labels 062 and 066 distinctly, not both as plain 'Alberta taxable income'", () => {
		const before = labelForLine("albertaTaxableIncome");
		const after = labelForLine("amountTaxableInAlberta");
		expect(before).not.toBe(after);
		expect(before).not.toBe("Alberta taxable income");
		expect(after).not.toBe("Alberta taxable income");
	});

	it("names which side of the allocation each figure is on", () => {
		expect(labelForLine("albertaTaxableIncome")).toMatch(/before allocation/i);
		expect(labelForLine("amountTaxableInAlberta")).toMatch(/after allocation/i);
	});

	it("cites the printed line number for each, so the two can be checked against the form", () => {
		expect(labelForLine("albertaTaxableIncome")).toMatch(/062/);
		expect(labelForLine("amountTaxableInAlberta")).toMatch(/066/);
	});
});
