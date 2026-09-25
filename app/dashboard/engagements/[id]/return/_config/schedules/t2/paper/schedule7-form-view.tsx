"use client";

import type { Control } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type { SbdValues } from "../../../../_lib/return-input";
import {
	PaperLeaderRow,
	PaperSection,
} from "../../at1/paper/components/paper-primitives";
import { WorksheetTable } from "../../at1/paper/components/worksheet-table";
import type {
	LineValue,
	NavigateToLine,
	ResolveLine,
} from "../../at1/paper/resolve-line";
import {
	T2_SCHEDULE_7_FIELDS,
	T2_SCHEDULE_7_SECTIONS,
} from "./generated/schedule7.layout";
import {
	T2_SCHEDULE_23_FIELDS,
	T2_SCHEDULE_23_SECTIONS,
} from "./generated/schedule23.layout";
import { PaperFormSections } from "./paper-form-sections";

interface JacketSbdField {
	line: string;
	caption: string;
	fieldName: keyof SbdValues;
	note?: string;
}

/**
 * The jacket lines this schedule's slice holds, on the jacket's own numbers.
 *
 * 440 is THIS year's aggregate investment income; 417 is the PRIOR year's
 * adjusted figure for the whole associated group, which grinds the business
 * limit. Line 440 used to be bound to the prior-year adjusted figure, so the
 * one box stood for both — its own note called that out.
 */
const FIELDS: readonly JacketSbdField[] = [
	{
		line: "400",
		caption: "Income eligible for the small business deduction",
		fieldName: "activeBusinessIncome",
	},
	{
		line: "410",
		caption: "Business limit",
		fieldName: "businessLimit",
		note: "$500,000, shared across an associated group (Schedule 23) — see the associated corporations below.",
	},
	{
		line: "415",
		caption:
			"Total taxable capital employed in Canada of the corporation and its associated corporations, previous tax year",
		fieldName: "taxableCapital",
		note: "The base of line 415, which is this amount minus $10,000,000, times 0.225% — the large-corporation grind. Enter the taxable capital; the grind is computed.",
	},
	{
		line: "417",
		caption:
			"Adjusted aggregate investment income of the corporation and all associated corporations, previous tax year (Schedule 7 line 745)",
		fieldName: "aaii",
		note: "Grinds the business limit $5 for every $1 above $50,000. Leave blank to derive it from Part 2 below.",
	},
	{
		line: "440",
		caption: "Aggregate investment income, this year (Schedule 7 line 092)",
		fieldName: "aggregateInvestmentIncome",
		note: "Feeds the refundable portion of Part I tax. Leave blank to derive it from Part 1 below.",
	},
];

/**
 * Schedule 7's Part 1 and Part 2 lines the slice holds. Filled in, they are
 * what the engine derives lines 092 and 745 from; blank, the figures typed at
 * 440 and 417 above stand.
 */
const SCHEDULE_7_BOUND: Readonly<Record<string, string>> = {
	"002": "aiiDetail.taxableCapitalGains",
	"012": "aiiDetail.allowableCapitalLosses",
	"022": "aiiDetail.netCapitalLossesClaimed",
	"032": "aiiDetail.incomeFromProperty",
	"042": "aiiDetail.exemptIncome",
	"052": "aiiDetail.agriInvestFundReceived",
	"062": "aiiDetail.taxableDividendsDeductible",
	"072": "aiiDetail.trustPropertyIncome",
	"082": "aiiDetail.lossesFromProperty",
	"705": "aaiiDetail.taxableCapitalGains",
	"710": "aaiiDetail.allowableCapitalLosses",
	"715": "aaiiDetail.incomeFromProperty",
	"720": "aaiiDetail.exemptIncome",
	"725": "aaiiDetail.agriInvestFundReceived",
	"730": "aaiiDetail.dividendsFromConnectedCorporations",
	"735": "aaiiDetail.trustPropertyIncome",
	"740": "aaiiDetail.lossesFromProperty",
	"741": "aaiiDetail.subsection91_4Deduction",
};

