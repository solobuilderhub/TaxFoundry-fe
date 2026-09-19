"use client";

import {
	type Control,
	Controller,
	useFieldArray,
	useWatch,
} from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import { cn } from "@/lib/utils";
import type {
	AlbertaReserve17Row,
	AlbertaReserves17Values,
	ReserveType,
} from "../../../../_lib/return-input";
import { at1Money, parseAt1LineItemId } from "./at1-lines";
import { PaperFootnotes, PaperSection } from "./components/paper-primitives";
import {
	AT1_SCHEDULE_17_FIELDS,
	AT1_SCHEDULE_17_FOOTNOTES,
	AT1_SCHEDULE_17_RESERVE_KINDS,
} from "./generated/schedule17.layout";
import type { NavigateToLine } from "./resolve-line";
import { filedByFieldFor } from "./resolve-line";

const SCHEDULE_ID = "017";

/**
 * Which `ReserveType` each printed row is, keyed by its OPENING line number.
 *
 * Keyed by line number rather than by label or by array position: the line
 * number is the row's identity on the form and in the payload, whereas a
 * caption can be reworded and two independent arrays can fall out of step.
 * `AT1_SCHEDULE_17_RESERVE_KINDS` happens to be in the same order as the
 * contract's `RESERVE_TYPES` today, and relying on that is the kind of
 * coincidence that breaks silently.
 */
const TYPE_BY_OPENING_LINE: Record<string, ReserveType> = {
	"001": "doubtfulDebts",
	"003": "undeliveredGoodsAndServices",
	"005": "prepaidRent",
	"009": "returnableContainers",
	"011": "unpaidAmounts",
	"013": "insurancePolicyReserves",
	"015": "bankReserves",
	"017": "otherTaxReserves",
};

/** The three printed column headings, verbatim. */
const COLUMNS: readonly {
	field: "opening" | "transfer" | "closing";
	heading: string;
}[] = [
	{ field: "opening", heading: "Balance at the beginning of the year" },
	{
		field: "transfer",
		heading: "Transfer on amalgamation or wind-up of subsidiary",
	},
	{ field: "closing", heading: "Balance at the end of the year" },
];

/** The TOTALS row the page prints inside the reserves box. */
const TOTAL_LINES: Record<"opening" | "transfer" | "closing", string> = {
	opening: "021",
	transfer: "051",
	closing: "081",
};

const CELL =
	"h-8 w-full rounded-md border border-input bg-transparent px-1.5 text-right text-sm tabular-nums outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:border-dashed disabled:bg-muted/50 disabled:opacity-50";

/** The printed three-digit number from a nine-digit line item id. */
const printed = (line: string) => parseAt1LineItemId(line)?.field ?? line;

/**
 * AT1 Schedule 17 — Alberta Reserves, laid out as the page prints it.
 *
 * ── Why this is not `PaperClassGrid` ────────────────────────────────────────
 *
 * It was, and the result did not resemble the form at all: the column headers
 * showed the FIELD NAMES ("opening", "transfer", "closing") where the page
 * shows its three headings, the row captions were ours rather than the form's,
 * and every cell read "not added" — because that primitive indexes rows by
 * array position and the underlying array starts empty.
 *
 * The form prints EIGHT FIXED ROWS. There is nothing to add or remove: the
 * eight reserve kinds are the form. So the grid is fixed, every cell is
 * editable from the start, and each carries its own line-number chip — the
 * numbers run down the rows (001, 003, 005…), not across the columns, which is
 * why a per-column chip was the wrong shape for them.
 *
 * ── Binding a fixed grid to a sparse array ──────────────────────────────────
 *
 * `albertaReserves17.rows` holds only the kinds that diverge from federal, so
 * a row's array index is not its position on the page. Each cell resolves its
 * own index by `type`, and a first edit to a kind with no row yet APPENDS one
 * — so the stored slice stays sparse (a return that overrides one reserve
 * sends one row) while the page always shows all eight.
 */
