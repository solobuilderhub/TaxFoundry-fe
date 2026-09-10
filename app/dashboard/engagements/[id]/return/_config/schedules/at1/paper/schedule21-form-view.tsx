"use client";

import type { FieldComponentProps } from "@classytic/formkit";
import { createElement } from "react";
import type { Control } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type {
	AlbertaContinuityValues,
	ReturnInput,
} from "../../../../_lib/return-input";
import {
	LimitedPartnershipTable,
	NonCapitalVintageTable,
	OtherLossVintageTable,
	RifeContinuitySection,
} from "../alberta-loss-vintage-tables";
import { parseAt1LineItemId } from "./at1-lines";
import {
	PaperContinuityGrid,
	PaperFootnotes,
	PaperLeaderRow,
	PaperSection,
} from "./components/paper-primitives";
import {
	AT1_SCHEDULE_21_FIELDS,
	AT1_SCHEDULE_21_FOOTNOTES,
	AT1_SCHEDULE_21_POOL_TABLE,
} from "./generated/schedule21.layout";
import type { LineValue, NavigateToLine, ResolveLine } from "./resolve-line";

const SCHEDULE_ID = "021";

/**
 * The T2 figures Part 1 reads, and the ONE place the working return keeps
 * each — the same slot Schedule 12's Area B reads, so an edit made in this
 * box is an edit to Schedule 12 too, and to what the engine files on both.
 *
 * §3.2.3.21 names each source ("Value must equal fed 200320", …). A preparer
 * whose T2 was prepared elsewhere has no T2 in this app for these to come
 * from, so each line is shown locked with a toggle to type the figure in.
 */
const PART_1_T2_SLOTS: Record<string, { path: string; label: string }> = {
	"005": {
		path: "albertaSchedule12.taxableDividendsDeductible",
		label: "T2 line 320",
	},
	"007": {
		path: "albertaSchedule12.partVI1TaxDeductible",
		label: "T2 line 325",
	},
	"011": { path: "albertaSchedule12.prospectorsShares", label: "T2 line 350" },
	"012": {
		path: "albertaSchedule12.nonQualifiedSecuritiesDeduction",
		label: "T2 line 352",
	},
	// Alberta's own additions — the figure Schedule 12 line 082 carries — which
	// default to federal T2 line 355 when blank.
	"017": {
		path: "albertaSchedule12.albertaSection110_5Additions",
		label: "Alberta s.110.5 additions (defaults to T2 line 355)",
	},
};

/**
 * 019 is the one T2-derived line whose slot is on THIS schedule's own form —
 * the farm pool's current-year loss override — so it binds through `control`
 * and is saved with the schedule, rather than written straight to the return.
 */
const PART_1_OWN_SLOTS: Record<string, { name: string; label: string }> = {
	"019": { name: "farmCurrentYearLoss", label: "federal Schedule 4 line 310" },
};

/** Part 1's deductions, summed into 013 — "Subtotal of lines 002 to 012". */
const PART_1_DEDUCTIONS = ["002", "003", "005", "007", "011", "012"] as const;

const valueAt = (ri: ReturnInput | undefined, path: string): number | undefined => {
	let cur: unknown = ri;
	for (const k of path.split(".")) cur = (cur as Record<string, unknown> | undefined)?.[k];
	return typeof cur === "number" ? cur : undefined;
};

/**
 * One filed-payload lookup for the whole schedule — Part 1 and the continuity
 * grid's computed/carried-in rows.
 *
 * Part 1 gets three things the grid does not:
 *
 *   linked T2 lines   005/007/011/012/017 (and 019, on this form) are shown
 *                     locked with a toggle — see `LinkedSlot`. Only when the
 *                     host can write the return (`writeInput`); without it the
 *                     line is plain read-only, never a box that cannot save.
 *   013 and 015       subtotals the form prints but the specification gives no
 *                     line code, so they are never filed and never arrive in
 *                     the payload. Worked here from the filed lines, with the
 *                     form's own arithmetic, so the printed shape reads through
 *                     — a view of what was filed, not a second calculation.
 *   the rest          001, 002, 003, 021 are computed by the engine and read
 *                     straight off the payload.
 */
