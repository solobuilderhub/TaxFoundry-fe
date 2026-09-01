"use client";

import type { FieldComponentProps } from "@classytic/formkit";
import { createElement } from "react";
import type { Control } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type { AlbertaContinuityValues } from "../../../../_lib/return-input";
import { LimitedPartnershipTable, NonCapitalVintageTable, OtherLossVintageTable } from "../alberta-loss-vintage-tables";
import { parseAt1LineItemId } from "./at1-lines";
import { PaperContinuityGrid, PaperFootnotes, PaperLeaderRow, PaperSection } from "./components/paper-primitives";
import { AT1_SCHEDULE_21_FIELDS, AT1_SCHEDULE_21_FOOTNOTES, AT1_SCHEDULE_21_POOL_TABLE } from "./generated/schedule21.layout";
import type { LineValue, NavigateToLine, ResolveLine } from "./resolve-line";

const SCHEDULE_ID = "021";

/**
 * Part 1 (lines 001-021, "Calculation of Current Year Non-Capital Loss") has
 * no editable field of its own anywhere in this app — every one of its
 * inputs (002/003/005/007/011/012/017/019) is a deduction/addition this
 * engine does not collect as a distinct entry point yet (they fold into the
 * federal figures Schedule 12 already reconciles). All of it is read-only
 * here, sourced from the last computed return — genuinely absent, not
 * guessed, matching the same rule the rest of this paper view already
 * follows for anything this product doesn't collect.
 */
function buildResolveLine(computed: ComputedReturn | undefined): ResolveLine {
	const filed = computed?.schedulePayloads?.find((p) => p.scheduleId === SCHEDULE_ID);
	const filedByField = new Map(
		(filed?.values ?? []).flatMap((v) => {
			const parsed = parseAt1LineItemId(v.lineItemId);
			return parsed ? [[parsed.field, v.value] as const] : [];
		}),
	);
	return (line: string): LineValue => {
		const field = parseAt1LineItemId(line)?.field ?? line;
		return { editable: false, value: filedByField.get(field) as string | number | undefined };
	};
}

/**
 * `LimitedPartnershipTable`/`NonCapitalVintageTable`/`OtherLossVintageTable`
 * are typed for the full `FieldComponentProps<AlbertaContinuityValues>` (the
 * shape `field.custom` hands them) but only ever destructure `control` (plus
 * `onNavigate`, which `LimitedPartnershipTable` alone accepts, for its
 * carries-to-Schedule-12 badge) — confirmed by reading all three. This builds
 * just enough of that shape to satisfy the type without fabricating a fake
 * `field`/`error`/etc.
 */
function tableProps(
	control: Control<AlbertaContinuityValues>,
	onNavigate: NavigateToLine | undefined,
): FieldComponentProps<AlbertaContinuityValues> & { onNavigate?: NavigateToLine } {
	return { control, onNavigate } as FieldComponentProps<AlbertaContinuityValues> & {
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
			if (poolKey === "farm" || poolKey === "restricted-farm") return `${p}CurrentYearLoss`;
			return undefined; // non-capital/capital derive this automatically — see alberta-continuity.ts's module doc comment
		case "appliedAgainstIncome":
			return isLpp ? "lppApplied" : `${p}Applied`;
		case "section80Adjustment":
			return `${p}Section80Adjustment`;
		case "otherAdjustments":
			return `${p}OtherAdjustments`;
		default:
			return undefined; // "opening" (033-style), "carryBack", "closing" — not a simple per-pool field in this app
	}
}

/** The full row order + captions, derived from the generated pool table rather than hand-typed — no separate copy to drift. */
const ROW_ORDER = (() => {
	const seen = new Set<string>();
	const rows: { kind: string; caption: string }[] = [];
	for (const pool of AT1_SCHEDULE_21_POOL_TABLE) {
		for (const row of pool.rows) {
			if (seen.has(row.kind)) continue;
			seen.add(row.kind);
			rows.push({ kind: row.kind, caption: row.caption });
		}
	}
	return rows;
})();

/**
 * AT1 Schedule 21 paper Form View — the printed form's page 1-2 continuity
 * grid (one column per pool), followed by the limited-partnership table and
 * the two by-year-of-origin vintage tables, reusing the SAME dense table
 * components the guided editor already uses for those (they're already
 * form-shaped; only their position on the page changes here).
 *
 * Not included: page 5 (Restricted Interest and Financing Expenses
 * continuity) — unmodeled in the engine, needs `schedule21.ts` +
 * `assemble-at1-schedules.ts` work first, not just a UI layout. Computed
 * closing balances aren't shown as a grid cell either (this app doesn't
 * store them as a field to bind to) — they're visible in the "as filed"
 * panel below this schedule instead, which already reads real Schedule 12
 * figures scheduleId "021" correctly.
 */
export function Schedule21FormView({
	control,
	disabled,
	computed,
	onNavigate,
	highlightLine,
}: {
	control: Control<Record<string, unknown>>;
	disabled?: boolean;
	computed?: ComputedReturn;
	onNavigate?: NavigateToLine;
	highlightLine?: string;
}) {
	const c = control as unknown as Control<AlbertaContinuityValues>;
	const resolvePart1Line = buildResolveLine(computed);
	const part1Fields = AT1_SCHEDULE_21_FIELDS.filter((f) => f.section === "current-year");

	return (
		<div className="space-y-4">
			<PaperSection
				title="Calculation of current year non-capital loss"
				description="Starts from Alberta net income on Schedule 12 line 054 and works down through the Division C deductions to the loss for the year. Not collected as separate entries in this app — read-only, from the last computed return."
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
			<PaperSection title="Continuity of losses">
				<div className="p-2">
					<PaperContinuityGrid
						pools={AT1_SCHEDULE_21_POOL_TABLE}
						rowOrder={ROW_ORDER}
						control={c}
						fieldName={fieldName}
						disabled={disabled}
						onNavigate={onNavigate}
						highlightLine={highlightLine}
					/>
				</div>
				<PaperFootnotes notes={AT1_SCHEDULE_21_FOOTNOTES} />
			</PaperSection>
			<PaperSection
				title="Continuity of limited partnership losses"
				description="A sixth pool, laid out per partnership rather than by jurisdiction."
			>
				<div className="p-3">{createElement(LimitedPartnershipTable, tableProps(c, onNavigate))}</div>
			</PaperSection>
			<PaperSection
				title="Non-capital losses by year of origin"
				description="The current year's row is derived from the grid above; only prior vintages are entered here."
			>
				<div className="p-3">{createElement(NonCapitalVintageTable, tableProps(c, onNavigate))}</div>
			</PaperSection>
			<PaperSection title="Farm, restricted farm & listed personal property losses by year of origin">
				<div className="p-3">{createElement(OtherLossVintageTable, tableProps(c, onNavigate))}</div>
			</PaperSection>
		</div>
	);
}
