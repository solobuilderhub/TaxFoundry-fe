"use client";

import { useWatch, type Control } from "react-hook-form";
import type { ShareholdersValues } from "../../../../_lib/return-input";
import {
	PaperClassGrid,
	PaperSection,
	type ClassGridColumn,
	type ClassGridRow,
} from "../../at1/paper/components/paper-primitives";

const COLUMNS: ClassGridColumn[] = [
	{ line: "100", caption: "Name of shareholder", kind: "text", fieldName: "name" },
	{ line: "200", caption: "Business number or partnership account number", kind: "code", fieldName: "bnOrSin" },
	{ line: "400", caption: "Percentage of common shares", kind: "rate", fieldName: "percentCommon" },
	{ line: "500", caption: "Percentage of preferred shares", kind: "rate", fieldName: "percentPreferred" },
];

/**
 * Federal T2 Schedule 50 — shareholder information. A pure disclosure grid,
 * no compute at all, so unlike Schedules 8/13 there is nothing here that
 * would ever be a read-only "computed" cell — every column this app collects
 * is genuinely editable.
 *
 * The printed form has SIX columns (100/200/300/350/400/500); this app's
 * `Shareholder` type has only FOUR fields — `bnOrSin` is one combined box
 * for whichever identifier applies (BN, SIN, or trust number), not three
 * separate ones. Rendering 300/350 as their own grid cells (even read-only,
 * mirroring 200's value) would misrepresent the form's own "mutually
 * exclusive" instruction — it would look like all three are filled at once.
 * A plain note is the honest version of this gap; the four real columns
 * still cover every fact the form actually needs disclosed.
 */
export function Schedule50FormView({
	control,
	disabled,
}: {
	control: Control<Record<string, unknown>>;
	disabled?: boolean;
}) {
	const shareholdersControl = control as unknown as Control<ShareholdersValues>;
	const list = useWatch({ control: shareholdersControl, name: "list" }) ?? [];

	const rows: ClassGridRow[] = list.map((s, i) => ({
		key: `shareholder-${i}`,
		label: s?.name || `Row ${i + 1}`,
		arrayIndex: i,
	}));

	return (
		<div className="space-y-4">
			<PaperSection
				title="Shareholder information"
				description="One row per shareholder holding 10% or more of the common or preferred shares. Lines 300 (social insurance number) and 350 (trust number) are not tracked as separate fields in this app — line 200 covers whichever identifier applies (BN, SIN, or trust number); the printed form treats these three as mutually exclusive anyway."
				formId="T2SCH50"
			>
				<div className="p-2">
					<PaperClassGrid
						arrayName="list"
						rows={rows}
						columns={COLUMNS}
						control={shareholdersControl}
						disabled={disabled}
						resolveCell={() => undefined}
					/>
				</div>
			</PaperSection>
			{rows.length === 0 && (
				<p className="px-1 text-sm text-muted-foreground">
					No shareholders entered yet — add one in Guided view first.
				</p>
			)}
		</div>
	);
}