export function Schedule7FormView({
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
	const sbdControl = control as unknown as Control<SbdValues>;

	const resolveLine: ResolveLine = (line): LineValue => {
		const field = FIELDS.find((f) => f.line === line);
		return field
			? { editable: true, name: field.fieldName }
			: { editable: false, value: undefined };
	};

	return (
		<div className="space-y-4">
			<PaperSection
				title="Small business deduction — jacket lines"
				description="The figures the T2 jacket's small business deduction is computed from, on the jacket's own line numbers. Schedule 7's Part 1 and Part 2 below derive lines 440 and 417 when they are filled in."
				formId="T2"
			>
				{FIELDS.map((f) => (
					<PaperLeaderRow
						key={f.line}
						line={f.line}
						caption={f.caption}
						kind="money"
						role="input"
						note={f.note}
						onNavigate={onNavigate}
						highlightLine={highlightLine}
						control={sbdControl}
						resolveLine={resolveLine}
						disabled={disabled}
					/>
				))}
			</PaperSection>
			<PaperSection
				title="Zero-emission technology manufacturing (Schedule 27)"
				description="Income from qualifying clean-technology manufacturing, taxed at half the rate (s.125.2). Schedule 27 itself is not modelled as a printed form; the qualifying portion of active business income is entered here and the engine applies the rate reduction to Part I tax."
			>
				<PaperLeaderRow
					line="—"
					caption="Zero-emission technology manufacturing income"
					kind="money"
					role="input"
					control={sbdControl}
					resolveLine={(): LineValue => ({
						editable: true,
						name: "zetmIncome",
					})}
					disabled={disabled}
				/>
			</PaperSection>

			<PaperSection
				title="Associated corporations"
				description="The other Canadian-controlled private corporations this one is associated with, and the share of the $500,000 business limit each is assigned. This corporation's own share is line 410 above; the group's total cannot exceed $500,000."
				formId="T2SCH23"
			>
				<div className="p-3">
					<WorksheetTable
						control={sbdControl}
						name="associated"
						disabled={disabled}
						addLabel="+ Add an associated corporation"
						emptyText="Not associated with any other corporation."
						columns={[
							{ name: "name", label: "Corporation name", kind: "text" },
							{
								name: "allocatedLimit",
								label: "Business limit assigned",
								kind: "money",
							},
						]}
					/>
				</div>
			</PaperSection>

			{/*
			 * Schedule 23 — the associated group's allocation of the business
			 * limit, read-only from the generated layout.
			 *
			 * The associated corporations are entered in the table above. The
			 * printed lines below are what the agreement itself asks for — the calendar year it covers,
			 * whether it amends or replaces one already filed, and the per-
			 * corporation percentage that must total 100% — none of which this
			 * app collects as numbered boxes.
			 */}
			<PaperFormSections
				sections={T2_SCHEDULE_23_SECTIONS}
				fields={T2_SCHEDULE_23_FIELDS}
				control={control}
				computed={computed}
				scheduleId="T2SCH23"
				disabled={disabled}
				onNavigate={onNavigate}
				highlightLine={highlightLine}
				formId="T2SCH23"
				titleSuffix=" — as printed"
			/>

			{/*
			 * Schedule 7 itself, from the generated layout. Part 1 and Part 2 —
			 * the lines the engine derives aggregate investment income (092) and
			 * its adjusted figure (745) from — are boxes; the parts this app does
			 * not model (3 to 7) stay as printed, read-only. Line 745 carries the
			 * figure the last compute filed for it.
			 */}
			<PaperFormSections
				sections={T2_SCHEDULE_7_SECTIONS}
				fields={T2_SCHEDULE_7_FIELDS}
				control={control}
				computed={computed}
				scheduleId="T2SCH7"
				boundFields={SCHEDULE_7_BOUND}
				disabled={disabled}
				onNavigate={onNavigate}
				highlightLine={highlightLine}
			/>
		</div>
	);
}
