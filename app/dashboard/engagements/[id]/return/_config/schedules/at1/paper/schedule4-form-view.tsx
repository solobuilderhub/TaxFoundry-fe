"use client";

import { TooltipWrapper } from "@classytic/fluid/client/tooltip-wrapper";
import { type Control, Controller, useFieldArray } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import { cn } from "@/lib/utils";
import type { AlbertaForeignInvestment4Values } from "../../../../_lib/return-input";
import { at1Money, parseAt1LineItemId } from "./at1-lines";
import {
	PaperFootnotes,
	PaperLeaderRow,
	PaperSection,
} from "./components/paper-primitives";
import {
	AT1_SCHEDULE_4_COLUMNS,
	AT1_SCHEDULE_4_FIELDS,
	AT1_SCHEDULE_4_FOOTNOTES,
	AT1_SCHEDULE_4_SECTIONS,
} from "./generated/schedule4.layout";
import type { LineValue, NavigateToLine, ResolveLine } from "./resolve-line";

const SCHEDULE_ID = "004";

/** 002/004/008 are genuine editable inputs on this row; 006 and 012 are computed — see `schedule4.ts`'s doc comment. */
const FIELD_NAME: Partial<Record<string, string>> = {
	"002": "country",
	"004": "netForeignInvestmentIncome",
	"008": "fedNonBusinessForeignTaxCredit",
};

const S4_CELL =
	"h-8 w-full rounded-md border border-input bg-transparent px-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:border-dashed disabled:bg-muted/50 disabled:opacity-50";

/**
 * The eight-column country table, A-H, one row per country.
 *
 * ── Why the three blank columns are the point ───────────────────────────────
 *
 * C, D and G carry no line number, and this view used to omit them because it
 * built its columns from `AT1_SCHEDULE_4_FIELDS` — five numbered boxes. The
 * result showed an "Allowable Credit" at H with none of the three quantities
 * that produce it: C is the Alberta allocation factor, D prorates the income
 * by it and by the jacket's 068/066 ratio, G nets the foreign tax against the
 * federal credit and scales it the same way, and H is the lesser of D and G.
 * A preparer reconciling against the paper had four of the eight columns.
 *
 * They render read-only and empty. The engine does compute D and G per country
 * (`incomeProrationAmount`, `taxPaidLessFederalCredit`) but neither is an AT1
 * line, so neither reaches `schedulePayloads` — there is nothing to read. The
 * heading, the letter and the arithmetic are what this view can honestly show,
 * and they are what was missing.
 *
 * ── Why not PaperClassGrid ──────────────────────────────────────────────────
 *
 * It has no way to append a row, which is why this told a preparer to "add one
 * in Guided view first". The page prints a numbered, growable list of
 * countries; sending someone elsewhere to add one is a worse form than paper.
 */