export function Schedule17FormView({
	control,
	disabled,
	computed,
	onNavigate: _onNavigate,
	highlightLine: _highlightLine,
}: {
	control: Control<Record<string, unknown>>;
	disabled?: boolean;
	computed?: ComputedReturn;
	onNavigate?: NavigateToLine;
	highlightLine?: string;
}) {
	const c = control as unknown as Control<AlbertaReserves17Values>;
	const { append } = useFieldArray({ control: c, name: "rows" });
	const rows = useWatch({ control: c, name: "rows" }) ?? [];

	const filedByField = filedByFieldFor(
		computed,
		SCHEDULE_ID,
		(l) => parseAt1LineItemId(l)?.field,
	);

	const indexOf = (type: ReserveType) =>
		rows.findIndex((r: AlbertaReserve17Row) => r?.type === type);

	const n = (v: unknown) => (typeof v === "number" ? v : 0);
	const totalOf = (field: "opening" | "transfer" | "closing") =>
		rows.reduce((sum, r) => sum + n(r?.[field]), 0);

	return (
		<div className="space-y-4">
			<PaperSection
				title="Reserves"
				description="Eight reserve kinds, as the form prints them. A cell left blank takes the federal figure — the schedule is required only where Alberta differs. Bank reserves and insurance policy reserves have no federal equivalent, so for those this is the only source."
				formId="AT1SCH17"
			>
				<div className="overflow-x-auto px-4 py-3">
					<table className="w-full border-collapse text-sm">
						<thead>
							<tr className="border-b">
								<th className="w-[28%] px-2 pb-2 text-left font-medium">
									&nbsp;
								</th>
								{COLUMNS.map((col) => (
									<th
										key={col.field}
										className="px-2 pb-2 text-center align-bottom font-medium leading-tight"
									>
										{col.heading}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{AT1_SCHEDULE_17_RESERVE_KINDS.map((kind) => {
								const type = TYPE_BY_OPENING_LINE[printed(kind.opening)];
								if (!type) return null;
								const i = indexOf(type);
								return (
									<tr key={kind.label} className="border-b">
										<td className="px-2 py-1.5 font-medium">{kind.label}</td>
										{COLUMNS.map((col) => (
											<td key={col.field} className="px-2 py-1.5">
												<div className="flex items-center gap-1.5">
													<span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
														{printed(kind[col.field])}
													</span>
													{i >= 0 ? (
														<Controller
															control={c}
															name={`rows.${i}.${col.field}` as const}
															render={({ field: f }) => (
																<input
																	type="number"
																	inputMode="decimal"
																	step="any"
																	disabled={disabled}
																	aria-label={`${kind.label} — ${col.heading}`}
																	className={CELL}
																	value={(f.value as number | undefined) ?? ""}
																	onChange={(e) =>
																		f.onChange(
																			e.target.value === ""
																				? undefined
																				: Number(e.target.value),
																		)
																	}
																	onBlur={f.onBlur}
																/>
															)}
														/>
													) : (
														/*
														 * No row for this kind yet. The input is live
														 * anyway — typing appends the row, so a
														 * preparer never has to "add" a reserve kind
														 * the form already prints.
														 */
														<input
															type="number"
															inputMode="decimal"
															step="any"
															disabled={disabled}
															aria-label={`${kind.label} — ${col.heading}`}
															className={CELL}
															defaultValue=""
															onChange={(e) => {
																if (e.target.value === "") return;
																append({
																	type,
																	[col.field]: Number(e.target.value),
																});
															}}
														/>
													)}
												</div>
											</td>
										))}
									</tr>
								);
							})}
							{/* TOTALS — printed inside the reserves box, with their own lines. */}
							<tr className="bg-muted/30">
								<td className="px-2 py-1.5 text-right font-medium">TOTALS:</td>
								{COLUMNS.map((col) => (
									<td key={col.field} className="px-2 py-1.5">
										<div className="flex items-center gap-1.5">
											<span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
												{TOTAL_LINES[col.field]}
											</span>
											<span className="flex-1 text-right tabular-nums text-muted-foreground">
												{at1Money(totalOf(col.field))}
											</span>
										</div>
									</td>
								))}
							</tr>
						</tbody>
					</table>
				</div>
			</PaperSection>

			{/*
			 * Line 091 sits OUTSIDE the reserves box on the page, under no heading
			 * at all — see `AT1_SCHEDULE_17`'s own section comment. Rendered the
			 * same way: after the box, captioned with the page's own arithmetic.
			 */}
			<div className="flex items-center justify-end gap-3 px-1 text-sm">
				<span className="font-semibold">Line 021 + line 051 =</span>
				<span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
					091
				</span>
				<span
					className={cn("w-32 text-right tabular-nums text-muted-foreground")}
				>
					{at1Money(
						(filedByField.get("091") as number | undefined) ??
							totalOf("opening") + totalOf("transfer"),
					)}
				</span>
			</div>

			{/*
			 * The two carry-forward instructions the page prints in bold italic.
			 * Taken from the field definitions' own `to` refs rather than retyped,
			 * so they cannot drift from the destinations the engine files against.
			 */}
			<div className="space-y-1 px-1 text-sm font-semibold">
				{AT1_SCHEDULE_17_FIELDS.filter((f) => f.to).map((f) => (
					<p key={f.line}>
						{`Carry forward the amount at line ${printed(f.line)} to Schedule 12, line ${printed(f.to?.line ?? "")}.`}
					</p>
				))}
			</div>

			<PaperFootnotes notes={AT1_SCHEDULE_17_FOOTNOTES} />
		</div>
	);
}
