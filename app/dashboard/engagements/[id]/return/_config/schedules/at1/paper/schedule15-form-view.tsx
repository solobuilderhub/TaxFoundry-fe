"use client";

import { useWatch, type Control } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type { AlbertaResourceDeductions15Values } from "../../../../_lib/return-input";
import {
	PaperClassGrid,
	PaperFootnotes,
	PaperSection,
	type ClassGridColumn,
	type ClassGridRow,
} from "./components/paper-primitives";
import { AT1_SCHEDULE_15_FIELDS, AT1_SCHEDULE_15_FOOTNOTES } from "./generated/schedule15.layout";

const ARRAYS = [
	{ key: "sfedeRegular" as const, field: "241", label: "SFEDE regular" },
	{ key: "sfedeSuccessor" as const, field: "261", label: "SFEDE successor" },
	{ key: "cfreRegular" as const, field: "281", label: "CFRE regular" },
	{ key: "cfreSuccessor" as const, field: "301", label: "CFRE successor" },
];

/** Only CFRE regular has a second FormDefinition-covered column (293 — amount claimed). */
const AMOUNT_FIELD: Partial<Record<string, string>> = { "281": "293" };

/**
 * AT1 Schedule 15 paper Form View — DELIBERATELY PARTIAL. `AT1_SCHEDULE_15`
 * only covers the SFEDE/CFRE per-country country-code lines (241/261/281/301)
 * plus CFRE regular's own claimed amount (293) — the ones that happen not to
 * collide with a line number another form already registers; see that
 * module's own doc comment. The eight resource-expense pools this schedule
 * actually computes (EDA, CMEDB, CEE, CDE, CCOGPE, FEDE, plus the rest of
 * SFEDE/CFRE's own ~130-line detail) have no numbered paper-view lines yet —
 * not silently dropped, just not built until a real fact pattern needs it
 * verified, matching `schedule15.ts`'s own stated scope.
 */
export function Schedule15FormView({
	control,
	disabled,
}: {
	control: Control<Record<string, unknown>>;
	disabled?: boolean;
	computed?: ComputedReturn;
}) {
	const s15Control = control as unknown as Control<AlbertaResourceDeductions15Values>;

	return (
		<div className="space-y-4">
			<PaperSection
				title="SFEDE / CFRE — per-country lines this schedule models"
				description="One row per country the corporation entered on the guided editor. Every other field on these rows (opening balances, transfers, additions/deductions, foreign resource income) — and the eight resource-expense pools this schedule computes — is not covered by a numbered paper-view line yet."
				formId="AT1SCH15"
			>
				<div className="space-y-3 p-2">
					{ARRAYS.map((a) => (
						<CountryGrid key={a.key} arrayKey={a.key} field={a.field} label={a.label} control={s15Control} disabled={disabled} />
					))}
				</div>
			</PaperSection>
			<PaperFootnotes notes={AT1_SCHEDULE_15_FOOTNOTES} />
		</div>
	);
}

function CountryGrid({
	arrayKey,
	field,
	label,
	control,
	disabled,
}: {
	arrayKey: "sfedeRegular" | "sfedeSuccessor" | "cfreRegular" | "cfreSuccessor";
	field: string;
	label: string;
	control: Control<AlbertaResourceDeductions15Values>;
	disabled?: boolean;
}) {
	const rows = useWatch({ control, name: arrayKey }) ?? [];
	const countryCodeField = AT1_SCHEDULE_15_FIELDS.find((f) => f.line.slice(3, 6) === field);
	const amountField = AMOUNT_FIELD[field]
		? AT1_SCHEDULE_15_FIELDS.find((f) => f.line.slice(3, 6) === AMOUNT_FIELD[field])
		: undefined;

	const gridRows: ClassGridRow[] = rows.map((r, i) => ({
		key: `${arrayKey}-${i}`,
		label: (r as { countryCode?: string })?.countryCode || `Row ${i + 1}`,
		arrayIndex: i,
	}));
	const columns: ClassGridColumn[] = [
		{ line: field, caption: countryCodeField?.caption ?? "Country code", kind: "code", fieldName: "countryCode" },
		...(amountField
			? [{ line: AMOUNT_FIELD[field]!, caption: amountField.caption, kind: amountField.kind, fieldName: "claimed" }]
			: []),
	];

	return (
		<div>
			<div className="px-1 pb-1 text-xs font-medium text-muted-foreground">{label}</div>
			<PaperClassGrid
				arrayName={arrayKey}
				rows={gridRows}
				columns={columns}
				control={control}
				disabled={disabled}
				resolveCell={() => undefined}
			/>
			{gridRows.length === 0 && (
				<p className="px-1 py-1 text-xs text-muted-foreground">No {label} countries entered yet.</p>
			)}
		</div>
	);
}
