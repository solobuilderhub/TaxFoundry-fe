"use client";

import { useWatch, type Control } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import { RESERVE_TYPES, type ReservesValues } from "../../../../_lib/return-input";
import { parseAt1LineItemId } from "./at1-lines";
import {
	PaperClassGrid,
	PaperFootnotes,
	PaperLeaderRow,
	PaperSection,
	type ClassGridColumn,
	type ClassGridRow,
} from "./components/paper-primitives";
import { AT1_SCHEDULE_17_FIELDS, AT1_SCHEDULE_17_FOOTNOTES, AT1_SCHEDULE_17_RESERVE_KINDS } from "./generated/schedule17.layout";
import type { LineValue, NavigateToLine, ResolveLine } from "./resolve-line";

const SCHEDULE_ID = "017";

const COLUMNS: ClassGridColumn[] = [
	{ line: "opening", caption: "Beginning of year", kind: "money", fieldName: "albertaOpening" },
	{ line: "transfer", caption: "Wind-up / amalgamation transfer", kind: "money", fieldName: "albertaTransfer" },
	{ line: "closing", caption: "End of year", kind: "money", fieldName: "albertaClosing" },
];

/**
 * AT1 Schedule 17 paper Form View — 8 reserve KINDS, matched by `type`
 * against whatever the preparer has actually added to `reserves.rows` (a
 * dynamic array, not one field per kind — unlike Schedule 21's loss pools).
 * A kind with no matching row shows "not added" rather than a blank editable
 * box, since there's no array entry yet to bind to.
 *
 * All three columns bind directly to the Alberta OVERRIDE fields
 * (`albertaOpening`/`albertaTransfer`/`albertaClosing`) — Schedule 17 as
 * printed IS the Alberta figure; blank still means "same as federal" at
 * compute time, same semantics as the guided editor's own description text.
 */
export function Schedule17FormView({
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
	const reservesControl = control as unknown as Control<ReservesValues>;
	const rows = useWatch({ control: reservesControl, name: "rows" }) ?? [];

	const gridRows: ClassGridRow[] = AT1_SCHEDULE_17_RESERVE_KINDS.map((kind, i) => {
		const type = RESERVE_TYPES[i];
		const arrayIndex = rows.findIndex((r) => r?.type === type);
		return {
			key: type ?? kind.label,
			label: kind.label,
			arrayIndex: arrayIndex === -1 ? undefined : arrayIndex,
		};
	});

	const filed = computed?.schedulePayloads?.find((p) => p.scheduleId === SCHEDULE_ID);
	const filedByField = new Map(
		(filed?.values ?? []).flatMap((v) => {
			const parsed = parseAt1LineItemId(v.lineItemId);
			return parsed ? [[parsed.field, v.value] as const] : [];
		}),
	);
	const resolveTotalsLine: ResolveLine = (line): LineValue => {
		const field = parseAt1LineItemId(line)?.field ?? line;
		return { editable: false, value: filedByField.get(field) as string | number | undefined };
	};

	return (
		<div className="space-y-4">
			<PaperSection
				title="Continuity of reserves"
				description="Eight reserve kinds, matched by type against whatever's been added below in Guided view. A kind not yet added shows 'not added' — add it in Guided view first, then it becomes editable here."
				formId="AT1SCH17"
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
			<PaperSection title="Totals carried to Schedule 12">
				{AT1_SCHEDULE_17_FIELDS.filter((f) => f.section === "totals").map((f) => (
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
						control={reservesControl}
						resolveLine={resolveTotalsLine}
						disabled={disabled}
					/>
				))}
				<PaperFootnotes notes={AT1_SCHEDULE_17_FOOTNOTES} />
			</PaperSection>
		</div>
	);
}
