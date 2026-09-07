"use client";

import { type Control, useWatch } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type { CcaClass, CcaValues } from "../../../../_lib/return-input";
import {
	type ClassGridColumn,
	type ClassGridRow,
	PaperClassGrid,
	PaperSection,
} from "../../at1/paper/components/paper-primitives";
import type { NavigateToLine } from "../../at1/paper/resolve-line";
import { T2_SCHEDULE_8_GRID_COLUMNS } from "./generated/schedule8.layout";
import { filedValuesFor } from "./paper-form-sections";

/**
 * The five columns `t2/cca.ts` actually collects — everything else on the
 * printed form is either arithmetic this schedule computes (rate,
 * recapture, terminal loss, the half-year UCC adjustment, closing UCC) or a
 * genuine collection gap (adjustments/transfers, assistance received/
 * repaid, RIIP) with no field anywhere in this app yet.
 */
const FIELD_NAME: Partial<Record<string, keyof CcaClass>> = {
	"200": "ccaClass",
	"201": "openingUCC",
	"203": "additions",
	"207": "dispositions",
	"217": "claim",
};

/**
 * Federal T2 Schedule 8 — Capital Cost Allowance, as a paper Form View. One
 * row per CCA class the preparer entered, 15 numbered columns (7 more than
 * AT1 Schedule 13's grid, since AT1 reconciles only where it diverges from
 * this schedule).
 *
 * A computed column shows the figure the last compute filed for that class.
 *
 * This comment used to say there was nowhere to resolve one from, because
 * `schedulePayloads` was Alberta-only. It is not now: `federalSchedulePayloads`
 * emits `T2SCH8` with one occurrence per class, so column 19 (recapture),
 * column 20 (terminal loss) and column 21 (the claim) resolve per row.
 *
 * The grid's other columns stay blank, and that is still correct. Some are the
 * form's own unnumbered arithmetic, and the rest are numbers this package has
 * not recorded a mapping for — a figure filed under a column it does not belong
 * to reads as a complete return and is wrong. Nothing here re-derives a value
 * client-side, which would drift from `computeCcaClass`.
 */
export function Schedule8FormView({
	control,
	computed,
	disabled,
}: {
	control: Control<Record<string, unknown>>;
	computed?: ComputedReturn;
	disabled?: boolean;
	onNavigate?: NavigateToLine;
	highlightLine?: string;
}) {
	const ccaControl = control as unknown as Control<CcaValues>;
	// Keyed `line-occurrence`; occurrence is the class's 1-based row number.
	const filed = filedValuesFor(computed, "T2SCH8");
	const classes = useWatch({ control: ccaControl, name: "classes" }) ?? [];

	const rows: ClassGridRow[] = classes.map((c, i) => ({
		key: `class-${i}`,
		label: c?.ccaClass ? `Class ${c.ccaClass}` : `Row ${i + 1}`,
		arrayIndex: i,
	}));

	const columns: ClassGridColumn[] = T2_SCHEDULE_8_GRID_COLUMNS.map((c) => ({
		line: c.line,
		caption: c.caption,
		kind: c.kind,
		fieldName: FIELD_NAME[c.line],
	}));

	return (
		<div className="space-y-4">
			<PaperSection
				title="Capital cost allowance by class"
				description="One row per class. Class number, opening UCC, additions, dispositions, and the claim are editable; the rest is arithmetic this schedule computes."
				formId="T2SCH8"
			>
				<div className="p-2">
					<PaperClassGrid
						arrayName="classes"
						rows={rows}
						columns={columns}
						control={ccaControl}
						disabled={disabled}
						resolveCell={(row, col) =>
							row.arrayIndex === undefined
								? undefined
								: filed.get(`${col.line}-${row.arrayIndex + 1}`)
						}
					/>
				</div>
			</PaperSection>
			{rows.length === 0 && (
				<p className="px-1 text-sm text-muted-foreground">
					No CCA classes entered yet — add one in Guided view first.
				</p>
			)}
		</div>
	);
}
