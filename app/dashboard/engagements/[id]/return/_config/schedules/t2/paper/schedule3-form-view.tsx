"use client";

import type { Control } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type { DividendsValues } from "../../../../_lib/return-input";
import {
	PaperLeaderRow,
	PaperSection,
} from "../../at1/paper/components/paper-primitives";
import type {
	LineValue,
	NavigateToLine,
	ResolveLine,
} from "../../at1/paper/resolve-line";
import {
	T2_SCHEDULE_3_FIELDS,
	T2_SCHEDULE_3_SECTIONS,
} from "./generated/schedule3.layout";
import {
	T2_SCHEDULE_53_FIELDS,
	T2_SCHEDULE_53_SECTIONS,
} from "./generated/schedule53.layout";
import {
	T2_SCHEDULE_55_FIELDS,
	T2_SCHEDULE_55_SECTIONS,
} from "./generated/schedule55.layout";
import { PaperFormSections } from "./paper-form-sections";

interface Sch3Field {
	line: string;
	caption: string;
	fieldName: keyof DividendsValues;
}

const PAID_FIELDS: readonly Sch3Field[] = [
	{
		line: "460",
		caption:
			"Total taxable dividends paid in the tax year that qualify for a dividend refund",
		fieldName: "taxableDividendsPaid",
	},
	{
		line: "465",
		caption: "Total eligible dividends paid in the tax year",
		fieldName: "eligibleDividendsPaid",
	},
];

/**
 * Only `eligibleDividendsReceived` maps to a confirmed worksheet letter
 * (1D — a genuine DOLLAR total, "total amounts from column H"). Earlier
 * research considered citing 1G/1H for the other two fields, but those
 * letters are "Part IV tax before deductions" — TAX amounts computed FROM
 * the dividends, not the dividend amounts themselves — a wrong citation is
 * worse than none, so `taxableReceivedConnected`/`taxableReceivedPortfolio`
 * are shown with no reference at all rather than a mismatched one.
 */
const RECEIVED_FIELDS: readonly Sch3Field[] = [
	{
		line: "1D",
		caption:
			"Eligible dividends received from connected corporations (Part 1, total of column H)",
		fieldName: "eligibleDividendsReceived",
	},
];
const RECEIVED_FIELDS_NO_REFERENCE: readonly {
	caption: string;
	fieldName: keyof DividendsValues;
}[] = [
	{
		caption: "Taxable dividends received from connected corporations",
		fieldName: "taxableReceivedConnected",
	},
	{
		caption: "Taxable dividends received, portfolio (non-connected)",
		fieldName: "taxableReceivedPortfolio",
	},
];

/**
 * Federal T2 Schedule 3 — Dividends Received, Taxable Dividends Paid, and
 * Part IV Tax Calculation. Verified against
 * `research/sources/cra-forms/extracted/T2SCH03-dividends-part-iv.layout.txt`
 * (the raw `pdftotext -layout` text, which for this form is trustworthy for
 * the small set of lines/letters actually checked — the form's own real
 * complexity is a per-payer grid, not extracted or modelled here at all).
 *
 * Part 2 (dividends PAID, lines 450-540) genuinely has numbered lines — the
 * guided editor's 460/465 citations were already correct.
 *
 * Part 1 (dividends RECEIVED) is a per-connected-payer grid whose TOTALS
 * are worksheet LETTERS (1D, 1G, 1H, …), not numbered lines at all — there
 * is no "line 300" to cite for "taxable dividends received from connected
 * corporations", so this app's aggregate input fields are shown against
 * their corresponding LETTER instead, clearly marked as such (not a real
 * CRA line-item id).
 *
 * `openingGrip` is NOT a Schedule 3 field at all — the guided editor's own
 * section title says so ("General Rate Income Pool (Schedule 53)"). It is
 * never rendered as a fabricated Schedule 3 line; Schedule 53's own printed
 * form is rendered instead, read-only, from `generated/schedule53.layout.ts`,
 * and Schedule 55 follows it because the Part III.1 tax is charged on the
 * excess of eligible dividends designated over the pool Schedule 53 closes
 * with (Schedule 55 line 160 carries in Schedule 53 line 590).
 */
