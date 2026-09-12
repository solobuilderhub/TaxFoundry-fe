/**
 * The generated schema/paper-layout files must match a fresh emit from
 * `@classytic/ca-tax`'s `FormDefinition`s.
 *
 * A generated file that nobody regenerates is worse than a hand-written one:
 * it looks authoritative and is stale. This is the check that makes the
 * arrangement safe — edit a `FormDefinition` (in the published package)
 * without bumping the dependency and re-running the emitter, and this fails.
 *
 *   npx tsx scripts/emit-paper-layouts.ts
 */
import { readdirSync, readFileSync } from "node:fs";
import {
	AT1_JACKET,
	AT1_SCHEDULE_1,
	AT1_SCHEDULE_2,
	AT1_SCHEDULE_4_COLUMNS,
	AT1_SCHEDULE_10,
	AT1_SCHEDULE_12_PAIRS,
	AT1_SCHEDULE_13_COLUMNS,
	AT1_SCHEDULE_16,
	AT1_SCHEDULE_17_RESERVES,
	AT1_SCHEDULE_18_ABIL_COLUMNS,
	AT1_SCHEDULE_18_BLOCK_HEADINGS,
	AT1_SCHEDULE_18_CATEGORIES,
	AT1_SCHEDULE_18_GRIDS,
	AT1_SCHEDULE_18_PRINTED_AFTER,
	AT1_SCHEDULE_20,
	AT1_SCHEDULE_21_POOLS,
	AT1_SCHEDULE_29,
	CO17_RETURN,
	T2_JACKET,
	T2_SCHEDULE_1,
	T2_SCHEDULE_3,
	T2_SCHEDULE_4,
	T2_SCHEDULE_7,
	T2_SCHEDULE_13,
	T2_SCHEDULE_130,
	T2_SCHEDULE_141,
} from "@classytic/ca-tax/t2";
import { describe, expect, it } from "vitest";
import {
	co17PaperLayout,
	jacketPaperLayout,
	netIncomeSchedule,
	schedule1PaperLayout,
	schedule2PaperLayout,
	schedule4PaperLayout,
	schedule10PaperLayout,
	schedule16PaperLayout,
	schedule18PaperLayout,
	schedule12PaperLayout,
	schedule13PaperLayout,
	schedule17PaperLayout,
	schedule20PaperLayout,
	schedule21PaperLayout,
	schedule29PaperLayout,
	t2JacketPaperLayout,
	t2Schedule1PaperLayout,
	t2Schedule3PaperLayout,
	t2Schedule4PaperLayout,
	t2Schedule7PaperLayout,
	t2Schedule13PaperLayout,
	t2Schedule130PaperLayout,
	t2Schedule141PaperLayout,
} from "../scripts/emit-paper-layouts";

const RETURN_DIR = "app/dashboard/engagements/[id]/return";
const SCHEDULES_DIR = `${RETURN_DIR}/_config/schedules`;
const PAPER_DIR = `${SCHEDULES_DIR}/at1/paper/generated`;
const T2_PAPER_DIR = `${SCHEDULES_DIR}/t2/paper/generated`;
const CO17_PAPER_DIR = `${SCHEDULES_DIR}/co17/paper/generated`;

const NET_INCOME_CHECKED_IN = `${SCHEDULES_DIR}/t2/net-income.ts`;
const T2_SCHEDULE_1_CHECKED_IN = `${T2_PAPER_DIR}/schedule1.layout.ts`;
const T2_SCHEDULE_13_CHECKED_IN = `${T2_PAPER_DIR}/schedule13.layout.ts`;
const T2_SCHEDULE_130_CHECKED_IN = `${T2_PAPER_DIR}/schedule130.layout.ts`;
const CO17_CHECKED_IN = `${CO17_PAPER_DIR}/co17.layout.ts`;
const T2_SCHEDULE_3_CHECKED_IN = `${T2_PAPER_DIR}/schedule3.layout.ts`;
const T2_SCHEDULE_4_CHECKED_IN = `${T2_PAPER_DIR}/schedule4.layout.ts`;
const T2_SCHEDULE_7_CHECKED_IN = `${T2_PAPER_DIR}/schedule7.layout.ts`;
const JACKET_CHECKED_IN = `${PAPER_DIR}/jacket.layout.ts`;
const SCHEDULE_21_CHECKED_IN = `${PAPER_DIR}/schedule21.layout.ts`;
const SCHEDULE_13_CHECKED_IN = `${PAPER_DIR}/schedule13.layout.ts`;
const SCHEDULE_17_CHECKED_IN = `${PAPER_DIR}/schedule17.layout.ts`;
const SCHEDULE_29_CHECKED_IN = `${PAPER_DIR}/schedule29.layout.ts`;
const SCHEDULE_12_CHECKED_IN = `${PAPER_DIR}/schedule12.layout.ts`;
const SCHEDULE_1_CHECKED_IN = `${PAPER_DIR}/schedule1.layout.ts`;
const SCHEDULE_2_CHECKED_IN = `${PAPER_DIR}/schedule2.layout.ts`;
const SCHEDULE_10_CHECKED_IN = `${PAPER_DIR}/schedule10.layout.ts`;
const SCHEDULE_18_CHECKED_IN = `${PAPER_DIR}/schedule18.layout.ts`;
const SCHEDULE_20_CHECKED_IN = `${PAPER_DIR}/schedule20.layout.ts`;
const SCHEDULE_16_CHECKED_IN = `${PAPER_DIR}/schedule16.layout.ts`;
const AT1_SCHEDULE_4_CHECKED_IN = `${PAPER_DIR}/schedule4.layout.ts`;

