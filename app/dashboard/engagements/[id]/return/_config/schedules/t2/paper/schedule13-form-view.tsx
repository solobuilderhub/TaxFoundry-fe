"use client";

import { type Control, useWatch } from "react-hook-form";
import {
	RESERVE_TYPES,
	type ReservesValues,
} from "../../../../_lib/return-input";
import {
	type ClassGridColumn,
	type ClassGridRow,
	PaperClassGrid,
	PaperLeaderRow,
	PaperSection,
} from "../../at1/paper/components/paper-primitives";
import type { NavigateToLine } from "../../at1/paper/resolve-line";
import { T2_SCHEDULE_13_FIELDS } from "./generated/schedule13.layout";

const COLUMNS: ClassGridColumn[] = [
	{
		line: "opening",
		caption: "Balance at the beginning of the year",
		kind: "money",
		fieldName: "opening",
	},
	{
		line: "transfer",
		caption: "Transfer on an amalgamation or the wind-up of a subsidiary",
		kind: "money",
		fieldName: "transfer",
	},
	{
		line: "closing",
		caption: "Balance at the end of the year",
		kind: "money",
		fieldName: "closing",
	},
];

/**
 * Federal T2 Schedule 13, Part 2 — six NAMED reserve types, each with a fixed
 * printed line triple (opening/transfer/closing), matched against
 * `reserves.rows` by `type` — the same pattern AT1 Schedule 17's own paper
 * view already uses for its 8 kinds (`schedule17-form-view.tsx`), except
 * federal recognizes only 6 of those 8: `insurancePolicyReserves` and
 * `bankReserves` (indices 5/6 of `RESERVE_TYPES`) have no federal line at
 * all — the AT1-side guided editor's own field description already says so
 * ("Insurance policy / bank reserves have no federal line, so federal
 * always reads 0 here").
 *
 * Part 1 (capital-gains reserves, lines 001-010) is NOT rendered here: this
 * app's Part 2 data model (`ReservesValues`) has nowhere for a capital-gains
 * reserve to live — `packages/ca-tax/src/t2/forms/schedule13.ts`'s own doc
 * comment is explicit that Part 1 "belongs to Schedule 6, not here."
 * Showing empty Part-1 boxes with no binding anywhere would be a bare
 * "not collected" wall, not a real gap disclosure — so Part 1 is a plain
 * note instead of a grid nobody can ever fill in from this schedule.
 *
 * The totals (270/275/280) have nowhere to resolve a computed value FROM, but
 * not for the reason this used to give. `schedulePayloads` carries federal
 * schedules as well as Alberta ones now; what it does not carry is anything
 * under `T2SCH13`, because `federalSchedulePayloads` emits a schedule only
 * where the line each figure belongs on is recorded in code, and Schedule 13's
 * is not. Unlike Schedule 8's genuinely complex CCA arithmetic (rate,
 * recapture, terminal loss), these totals are a PLAIN SUM of the six rows
 * directly above them — exactly what `computeSchedule13` itself does
 * (`totalOpening`/`totalTransfer`/`totalClosing`) — so computing them
 * client-side from the same watched values carries no drift risk; it is
 * the identical arithmetic, not a re-derivation of tax law.
 */
