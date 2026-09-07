"use client";

import { type Control, useWatch } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type { LossesValues } from "../../../../_lib/return-input";
import {
	type ClassGridColumn,
	type ClassGridRow,
	PaperClassGrid,
	PaperLeaderRow,
	PaperSection,
} from "../../at1/paper/components/paper-primitives";
import type { LineValue, NavigateToLine } from "../../at1/paper/resolve-line";
import {
	T2_SCHEDULE_4_FIELDS,
	T2_SCHEDULE_4_SECTIONS,
} from "./generated/schedule4.layout";
import { PaperFormSections } from "./paper-form-sections";

/**
 * The eight Schedule 4 lines this app's guided editor actually collects.
 *
 * Everything else on the form renders read-only. The form has 82 numbered lines
 * across eight parts; this app asks for the opening balance and the amount
 * applied for each of four pools, and derives the rest.
 */
const FIELD_NAME: Partial<Record<string, keyof LossesValues>> = {
	"102": "nonCapitalOpening",
	"130": "nonCapitalApplied",
	"200": "netCapitalOpening",
	"225": "netCapitalApplied",
	"302": "farmOpening",
	"330": "farmApplied",
	"402": "restrictedFarmOpening",
	"430": "restrictedFarmApplied",
};

const CARRYBACK_LINES = ["901", "902", "903"];
const CARRYBACK_COLUMNS: ClassGridColumn[] = [
	{
		line: "taxYearEnd",
		caption: "Prior tax year-end",
		kind: "date",
		fieldName: "taxYearEnd",
	},
	{
		line: "amount",
		caption: "Non-capital loss carried back",
		kind: "money",
		fieldName: "amount",
	},
];

/**
 * Federal T2 Schedule 4 — corporation loss continuity and application, as a
 * paper Form View. The whole form, from the generated layout, with the eight
 * lines this app collects editable in place.
 *
 * ── What this view used to claim, and why it was wrong ──────────────────────
 *
 * It rendered eight lines and stated that limited partnership losses "do not
 * appear anywhere on the printed Schedule 4 (confirmed by searching the form's
 * own text for 'partnership' — no match)". They occupy the whole of page 6 as
 * Part 7, in three grid tables over eighteen numbered columns. The search found
 * nothing because a grid puts its numbers in the column headings, which is the
 * documented blind spot of `pdftotext -layout` and the reason this repo's
 * guidance says to author such parts by hand. Part 7 is now in the definition,
 * authored from the rendered page, so it appears here like any other part.
 *
 * ── Two corrections that came with it ───────────────────────────────────────
 *
 * Lines 330 and 335 are Part 3 (farm) lines that extraction had filed under
 * Part 1, and they rendered under "Non-capital losses" on this very screen — on
 * the one form whose entire difficulty is that five loss types run in parallel
 * with near-identical rows. And the jacket cross-references read 331 ← 150 and
 * 332 ← 250, the "Other adjustments" lines, where the form prints 130 and 225.
 *
 * ── Why the non-collected lines are read-only ───────────────────────────────
 *
 * A line this app does not collect is not re-derived on the client, where it
 * could drift from the engine: it shows the figure the last compute filed for
 * it, read from `ComputedReturn.schedulePayloads`, which carries federal
 * schedules as well as Alberta ones. `federalSchedulePayloads` does not yet
 * emit anything under `T2SCH4`, so those lines still render with their number,
 * caption and cross-references and no figure — and fill in of their own accord
 * once the engine reports them.
 */
export function Schedule4FormView({
	control,
	computed,
	disabled,
	onNavigate,
	highlightLine,
}: {
	control: Control<Record<string, unknown>>;
	computed?: ComputedReturn;
	disabled?: boolean;
	onNavigate?: NavigateToLine;
	highlightLine?: string;
}) {
	const lossesControl = control as unknown as Control<LossesValues>;
	const carrybacks =
		useWatch({ control: lossesControl, name: "carrybacks" }) ?? [];

	const carrybackRows: ClassGridRow[] = [0, 1, 2].map((i) => ({
		key: `carryback-${i}`,
		label: `${["First", "Second", "Third"][i]} preceding year`,
		arrayIndex: i < carrybacks.length ? i : undefined,
	}));

	return (
		<div className="space-y-4">
			<PaperFormSections
				sections={T2_SCHEDULE_4_SECTIONS}
				fields={T2_SCHEDULE_4_FIELDS}
				control={control}
				boundFields={FIELD_NAME}
				computed={computed}
				scheduleId="T2SCH4"
				disabled={disabled}
				onNavigate={onNavigate}
				highlightLine={highlightLine}
				formId="T2SCH4"
			/>

			<PaperSection
				title="Farming income this year"
				description="The ceiling for the restricted farm pool. It has no numbered box of its own — line 430's caption folds it in as descriptive text — so it is collected here rather than given a fabricated line number."
			>
				<PaperLeaderRow
					line="—"
					caption="Farming income this year"
					kind="money"
					role="input"
					control={lossesControl}
					resolveLine={(): LineValue => ({
						editable: true,
						name: "farmingIncome",
					})}
					disabled={disabled}
				/>
			</PaperSection>

			<PaperSection
				title="Non-capital loss carry-back request"
				description="Lines 901, 902 and 903 — one per preceding year. The same three-row pattern repeats per loss type (951-953 capital, 921-923 farm, 941-943 restricted farm, 961-963 listed personal); this app's carry-back array is non-capital only."
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
		</div>
	);
}
