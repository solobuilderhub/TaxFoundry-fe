import { describe, expect, it } from "vitest";
import {
	AT1_SCHEDULE_1_AREA_B_STEPS,
	AT1_SCHEDULE_1_FIELDS,
} from "../app/dashboard/engagements/[id]/return/_config/schedules/at1/paper/generated/schedule1.layout";
import {
	AREA_B_AMOUNT,
	AREA_B_BLANK_REASON,
} from "../app/dashboard/engagements/[id]/return/_config/schedules/at1/paper/schedule1-area-b-map";

/**
 * AT1 Schedule 1 Area B — every lettered box accounted for.
 *
 * Area B is the working behind line 015, the base amount the whole small
 * business deduction is scaled by. It was rendered as the page prints it —
 * eleven captions and eleven EMPTY boxes — while the engine computed the
 * entire cascade internally and threw every intermediate away. Line 015 then
 * showed a "Computed" badge over a blank cell, and a preparer had no way to
 * tell a nil base amount from an unmodelled one.
 *
 * The rule this pins: a lettered step either has an amount wired to it, or has
 * a stated reason it is blank. Never neither — a silent blank is the defect.
 */
describe("Area B — every step is either filled or explained", () => {
	const letters = [
		...new Set(AT1_SCHEDULE_1_AREA_B_STEPS.map((s) => s.letter)),
	];

	it("covers every letter the page prints", () => {
		expect(letters.length).toBeGreaterThan(0);
		for (const letter of letters) {
			const wired = letter in AREA_B_AMOUNT;
			const explained = letter in AREA_B_BLANK_REASON;
			expect(
				wired || explained,
				`${letter} is neither wired to an engine amount nor given a reason for being blank`,
			).toBe(true);
		}
	});

	it("never both wires and excuses the same letter", () => {
		// The two maps are consulted in order, so an overlap would mean a figure
		// the engine really computed being hidden behind an excuse.
		for (const letter of letters) {
			expect(
				letter in AREA_B_AMOUNT && letter in AREA_B_BLANK_REASON,
				`${letter} is both wired and excused`,
			).toBe(false);
		}
	});

	it("wires the amounts the engine actually reports", () => {
		// The field names are `AlbertaSbdResult.areaB`'s own keys, surfaced on the
		// computed return as `sbdAreaB.*` by the server's `at1-compute.ts`. A typo
		// here renders a permanent blank that looks exactly like an unmodelled
		// line, which is the failure this whole change is about.
		expect(AREA_B_AMOUNT).toMatchObject({
			"(a)": "baseAmount",
			"(b)": "proratedBaseAmount",
			"(c)": "reductionTaxableCapital",
			"(d)": "aaiiOverThreshold",
			"(e)": "reductionPassiveIncome",
			"(f)": "reductionApplied",
			"(h)": "reducedBusinessLimit",
		});
	});

	it("leaves the line 515 assignment branch unmodelled and says so", () => {
		// (i) drives (j) and (k). Reporting any of them as $0 would assert that
		// nothing was assigned under federal line 515, and nobody was asked.
		for (const letter of ["(i)", "(j)", "(k)"]) {
			expect(AREA_B_BLANK_REASON[letter], letter).toBeTruthy();
		}
		expect(AREA_B_BLANK_REASON["(i)"]).toMatch(/515/);
	});
});

/**
 * The badge on a line nothing produces.
 *
 * `not-collected` exists because `computed` was being used for lines with no
 * editable binding, nothing computing them and nothing filing them — so the
 * renderer printed "Computed" over an empty cell and told the preparer the
 * engine had worked out a nil.
 */
describe("Schedule 1 does not claim to compute what it does not", () => {
	const byField = new Map(
		AT1_SCHEDULE_1_FIELDS.map((f) => [f.line.slice(3, 6), f] as const),
	);

	it("marks the three unmodelled lines not-collected", () => {
		// 019/020 are federal Schedule 5's 127/167, which this engine's Schedule
		// 5 does not model; 021 is the allocation factor, which reaches the
		// return at jacket 000065001 and is not filed here.
		for (const field of ["019", "020", "021"]) {
			expect(byField.get(field)?.role, `line ${field}`).toBe("not-collected");
		}
	});

	it("keeps 015 computed, because Area B now genuinely computes it", () => {
		expect(byField.get("015")?.role).toBe("computed");
	});

	it("derives 044 rather than leaving it a dash", () => {
		/*
		 * The page computes 045 FROM 044 ("$200,000 X % in Col 044"); this
		 * product collects the dollars and derives the percentage, which is the
		 * same relationship read the other way and keeps it ONE fact. The cost
		 * of the old permanent dash was the check the page prints beside it —
		 * the column totals 100%, which catches an over-allocated group.
		 */
		expect(byField.get("044")?.role).toBe("computed");
	});

	it("gives every not-collected line a note explaining the gap", () => {
		// The badge is a pointer to the note, not a substitute for it.
		for (const f of AT1_SCHEDULE_1_FIELDS) {
			if (f.role !== "not-collected") continue;
			expect(f.note, `line ${f.line}`).toMatch(/NOT (COLLECTED|FILED)/);
		}
	});
});

