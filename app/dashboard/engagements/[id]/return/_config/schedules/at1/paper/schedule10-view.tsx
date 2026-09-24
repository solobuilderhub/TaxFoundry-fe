"use client";

import { type Control, useWatch } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type { EngagementYear } from "@/api/engagements";
import { Input } from "@/components/ui/input";
import type { AlbertaContinuityValues } from "../../../../_lib/return-input";
import { parseAt1LineItemId } from "./at1-lines";
import { PaperCheck, PaperMoney } from "./components/paper-inputs";
import { PaperFootnotes, PaperSection } from "./components/paper-primitives";
import {
	AT1_SCHEDULE_10_FIELDS,
	AT1_SCHEDULE_10_FOOTNOTES,
} from "./generated/schedule10.layout";
import { filedByFieldFor } from "./resolve-line";

/**
 * AT1 Schedule 10 — Alberta Loss Carry-Back Application, as the printed grid
 * (TRA11731 Rev. 2025-12, page 1).
 *
 * The carry-back requests are TYPED HERE, where the page prints them. They
 * used to be entered only in Schedule 21's guided view, with this schedule a
 * read-only echo — so a preparer looking for "carry back a loss" found a form
 * that would not take one.
 *
 * The form is the `albertaContinuity` slice — the one place the engine reads
 * the requests from — and saves itself like every other form. Rows are fixed
 * positions: row i is the i-th preceding year, and its date (003/005/007) is
 * shared by every column. Figures the engine computes (the loss available at
 * A, the balances at 010/020/040/050) come from the live preview.
 */

type ColumnKey =
	| "nonCapitalCarrybacks"
	| "farmCarrybacks"
	| "otherLossCarrybacks"
	| "capitalCarrybacks";
type Row = { taxYearEnd?: string; amount?: number } | null | undefined;

const COLUMNS: {
	key: ColumnKey;
	title: string;
	available: string;
	rows: [string, string, string];
	balance: string;
}[] = [
	{
		key: "nonCapitalCarrybacks",
		title: "Non-capital Loss",
		available: "002",
		rows: ["004", "006", "008"],
		balance: "010",
	},
	{
		key: "farmCarrybacks",
		title: "Farm Loss",
		available: "012",
		rows: ["014", "016", "018"],
		balance: "020",
	},
	{
		key: "otherLossCarrybacks",
		title: "Other Losses",
		available: "032",
		rows: ["034", "036", "038"],
		balance: "040",
	},
	{
		key: "capitalCarrybacks",
		title: "Capital Loss — Gross Amount",
		available: "042",
		rows: ["044", "046", "048"],
		balance: "050",
	},
];
const CARRYBACK_KEYS = COLUMNS.map((c) => c.key);
const DATE_LINES = ["003", "005", "007"] as const;
const RATE_LINES = ["043", "045", "047"] as const;
/** Row captions, from the form definition ("1st preceding taxation year ending (YYYY MM DD)"). */
const ROW_LABELS = ["003", "005", "007"].map(
	(line) =>
		AT1_SCHEDULE_10_FIELDS.find(
			(f) => f.line === `010${line}001`,
		)?.caption.replace(/\s*\(YYYY MM DD\)$/, "") ?? line,
);
/** Post-2000 inclusion rate, which the engine files at 043/045/047 (see page 2). */
const INCLUSION_RATE = 0.5;

const money = (v: number | undefined) =>
	v === undefined || Number.isNaN(v)
		? ""
		: v < 0
			? `($${Math.abs(Math.round(v)).toLocaleString("en-CA")})`
			: `$${Math.round(v).toLocaleString("en-CA")}`;

/** The i-th preceding year end: the day before this tax year starts, less i years. */
function defaultYearEnd(taxYearStart: string | undefined, i: number) {
	if (!taxYearStart) return undefined;
	const d = new Date(taxYearStart);
	if (Number.isNaN(d.getTime())) return undefined;
	d.setUTCDate(d.getUTCDate() - 1);
	d.setUTCFullYear(d.getUTCFullYear() - i);
	return d.toISOString().slice(0, 10);
}

const READ =
	"flex h-8 items-center justify-end rounded-md border border-dashed bg-muted/50 px-1.5 text-sm tabular-nums text-muted-foreground";

function LineChip({ line }: { line: string }) {
	return (
		<span className="mr-1 shrink-0 rounded bg-muted px-1 font-mono text-[10px] text-muted-foreground">
			{line}
		</span>
	);
}