describe("the guided-editor T2SCH1 schema is in step with T2_SCHEDULE_1", () => {
	it("matches a fresh emit exactly", () => {
		const onDisk = readFileSync(NET_INCOME_CHECKED_IN, "utf8");
		expect(
			onDisk,
			"net-income.ts is stale — run `npx tsx scripts/emit-paper-layouts.ts`",
		).toBe(netIncomeSchedule());
	});

	it("names every field for the CRA line it is transmitted under", () => {
		const onDisk = readFileSync(NET_INCOME_CHECKED_IN, "utf8");
		const named = [...onDisk.matchAll(/"lines\.(\d{3})"/g)].map(
			(m) => m[1] as string,
		);
		expect(named.length).toBeGreaterThan(90);
		expect(named).toContain("104");
		expect(named).toContain("121");
	});

	it("does NOT render totals or carried-in figures as boxes", () => {
		const onDisk = readFileSync(NET_INCOME_CHECKED_IN, "utf8");
		expect(onDisk).not.toContain('"lines.500"');
		expect(onDisk).not.toContain('"lines.510"');
		expect(onDisk).not.toContain('"lines.403"');
	});
});

describe("the federal T2SCH1 paper layout is in step with T2_SCHEDULE_1", () => {
	it("matches a fresh emit exactly", () => {
		const onDisk = readFileSync(T2_SCHEDULE_1_CHECKED_IN, "utf8");
		expect(
			onDisk,
			"t2/paper/generated/schedule1.layout.ts is stale — run `npx tsx scripts/emit-paper-layouts.ts`",
		).toBe(t2Schedule1PaperLayout());
	});

	it("carries every field on the form, not just input ones", () => {
		const onDisk = readFileSync(T2_SCHEDULE_1_CHECKED_IN, "utf8");
		const lines = [...onDisk.matchAll(/ {2}\{ line: "(\d+)"/g)].map(
			(m) => m[1] as string,
		);
		expect(lines.length).toBe(T2_SCHEDULE_1.fields.length);
		expect(onDisk).toContain('role: "total"');
		expect(onDisk).toContain('role: "carried-in"');
	});
});

describe("the federal T2SCH13 paper layout is in step with T2_SCHEDULE_13", () => {
	it("matches a fresh emit exactly", () => {
		const onDisk = readFileSync(T2_SCHEDULE_13_CHECKED_IN, "utf8");
		expect(
			onDisk,
			"t2/paper/generated/schedule13.layout.ts is stale — run `npx tsx scripts/emit-paper-layouts.ts`",
		).toBe(t2Schedule13PaperLayout());
	});

	it("carries every field on the form, not just input ones", () => {
		const onDisk = readFileSync(T2_SCHEDULE_13_CHECKED_IN, "utf8");
		const lines = [...onDisk.matchAll(/ {2}\{ line: "(\d+)"/g)].map(
			(m) => m[1] as string,
		);
		expect(lines.length).toBe(T2_SCHEDULE_13.fields.length);
		expect(onDisk).toContain('role: "total"');
	});

	it("carries all six federally-recognized reserve types' named lines", () => {
		const onDisk = readFileSync(T2_SCHEDULE_13_CHECKED_IN, "utf8");
		for (const line of ["110", "130", "150", "190", "210", "230"]) {
			expect(onDisk).toContain(`line: "${line}"`);
		}
	});
});

describe("the jacket paper layout is in step with AT1_JACKET", () => {
	it("matches a fresh emit exactly", () => {
		const onDisk = readFileSync(JACKET_CHECKED_IN, "utf8");
		expect(
			onDisk,
			"jacket.layout.ts is stale — run `npx tsx scripts/emit-paper-layouts.ts`",
		).toBe(jacketPaperLayout());
	});

	it("carries every field on the form, not just input ones", () => {
		const onDisk = readFileSync(JACKET_CHECKED_IN, "utf8");
		const lines = [...onDisk.matchAll(/ {2}\{ line: "(\d+)"/g)].map(
			(m) => m[1] as string,
		);
		expect(lines.length).toBe(AT1_JACKET.fields.length);
		expect(onDisk).toContain('role: "computed"');
		expect(onDisk).toContain('role: "carried-in"');
	});
});

describe("the Schedule 21 paper layout is in step with AT1_SCHEDULE_21", () => {
	it("matches a fresh emit exactly", () => {
		const onDisk = readFileSync(SCHEDULE_21_CHECKED_IN, "utf8");
		expect(
			onDisk,
			"schedule21.layout.ts is stale — run `npx tsx scripts/emit-paper-layouts.ts`",
		).toBe(schedule21PaperLayout());
	});

	it("has one pool-table entry per AT1_SCHEDULE_21_POOLS pool", () => {
		const onDisk = readFileSync(SCHEDULE_21_CHECKED_IN, "utf8");
		const keys = [...onDisk.matchAll(/key: "([a-z-]+)"/g)].map(
			(m) => m[1] as string,
		);
		expect(keys).toEqual(AT1_SCHEDULE_21_POOLS.map((p) => p.key));
	});

	it('does not invent a row a pool has no line for — capital has no "expired" row', () => {
		const onDisk = readFileSync(SCHEDULE_21_CHECKED_IN, "utf8");
		const capitalBlock = onDisk.slice(
			onDisk.indexOf('key: "capital"'),
			onDisk.indexOf('key: "farm"'),
		);
		expect(capitalBlock).not.toContain('kind: "expired"');
	});
});

describe("the Schedule 13 paper layout is in step with AT1_SCHEDULE_13", () => {
	it("matches a fresh emit exactly", () => {
		const onDisk = readFileSync(SCHEDULE_13_CHECKED_IN, "utf8");
		expect(
			onDisk,
			"schedule13.layout.ts is stale — run `npx tsx scripts/emit-paper-layouts.ts`",
		).toBe(schedule13PaperLayout());
	});

	/**
	 * All 24 columns are emitted, and the 5 unnumbered ones carry no `line`.
	 *
	 * This asserted the opposite — that the emitter OMITTED them, on the
	 * reasoning that the form "does not ask for" those figures. It does show
	 * them, though: columns 10, 13 and 15-17 are the whole path from the
	 * entered figures to the CCA claim at column 23. Skipping them gave a grid
	 * that jumped 9 → 11, 12 → 14 and 14 → 18 while the headings that survived
	 * went on citing the ones that were gone ("column 10 minus column 12").
	 *
	 * What the old test was protecting is still protected, and more precisely:
	 * no `line` means no field to bind and nothing that can be transmitted.
	 */
	it("emits all 24 columns, with no line on the 5 the page does not number", () => {
		const onDisk = readFileSync(SCHEDULE_13_CHECKED_IN, "utf8");
		const columns = [...onDisk.matchAll(/\{ column: (\d+)/g)].map((m) =>
			Number(m[1]),
		);
		expect(columns).toEqual(Array.from({ length: 24 }, (_, i) => i + 1));
		expect(columns.length).toBe(AT1_SCHEDULE_13_COLUMNS.length);

		// The five unnumbered ones are emitted WITHOUT a line, so nothing can
		// bind or file them — which is what "does not ask for" should have meant.
		for (const c of [10, 13, 15, 16, 17]) {
			const entry = onDisk
				.split("\n")
				.find((l) => l.includes(`{ column: ${c},`));
			expect(entry, `column ${c}`).toBeDefined();
			expect(entry, `column ${c} must carry no line`).not.toMatch(/line: "/);
			// …and it still states itself in the page's words.
			expect(entry, `column ${c}`).toMatch(/printedHeading: "/);
		}
	});
});

describe("the Schedule 17 paper layout is in step with AT1_SCHEDULE_17", () => {
	it("matches a fresh emit exactly", () => {
		const onDisk = readFileSync(SCHEDULE_17_CHECKED_IN, "utf8");
		expect(
			onDisk,
			"schedule17.layout.ts is stale — run `npx tsx scripts/emit-paper-layouts.ts`",
		).toBe(schedule17PaperLayout());
	});

	it("has one reserve-kind entry per AT1_SCHEDULE_17_RESERVES kind, in order", () => {
		const onDisk = readFileSync(SCHEDULE_17_CHECKED_IN, "utf8");
		const labels = [...onDisk.matchAll(/label: "([^"]+)"/g)].map(
			(m) => m[1] as string,
		);
		expect(labels).toEqual(AT1_SCHEDULE_17_RESERVES.map((r) => r.label));
	});
});

describe("the Schedule 29 paper layout is in step with AT1_SCHEDULE_29", () => {
	it("matches a fresh emit exactly", () => {
		const onDisk = readFileSync(SCHEDULE_29_CHECKED_IN, "utf8");
		expect(
			onDisk,
			"schedule29.layout.ts is stale — run `npx tsx scripts/emit-paper-layouts.ts`",
		).toBe(schedule29PaperLayout());
	});

	it("carries all 4 sections — eligible, limit, grant, agreement", () => {
		const onDisk = readFileSync(SCHEDULE_29_CHECKED_IN, "utf8");
		for (const id of ["eligible", "limit", "grant", "agreement"]) {
			expect(onDisk).toContain(`id: "${id}"`);
		}
		expect(AT1_SCHEDULE_29.sections.map((s) => s.id)).toEqual([
			"eligible",
			"limit",
			"grant",
			"agreement",
		]);
	});
});

describe("the Schedule 12 paper layout is in step with AT1_SCHEDULE_12", () => {
	it("matches a fresh emit exactly", () => {
		const onDisk = readFileSync(SCHEDULE_12_CHECKED_IN, "utf8");
		expect(
			onDisk,
			"schedule12.layout.ts is stale — run `npx tsx scripts/emit-paper-layouts.ts`",
		).toBe(schedule12PaperLayout());
	});

	/**
	 * Every reconciling item is two lines, federal and Alberta, and Schedule 12
	 * additionally carries fourteen lines that stand alone: the two net-income
	 * lines and two adjustments in Area A, in Area B the two subtotals and the
	 * two taxable-income figures they produce, and the four of the
	 * active-business-income reconciliation block on page 2 (100/102/104/106).
	 *
	 * Area B used to stop at line 075, so those last four and three whole pairs
	 * were missing — which is how Schedule 21's line 017 came to print "Carry
	 * forward to Schedule 12, line 082" against a line that did not exist.
	 *
	 * The ABI block was missing for longer and more quietly, because nothing
	 * pointed at it from inside this schedule: AT1 Schedule 1 line 003 names
	 * "Schedule 12, line 106" from the OTHER side, and a cross-form check can
	 * only catch a link to a line that is absent, never a line nobody links to.
	 */
	const STAND_ALONE_LINES = 14;

	it("has a federal AND an Alberta field for every reconciling pair", () => {
		const onDisk = readFileSync(SCHEDULE_12_CHECKED_IN, "utf8");
		const lines = [...onDisk.matchAll(/ {2}\{ line: "(\d+)"/g)].map(
			(m) => m[1] as string,
		);
		expect(lines.length).toBe(
			STAND_ALONE_LINES + AT1_SCHEDULE_12_PAIRS.length * 2,
		);
	});

	it("carries Area B through to the taxable income it produces", () => {
		const onDisk = readFileSync(SCHEDULE_12_CHECKED_IN, "utf8");
		// The subtotal, the s.110.5 addition after it, and Alberta taxable income.
		for (const line of ["012080001", "012082001", "012090001"]) {
			expect(onDisk).toContain(`line: "${line}"`);
		}
	});
});

describe("the Schedule 1 (AT1) paper layout is in step with AT1_SCHEDULE_1", () => {
	it("matches a fresh emit exactly", () => {
		const onDisk = readFileSync(SCHEDULE_1_CHECKED_IN, "utf8");
		expect(
			onDisk,
			"schedule1.layout.ts is stale — run `npx tsx scripts/emit-paper-layouts.ts`",
		).toBe(schedule1PaperLayout());
	});

	it("carries lines 003-013 plus Area A's agreement table (041/043/045) — nothing past that, and no line 001 (that's the AT1 jacket's own, see jacket.ts's LINE_001)", () => {
		expect(AT1_SCHEDULE_1.fields.map((f) => f.line.slice(3, 6))).toEqual([
			"003",
			"005",
			"007",
			"009",
			"011",
			"013",
			"041",
			"043",
			"045",
		]);
	});
});

describe("the Schedule 2 paper layout is in step with AT1_SCHEDULE_2", () => {
	it("matches a fresh emit exactly", () => {
		const onDisk = readFileSync(SCHEDULE_2_CHECKED_IN, "utf8");
		expect(
			onDisk,
			"schedule2.layout.ts is stale — run `npx tsx scripts/emit-paper-layouts.ts`",
		).toBe(schedule2PaperLayout());
	});

	/**
	 * This used to assert the schedule had exactly Area A's four lines, which
	 * was true of the definition and not of the form. Area B's eight
	 * industry-specific formulas are on the page whether or not the engine
	 * computes them, and a paper view shows the page.
	 *
	 * Counting sections rather than fields, because the fields differ per
	 * formula by design — insurance and trust & loan print only columns C and
	 * D, ship operators run to eight — and a bare total would hide that while
	 * still passing.
	 */
	it("carries Area A and all eight Area B formulas", () => {
		const sections = AT1_SCHEDULE_2.sections.map((s) => s.id);
		expect(sections).toContain("gate");
		expect(sections).toContain("general");
		for (const areaB of [
			"bus-truck",
			"grain-elevator",
			"pipeline",
			"insurance",
			"chartered-banks",
			"trust-loan",
			"airline",
			"railway",
			"ship",
			"divided-businesses",
		]) {
			expect(sections, `Area B: ${areaB}`).toContain(areaB);
		}
		// Area A itself is still exactly its four inputs.
		expect(
			AT1_SCHEDULE_2.fields.filter((f) => f.section === "general"),
		).toHaveLength(4);
	});
});

describe("the Schedule 18 paper layout is in step with AT1_SCHEDULE_18", () => {
	it("matches a fresh emit exactly", () => {
		const onDisk = readFileSync(SCHEDULE_18_CHECKED_IN, "utf8");
		expect(
			onDisk,
			"schedule18.layout.ts is stale — run `npx tsx scripts/emit-paper-layouts.ts`",
		).toBe(schedule18PaperLayout());
	});

	/**
	 * The layout has to carry the GRID, not just the fields.
	 *
	 * A flat field list is ordered by line number, and this schedule numbers
	 * its four columns in four separate bands — 002-012 down column A, 022-032
	 * down column B. Rendered in that order a preparer sees six proceeds
	 * figures, then six cost bases, and never one row of the table. Which cells
	 * share a row is structure no list of fields can hold, so the emitter ships
	 * the category table beside it; without these exports the view silently
	 * falls back to a list that does not resemble the page.
	 */
	it("emits the category table the grid is drawn from", () => {
		const onDisk = readFileSync(SCHEDULE_18_CHECKED_IN, "utf8");
		expect(onDisk).toContain("AT1_SCHEDULE_18_CATEGORIES");
		expect(onDisk).toContain("AT1_SCHEDULE_18_COLUMNS");
		expect(onDisk).toContain("AT1_SCHEDULE_18_GRIDS");
		expect(AT1_SCHEDULE_18_CATEGORIES).toHaveLength(6);
	});

	/**
	 * Two grids, and the shares one numbers no column D.
	 *
	 * The page prints shares in a table of their own, leaves that table's
	 * column D blank of a line number, and strikes the shares gain BELOW it at
	 * 054 — after line 053 has added federal Schedule 6 line 160 in. Modelling
	 * 054 as the shares row's column D (which this did until the XFA template
	 * was read) loses line 053 from the form: the gain then reads as
	 * "002 - (022 + 042)" with the addition that is the entire reason 053 and
	 * 054 are two lines gone.
	 */
	it("keeps shares in their own grid, with no column D line", () => {
		const shares = AT1_SCHEDULE_18_CATEGORIES.filter(
			(c) => c.grid === "shares",
		);
		expect(shares).toHaveLength(1);
		expect(shares[0]?.label).toBe("Total of all shares");
		expect(
			shares[0]?.gainOrLoss,
			"the shares grid numbers no column D — 054 sits below it, after 053",
		).toBeUndefined();
		// Every other category IS numbered, in the second grid.
		for (const c of AT1_SCHEDULE_18_CATEGORIES.filter(
			(x) => x.grid === "properties",
		)) {
			expect(c.gainOrLoss, c.label).toBeDefined();
		}
	});

	/**
	 * Only column D differs between the two grids — and it does differ, so a
	 * single table drawn for all six categories prints one grid's heading over
	 * the other grid's rows.
	 */
	/**
	 * The tail of page 1 needs two things a sorted field list cannot give it.
	 *
	 * Line 076 is the schedule's LAST figure — the taxable capital gain struck
	 * from 099 — but numbers below 077-099, so ordering by line number prints
	 * "Taxable capital gain: Line 099 X 50%" six rows above line 099. And the
	 * page sets a heading over 077-079 that those lines genuinely need: "Add:
	 * Exemption threshold at time of disposal" and "Add: Total of all capital
	 * gains from the disposition of the actual property" say neither which
	 * property nor that the pair exists only for a donated flow-through share.
	 */
	it("carries the page's own order and its mid-block heading", () => {
		const onDisk = readFileSync(SCHEDULE_18_CHECKED_IN, "utf8");
		expect(onDisk).toContain("AT1_SCHEDULE_18_PRINTED_AFTER");
		expect(onDisk).toContain("AT1_SCHEDULE_18_BLOCK_HEADINGS");
		expect(AT1_SCHEDULE_18_PRINTED_AFTER["076"]).toBe("099");
		expect(
			AT1_SCHEDULE_18_BLOCK_HEADINGS.find((h) => h.aboveLine === "077")?.text,
		).toContain("flow-through share class of property");
	});

	/**
	 * The ABIL part is the form's one REPEATING table, and its column D is the
	 * figure line 094 is built from — struck per row and numbered nowhere. A
	 * layout that shipped only the fields leaves a view rendering 094 with
	 * nothing behind it, and no way to lay the rows out as rows.
	 */
	it("emits the ABIL table's columns, including the unnumbered one", () => {
		const onDisk = readFileSync(SCHEDULE_18_CHECKED_IN, "utf8");
		expect(onDisk).toContain("AT1_SCHEDULE_18_ABIL_COLUMNS");
		expect(onDisk).toContain("AT1_SCHEDULE_18_ABIL_TOTALS_LABEL");
		expect(AT1_SCHEDULE_18_ABIL_COLUMNS.map((c) => c.line)).toEqual([
			"082",
			"084",
			"086",
			"088",
			"090",
			"092",
			undefined,
		]);
		// Column D: lettered, but no line — the page numbers it nowhere.
		const d = AT1_SCHEDULE_18_ABIL_COLUMNS.at(-1);
		expect(d?.column).toBe("D");
		expect(d?.line).toBeUndefined();
		// Its bracketing is this part's own, not the page-1 grid's.
		expect(d?.heading).toBe("(Loss) Cols. A - (B + C)");
	});

	it("heads column D differently on each grid", () => {
		const [shares, properties] = AT1_SCHEDULE_18_GRIDS;
		expect(shares?.gainHeading).toBe("Col. A - (Cols. B + C)");
		expect(properties?.gainHeading).toBe(
			"Gain or (loss) Col. A - (Cols. B + C)",
		);
		expect(shares?.gainHeading).not.toBe(properties?.gainHeading);
	});
});

describe("the Schedule 10 paper layout is in step with AT1_SCHEDULE_10", () => {
	it("matches a fresh emit exactly", () => {
		const onDisk = readFileSync(SCHEDULE_10_CHECKED_IN, "utf8");
		expect(
			onDisk,
			"schedule10.layout.ts is stale — run `npx tsx scripts/emit-paper-layouts.ts`",
		).toBe(schedule10PaperLayout());
	});

	it("models farm and the checkbox-selected other-loss column, alongside non-capital and capital", () => {
		const lines = AT1_SCHEDULE_10.fields.map((f) => f.line.slice(3, 6));
		for (const modelled of [
			"012",
			"014",
			"016",
			"018",
			"020",
			"023",
			"025",
			"032",
			"034",
			"036",
			"038",
			"040",
		]) {
			expect(lines).toContain(modelled);
		}
	});
});

/**
 * AT1 Schedule 4 had no byte-for-byte guard at all — only federal T2SCH4 did,
 * and the two stringify to similar names.
 */
describe("the Schedule 4 (AT1) paper layout is in step with AT1_SCHEDULE_4", () => {
	it("matches a fresh emit exactly", () => {
		const onDisk = readFileSync(AT1_SCHEDULE_4_CHECKED_IN, "utf8");
		expect(
			onDisk,
			"at1/paper/generated/schedule4.layout.ts is stale — run `npx tsx scripts/emit-paper-layouts.ts`",
		).toBe(schedule4PaperLayout());
	});

	/**
	 * Eight columns, three of them unnumbered — and those three are the whole
	 * derivation. The view built its columns from the FIELDS alone, so it
	 * showed five: an "Allowable Credit" at H with none of C, D or G behind it.
	 */
	it("emits all eight columns, including the three with no line", () => {
		const onDisk = readFileSync(AT1_SCHEDULE_4_CHECKED_IN, "utf8");
		expect(onDisk).toContain("AT1_SCHEDULE_4_COLUMNS");
		expect(AT1_SCHEDULE_4_COLUMNS.map((c) => c.column)).toEqual([
			"A",
			"B",
			"C",
			"D",
			"E",
			"F",
			"G",
			"H",
		]);
		expect(
			AT1_SCHEDULE_4_COLUMNS.filter((c) => !c.line).map((c) => c.column),
			"C, D and G are the derivation behind H and the page numbers none of them",
		).toEqual(["C", "D", "G"]);
		// The page's own capital X for multiplication, not a lower-case x.
		expect(
			AT1_SCHEDULE_4_COLUMNS.find((c) => c.column === "D")?.heading,
		).toBe("B X C X (AT1 line 068 / AT1 line 066)");
	});
});

/**
 * AT1 Schedule 16 — the SR&ED expenditure pool, which this app could not file.
 *
 * ca-tax had the form, `computeAlbertaSchedule16` and `schedule16Values`, and
 * `alberta-return.ts` already pushed the payload whenever
 * `schedules.scientificResearch` existed. Nothing built that input: no
 * contract slice, no composer, no editor, no registry entry, and no emitted
 * layout — so a corporation with an Alberta SR&ED pool had nowhere to enter it
 * and nothing was transmitted. Every test called the builder directly, so none
 * of them noticed.
 */
describe("the Schedule 16 paper layout is in step with AT1_SCHEDULE_16", () => {
	it("matches a fresh emit exactly", () => {
		const onDisk = readFileSync(SCHEDULE_16_CHECKED_IN, "utf8");
		expect(
			onDisk,
			"schedule16.layout.ts is stale — run `npx tsx scripts/emit-paper-layouts.ts`",
		).toBe(schedule16PaperLayout());
	});

	it("carries all twelve lines, computed ones included", () => {
		const onDisk = readFileSync(SCHEDULE_16_CHECKED_IN, "utf8");
		const lines = [...onDisk.matchAll(/ {2}\{ line: "(\d+)"/g)].map(
			(m) => m[1] as string,
		);
		expect(lines.length).toBe(AT1_SCHEDULE_16.fields.length);
		expect(lines.length).toBe(12);
		// The three the preparer never types: subtotal, pool available, carry-forward.
		for (const computed of ["016016001", "016018001", "016022001"]) {
			expect(lines, computed).toContain(computed);
		}
	});

	/**
	 * Line 022 becomes NEXT year's line 012 — the pool's only continuity, and
	 * the thing the whole schedule exists to preserve. `AT1_SCHEDULE_16` exports
	 * the carry-forward line separately so a consumer cannot guess it.
	 */
	it("names the carry-forward line the pool continues through", async () => {
		const { AT1_SCHEDULE_16_CARRYFORWARD_LINE } = await import(
			"@classytic/ca-tax/t2"
		);
		expect(AT1_SCHEDULE_16_CARRYFORWARD_LINE).toContain("022");
	});
});

describe("the Schedule 20 paper layout is in step with AT1_SCHEDULE_20", () => {
	it("matches a fresh emit exactly", () => {
		const onDisk = readFileSync(SCHEDULE_20_CHECKED_IN, "utf8");
		expect(
			onDisk,
			"schedule20.layout.ts is stale — run `npx tsx scripts/emit-paper-layouts.ts`",
		).toBe(schedule20PaperLayout());
	});

	it("carries the carryforward-by-category block (090-100)", () => {
		expect(
			AT1_SCHEDULE_20.fields
				.filter((f) => f.section === "carryforward")
				.map((f) => f.line.slice(3, 6)),
		).toEqual(["090", "092", "094", "096", "098", "100"]);
	});

	/**
	 * The paragraph the page sets BETWEEN the gifts continuity and the
	 * carryforward table has to survive the emit, and has to stay out of
	 * `description`.
	 *
	 * `description` is our own guidance and renders inside the section card;
	 * this is the form's own words about something that is NOT in that card —
	 * the medicine-gift claim goes on Schedule 12, not here. Emitted into
	 * `printedBefore` so the view can set it outside both cards, which is where
	 * the page puts it.
	 */
	it("emits the printed instruction between the gifts and carryforward blocks", () => {
		const onDisk = readFileSync(SCHEDULE_20_CHECKED_IN, "utf8");
		expect(onDisk).toContain("printedBefore");
		expect(onDisk).toContain("additional deduction for gifts of medicine");

		const carryforward = AT1_SCHEDULE_20.sections.find(
			(s) => s.id === "carryforward",
		);
		expect(carryforward?.printedBefore).toMatch(/gifts of medicine/);
		// Not folded into the description, which would render it as our advice
		// about the table beneath it rather than the page's about Schedule 12.
		expect(carryforward?.description).not.toMatch(/line 660/);
	});
});

describe("the federal T2SCH130 paper layout is in step with T2_SCHEDULE_130", () => {
	it("matches a fresh emit exactly", () => {
		const onDisk = readFileSync(T2_SCHEDULE_130_CHECKED_IN, "utf8");
		expect(
			onDisk,
			"t2/paper/generated/schedule130.layout.ts is stale — run `npx tsx scripts/emit-paper-layouts.ts`",
		).toBe(t2Schedule130PaperLayout());
	});

	it("carries every field on the form, not just input ones", () => {
		const onDisk = readFileSync(T2_SCHEDULE_130_CHECKED_IN, "utf8");
		const lines = [...onDisk.matchAll(/ {2}\{ line: "(\d+)"/g)].map(
			(m) => m[1] as string,
		);
		expect(lines.length).toBe(T2_SCHEDULE_130.fields.length);
	});

	/**
	 * The 20 lettered sub-parts, each its own section. Schedule 130's line
	 * numbers restart within parts, so a line rendered under the wrong part is
	 * a different line of the form — the reason the definition sections by
	 * number band rather than by the part a caption cross-references.
	 */
	it("keeps all twenty sub-parts as sections", () => {
		const onDisk = readFileSync(T2_SCHEDULE_130_CHECKED_IN, "utf8");
		const sections = [
			...onDisk.matchAll(/\{ id: "([a-z0-9-]+)", title: "Part /g),
		];
		expect(sections.length).toBe(T2_SCHEDULE_130.sections.length);
	});
});

/**
 * Every emitted layout must be READ by something.
 *
 * `schedule50.layout.ts` was emitted on every run and imported by nothing: the
 * Schedule 50 paper view retyped its four columns by hand instead. A generated
 * file nobody reads is drift with the detector switched off — the emitter keeps
 * it in step with the package while the screen quietly shows something else.
 */
describe("no generated paper layout is orphaned", () => {
	it("every emitted layout is imported by a hand-written view", () => {
		const orphans: string[] = [];
		for (const generatedDir of [PAPER_DIR, T2_PAPER_DIR, CO17_PAPER_DIR]) {
			// The hand-written views sit one level up from `generated/`.
			const viewDir = generatedDir.replace(/\/generated$/, "");
			const views = readdirSync(viewDir)
				.filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"))
				.map((f) => readFileSync(`${viewDir}/${f}`, "utf8"))
				.join("\n");
			for (const file of readdirSync(generatedDir).filter((f) =>
				f.endsWith(".layout.ts"),
			)) {
				const importPath = `generated/${file.replace(/\.ts$/, "")}`;
				if (!views.includes(importPath))
					orphans.push(`${generatedDir}/${file}`);
			}
		}
		expect(
			orphans,
			"emitted but never imported — wire the view to it or stop emitting it",
		).toEqual([]);
	});

	/**
	 * …and every hand-written VIEW is rendered by something.
	 *
	 * The check above asks whether a view imports each emitted layout, which is
	 * one link short. `at1/paper/schedule13-form-view.tsx` — the Alberta CCA
	 * grid — imported its layout quite happily and was itself rendered by
	 * nothing: the guided editor collected `albertaOpeningUCC` and
	 * `albertaClaim`, the engine computed Schedule 13 from them, and the only
	 * screen showing that schedule as TRA prints it was never mounted. `t2/cca.ts`
	 * pointed `formView` at the federal `Schedule8FormView` alone.
	 *
	 * That is the SECOND time this exact defect appeared on this exact shape of
	 * schedule — one guided slice shared by T2 and AT1, two single-purpose
	 * views, `formView` wired to the federal one. `ReservesFormView` was written
	 * to fix the first (federal S13 reserves + Alberta S17). Nothing noticed the
	 * second for as long as it existed, so the check now covers the whole chain.
	 */
	it("every hand-written paper view is rendered by some schedule or wrapper", () => {
		/*
		 * Searched over the whole `return/` tree, not just `_config/schedules`.
		 * Schedules 2 and 10 have no registry entry at all — they are read-only
		 * forms with no editable slice, special-cased straight into
		 * `components/return-editor.tsx` alongside the jacket. A check scoped to
		 * the schedules directory calls both of them dead, which is how a test
		 * meant to catch unreachable views ends up pointing at the wrong two.
		 */
		const files: string[] = [];
		const walk = (dir: string) => {
			for (const e of readdirSync(dir, { withFileTypes: true })) {
				if (e.name === "generated" || e.name === "node_modules") continue;
				const p = `${dir}/${e.name}`;
				if (e.isDirectory()) walk(p);
				else if (p.endsWith(".ts") || p.endsWith(".tsx")) files.push(p);
			}
		};
		walk(RETURN_DIR);

		const views = files.filter((p) => /-(form-)?view\.tsx$/.test(p));
		const unrendered = views.filter((view) => {
			const stem = view.split("/").pop()?.replace(/\.tsx$/, "") ?? "";
			// A view importing ITSELF proves nothing, so its own file is excluded.
			return !files.some((p) => p !== view && readFileSync(p, "utf8").includes(stem));
		});

		expect(
			unrendered,
			"written but rendered by nothing — wire it into a schedule's formView (or a wrapper, as CcaFormView/ReservesFormView do) or delete it",
		).toEqual([]);
	});
});

describe("the Québec CO-17 paper layout is in step with CO17_RETURN", () => {
	it("matches a fresh emit exactly", () => {
		const onDisk = readFileSync(CO17_CHECKED_IN, "utf8");
		expect(
			onDisk,
			"co17/paper/generated/co17.layout.ts is stale — run `npx tsx scripts/emit-paper-layouts.ts`",
		).toBe(co17PaperLayout());
	});

	/**
	 * Revenu Québec numbers its own boxes and some carry a letter suffix. Any
	 * downstream code that assumes a three-digit numeric line drops these.
	 */
	it("keeps the lettered box identifiers Revenu Québec actually prints", () => {
		const onDisk = readFileSync(CO17_CHECKED_IN, "utf8");
		for (const box of ["01a", "250a", "420c", "420d", "421a", "440b"]) {
			expect(onDisk).toContain(`line: "${box}"`);
		}
	});

	it("carries every box on the form, not just the entered ones", () => {
		const onDisk = readFileSync(CO17_CHECKED_IN, "utf8");
		const boxes = [...onDisk.matchAll(/ {2}\{ line: "([0-9a-z]+)"/g)];
		expect(boxes.length).toBe(CO17_RETURN.fields.length);
	});
});

describe("the federal T2SCH3, T2SCH4 and T2SCH7 paper layouts are in step", () => {
	const CASES: readonly [
		name: string,
		path: string,
		emit: () => string,
		fields: number,
	][] = [
		[
			"schedule3",
			T2_SCHEDULE_3_CHECKED_IN,
			t2Schedule3PaperLayout,
			T2_SCHEDULE_3.fields.length,
		],
		[
			"schedule4",
			T2_SCHEDULE_4_CHECKED_IN,
			t2Schedule4PaperLayout,
			T2_SCHEDULE_4.fields.length,
		],
		[
			"schedule7",
			T2_SCHEDULE_7_CHECKED_IN,
			t2Schedule7PaperLayout,
			T2_SCHEDULE_7.fields.length,
		],
	];

	for (const [name, path, emit, count] of CASES) {
		it(`${name} matches a fresh emit exactly`, () => {
			expect(
				readFileSync(path, "utf8"),
				`t2/paper/generated/${name}.layout.ts is stale — run \`npx tsx scripts/emit-paper-layouts.ts\``,
			).toBe(emit());
		});

		it(`${name} carries every field on the form`, () => {
			const onDisk = readFileSync(path, "utf8");
			const lines = [...onDisk.matchAll(/ {2}\{ line: "(\d+)"/g)];
			expect(lines.length).toBe(count);
		});
	}

	/**
	 * Part 7 — limited partnership losses — is the part extraction cannot see,
	 * and the part this screen used to tell preparers was not on the form.
	 */
	it("Schedule 4 reaches the interface with Part 7 intact", () => {
		const onDisk = readFileSync(T2_SCHEDULE_4_CHECKED_IN, "utf8");
		expect(onDisk).toContain('id: "limited-partnership"');
		for (const line of ["600", "620", "650", "680"]) {
			expect(onDisk).toContain(`line: "${line}"`);
		}
		// And the farm lines extraction had filed under Part 1.
		const farmBlock = onDisk.slice(onDisk.indexOf('line: "330"'));
		expect(farmBlock.slice(0, 400)).toContain('section: "farm"');
	});
});

describe("the federal jacket and Schedule 141 paper layouts are in step", () => {
	it("the jacket matches a fresh emit exactly", () => {
		expect(
			readFileSync(`${T2_PAPER_DIR}/jacket.layout.ts`, "utf8"),
			"t2/paper/generated/jacket.layout.ts is stale — run `npx tsx scripts/emit-paper-layouts.ts`",
		).toBe(t2JacketPaperLayout());
	});

	/**
	 * Page 1 was unmodelled until the identification block was hand-authored,
	 * because the jacket extractor reads two-column pages by stitching both
	 * columns into one caption. These are the lines that block carries.
	 */
	it("the jacket carries its identification page, and none of it as money", () => {
		const onDisk = readFileSync(`${T2_PAPER_DIR}/jacket.layout.ts`, "utf8");
		expect(onDisk).toContain('id: "identification"');
		for (const line of ["001", "002", "040", "060", "061", "080"]) {
			expect(onDisk).toContain(`line: "${line}"`);
		}
		const identification = T2_JACKET.fields.filter(
			(f) => f.section === "identification",
		);
		expect(identification.filter((f) => f.kind === "money")).toEqual([]);
	});

	it("Schedule 141 matches a fresh emit exactly", () => {
		expect(
			readFileSync(`${T2_PAPER_DIR}/schedule141.layout.ts`, "utf8"),
			"t2/paper/generated/schedule141.layout.ts is stale — run `npx tsx scripts/emit-paper-layouts.ts`",
		).toBe(t2Schedule141PaperLayout());
	});

	it("Schedule 141 carries all five parts, not just the four questions we ask", () => {
		const onDisk = readFileSync(
			`${T2_PAPER_DIR}/schedule141.layout.ts`,
			"utf8",
		);
		const lines = [...onDisk.matchAll(/ {2}\{ line: "(\d+)"/g)];
		expect(lines.length).toBe(T2_SCHEDULE_141.fields.length);
		// Part 1 asks who prepared the STATEMENTS; Part 5 asks who prepared the
		// RETURN. Same shape of question, different answer.
		expect(onDisk).toContain('id: "preparer"');
		expect(onDisk).toContain('id: "return-preparer"');
	});
});

/**
 * The formatter must not be able to reach a generated layout.
 *
 * These files have to stay byte-identical to what the emitter writes, and the
 * drift tests above are what notice when they do not. But noticing is late: a
 * routine `biome check --write` over the app rewrote every one of them at once
 * — import order, line wrapping, trailing commas — and turned a green suite red
 * in a way that looks like the ENGINE drifted rather than like a formatter ran.
 *
 * So the generated directory is excluded in `biome.json`, and this is the test
 * that fails if that exclusion is ever dropped. It checks the config rather than
 * the files, because by the time the files are wrong the damage is done.
 */
describe("the formatter cannot rewrite a generated layout", () => {
	it("biome.json excludes every paper/generated directory", () => {
		const config = JSON.parse(readFileSync("biome.json", "utf8")) as {
			files?: { includes?: string[] };
		};
		expect(
			config.files?.includes,
			"removing this exclusion lets `biome check --write` rewrite the emitted layouts",
		).toContain("!**/paper/generated/**");
	});

	/**
	 * `_lib/return-input.ts` is generated too — by the SERVER's
	 * `scripts/emit-return-input.ts`, which writes across the repo boundary into
	 * this app so the editor's field types cannot drift from the Zod contracts
	 * the API validates against. Its drift guard lives over there
	 * (`apps/server/tests/return-input-drift.test.ts`), which is exactly why the
	 * exclusion here was missed: nothing in this app's own tree looks generated,
	 * the file sits in an ordinary `_lib/` beside hand-written modules, and it
	 * was duly reformatted by a whole-app `biome check --write` — 43 lines of
	 * pure re-wrapping inside a real feature diff, which is the worst place for
	 * it to hide.
	 *
	 * The fix is the same as above: keep the formatter away from it, and re-run
	 * the emitter if it ever does get rewritten.
	 */
	it("biome.json excludes the emitted return-input contract", () => {
		const config = JSON.parse(readFileSync("biome.json", "utf8")) as {
			files?: { includes?: string[] };
		};
		expect(
			config.files?.includes,
			"removing this exclusion lets `biome check --write` rewrite the emitted ReturnInput types, and the drift test that notices lives in apps/server",
		).toContain("!**/return/_lib/return-input.ts");
	});
});