function CountryTable({
	control,
	disabled,
	filedByFieldOccurrence,
}: {
	control: Control<AlbertaForeignInvestment4Values>;
	disabled?: boolean;
	filedByFieldOccurrence: ReadonlyMap<string, string | number>;
}) {
	const { fields, append, remove } = useFieldArray({ control, name: "countries" });

	return (
		<div className="space-y-3 px-4 py-3">
			<div className="overflow-x-auto rounded-lg border bg-card">
				<table className="w-full border-collapse text-xs">
					<thead>
						<tr className="border-b bg-muted/40">
							<th className="w-10 px-2 py-2 text-right font-medium">&nbsp;</th>
							{AT1_SCHEDULE_4_COLUMNS.map((c) => (
								<th
									key={c.column}
									className="min-w-[9rem] px-2 py-2 text-left align-bottom font-medium"
								>
									<span className="block text-center text-sm font-semibold">
										{c.column}
									</span>
									<span className="block leading-tight">
										{c.heading}
										{c.footnoteMarks?.map((i) => (
											<TooltipWrapper
												key={i}
												content={AT1_SCHEDULE_4_FOOTNOTES[i]}
												side="top"
											>
												<span className="ml-0.5 cursor-help font-mono">*</span>
											</TooltipWrapper>
										))}
									</span>
									{c.line ? (
										<span className="mt-0.5 block w-fit rounded bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
											{c.line}
										</span>
									) : (
										<TooltipWrapper
											content="The page numbers this column nowhere — it is part of the derivation behind column H and is not transmitted."
											side="top"
										>
											<span className="mt-0.5 block w-fit cursor-help font-mono text-[10px] text-muted-foreground">
												(no line)
											</span>
										</TooltipWrapper>
									)}
								</th>
							))}
							<th className="w-10 px-2 py-2">&nbsp;</th>
						</tr>
					</thead>
					<tbody>
						{fields.map((row, i) => (
							<tr key={row.id} className="border-b">
								<td className="px-2 py-1.5 text-right text-muted-foreground">
									{i + 1}.
								</td>
								{AT1_SCHEDULE_4_COLUMNS.map((c) => {
									const bind = c.line ? FIELD_NAME[c.line] : undefined;
									// 006 and 012 are computed by the engine and filed, so they
									// are read from the payload by occurrence, not bound.
									const filed = c.line
										? filedByFieldOccurrence.get(`${c.line}-${i + 1}`)
										: undefined;
									return (
										<td key={c.column} className="px-2 py-1.5">
											{bind ? (
												<Controller
													control={control}
													name={`countries.${i}.${bind}` as never}
													render={({ field: f }) => (
														<input
															type={c.line === "002" ? "text" : "number"}
															inputMode={
																c.line === "002" ? undefined : "decimal"
															}
															step="any"
															disabled={disabled}
															aria-label={`Row ${i + 1} — column ${c.column}`}
															className={cn(
																S4_CELL,
																c.line === "002"
																	? "text-left"
																	: "text-right",
															)}
															value={
																(f.value as string | number | undefined) ?? ""
															}
															onChange={(e) =>
																f.onChange(
																	e.target.value === ""
																		? undefined
																		: c.line === "002"
																			? e.target.value
																			: Number(e.target.value),
																)
															}
															onBlur={f.onBlur}
														/>
													)}
												/>
											) : (
												<span className="block h-8 truncate rounded-md border border-dashed bg-muted/50 px-1.5 text-right leading-8 tabular-nums text-muted-foreground">
													{typeof filed === "number"
														? at1Money(filed)
														: (filed ?? "—")}
												</span>
											)}
										</td>
									);
								})}
								<td className="px-2 py-1.5 text-center">
									<button
										type="button"
										onClick={() => remove(i)}
										disabled={disabled}
										aria-label={`Remove row ${i + 1}`}
										className="rounded-md border px-1.5 py-0.5 text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
									>
										✕
									</button>
								</td>
							</tr>
						))}
						{fields.length === 0 && (
							<tr>
								<td
									colSpan={AT1_SCHEDULE_4_COLUMNS.length + 2}
									className="px-3 py-4 text-center text-muted-foreground"
								>
									No countries yet — add one for each country the corporation
									earned foreign non-business income in.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
			<button
				type="button"
				onClick={() => append({})}
				disabled={disabled}
				className="rounded-md border px-2.5 py-1 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
			>
				+ Add a country
			</button>
		</div>
	);
}

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
	// The table owns the row list via `useFieldArray`; nothing here needs to
	// watch it, and watching it too re-rendered this whole view on every cell.
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

	return (
		<div className="space-y-4">
			<PaperSection
				title={AT1_SCHEDULE_4_SECTIONS[0]?.title ?? "Foreign Investment Credits"}
				description={AT1_SCHEDULE_4_SECTIONS[0]?.description}
				formId="AT1SCH04"
			>
				<CountryTable
					control={s4Control}
					disabled={disabled}
					filedByFieldOccurrence={filedByFieldOccurrence}
				/>
			</PaperSection>
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