export function Schedule10View({
	control,
	setValue,
	computed,
	engagement,
	disabled,
}: {
	control: Control<Record<string, unknown>>;
	setValue: (
		name: string,
		value: unknown,
		options?: { shouldDirty?: boolean },
	) => void;
	computed?: ComputedReturn;
	engagement?: EngagementYear;
	disabled?: boolean;
}) {
	const filed = filedByFieldFor(
		computed,
		"010",
		(l) => parseAt1LineItemId(l)?.field,
	);
	const num = (line: string) => {
		const v = filed.get(line);
		return v === undefined ? undefined : Number(v);
	};
	const watched = useWatch({ control, name: CARRYBACK_KEYS }) as (
		| Row[]
		| undefined
	)[];
	const rowsOf = (key: ColumnKey) => watched[CARRYBACK_KEYS.indexOf(key)] ?? [];

	/** The date on row i: entered in any column, else the preceding year end. */
	const fallbackDate = (i: number) =>
		defaultYearEnd(
			engagement?.taxYearStart as unknown as string | undefined,
			i,
		);
	const dateOf = (i: number): string | undefined =>
		CARRYBACK_KEYS.map((k) => rowsOf(k)[i]?.taxYearEnd).find(
			(d): d is string => !!d && d.trim() !== "",
		);
	/*
	 * One date per row, stored on every column's row that exists — and always
	 * on the non-capital column, so a date typed before any amount is kept.
	 * The server reads a row's own date first, so a column left holding an
	 * older date would file it.
	 */
	const setDate = (i: number, date: string) => {
		for (const key of CARRYBACK_KEYS) {
			if (key === "nonCapitalCarrybacks" || rowsOf(key)[i]) {
				setValue(`${key}.${i}.taxYearEnd`, date || undefined, {
					shouldDirty: true,
				});
			}
		}
	};

	/*
	 * With no rows entered in a column, the engine files the federal
	 * carry-back (non-capital) — shown as the box's placeholder so the empty
	 * box does not hide a figure that IS being filed.
	 */
	const filedPlaceholder = (key: ColumnKey, line: string) => {
		const entered = rowsOf(key).some((r) => r?.amount != null);
		const v = num(line);
		return !entered && v !== undefined ? String(v) : undefined;
	};

	/** Column B — the page's own sum of the three rows above it. */
	const totalOf = (key: ColumnKey) =>
		rowsOf(key)
			.slice(0, 3)
			.reduce((s, r) => s + (Number(r?.amount) || 0), 0);

	return (
		<div className="space-y-4">
			<p className="px-1 text-sm text-muted-foreground">
				For use by a corporation to request a loss carry-back to prior taxation
				years. The application of losses is at the corporation's discretion, so
				the federal application does not apply for Alberta purposes. Report all
				monetary amounts in dollars.
			</p>
			<PaperSection
				title="Application of current year losses"
				description="Enter the loss to be applied to each preceding year. Type the loss available (A) when the T2 was not prepared here; blank uses the federal figure. The balance carried forward is calculated."
				formId="AT1SCH10"
			>
				<div className="overflow-x-auto p-2">
					<table className="w-full min-w-[56rem] border-collapse text-sm">
						<thead>
							<tr className="align-bottom">
								<th className="w-56 border-b px-2 pb-2 text-left font-medium" />
								{COLUMNS.slice(0, 3).map((c) => (
									<th
										key={c.key}
										className="border-b px-2 pb-2 text-left font-semibold"
									>
										{c.title}
										{c.key === "otherLossCarrybacks" && (
											<span className="mt-1 block space-y-1 text-xs font-normal">
												<span className="flex items-center">
													<LineChip line="023" />
													<PaperCheck
														control={control}
														name="otherLossIncludesRestrictedFarm"
														label="Restricted Farm"
														disabled={disabled}
													/>
												</span>
												<span className="flex items-center">
													<LineChip line="025" />
													<PaperCheck
														control={control}
														name="otherLossIncludesListedPersonal"
														label="Listed Personal Property"
														disabled={disabled}
													/>
												</span>
											</span>
										)}
									</th>
								))}
								<th className="border-b px-2 pb-2 text-left font-semibold">
									Inclusion Rate
								</th>
								<th className="border-b px-2 pb-2 text-left font-semibold">
									Capital Loss — Gross Amount
								</th>
								<th className="border-b px-2 pb-2 text-left font-semibold">
									Amount of Loss Applied
									<span className="block text-xs font-normal">
										(Inclusion Rate × Capital Loss)
									</span>
								</th>
							</tr>
						</thead>
						<tbody>
							<tr className="border-b">
								<td className="px-2 py-1.5">
									<span className="font-medium">
										Amount of current year loss available for carry-back
									</span>{" "}
									<span className="font-semibold">A</span>
								</td>
								{COLUMNS.slice(0, 3).map((c) =>
									c.key === "nonCapitalCarrybacks" ? (
										<td key={c.key} className="px-2 py-1.5">
											<div className="flex items-center">
												<LineChip line="002" />
												<PaperMoney
													control={control}
													name="nonCapitalCurrentYearLoss"
													label="Non-capital loss available for carry-back"
													placeholder={
														num("002") === undefined
															? "Federal"
															: String(num("002"))
													}
													disabled={disabled}
												/>
											</div>
										</td>
									) : (
										<td key={c.key} className="px-2 py-1.5">
											<div className={READ} title="Calculated">
												<LineChip line={c.available} />
												{money(num(c.available))}
											</div>
										</td>
									),
								)}
								<td />
								<td className="px-2 py-1.5">
									{/*
									 * Same figure as federal (TRA says so), typed when the T2
									 * is not in this app. Also Schedule 21's capital
									 * current-year loss — one entry for both.
									 */}
									<div className="flex items-center">
										<LineChip line="042" />
										<PaperMoney
											control={control}
											name="capitalCurrentYearLoss"
											label="Gross capital loss available for carry-back"
											placeholder={
												num("042") === undefined
													? "Federal"
													: String(num("042"))
											}
											disabled={disabled}
										/>
									</div>
								</td>
								<td />
							</tr>
							<tr>
								<td
									colSpan={7}
									className="px-2 pt-3 pb-1 text-sm font-semibold"
								>
									Deduct loss to be applied under the{" "}
									<i>Alberta Corporate Tax Act</i> to:
								</td>
							</tr>
							{ROW_LABELS.map((label, i) => {
								const capital = Number(rowsOf("capitalCarrybacks")[i]?.amount);
								return (
									<tr key={label} className="border-b">
										<td className="px-2 py-1.5">
											<span className="block text-xs">{label}:</span>
											<span className="flex items-center gap-1">
												<LineChip line={DATE_LINES[i] as string} />
												<Input
													type="date"
													aria-label={label}
													className="h-8"
													disabled={disabled}
													// No date typed: the preceding year end, which is
													// also what the server files for this row.
													value={dateOf(i) ?? fallbackDate(i) ?? ""}
													onChange={(e) => setDate(i, e.target.value)}
												/>
											</span>
										</td>
										{COLUMNS.slice(0, 3).map((c) => (
											<td key={c.key} className="px-2 py-1.5">
												<div className="flex items-center">
													<LineChip line={c.rows[i] as string} />
													<PaperMoney
														control={control}
														name={`${c.key}.${i}.amount`}
														label={`${c.title} — ${label}`}
														placeholder={filedPlaceholder(
															c.key,
															c.rows[i] as string,
														)}
														disabled={disabled}
													/>
												</div>
											</td>
										))}
										<td className="px-2 py-1.5">
											<div
												className={READ}
												title="Post-2000 inclusion rate (page 2)"
											>
												<LineChip line={RATE_LINES[i] as string} />
												{INCLUSION_RATE.toFixed(6)}
											</div>
										</td>
										<td className="px-2 py-1.5">
											<div className="flex items-center">
												<LineChip line={COLUMNS[3]?.rows[i] as string} />
												<PaperMoney
													control={control}
													name={`capitalCarrybacks.${i}.amount`}
													label={`Capital loss — ${label}`}
													placeholder={filedPlaceholder(
														"capitalCarrybacks",
														COLUMNS[3]?.rows[i] as string,
													)}
													disabled={disabled}
												/>
											</div>
										</td>
										<td className="px-2 py-1.5">
											<div className={READ}>
												{Number.isFinite(capital) && capital > 0
													? money(capital * INCLUSION_RATE)
													: ""}
											</div>
										</td>
									</tr>
								);
							})}
							<tr className="border-b">
								<td className="px-2 py-1.5">
									<span className="font-medium">Total loss carried back:</span>{" "}
									<span className="font-semibold">B</span>
								</td>
								{COLUMNS.slice(0, 3).map((c) => (
									<td key={c.key} className="px-2 py-1.5">
										<div className={READ}>{money(totalOf(c.key))}</div>
									</td>
								))}
								<td className="bg-muted/60" />
								<td className="px-2 py-1.5">
									<div className={READ}>
										{money(totalOf("capitalCarrybacks"))}
									</div>
								</td>
								<td className="bg-muted/60" />
							</tr>
							<tr>
								<td className="px-2 py-1.5 font-medium">
									Balance of current year loss available for carry forward
									(Amount A minus amount B)
								</td>
								{COLUMNS.slice(0, 3).map((c) => (
									<td key={c.key} className="px-2 py-1.5">
										<div className={READ} title="Calculated">
											<LineChip line={c.balance} />
											{money(num(c.balance))}
										</div>
									</td>
								))}
								<td className="bg-muted/60" />
								<td className="px-2 py-1.5">
									<div className={READ} title="Calculated">
										<LineChip line="050" />
										{money(num("050"))}
									</div>
								</td>
								<td className="bg-muted/60" />
							</tr>
						</tbody>
					</table>
				</div>
			</PaperSection>
			<PaperFootnotes notes={AT1_SCHEDULE_10_FOOTNOTES} />
			<p className="px-1 text-xs text-muted-foreground">
				A carry-back larger than the loss available is refused rather than
				capped — the header shows the engine's message until the rows are
				reduced. Inclusion rate: ½ for dispositions after October 17, 2000 (page
				2).
			</p>
		</div>
	);
}