/**
 * "Large Corporations" — A, B and the three cases.
 *
 * Another product renders these five as fillable boxes. TRA11723 does not:
 * every lettered row from (a) to (k) carries an amount rule on the page, and
 * these carry none — they are definitions of the symbols the (c) formula uses.
 * So they are shown with their COMPUTED values, to make "(c) = A x (B / 90000)"
 * followable, and without a box outline, because there is no box.
 */
describe("the Large Corporations definitions carry values, not boxes", () => {
	it("maps A and B to the engine's own figures", () => {
		expect(AREA_B_AMOUNT.A).toBe("thresholdForReduction");
		expect(AREA_B_AMOUNT.B).toBe("taxableCapitalFactor");
	});

	it("does not give A or B a blank-reason — they are always computed", () => {
		// A blank-reason would render a dash with an excuse, which is the
		// treatment for something unmodelled. These are modelled.
		expect(AREA_B_BLANK_REASON.A).toBeUndefined();
		expect(AREA_B_BLANK_REASON.B).toBeUndefined();
	});

	it("keeps every lettered STEP mapped, unaffected by the definitions", () => {
		// A and B live in the prose block, not in AT1_SCHEDULE_1_AREA_B_STEPS,
		// so adding them must not make a step look covered that is not.
		const stepLetters = new Set(
			AT1_SCHEDULE_1_AREA_B_STEPS.map((s) => s.letter),
		);
		expect(stepLetters.has("A")).toBe(false);
		expect(stepLetters.has("B")).toBe(false);
	});
});

/**
 * (b) is a SHORT-YEAR box.
 *
 * The form routes around it — "If adjustments are not required, enter Amount
 * (a) on line 015" — so filling it on a full year states a proration that did
 * not happen. On a 366-day year the literal formula would read MORE than (a),
 * which is worse than noise.
 */
describe("(b) is mapped, and blank when the engine reports no proration", () => {
	it("is wired to the engine's optional prorated figure", () => {
		expect(AREA_B_AMOUNT["(b)"]).toBe("proratedBaseAmount");
	});

	it("has no blank-reason, so an absent value renders as an empty box", () => {
		// Absent ≠ unmodelled: the box is genuinely empty on a full year, which
		// is what the printed form shows too.
		expect(AREA_B_BLANK_REASON["(b)"]).toBeUndefined();
	});
});

import { valueAt } from "../app/dashboard/engagements/[id]/return/_config/schedules/at1/paper/resolve-line";

/**
 * `valueAt` — the read half of a linked slot.
 *
 * Schedule 21 had the only copy, inline. Schedule 1 needed the same thing for
 * line 003, and a second copy is how two views come to disagree about what
 * "stored" means, so it moved next to `LinkedSlot` itself.
 */
describe("valueAt reads a stored figure by path", () => {
	const ri = { sbd: { activeBusinessIncome: 50_000, businessLimit: 0 } };

	it("reads a nested numeric figure", () => {
		expect(valueAt(ri, "sbd.activeBusinessIncome")).toBe(50_000);
	});

	it("keeps a stored ZERO, which is an answer", () => {
		// The trap a truthiness check would spring: nil active business income
		// is a real figure, and must not read as "never entered".
		expect(valueAt(ri, "sbd.businessLimit")).toBe(0);
	});

	it("returns undefined for a missing path rather than throwing", () => {
		expect(valueAt(ri, "sbd.nope")).toBeUndefined();
		expect(valueAt(ri, "nope.deeper.still")).toBeUndefined();
		expect(valueAt(undefined, "sbd.activeBusinessIncome")).toBeUndefined();
	});

	it("refuses a non-numeric value instead of rendering it as a figure", () => {
		// A working return is assembled from many schedules; a string where a
		// number belongs must not reach a money cell.
		expect(
			valueAt(
				{ sbd: { activeBusinessIncome: "50000" } },
				"sbd.activeBusinessIncome",
			),
		).toBeUndefined();
	});
});
