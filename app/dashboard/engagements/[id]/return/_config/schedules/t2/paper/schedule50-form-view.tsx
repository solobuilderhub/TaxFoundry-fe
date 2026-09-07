"use client";

import { type Control, useWatch } from "react-hook-form";
import type { ShareholdersValues } from "../../../../_lib/return-input";
import {
	type ClassGridColumn,
	type ClassGridRow,
	PaperClassGrid,
	PaperSection,
} from "../../at1/paper/components/paper-primitives";
import { T2_SCHEDULE_50_FIELDS } from "./generated/schedule50.layout";

/**
 * The four columns this app's `Shareholder` type actually collects.
 *
 * `bnOrSin` is ONE combined box for whichever identifier applies, so lines 300
 * (social insurance number) and 350 (trust number) have no field of their own.
 * They still appear as columns — the printed form has them and a paper view
 * shows the whole form — and render as an uncollected cell, which is what they
 * are. The form treats 200, 300 and 350 as mutually exclusive, so at most one
 * of the three is ever filled on a real return anyway.
 */
const FIELD_NAME: Record<string, string | undefined> = {
	"100": "name",
	"200": "bnOrSin",
	"400": "percentCommon",
	"500": "percentPreferred",
};

/**
 * Federal T2 Schedule 50 — shareholder information. A pure disclosure grid,
 * no compute at all, so unlike Schedules 8/13 there is nothing here that
 * would ever be a read-only "computed" cell — every column this app collects
 * is genuinely editable.
 *
 * The columns come from the GENERATED layout, which the emitter writes from
 * `T2_SCHEDULE_50` in @classytic/ca-tax and which traces to the printed PDF in
 * its own provenance line. They used to be retyped here, so this file was the
 * one T2 paper view whose generated layout nothing imported: the emitter wrote
 * `schedule50.layout.ts` on every run and no code ever read it, which is drift
 * with the detector switched off. See `tests/forms-drift.test.ts`.
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

	const columns: ClassGridColumn[] = T2_SCHEDULE_50_FIELDS.map((f) => ({
		line: f.line,
		caption: f.caption,
		kind: f.kind,
		fieldName: FIELD_NAME[f.line] as ClassGridColumn["fieldName"],
	}));

	return (
		<div className="space-y-4">
			<PaperSection
				title="Shareholder information"
				description="One row per shareholder holding 10% or more of the common or preferred shares. Lines 300 (social insurance number) and 350 (trust number) have no separate field in this app — line 200 holds whichever identifier applies, and the printed form treats the three as mutually exclusive."
				formId="T2SCH50"
			>
				<div className="p-2">
					<PaperClassGrid
						arrayName="list"
						rows={rows}
						columns={columns}
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
