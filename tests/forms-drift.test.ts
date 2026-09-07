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
	AT1_SCHEDULE_10,
	AT1_SCHEDULE_12_PAIRS,
	AT1_SCHEDULE_13_COLUMNS,
	AT1_SCHEDULE_17_RESERVES,
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
	schedule10PaperLayout,
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

const SCHEDULES_DIR = "app/dashboard/engagements/[id]/return/_config/schedules";
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
const SCHEDULE_20_CHECKED_IN = `${PAPER_DIR}/schedule20.layout.ts`;

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

	it("omits the 5 unnumbered arithmetic columns the form shows but does not ask for", () => {
		const onDisk = readFileSync(SCHEDULE_13_CHECKED_IN, "utf8");
		const columns = [...onDisk.matchAll(/column: (\d+),/g)].map((m) =>
			Number(m[1]),
		);
		const numbered = AT1_SCHEDULE_13_COLUMNS.filter((c) => c.line).length;
		expect(columns.length).toBe(numbered);
		expect(columns).not.toContain(10);
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

	it("has a federal AND an Alberta field for every reconciling pair", () => {
		const onDisk = readFileSync(SCHEDULE_12_CHECKED_IN, "utf8");
		const lines = [...onDisk.matchAll(/ {2}\{ line: "(\d+)"/g)].map(
			(m) => m[1] as string,
		);
		expect(lines.length).toBe(6 + AT1_SCHEDULE_12_PAIRS.length * 2);
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

	it("carries only Area A's 4 lines", () => {
		expect(AT1_SCHEDULE_2.fields).toHaveLength(4);
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
});
