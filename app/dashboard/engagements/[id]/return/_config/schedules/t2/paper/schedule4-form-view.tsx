"use client";

import { useWatch, type Control } from "react-hook-form";
import type { LossesValues } from "../../../../_lib/return-input";
import {
	PaperClassGrid,
	PaperLeaderRow,
	PaperSection,
	type ClassGridColumn,
	type ClassGridRow,
} from "../../at1/paper/components/paper-primitives";
import type { LineValue, NavigateToLine, ResolveLine } from "../../at1/paper/resolve-line";

interface Sch4Field {
	line: string;
	caption: string;
	fieldName: keyof LossesValues;
}

/**
 * Federal T2 Schedule 4 — corporation loss continuity and application. Line
 * numbers verified against the raw `pdftotext -layout` extraction
 * (`research/sources/cra-forms/extracted/T2SCH04-loss-continuity.lines.tsv`)
 * — that extraction is reliable for THIS form (unlike the T2 jacket's pages
 * 1-2 or Schedule 5/13's grids), since Schedule 4 is a genuine caption-then-
 * number leader-row form throughout.
 *
 * The guided editor's two ALREADY-cited pairs (non-capital 102/130,
 * net-capital 200/225) were both confirmed correct. Farm (302/330) and
 * restricted farm (402/430) were NOT cited in the guided editor at all —
 * added here, confirmed against the same extraction.
 *
 * `farmingIncome` ("the ceiling for the restricted farm pool") has no
 * numbered box of its own on the printed form — line 430's own caption
 * folds "current farming income" in as descriptive text, not a separate
 * line — shown here without a line badge rather than a fabricated one.
 *
 * Limited partnership losses (`limitedPartnershipOpening`,
 * `partnershipIncome`, `atRiskAmount`, `limitedPartnershipApplied`, s.111(1)(e))
 * are NOT on Schedule 4 at all — confirmed by searching the raw extraction
 * for "partnership" and finding no match anywhere on this form. The compute
 * engine (`schedule4-losses.ts`) genuinely computes this pool despite its
 * own module doc comment only mentioning "two pools" (non-capital,
 * net-capital) — a separate, minor documentation gap, not corrected here.
 * Shown as a clear disclosure rather than a fabricated Schedule 4 line.
 *
 * The carry-back array maps to Schedule 4's own repeating three-row pattern
 * (901/902/903 for non-capital — `schedule4.ts`'s own notes on line 901 name
 * the SAME offsets repeating for the other four loss types, though this
 * app's `carrybacks` array is non-capital only, matching its section
 * description "Carry this year's non-capital loss back").
 */
const FIELDS: readonly Sch4Field[] = [
	{ line: "102", caption: "Non-capital losses at the beginning of the tax year", fieldName: "nonCapitalOpening" },
	{ line: "130", caption: "Non-capital losses of previous tax years applied in the current tax year", fieldName: "nonCapitalApplied" },
	{ line: "200", caption: "Capital losses at the end of the previous tax year", fieldName: "netCapitalOpening" },
	{ line: "225", caption: "Capital losses from previous tax years applied against the current-year net capital gain", fieldName: "netCapitalApplied" },
	{ line: "302", caption: "Farm losses at the beginning of the tax year", fieldName: "farmOpening" },
	{ line: "330", caption: "Farm losses of previous tax years applied in the current tax year", fieldName: "farmApplied" },
	{ line: "402", caption: "Restricted farm losses at the beginning of the tax year", fieldName: "restrictedFarmOpening" },
	{ line: "430", caption: "Restricted farm losses from previous tax years applied against current farming income", fieldName: "restrictedFarmApplied" },
];

const CARRYBACK_LINES = ["901", "902", "903"];
const CARRYBACK_COLUMNS: ClassGridColumn[] = [
	{ line: "taxYearEnd", caption: "Prior tax year-end", kind: "date", fieldName: "taxYearEnd" },
	{ line: "amount", caption: "Non-capital loss carried back", kind: "money", fieldName: "amount" },
];

export function Schedule4FormView({
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
	const lossesControl = control as unknown as Control<LossesValues>;
	const carrybacks = useWatch({ control: lossesControl, name: "carrybacks" }) ?? [];

	const resolveLine: ResolveLine = (line): LineValue => {
		const field = FIELDS.find((f) => f.line === line);
		return field ? { editable: true, name: field.fieldName } : { editable: false, value: undefined };
	};

	const carrybackRows: ClassGridRow[] = [0, 1, 2].map((i) => ({
		key: `carryback-${i}`,
		label: `${["First", "Second", "Third"][i]} preceding year`,
		arrayIndex: i < carrybacks.length ? i : undefined,
	}));

	return (
		<div className="space-y-4">
			<PaperSection title="Non-capital and net-capital losses (Parts 1-2)" formId="T2SCH4">
				{FIELDS.slice(0, 4).map((f) => (
					<PaperLeaderRow
						key={f.line}
						line={f.line}
						caption={f.caption}
						kind="money"
						role="input"
						onNavigate={onNavigate}
						highlightLine={highlightLine}
						control={lossesControl}
						resolveLine={resolveLine}
						disabled={disabled}
					/>
				))}
			</PaperSection>
			<PaperSection title="Farm and restricted farm losses (Parts 3-4)" formId="T2SCH4">
				{FIELDS.slice(4, 8).map((f) => (
					<PaperLeaderRow
						key={f.line}
						line={f.line}
						caption={f.caption}
						kind="money"
						role="input"
						onNavigate={onNavigate}
						highlightLine={highlightLine}
						control={lossesControl}
						resolveLine={resolveLine}
						disabled={disabled}
					/>
				))}
				<PaperLeaderRow
					line="—"
					caption="Farming income this year (the ceiling for the restricted farm pool)"
					kind="money"
					role="input"
					note="No numbered box of its own on the printed form — line 430's caption folds this in as descriptive text, not a separate line."
					control={lossesControl}
					resolveLine={(): LineValue => ({ editable: true, name: "farmingIncome" })}
					disabled={disabled}
				/>
			</PaperSection>
			<PaperSection
				title="Non-capital loss carry-back request"
				description="Maps to Schedule 4's own repeating three-preceding-year pattern (901/902/903 for non-capital)."
				formId="T2SCH4"
			>
				<div className="p-2">
					<PaperClassGrid
						arrayName="carrybacks"
						rows={carrybackRows}
						columns={CARRYBACK_COLUMNS}
						control={lossesControl}
						disabled={disabled}
						resolveCell={() => undefined}
						lineFor={(row) => CARRYBACK_LINES[carrybackRows.indexOf(row)] ?? ""}
					/>
				</div>
			</PaperSection>
			<PaperSection
				title="Limited partnership losses (s.111(1)(e)) — not on Schedule 4"
				description="This loss type does not appear anywhere on the printed Schedule 4 (confirmed by searching the form's own text for 'partnership' — no match). The engine computes this pool (schedule4-losses.ts), but there is no CRA line number to cite for it on this form. Collected in Guided view; not shown as a fabricated Schedule 4 line here."
				formId="T2SCH4"
			>
				<p className="p-4 text-xs text-muted-foreground">Not modelled as a Schedule 4 line.</p>
			</PaperSection>
		</div>
	);
}
