"use client";

import type { FieldComponentProps } from "@classytic/formkit";
import { createElement } from "react";
import { useWatch, type Control } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type { AlbertaContinuityValues } from "../../../../_lib/return-input";
import { LimitedPartnershipTable, NonCapitalVintageTable, OtherLossVintageTable, RifeContinuitySection } from "../alberta-loss-vintage-tables";
import { parseAt1LineItemId } from "./at1-lines";
import { PaperContinuityGrid, PaperFootnotes, PaperLeaderRow, PaperSection } from "./components/paper-primitives";
import {
	AT1_SCHEDULE_21_BLOCK_TABLE,
	AT1_SCHEDULE_21_FIELDS,
	AT1_SCHEDULE_21_FOOTNOTES,
	AT1_SCHEDULE_21_POOL_TABLE,
} from "./generated/schedule21.layout";
import { buildResolveLine } from "./editability";
import { previewDerivedLines } from "./schedule21-preview";
import type { LineValue, NavigateToLine, ResolveLine } from "./resolve-line";

const SCHEDULE_ID = "021";

/**
 * Line number → the `AlbertaContinuityValues` field it writes to.
 *
 * Part 1's eight Division C entries and page 5's four RIFE entries. A line
 * absent here is one this app does not collect as a single scalar — the
 * continuity grid and the repeating tables bind their own way, and a
 * `carried-in` line has nothing to bind at all.
 */
const OWN_FIELD: Partial<Record<string, string>> = {
	// Part 1 — the Division C deductions
	"002": "rifeDeducted",
	"003": "netCapitalLossesDeducted",
	"005": "taxableDividendsDeductible",
	"007": "partVI1TaxDeductible",
	"011": "prospectorAndGrubstakerShares",
	"012": "nonQualifiedSecuritiesDeduction",
	"017": "foreignTaxCreditAdditions",
	"019": "currentYearFarmLossAddBack",
	// Page 5 — the RIFE continuity, plus the three federal carry-ins the
	// preparer transcribes (see `isAlbertaSourced`).
	"200": "rifeClosingPreviousYear",
	"210": "rifeTransferredOnAmalgamation",
	"220": "rifeAcquisitionOfControlAdjustment",
	"230": "rifeCurrentYear",
	"240": "rifeDeductedForTaxYear",
	"320": "excessCapacityForYear",
	"330": "receivedCapacityForYear",
};

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
): FieldComponentProps<AlbertaContinuityValues> & { onNavigate?: NavigateToLine } {
	return { control, onNavigate, disabled } as FieldComponentProps<AlbertaContinuityValues> & {
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
		// The form prints four distinct "applied against …" rows, one per pool,
		// because each applies the loss against a different thing. They all bind
		// to the same per-pool `…Applied` field — only the caption differs.
		case "appliedAgainstTaxableIncome":
		case "appliedAgainstCapitalGain":
		case "appliedAgainstFarmingIncome":
		case "appliedAgainstLppGain":
			return isLpp ? "lppApplied" : `${p}Applied`;
		case "section80Adjustment":
			return `${p}Section80Adjustment`;
		case "otherAdjustments":
			return `${p}OtherAdjustments`;
		default:
			return undefined; // "opening" (033-style), "carryBack", "closing" — not a simple per-pool field in this app
	}
}

