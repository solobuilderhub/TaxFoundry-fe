"use client";

import { useWatch, type Control } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type { CcaClass, CcaValues } from "../../../../_lib/return-input";
import { parseAt1LineItemId } from "./at1-lines";
import {
	PaperClassGrid,
	PaperSection,
	type ClassGridColumn,
	type ClassGridRow,
} from "./components/paper-primitives";
import { AT1_SCHEDULE_13_GRID_COLUMNS } from "./generated/schedule13.layout";

/** The two Alberta-specific override fields Schedule 13 collects — everything else is assumed equal to federal (or computed by the engine) and shown read-only. */
const FIELD_NAME: Partial<Record<string, keyof CcaClass>> = {
	"013001001": "ccaClass",
	"013003001": "albertaOpeningUCC",
	"013019001": "albertaClaim",
};

const SCHEDULE_ID = "013";

/**
 * AT1 Schedule 13 paper Form View — one row per CCA class the preparer
 * actually entered (dynamic, via `PaperClassGrid`), 19 numbered columns.
 * Only class number, Alberta opening UCC, and the Alberta claim override are
 * editable here; the rest is read from the last computed return, matching
 * the same "don't render a computed figure as a box" rule the card editor's
 * generator enforces.
 */
export function Schedule13FormView({
	control,
	disabled,
	computed,
}: {
	control: Control<Record<string, unknown>>;
	disabled?: boolean;
	computed?: ComputedReturn;
}) {
	const ccaControl = control as unknown as Control<CcaValues>;
	const classes = useWatch({ control: ccaControl, name: "classes" }) ?? [];

	const filed = computed?.schedulePayloads?.find((p) => p.scheduleId === SCHEDULE_ID);
	const filedByFieldOccurrence = new Map(
		(filed?.values ?? []).flatMap((v) => {
			const parsed = parseAt1LineItemId(v.lineItemId);
			return parsed ? [[`${parsed.field}-${parsed.occurrence}`, v.value] as const] : [];
		}),
	);

	const rows: ClassGridRow[] = classes.map((c, i) => ({
		key: `class-${i}`,
		label: c?.ccaClass ? `Class ${c.ccaClass}` : `Row ${i + 1}`,
		arrayIndex: i,
	}));

	const columns: ClassGridColumn[] = AT1_SCHEDULE_13_GRID_COLUMNS.map((c) => {
		const field = c.line.slice(3, 6);
		return { line: field, caption: c.caption, kind: c.kind, fieldName: FIELD_NAME[c.line] };
	});

	return (
		<div className="space-y-4">
			<PaperSection
				title="Alberta capital cost allowance by class"
				description="One row per class. Class number, Alberta opening UCC, and the Alberta claim override are editable; the rest is assumed equal to federal — see the last computed return where available."
			>
				<div className="p-2">
					<PaperClassGrid
						arrayName="classes"
						rows={rows}
						columns={columns}
						control={ccaControl}
						disabled={disabled}
						resolveCell={(row, col) => {
							// column.line was rewritten to the bare field above; re-derive the
							// full occurrence-scoped lookup key (CCA classes file with
							// occurrence = array index + 1, the convention this engine uses
							// elsewhere for repeating schedule rows).
							if (row.arrayIndex === undefined) return undefined;
							return filedByFieldOccurrence.get(`${col.line}-${row.arrayIndex + 1}`) as
								| string
								| number
								| undefined;
						}}
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
