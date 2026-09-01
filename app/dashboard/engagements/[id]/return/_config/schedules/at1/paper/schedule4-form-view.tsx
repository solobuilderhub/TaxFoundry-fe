"use client";

import { useWatch, type Control } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type { AlbertaForeignInvestment4Values } from "../../../../_lib/return-input";
import { parseAt1LineItemId } from "./at1-lines";
import {
	PaperClassGrid,
	PaperFootnotes,
	PaperLeaderRow,
	PaperSection,
	type ClassGridColumn,
	type ClassGridRow,
} from "./components/paper-primitives";
import { AT1_SCHEDULE_4_FIELDS, AT1_SCHEDULE_4_FOOTNOTES, AT1_SCHEDULE_4_SECTIONS } from "./generated/schedule4.layout";
import type { LineValue, NavigateToLine, ResolveLine } from "./resolve-line";

const SCHEDULE_ID = "004";

/** 002/004/008 are genuine editable inputs on this row; 006 and 012 are computed — see `schedule4.ts`'s doc comment. */
const FIELD_NAME: Partial<Record<string, string>> = {
	"002": "country",
	"004": "netForeignInvestmentIncome",
	"008": "fedNonBusinessForeignTaxCredit",
};

/**
 * AT1 Schedule 4 paper Form View — one row per country (dynamic, via
 * `PaperClassGrid`), matching `alberta-schedule4.ts`'s own `countries` array.
 * 006 and 012 are read-only, sourced from the last computed return by
 * occurrence — the engine derives both from figures that are not themselves
 * AT1 lines (gross federal tax paid, the ITA 20(12)/ACTA 8(2.2) deduction),
 * so there is nothing on this schedule's own control to bind them to.
 */
export function Schedule4FormView({
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
	const s4Control = control as unknown as Control<AlbertaForeignInvestment4Values>;
	const countries = useWatch({ control: s4Control, name: "countries" }) ?? [];

	const filed = computed?.schedulePayloads?.find((p) => p.scheduleId === SCHEDULE_ID);
	const filedByFieldOccurrence = new Map(
		(filed?.values ?? []).flatMap((v) => {
			const parsed = parseAt1LineItemId(v.lineItemId);
			return parsed ? [[`${parsed.field}-${parsed.occurrence}`, v.value] as const] : [];
		}),
	);
	const resolveTotalsLine: ResolveLine = (line): LineValue => {
		const field = parseAt1LineItemId(line)?.field ?? line;
		return { editable: false, value: filedByFieldOccurrence.get(`${field}-1`) as string | number | undefined };
	};
	const totalsFields = AT1_SCHEDULE_4_FIELDS.filter((f) => f.section === "total");

	const rows: ClassGridRow[] = countries.map((c, i) => ({
		key: `country-${i}`,
		label: c?.country || `Row ${i + 1}`,
		arrayIndex: i,
	}));

	const columns: ClassGridColumn[] = AT1_SCHEDULE_4_FIELDS.map((f) => {
		const field = parseAt1LineItemId(f.line)?.field ?? f.line;
		return { line: field, caption: f.caption, kind: f.kind, fieldName: FIELD_NAME[field] };
	});

	return (
		<div className="space-y-4">
			<PaperSection
				title={AT1_SCHEDULE_4_SECTIONS[0]?.title ?? "Foreign Investment Credits"}
				description={AT1_SCHEDULE_4_SECTIONS[0]?.description}
				formId="AT1SCH04"
			>
				<div className="p-2">
					<PaperClassGrid
						arrayName="countries"
						rows={rows}
						columns={columns}
						control={s4Control}
						disabled={disabled}
						resolveCell={(row, col) => {
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
					No countries entered yet — add one in Guided view first.
				</p>
			)}
			<PaperSection title="Total and Alberta Foreign Investment Income Tax Credit">
				{totalsFields.map((f) => (
					<PaperLeaderRow
						key={f.line}
						line={parseAt1LineItemId(f.line)?.field ?? f.line}
						caption={f.caption}
						kind={f.kind}
						role={f.role}
						note={f.note}
						to={f.to}
						onNavigate={onNavigate}
						highlightLine={highlightLine}
						control={s4Control}
						resolveLine={resolveTotalsLine}
						disabled={disabled}
					/>
				))}
			</PaperSection>
			<PaperFootnotes notes={AT1_SCHEDULE_4_FOOTNOTES} />
		</div>
	);
}