export function Schedule3FormView({
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
	const dividendsControl = control as unknown as Control<DividendsValues>;

	const ALL_FIELDS = [...PAID_FIELDS, ...RECEIVED_FIELDS];
	const resolveLine: ResolveLine = (line): LineValue => {
		const field = ALL_FIELDS.find((f) => f.line === line);
		return field
			? { editable: true, name: field.fieldName }
			: { editable: false, value: undefined };
	};

	return (
		<div className="space-y-4">
			<PaperSection
				title="Dividends paid (Part 2, real numbered lines)"
				formId="T2SCH3"
			>
				{PAID_FIELDS.map((f) => (
					<PaperLeaderRow
						key={f.line}
						line={f.line}
						caption={f.caption}
						kind="money"
						role="input"
						onNavigate={onNavigate}
						highlightLine={highlightLine}
						control={dividendsControl}
						resolveLine={resolveLine}
						disabled={disabled}
					/>
				))}
			</PaperSection>
			<PaperSection
				title="Dividends received (Part 1 — worksheet LETTERS, not numbered lines)"
				description="The real form is a per-connected-payer grid; only one of this app's three fields maps to a confirmed worksheet letter (1D, a genuine dollar total) — the other two have no confirmed reference at all (see the note on each) rather than a guessed one."
				formId="T2SCH3"
			>
				{RECEIVED_FIELDS.map((f) => (
					<PaperLeaderRow
						key={f.line}
						line={f.line}
						caption={f.caption}
						kind="money"
						role="input"
						onNavigate={onNavigate}
						highlightLine={highlightLine}
						control={dividendsControl}
						resolveLine={resolveLine}
						disabled={disabled}
					/>
				))}
				{RECEIVED_FIELDS_NO_REFERENCE.map((f) => (
					<PaperLeaderRow
						key={f.fieldName}
						line="—"
						caption={f.caption}
						kind="money"
						role="input"
						note="No confirmed worksheet letter or line number — the candidates considered (1G/1H) turned out to be Part IV TAX amounts, not the dividend amount itself. Shown without a reference rather than a wrong one."
						control={dividendsControl}
						resolveLine={(): LineValue => ({
							editable: true,
							name: f.fieldName,
						})}
						disabled={disabled}
					/>
				))}
			</PaperSection>
			{/*
			 * Schedule 3 itself, from the generated layout, directly below the boxes
			 * this app collects, so the two can be read against each other instead of
			 * the screen showing only the handful we fill.
			 *
			 * It comes before Schedules 53 and 55 because this is the Schedule 3
			 * screen. Those two follow as neighbours — the forms the opening GRIP
			 * figure on this page really belongs to — and a reader should reach this
			 * form's own lines before another form's.
			 */}
			<PaperFormSections
				sections={T2_SCHEDULE_3_SECTIONS}
				fields={T2_SCHEDULE_3_FIELDS}
				control={control}
				computed={computed}
				scheduleId="T2SCH3"
				disabled={disabled}
				onNavigate={onNavigate}
				highlightLine={highlightLine}
				titleSuffix=" — as printed"
			/>

			{/*
			 * The General Rate Income Pool, on its own form.
			 *
			 * Opening GRIP is collected on this same guided-editor page for
			 * convenience, but it is a Schedule 53 figure, not a Schedule 3 one, and
			 * this view used to say so and stop there. Schedule 53 itself is printed
			 * below instead — read-only, since the pool's continuity is derived by
			 * the engine rather than entered here — which is the same disclosure
			 * made against the real form rather than in place of it.
			 */}
			<PaperFormSections
				sections={T2_SCHEDULE_53_SECTIONS}
				fields={T2_SCHEDULE_53_FIELDS}
				control={control}
				computed={computed}
				scheduleId="T2SCH53"
				disabled={disabled}
				onNavigate={onNavigate}
				highlightLine={highlightLine}
				formId="T2SCH53"
				titleSuffix=" — as printed"
			/>

			{/*
			 * Schedule 55 follows Schedule 53 because it is computed from it: the
			 * Part III.1 tax falls on the EXCESSIVE eligible dividend designation,
			 * the excess of eligible dividends paid over the pool Schedule 53
			 * closes with — line 160 here carries in Schedule 53's line 590, read
			 * as nil when that pool is negative.
			 */}
			<PaperFormSections
				sections={T2_SCHEDULE_55_SECTIONS}
				fields={T2_SCHEDULE_55_FIELDS}
				control={control}
				computed={computed}
				scheduleId="T2SCH55"
				disabled={disabled}
				onNavigate={onNavigate}
				highlightLine={highlightLine}
				formId="T2SCH55"
				titleSuffix=" — as printed"
			/>
		</div>
	);
}
