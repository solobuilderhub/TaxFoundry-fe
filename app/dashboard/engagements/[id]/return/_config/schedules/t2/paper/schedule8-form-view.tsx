"use client";

import { BooleanCheckbox } from "@classytic/fluid/forms";
import { type Control, useFieldArray, useWatch } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type { CcaClass, CcaValues } from "../../../../_lib/return-input";
import { PaperMoney } from "../../at1/paper/components/paper-inputs";
import {
	type ClassGridColumn,
	type ClassGridRow,
	PaperClassGrid,
	PaperSection,
} from "../../at1/paper/components/paper-primitives";
import { StraightLineWorksheets } from "../../at1/paper/components/straight-line-worksheets";
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
	const { append, remove } = useFieldArray({
		control: ccaControl,
		name: "classes",
	});

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
				description="One row per class. Class number, opening UCC, additions, dispositions and the claim are editable; the rest is arithmetic this schedule computes, shown from the last computed return."
				formId="T2SCH8"
			>
				<div className="p-2">
					<PaperClassGrid
						arrayName="classes"
						rows={rows}
						columns={columns}
						control={ccaControl}
						disabled={disabled}
						onAppend={() => append({})}
						onRemove={(i) => remove(i)}
						addLabel="+ Add a CCA class"
						resolveCell={(row, col) =>
							row.arrayIndex === undefined
								? undefined
								: filed.get(`${col.line}-${row.arrayIndex + 1}`)
						}
					/>
				</div>
			</PaperSection>
			{rows.length > 0 && (
				<PaperSection
					title="Per class — not columns on the 2025 form"
					description="Three things about a class the grid has no column for. Immediate expensing was claimed on designated property a CCPC acquired before 2024 and made available for use by then — the 2025 form dropped it, but a return for an earlier year still needs it. AIIP marks the class for the accelerated first-year rate (the amount is column 225). A class emptied at year-end turns its remaining balance into a terminal loss at line 215, computed."
				>
					<div className="divide-y">
						{rows.map((r) => (
							<div
								key={r.key}
								className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2"
							>
								<span className="w-20 shrink-0 text-sm font-medium">
									{r.label}
								</span>
								<span className="flex w-64 items-center gap-2 text-sm">
									<span className="shrink-0 text-muted-foreground">
										Immediate expensing
									</span>
									<PaperMoney
										control={ccaControl}
										name={`classes.${r.arrayIndex}.immediateExpensing`}
										label={`${r.label} — immediate expensing`}
										disabled={disabled}
									/>
								</span>
								<BooleanCheckbox
									control={ccaControl}
									name={`classes.${r.arrayIndex}.aiip`}
									label="AIIP"
									disabled={disabled}
								/>
								<BooleanCheckbox
									control={ccaControl}
									name={`classes.${r.arrayIndex}.classEmptied`}
									label="Class emptied"
									disabled={disabled}
								/>
							</div>
						))}
					</div>
				</PaperSection>
			)}
			<StraightLineWorksheets
				control={ccaControl}
				disabled={disabled}
				blankMeans={{ opening: "0", claim: "Maximum" }}
				class13Description="Straight-line, one layer per leasehold improvement. A blank claim takes the maximum the layers allow."
			/>
		</div>
	);
}