export function Schedule13FormView({
	control,
	disabled,
	onNavigate,
	highlightLine,
}: {
	control: Control<Record<string, unknown>>;
	disabled?: boolean;
	onNavigate?: NavigateToLine;
	highlightLine?: string;
}) {
	const reservesControl = control as unknown as Control<ReservesValues>;
	const rows = useWatch({ control: reservesControl, name: "rows" }) ?? [];

	// The six federally-recognized reserve types, in the same order as the
	// printed form's lines (110, 130, 150, 190, 210, 230) — `RESERVE_TYPES`
	// indices 5/6 (insurancePolicyReserves/bankReserves) are AT1-only and
	// deliberately excluded. Each "opening" field's caption is
	// "<Reserve label> — Balance at the beginning of the year"; splitting off
	// the label reuses the FormDefinition's own wording instead of a second,
	// hand-typed copy that could drift from it.
	const FEDERAL_TYPE_INDICES = [0, 1, 2, 3, 4, 7] as const;
	const openingLines = ["110", "130", "150", "190", "210", "230"];
	const gridRows: ClassGridRow[] = FEDERAL_TYPE_INDICES.map((typeIndex, i) => {
		const type = RESERVE_TYPES[typeIndex];
		const openingField = T2_SCHEDULE_13_FIELDS.find(
			(f) => f.line === openingLines[i],
		);
		const label = openingField?.caption.split(" — ")[0] ?? type;
		const arrayIndex = rows.findIndex((r) => r?.type === type);
		return {
			key: type ?? label,
			label,
			arrayIndex: arrayIndex === -1 ? undefined : arrayIndex,
		};
	});

	const toNum = (v: unknown): number => {
		const n = Number(v);
		return Number.isFinite(n) ? n : 0;
	};
	const totals = rows.reduce<{
		opening: number;
		transfer: number;
		closing: number;
	}>(
		(acc, r) => ({
			opening: acc.opening + toNum(r?.opening),
			transfer: acc.transfer + toNum(r?.transfer),
			closing: acc.closing + toNum(r?.closing),
		}),
		{ opening: 0, transfer: 0, closing: 0 },
	);
	const CURRENCY_FMT = new Intl.NumberFormat("en-CA", {
		style: "currency",
		currency: "CAD",
		maximumFractionDigits: 0,
	});
	const totalsResolve = (line: string) => {
		const field = line.slice(-3);
		const value =
			field === "270"
				? totals.opening
				: field === "275"
					? totals.transfer
					: field === "280"
						? totals.closing
						: undefined;
		return { editable: false as const, value };
	};

	return (
		<div className="space-y-4">
			<PaperSection
				title="Part 1 — Capital gains reserves"
				description="Not modelled on this schedule — capital-gains reserves (s.40(1)(a)(iii)) are entered on the Capital Gains schedule instead; Schedule 13 only carries their totals (lines 008/009/010) forward from there on the printed form."
				formId="T2SCH13"
			>
				<p className="p-4 text-xs text-muted-foreground">
					See the Capital Gains schedule for this part of the form.
				</p>
			</PaperSection>
			<PaperSection
				title="Part 2 — Other reserves"
				description="Six named reserve types. A type not yet added below in Guided view shows 'not added' — add it there first, then it becomes editable here."
				formId="T2SCH13"
			>
				<div className="p-2">
					<PaperClassGrid
						arrayName="rows"
						rows={gridRows}
						columns={COLUMNS}
						control={reservesControl}
						disabled={disabled}
						resolveCell={() => undefined}
					/>
				</div>
			</PaperSection>
			<PaperSection title="Totals carried to Schedule 1">
				{T2_SCHEDULE_13_FIELDS.filter(
					(f) => f.section === "other" && f.role === "total",
				).map((f) => (
					<PaperLeaderRow
						key={f.line}
						line={f.line}
						caption={f.caption}
						kind={f.kind}
						role={f.role}
						note={
							f.note ??
							"Computed here as the sum of the six reserve rows above — the same arithmetic the engine uses. The stored line-item breakdown does not cover Schedule 13 yet, so this total is added up on screen rather than read back."
						}
						to={f.to}
						onNavigate={onNavigate}
						highlightLine={highlightLine}
						control={reservesControl}
						resolveLine={totalsResolve}
						disabled={disabled}
					/>
				))}
			</PaperSection>
			<p className="px-1 text-xs text-muted-foreground">
				Amounts shown: opening {CURRENCY_FMT.format(totals.opening)}, transfer{" "}
				{CURRENCY_FMT.format(totals.transfer)}, closing{" "}
				{CURRENCY_FMT.format(totals.closing)}.
			</p>
		</div>
	);
}