function buildResolveLine(
	computed: ComputedReturn | undefined,
	returnInput?: ReturnInput,
	writeInput?: (path: string, value: number | undefined) => Promise<void>,
): ResolveLine {
	const filed = computed?.schedulePayloads?.find(
		(p) => p.scheduleId === SCHEDULE_ID,
	);
	const filedByField = new Map(
		(filed?.values ?? []).flatMap((v) => {
			const parsed = parseAt1LineItemId(v.lineItemId);
			return parsed ? [[parsed.field, v.value] as const] : [];
		}),
	);
	const num = (field: string) => {
		const v = filedByField.get(field);
		return typeof v === "number" ? v : 0;
	};
	// Only once the schedule has actually been computed — before that there is
	// nothing to sum, and a 0 would read as a computed nil.
	const subtotal013 = filed
		? PART_1_DEDUCTIONS.reduce((n, f) => n + num(f), 0)
		: undefined;

	return (line: string): LineValue => {
		const field = parseAt1LineItemId(line)?.field ?? line;
		if (field === "013") return { editable: false, value: subtotal013 };
		if (field === "015") {
			return {
				editable: false,
				value:
					subtotal013 === undefined
						? undefined
						: Math.min(0, num("001") - subtotal013) + 0,
			};
		}
		const value = filedByField.get(field) as string | number | undefined;
		const t2 = PART_1_T2_SLOTS[field];
		if (t2 && writeInput) {
			return {
				editable: false,
				value,
				linked: {
					backing: "global",
					path: t2.path,
					label: t2.label,
					stored: valueAt(returnInput, t2.path),
					write: (v) => writeInput(t2.path, v),
				},
			};
		}
		const own = PART_1_OWN_SLOTS[field];
		if (own) {
			return {
				editable: false,
				value,
				linked: { backing: "own", name: own.name, label: own.label },
			};
		}
		return { editable: false, value };
	};
}

/**
 * `LimitedPartnershipTable`/`NonCapitalVintageTable`/`OtherLossVintageTable`/
 * `RifeContinuitySection` are typed for the full
 * `FieldComponentProps<AlbertaContinuityValues>` (the shape `field.custom`
 * hands them) but only ever destructure `control` and `disabled` (plus
 * `onNavigate`, which `LimitedPartnershipTable` alone accepts, for its
 * carries-to-Schedule-12 badge) — confirmed by reading all four. This builds
 * just enough of that shape to satisfy the type without fabricating a fake
 * `field`/`error`/etc.
 */
function tableProps(
	control: Control<AlbertaContinuityValues>,
	onNavigate: NavigateToLine | undefined,
	disabled?: boolean,
): FieldComponentProps<AlbertaContinuityValues> & {
	onNavigate?: NavigateToLine;
} {
	return {
		control,
		onNavigate,
		disabled,
	} as FieldComponentProps<AlbertaContinuityValues> & {
		onNavigate?: NavigateToLine;
	};
}

/**
 * Pool key → this schedule's field-name prefix. Not a 1:1 slug transform —
 * the editor calls the fifth pool `lpp`, not `listedPersonal`, matching how
 * the printed form's own "Listed personal property" abbreviates on the page.
 */
const PREFIX: Record<string, string> = {
	"non-capital": "nonCapital",
	capital: "capital",
	farm: "farm",
	"restricted-farm": "restrictedFarm",
	"listed-personal": "lpp",
};

/**
 * Which `AlbertaContinuityValues` field one pool's row actually binds to.
 * `undefined` means this app doesn't collect that (pool, row) as a simple
 * money field — either it's genuinely not collected yet, it's derived rather
 * than entered (e.g. "closing" is always computed), or it's collected
 * through a different UI shape the grid can't render as one cell (capital's
 * carry-back is an array of {taxYearEnd, amount} rows, below this grid, not
 * a single number here). The grid only calls this for a (pool, row) pair
 * that genuinely exists in `AT1_SCHEDULE_21_POOL_TABLE`, so a pool lacking a
 * row (e.g. capital has no "expired") never reaches this function for it.
 */
function fieldName(poolKey: string, rowKind: string): string | undefined {
	const p = PREFIX[poolKey];
	if (!p) return undefined;
	const isLpp = poolKey === "listed-personal";
	switch (rowKind) {
		case "carriedForward":
			return `${p}Opening`; // the editor's own field label cites this as "(line 031)" etc — the carried-forward line, not the separate "beginning of year" line
		case "expired":
			return `${p}Expired`;
		case "windUpTransfer":
			return `${p}WindUpTransfer`;
		case "currentYearLoss":
			if (isLpp) return "lppCurrentYearLoss";
			if (poolKey === "farm" || poolKey === "restricted-farm")
				return `${p}CurrentYearLoss`;
			return undefined; // non-capital/capital derive this automatically — see alberta-continuity.ts's module doc comment
		case "appliedAgainstIncome":
			return isLpp ? "lppApplied" : `${p}Applied`;
		case "section80Adjustment":
			return `${p}Section80Adjustment`;
		case "otherAdjustments":
			return `${p}OtherAdjustments`;
		/**
		 * Capital's line 059 — an allowable business investment loss that has
		 * expired and so becomes a net capital loss. Deliberately unbound: the
		 * row renders (the page prints it, so this view prints it) but reads
		 * "not collected", because there is no field for it to bind to.
		 *
		 * It must NOT be bound to `capitalExpired`, the one field whose name
		 * looks like a fit. 059 is an ADDITION — it sits in the "Add:" block
		 * above the Subtotal rule and grows the pool — while `capitalExpired`
		 * is fed to the engine as the continuity's `expired`, which DEDUCTS.
		 * Wiring the two together would file the preparer's figure with the
		 * sign reversed and still foot, which is the failure mode this
		 * schedule can least afford. Collecting it properly needs a new
		 * additive input on the contract AND on the engine's
		 * `LossContinuityInput` (whose only ADDS-to-pool slot today is
		 * `windUpTransfer`) — a ca-tax change, not an app-side one.
		 */
		case "abilExpired":
			return undefined;
		default:
			return undefined; // "opening" (033-style), "carryBack", "closing" — not a simple per-pool field in this app
	}
}

