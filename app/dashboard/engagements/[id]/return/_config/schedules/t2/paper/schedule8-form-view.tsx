"use client";

import { useWatch, type Control } from "react-hook-form";
import type { CcaClass, CcaValues } from "../../../../_lib/return-input";
import {
	PaperClassGrid,
	PaperSection,
	type ClassGridColumn,
	type ClassGridRow,
} from "../../at1/paper/components/paper-primitives";
import type { NavigateToLine } from "../../at1/paper/resolve-line";
import { T2_SCHEDULE_8_GRID_COLUMNS } from "./generated/schedule8.layout";

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
 * Unlike AT1 Schedule 13, there is nowhere to resolve a computed column's
 * value from: `ComputedReturn.schedulePayloads` is AT1-only (see its own
 * doc comment) — federal T2 does not persist a per-line breakdown for
 * Schedule 8. Computed columns render read-only with an honest "not
 * available" state rather than a client-side re-derivation that could
 * drift from the engine's own `computeCcaClass`.
 */
export function Schedule8FormView({
	control,
	disabled,
}: {
	control: Control<Record<string, unknown>>;
	disabled?: boolean;
	onNavigate?: NavigateToLine;
	highlightLine?: string;
}) {
	const ccaControl = control as unknown as Control<CcaValues>;
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
						resolveCell={() => undefined}
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
