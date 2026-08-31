"use client";

import { useWatch, type Control } from "react-hook-form";
import { Controller } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import { cn } from "@/lib/utils";
import type { AlbertaRoyaltyCredit6Values } from "../../../../_lib/return-input";
import { parseAt1LineItemId } from "./at1-lines";
import {
	PaperClassGrid,
	PaperLeaderRow,
	PaperSection,
	type ClassGridColumn,
	type ClassGridRow,
} from "./components/paper-primitives";
import { AT1_SCHEDULE_6_FIELDS, AT1_SCHEDULE_6_SECTIONS } from "./generated/schedule6.layout";
import type { LineValue, ResolveLine } from "./resolve-line";

const SCHEDULE_ID = "006";

const OWN_FIELD: Partial<Record<string, keyof AlbertaRoyaltyCredit6Values>> = {
	"002": "associatedWithCrownRoyaltyCorporations",
	"004": "albertaCrownRoyaltyIncurred",
	"022": "longestAssociatedYearCan",
	"024": "longestAssociatedYearBeginning",
	"026": "longestAssociatedYearEnding",
	"028": "longestAssociatedYearDays",
};

const AACRS_FIELD_NAME: Partial<Record<string, string>> = {
	"030": "name",
	"032": "albertaCan",
	"034": "allocatedAmount",
};

function buildResolveLine(computed: ComputedReturn | undefined): ResolveLine {
	const filed = computed?.schedulePayloads?.find((p) => p.scheduleId === SCHEDULE_ID);
	const filedByField = new Map(
		(filed?.values ?? []).flatMap((v) => {
			const parsed = parseAt1LineItemId(v.lineItemId);
			return parsed && parsed.occurrence === 1 ? [[parsed.field, v.value] as const] : [];
		}),
	);

	return (line: string): LineValue => {
		const field = parseAt1LineItemId(line)?.field ?? line;
		const ownName = OWN_FIELD[field];
		if (ownName) return { editable: true, name: ownName };
		return { editable: false, value: filedByField.get(field) as string | number | undefined };
	};
}

/**
 * AT1 Schedule 6 paper Form View. Line 008's day-weighted quarters worksheet
 * has no AT1 line numbers of its own — only the resulting weighted rate is a
 * line — so it renders as a plain worksheet grid, not through the generic
 * `AT1_SCHEDULE_6_FIELDS` loop.
 */
export function Schedule6FormView({
	control,
	disabled,
	computed,
}: {
	control: Control<Record<string, unknown>>;
	disabled?: boolean;
	computed?: ComputedReturn;
}) {
	const s6Control = control as unknown as Control<AlbertaRoyaltyCredit6Values>;
	const resolveLine = buildResolveLine(computed);
	const allocations = useWatch({ control: s6Control, name: "allocations" }) ?? [];
	const quarters = useWatch({ control: s6Control, name: "quarters" }) ?? [];

	const aacrsColumns: ClassGridColumn[] = AT1_SCHEDULE_6_FIELDS.filter(
		(f) => f.section === "aacrs",
	).map((f) => {
		const field = parseAt1LineItemId(f.line)?.field ?? f.line;
		return { line: field, caption: f.caption, kind: f.kind, fieldName: AACRS_FIELD_NAME[field] };
	});
	const aacrsRows: ClassGridRow[] = allocations.map((a, i) => ({
		key: `allocation-${i}`,
		label: a?.name || `Row ${i + 1}`,
		arrayIndex: i,
	}));

	return (
		<div className="space-y-4">
			{AT1_SCHEDULE_6_SECTIONS.map((section) => {
				if (section.id === "aacrs") {
					return (
						<PaperSection key={section.id} title={section.title} description={section.description}>
							<div className="p-2">
								<PaperClassGrid
									arrayName="allocations"
									rows={aacrsRows}
									columns={aacrsColumns}
									control={s6Control}
									disabled={disabled}
									resolveCell={() => undefined}
								/>
							</div>
							{aacrsRows.length === 0 && (
								<p className="px-4 pb-3 text-xs text-muted-foreground">
									No allocation rows entered — add one in Guided view if associated.
								</p>
							)}
						</PaperSection>
					);
				}
				const fields = AT1_SCHEDULE_6_FIELDS.filter((f) => f.section === section.id);
				return (
					<PaperSection key={section.id} title={section.title} description={section.description}>
						{fields.map((f) => (
							<PaperLeaderRow
								key={f.line}
								line={parseAt1LineItemId(f.line)?.field ?? f.line}
								caption={f.caption}
								kind={f.kind}
								role={f.role}
								note={f.note}
								from={f.from}
								control={s6Control}
								resolveLine={resolveLine}
								disabled={disabled}
							/>
						))}
					</PaperSection>
				);
			})}
			<PaperSection
				title="Weighted Average Rate — worksheet (feeds line 008 above)"
				description="One row per calendar quarter the taxation year spans. Days and the published RTC quarterly rate — neither has its own AT1 line number; only the resulting weighted rate (line 008) is filed."
			>
				<div className="divide-y">
					{quarters.map((_, i) => (
						<div key={i} className="flex items-center gap-3 px-4 py-2 text-sm">
							<span className="w-16 shrink-0 text-center text-xs text-muted-foreground">Q row {i + 1}</span>
							<Controller
								control={s6Control}
								name={`quarters.${i}.days`}
								render={({ field }) => (
									<input
										type="number"
										inputMode="decimal"
										disabled={disabled}
										aria-label={`Quarter ${i + 1} days`}
										placeholder="Days"
										className={cn(
											"h-8 w-28 rounded-md border border-input bg-transparent px-1.5 text-right text-sm tabular-nums outline-none",
											"focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring",
										)}
										value={(field.value as number | undefined) ?? ""}
										onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
										onBlur={field.onBlur}
									/>
								)}
							/>
							<Controller
								control={s6Control}
								name={`quarters.${i}.rate`}
								render={({ field }) => (
									<input
										type="number"
										inputMode="decimal"
										step="any"
										disabled={disabled}
										aria-label={`Quarter ${i + 1} rate`}
										placeholder="Rate (e.g. .0473)"
										className={cn(
											"h-8 w-32 rounded-md border border-input bg-transparent px-1.5 text-right text-sm tabular-nums outline-none",
											"focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring",
										)}
										value={(field.value as number | undefined) ?? ""}
										onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
										onBlur={field.onBlur}
									/>
								)}
							/>
						</div>
					))}
					{quarters.length === 0 && (
						<p className="px-4 py-2 text-xs text-muted-foreground">
							No quarters entered yet — add them in Guided view.
						</p>
					)}
				</div>
			</PaperSection>
		</div>
	);
}