/**
 * The full row order + captions, derived from the generated pool table rather
 * than hand-typed — no separate copy to drift.
 *
 * The merge preserves EVERY pool's own row order, not just the first pool's.
 * This used to take the first pool's order and append whatever later pools
 * added, which put a row belonging to one pool alone at the bottom of the
 * block instead of where the page prints it: capital's allowable business
 * investment loss (059) is the only such row, it sits between "Current year
 * loss" and the Subtotal rule on page 1, and appending it dropped it below
 * the closing balance — a position the form has no row in at all.
 *
 * So each pool's rows are spliced in after the last kind that pool shares
 * with the order built so far, rather than pushed onto the end.
 */
const ROW_ORDER = (() => {
	const rows: { kind: string; caption: string }[] = [];
	for (const pool of AT1_SCHEDULE_21_POOL_TABLE) {
		// Where this pool's next not-yet-merged row belongs: just after the
		// previous row of its own that the merged order already carries.
		let at = 0;
		for (const row of pool.rows) {
			const seen = rows.findIndex((r) => r.kind === row.kind);
			if (seen === -1) {
				rows.splice(at, 0, { kind: row.kind, caption: row.caption });
				at += 1;
			} else {
				at = seen + 1;
			}
		}
	}
	return rows;
})();

/**
 * AT1 Schedule 21 paper Form View — the printed form's page 1-2 continuity
 * grid (one column per pool), followed by the limited-partnership table, the
 * two by-year-of-origin vintage tables, and page 5's RIFE continuity — all
 * reusing the SAME components the guided editor already uses for them
 * (they're already form-shaped; only their position on the page changes
 * here).
 *
 * Computed / carried-in rows (closing balance, opening-net-of-expiry,
 * non-capital's current-year loss, capital's current-year loss) DO render as
 * real grid cells now, read from the same filed-payload lookup as Part 1
 * above (`resolveLine`, threaded into `PaperContinuityGrid`) — they used to
 * fall through to a "not collected" placeholder because the grid had no way
 * to read a filed value at all, not because the figure wasn't real. RIFE's
 * own derived lines (310/340/350/250) are different again — never filed at
 * all (see `RifeContinuitySection`'s doc comment), so they're computed
 * live from the watched inputs instead of resolved from a payload.
 */
/**
 * The form's own grouping of the five pools, in page order.
 *
 * Page 1 sets non-capital beside capital; page 2 sets farm beside restricted
 * farm and then gives listed personal property a block of its own. The pairing
 * is not arbitrary — each pair shares a row set and a "Deduct:" line that the
 * other pairs do not.
 */
const CONTINUITY_BLOCKS: readonly {
	title: string;
	description?: string;
	pools: readonly string[];
	/**
	 * The row kind the block's "Subtotal" rule follows — per block, because
	 * the additions block does not end on the same row in all three. Page 1
	 * ends on capital's allowable business investment loss (059), which the
	 * other two blocks do not have; they end on the current-year loss.
	 */
	dividerAfter: readonly string[];
}[] = [
	{
		title: "Continuity of losses — non-capital and capital",
		description:
			"Page 1. Capital losses are the gross amount, and the allowable business investment loss row belongs to this block alone.",
		pools: ["non-capital", "capital"],
		dividerAfter: ["abilExpired"],
	},
	{
		title: "Continuity of losses — farm and restricted farm",
		description:
			"Page 2. A farm loss is applied against taxable income; a restricted farm loss only against farming income, which is why the two carry forward to different Schedule 12 lines.",
		pools: ["farm", "restricted-farm"],
		dividerAfter: ["currentYearLoss"],
	},
	{
		title: "Continuity of losses — listed personal property",
		description:
			"Page 2, its own block. Seven-year expiry, applied only against listed personal property gains, and no wind-up transfer or section 80 adjustment.",
		pools: ["listed-personal"],
		dividerAfter: ["currentYearLoss"],
	},
];

