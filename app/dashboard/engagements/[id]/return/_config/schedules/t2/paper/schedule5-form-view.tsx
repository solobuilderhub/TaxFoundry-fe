"use client";

import { useWatch, type Control } from "react-hook-form";
import type { ProvincialAllocationValues } from "../../../../_lib/return-input";
import {
	PaperClassGrid,
	PaperLeaderRow,
	PaperSection,
	type ClassGridColumn,
	type ClassGridRow,
} from "../../at1/paper/components/paper-primitives";
import type { LineValue, NavigateToLine, ResolveLine } from "../../at1/paper/resolve-line";
import { T2_SCHEDULE_5_FIELDS } from "./generated/schedule5.layout";

/**
 * The guided editor's `PROVINCE_OPTIONS` 2-letter codes → Schedule 5's own
 * jurisdiction line numbers (`SCHEDULE_5_JURISDICTIONS` in
 * `packages/ca-tax/src/t2/forms/schedule5.ts`). The printed form ALSO has
 * two "Offshore" rows (Newfoundland 004, Nova Scotia 008) this app has no
 * separate province code for — genuinely not collected, not a mapping gap.
 */
const PROVINCE_LINES: Record<string, { tick: string; salaries: string; grossRevenue: string; label: string }> = {
	NL: { tick: "003", salaries: "103", grossRevenue: "143", label: "Newfoundland and Labrador" },
	PE: { tick: "005", salaries: "105", grossRevenue: "145", label: "Prince Edward Island" },
	NS: { tick: "007", salaries: "107", grossRevenue: "147", label: "Nova Scotia" },
	NB: { tick: "009", salaries: "109", grossRevenue: "149", label: "New Brunswick" },
	QC: { tick: "011", salaries: "111", grossRevenue: "151", label: "Quebec" },
	ON: { tick: "013", salaries: "113", grossRevenue: "153", label: "Ontario" },
	MB: { tick: "015", salaries: "115", grossRevenue: "155", label: "Manitoba" },
	SK: { tick: "017", salaries: "117", grossRevenue: "157", label: "Saskatchewan" },
	AB: { tick: "019", salaries: "119", grossRevenue: "159", label: "Alberta" },
	BC: { tick: "021", salaries: "121", grossRevenue: "161", label: "British Columbia" },
	YT: { tick: "023", salaries: "123", grossRevenue: "163", label: "Yukon" },
	NT: { tick: "025", salaries: "125", grossRevenue: "165", label: "Northwest Territories" },
	NU: { tick: "026", salaries: "126", grossRevenue: "166", label: "Nunavut" },
};

const COLUMNS: ClassGridColumn[] = [
	{ line: "salaries", caption: "Salaries and wages", kind: "money", fieldName: "salariesWages" },
	{ line: "grossRevenue", caption: "Gross revenue", kind: "money", fieldName: "grossRevenue" },
];

/**
 * Federal T2 Schedule 5, Part 1 — the Reg 402 provincial allocation grid.
 * Thirteen fixed jurisdiction rows (2 more on the printed form — Newfoundland
 * and Nova Scotia Offshore — that this app has no separate code for at all;
 * see `PROVINCE_LINES`'s own comment), matched against the guided editor's
 * `establishments` array by province code, the same fixed-row pattern
 * T2SCH13/T2SCH50 and AT1 Schedule 17 already use.
 *
 * The "permanent establishment" tick (column A) isn't its own editor field —
 * this app infers it from whether a row was added for that province at all,
 * which is exactly what the tick means on the printed form (no separate
 * yes/no question to lose sync with). Line 100 (which Reg applies, 402-413)
 * is a genuine gap: nothing in this app asks it, and Reg 402 (the general
 * rule this schedule's own doc comment calls "the common case") is simply
 * assumed rather than confirmed — shown as "not collected", honestly.
 */
export function Schedule5FormView({
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
	const provincialControl = control as unknown as Control<ProvincialAllocationValues>;
	const establishments = useWatch({ control: provincialControl, name: "establishments" }) ?? [];

	const gridRows: ClassGridRow[] = Object.entries(PROVINCE_LINES).map(([code, meta]) => {
		const arrayIndex = establishments.findIndex((e) => e?.province === code);
		return {
			key: code,
			label: meta.label,
			arrayIndex: arrayIndex === -1 ? undefined : arrayIndex,
		};
	});

	const tickField = T2_SCHEDULE_5_FIELDS.find((f) => f.line === "100");
	const resolveTick: ResolveLine = (): LineValue => ({ editable: false, value: undefined });

	return (
		<div className="space-y-4">
			{tickField && (
				<PaperSection title="Allocation method" formId="T2SCH5">
					<PaperLeaderRow
						line={tickField.line}
						caption={tickField.caption}
						kind={tickField.kind}
						role={tickField.role}
						note="Not collected — this app always allocates under the general rule (Reg 402), the common case; the industry-specific rules (banks, railways, airlines, grain, trucking) are not modelled."
						control={provincialControl}
						resolveLine={resolveTick}
						disabled={disabled}
					/>
				</PaperSection>
			)}
			<PaperSection
				title="Part 1 — Allocation of taxable income"
				description="One row per jurisdiction with a permanent establishment. A jurisdiction not yet added below in Guided view shows 'not added' — add it there first. The 'tick' (column A) isn't asked separately; a row existing here IS the tick."
				formId="T2SCH5"
			>
				<div className="p-2">
					<PaperClassGrid
						arrayName="establishments"
						rows={gridRows}
						columns={COLUMNS}
						control={provincialControl}
						disabled={disabled}
						resolveCell={() => undefined}
						lineFor={(row, col) => {
							const meta = PROVINCE_LINES[row.key];
							if (!meta) return "";
							return col.line === "salaries" ? meta.salaries : meta.grossRevenue;
						}}
					/>
				</div>
			</PaperSection>
			<p className="px-1 text-xs text-muted-foreground">
				Newfoundland and Nova Scotia each have a second "Offshore" row on the
				printed form (lines 004/104/144 and 008/108/148) — not modelled here,
				since this app's province list has no separate offshore option.
			</p>
		</div>
	);
}