/*
 * Row order and labels come from the generated layout, per block, already in the
 * form's PRINT order — see `AT1_SCHEDULE_21_BLOCK_TABLE`. They used to be derived
 * here by walking the pools and taking the first mention of each row kind, which
 * ordered by "whichever pool mentions it first": a row only the capital column
 * has (line 059, ABIL expired) landed at the bottom of the grid instead of among
 * the additions where the form prints it.
 */

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
	// Live form state, so the derived lines move as the preparer types rather
	// than waiting on a server compute.
	const liveValues = useWatch({ control: c }) as AlbertaContinuityValues;
	/** Reads a carried-in line's figure out of the last computed return. */
	const filedLine = (field: string): number | undefined => {
		const v = computed?.schedulePayloads
			?.find((p) => p.scheduleId === SCHEDULE_ID)
			?.values?.find((x) => x.lineItemId === `${SCHEDULE_ID}${field}001`)?.value;
		return typeof v === "number" ? v : undefined;
	};
	const derived = previewDerivedLines(liveValues, filedLine);
	// One resolver for the whole schedule — Part 1, the continuity grid's
	// computed rows, and page 5 all read through it. The rule it applies is
	// shared with every other schedule; see `editability.ts`.
	const resolvePart1Line = buildResolveLine({
		scheduleId: SCHEDULE_ID,
		fields: AT1_SCHEDULE_21_FIELDS,
		ownField: OWN_FIELD,
		computed,
		derived,
	});
	const fieldsIn = (section: string) =>
		AT1_SCHEDULE_21_FIELDS.filter((f) => f.section === section);
	const part1Fields = fieldsIn("current-year");

	/** Page 1 and page 5 render identically — a leader row per line, read-only. */
	const leaderRows = (fields: typeof AT1_SCHEDULE_21_FIELDS) =>
		fields.map((f) => (
			<PaperLeaderRow
				key={f.line}
				line={parseAt1LineItemId(f.line)?.field ?? f.line}
				caption={f.caption}
				kind={f.kind}
				role={f.role}
				note={f.note}
				formula={f.formula}
				from={f.from}
				to={f.to}
				onNavigate={onNavigate}
				highlightLine={highlightLine}
				control={c}
				resolveLine={resolvePart1Line}
				disabled={disabled}
			/>
		));

	return (
		<div className="space-y-4">
			<PaperSection
				title="Calculation of current year non-capital loss"
				description="Starts from Alberta net income on Schedule 12 line 054 and works down through the Division C deductions to the loss for the year. Lines 002-019 are yours to enter and are saved with the return, but do not yet move line 021 — the engine still derives it from Schedule 12's reconciliation. Line 001 comes from Schedule 12; 013, 015 and 021 are calculated."
				formId="AT1SCH21"
			>
				{leaderRows(part1Fields)}
			</PaperSection>
			{/*
			 * One table per PRINTED block, not one grid over all five pools. The
			 * form prints non-capital|capital on page 1, farm|restricted-farm on
			 * page 2, and listed personal property on its own — each with its own
			 * column headings and only the rows those columns actually have.
			 *
			 * A single five-column grid had to manufacture a cell for every
			 * (pool, row) pair and fill the ones the form doesn't print with "—".
			 * Most of the table was placeholders, which made it unreadable and
			 * impossible to check line-by-line against the paper.
			 */}
			{AT1_SCHEDULE_21_BLOCK_TABLE.map((block) => (
				<PaperSection
					key={block.id}
					title="Continuity of losses"
					description={`Page ${block.page} — ${block.poolKeys
						.map((k) => AT1_SCHEDULE_21_POOL_TABLE.find((p) => p.key === k)?.label ?? k)
						.join(" and ")
						.toLowerCase()}.`}
				>
					<div className="p-2">
						<PaperContinuityGrid
							pools={AT1_SCHEDULE_21_POOL_TABLE.filter((p) =>
								block.poolKeys.includes(p.key),
							)}
							rowOrder={block.rowOrder}
							control={c}
							fieldName={fieldName}
							disabled={disabled}
							onNavigate={onNavigate}
							highlightLine={highlightLine}
							resolveLine={resolvePart1Line}
							// The form prints an unnumbered "Subtotal" rule between the
							// additions and the "Deduct:" block. Which row it follows
							// differs by block: page 1 carries the ABIL-expired addition
							// (059) above it, the others don't.
							dividerAfter={[block.subtotalAfter]}
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
				<div className="p-3">{createElement(LimitedPartnershipTable, tableProps(c, onNavigate))}</div>
			</PaperSection>
			<PaperSection
				title="Non-capital losses by year of origin"
				description="Page 3 — one row per vintage, current year through the 20th preceding. Cells the form shades for a given vintage are disabled rather than hidden."
			>
				<div className="p-3">{createElement(NonCapitalVintageTable, tableProps(c, onNavigate))}</div>
			</PaperSection>
			<PaperSection title="Farm, restricted farm & listed personal property losses by year of origin">
				<div className="p-3">{createElement(OtherLossVintageTable, tableProps(c, onNavigate))}</div>
			</PaperSection>
<<<<<<< Updated upstream
			<PaperSection
				title="Continuity of restricted interest and financing expenses (RIFE)"
				description="Page 5 of the printed form — a separate continuity from the five pools above. Not part of Schedule 21's own filed payload; line 240 feeds AT1 Schedule 12 line 130 directly."
			>
				<div className="p-3">{createElement(RifeContinuitySection, tableProps(c, onNavigate, disabled))}</div>
=======
			{/*
			 * Page 5. Read-only for the same reason Part 1 is: no RIFE field exists
			 * on `AlbertaContinuityValues` and the engine has no RIFE calculation,
			 * so there is nothing to bind an input to and nothing to read back. The
			 * lines render anyway — an empty box on a form the corporation must file
			 * says "this exists and we have no figure", which the line being absent
			 * entirely does not.
			 */}
			<PaperSection
				title="Continuity of Restricted interest and financing expenses (RIFE)"
				description="Lines 200-240 are yours to enter, 230 transcribed off federal Schedule 4 line 710. 250 needs a compute; 310 calculates here. The engine does not model RIFE yet, so none of this reaches the filed figures."
				formId="AT1SCH21"
			>
				{leaderRows(fieldsIn("rife-continuity"))}
			</PaperSection>
			<PaperSection
				title="Restricted interest and financing expenses (RIFE) under paragraph 111(1)(a.1) of ITA"
				description="Sets the ceiling on line 240. Transcribe 320 and 330 off federal Schedule 130 (lines 129 and 130); 340 and 350 follow. The form requires line 240 not to exceed line 350 — nothing enforces that yet."
			>
				{leaderRows(fieldsIn("rife-deductible"))}
>>>>>>> Stashed changes
			</PaperSection>
		</div>
	);
}