export function Schedule21FormView({
	control,
	disabled,
	computed,
	onNavigate,
	highlightLine,
	returnInput,
	writeInput,
}: {
	control: Control<Record<string, unknown>>;
	disabled?: boolean;
	computed?: ComputedReturn;
	onNavigate?: NavigateToLine;
	highlightLine?: string;
	returnInput?: ReturnInput;
	writeInput?: (path: string, value: number | undefined) => Promise<void>;
}) {
	const c = control as unknown as Control<AlbertaContinuityValues>;
	// Same lookup for both Part 1 (already read-only throughout) and the
	// continuity grid's computed/carried-in rows — one filed-payload map
	// for the whole schedule, not two.
	const resolvePart1Line = buildResolveLine(computed, returnInput, writeInput);
	const part1Fields = AT1_SCHEDULE_21_FIELDS.filter(
		(f) => f.section === "current-year",
	);

	return (
		<div className="space-y-4">
			<PaperSection
				title="Calculation of current year non-capital loss"
				description="Starts from Alberta net income on Schedule 12 line 054 and works down through the Division C deductions to the loss for the year. The T2 figures (violet) are kept once for the whole return — unlock one with its pencil to type it in when the T2 was not prepared here. Everything else is computed; 013 and 015 are print-only subtotals. Line 021 is a negative amount, carried to line 037 as a positive."
				formId="AT1SCH21"
			>
				{part1Fields.map((f) => (
					<PaperLeaderRow
						key={f.line}
						line={parseAt1LineItemId(f.line)?.field ?? f.line}
						caption={f.caption}
						kind={f.kind}
						role={f.role}
						note={f.note}
						from={f.from}
						to={f.to}
						onNavigate={onNavigate}
						highlightLine={highlightLine}
						control={c}
						resolveLine={resolvePart1Line}
						disabled={disabled}
					/>
				))}
			</PaperSection>
			{/*
			 * Three blocks, because the form has three.
			 *
			 * This used to be one grid with all five pools side by side, which is
			 * not how the page is laid out and not how the pools behave. Page 1
			 * carries non-capital beside capital; page 2 carries farm beside
			 * restricted farm, then listed personal property on its own. The row
			 * sets differ — an allowable business investment loss exists only for
			 * capital, and listed personal property has no wind-up transfer and no
			 * section 80 adjustment — so a single grid had to show a dash wherever a
			 * pool lacked a row, and had to crowd three different destinations onto
			 * one "Applied against income" line. Each block now shows only the rows
			 * its own pools have, and each carry-forward sits on the row that
			 * actually carries it.
			 *
			 * `dividerAfter` is the plain "Subtotal" rule the form prints between the
			 * additions and the "Deduct:" block. Not a numbered line — pure print
			 * layout, confirmed against the TRA spec (no field for it in §3.2.3.21).
			 */}
			{CONTINUITY_BLOCKS.map((block) => (
				<PaperSection
					key={block.title}
					title={block.title}
					description={block.description}
				>
					<div className="p-2">
						<PaperContinuityGrid
							pools={AT1_SCHEDULE_21_POOL_TABLE.filter((p) =>
								block.pools.includes(p.key),
							)}
							rowOrder={ROW_ORDER}
							control={c}
							fieldName={fieldName}
							disabled={disabled}
							onNavigate={onNavigate}
							highlightLine={highlightLine}
							resolveLine={resolvePart1Line}
							dividerAfter={block.dividerAfter}
							footnotes={AT1_SCHEDULE_21_FOOTNOTES}
						/>
					</div>
				</PaperSection>
			))}
			<PaperFootnotes notes={AT1_SCHEDULE_21_FOOTNOTES} />
			<PaperSection
				title="Continuity of limited partnership losses"
				description="A sixth pool, laid out per partnership rather than by jurisdiction."
			>
				<div className="p-3">
					{createElement(LimitedPartnershipTable, tableProps(c, onNavigate))}
				</div>
			</PaperSection>
			<PaperSection
				title="Non-capital losses by year of origin"
				description="The current year's row is derived from the grid above; only prior vintages are entered here."
			>
				<div className="p-3">
					{createElement(NonCapitalVintageTable, tableProps(c, onNavigate))}
				</div>
			</PaperSection>
			<PaperSection title="Farm, restricted farm & listed personal property losses by year of origin">
				<div className="p-3">
					{createElement(OtherLossVintageTable, tableProps(c, onNavigate))}
				</div>
			</PaperSection>
			<PaperSection
				title="Continuity of restricted interest and financing expenses (RIFE)"
				description="Page 5 of the printed form — a separate continuity from the five pools above. Not part of Schedule 21's own filed payload; line 240 feeds AT1 Schedule 12 line 130 directly."
			>
				<div className="p-3">
					{createElement(
						RifeContinuitySection,
						tableProps(c, onNavigate, disabled),
					)}
				</div>
			</PaperSection>
		</div>
	);
}
