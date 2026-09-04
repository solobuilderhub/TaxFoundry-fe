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
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
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
	T2_SCHEDULE_1,
	T2_SCHEDULE_13,
} from "@classytic/ca-tax/t2";
import {
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
	t2Schedule1PaperLayout,
	t2Schedule13PaperLayout,
} from "../scripts/emit-paper-layouts";

const SCHEDULES_DIR = "app/dashboard/engagements/[id]/return/_config/schedules";
const PAPER_DIR = `${SCHEDULES_DIR}/at1/paper/generated`;
const T2_PAPER_DIR = `${SCHEDULES_DIR}/t2/paper/generated`;

const NET_INCOME_CHECKED_IN = `${SCHEDULES_DIR}/t2/net-income.ts`;
const T2_SCHEDULE_1_CHECKED_IN = `${T2_PAPER_DIR}/schedule1.layout.ts`;
const T2_SCHEDULE_13_CHECKED_IN = `${T2_PAPER_DIR}/schedule13.layout.ts`;
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
		expect(onDisk, "net-income.ts is stale — run `npx tsx scripts/emit-paper-layouts.ts`").toBe(
			netIncomeSchedule(),
		);
	});

	it("names every field for the CRA line it is transmitted under", () => {
		const onDisk = readFileSync(NET_INCOME_CHECKED_IN, "utf8");
		const named = [...onDisk.matchAll(/"lines\.(\d{3})"/g)].map((m) => m[1] as string);
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
		const lines = [...onDisk.matchAll(/ {2}\{ line: "(\d+)"/g)].map((m) => m[1] as string);
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
		const lines = [...onDisk.matchAll(/ {2}\{ line: "(\d+)"/g)].map((m) => m[1] as string);
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
		expect(onDisk, "jacket.layout.ts is stale — run `npx tsx scripts/emit-paper-layouts.ts`").toBe(
			jacketPaperLayout(),
		);
	});

	it("carries every field on the form, not just input ones", () => {
		const onDisk = readFileSync(JACKET_CHECKED_IN, "utf8");
		const lines = [...onDisk.matchAll(/ {2}\{ line: "(\d+)"/g)].map((m) => m[1] as string);
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
		const keys = [...onDisk.matchAll(/key: "([a-z-]+)"/g)].map((m) => m[1] as string);
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
		const columns = [...onDisk.matchAll(/column: (\d+),/g)].map((m) => Number(m[1]));
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
		const labels = [...onDisk.matchAll(/label: "([^"]+)"/g)].map((m) => m[1] as string);
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
		const lines = [...onDisk.matchAll(/ {2}\{ line: "(\d+)"/g)].map((m) => m[1] as string);
		expect(lines.length).toBe(6 + AT1_SCHEDULE_12_PAIRS.length * 2);
	});
});

describe("the Schedule 1 (AT1) paper layout is in step with AT1_SCHEDULE_1", () => {
	it("matches a fresh emit exactly", () => {
		const onDisk = readFileSync(SCHEDULE_1_CHECKED_IN, "utf8");
		expect(onDisk, "schedule1.layout.ts is stale — run `npx tsx scripts/emit-paper-layouts.ts`").toBe(
			schedule1PaperLayout(),
		);
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
		expect(onDisk, "schedule2.layout.ts is stale — run `npx tsx scripts/emit-paper-layouts.ts`").toBe(
			schedule2PaperLayout(),
		);
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
