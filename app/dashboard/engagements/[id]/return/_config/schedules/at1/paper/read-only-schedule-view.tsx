"use client";

import { TooltipWrapper } from "@classytic/fluid/client/tooltip-wrapper";
import type { ReactNode } from "react";
import type { Control } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type { ReturnInput } from "../../../../_lib/return-input";
import { cn } from "@/lib/utils";
import { parseAt1LineItemId } from "./at1-lines";
import {
	captionFormula,
	formatSignedMoney,
	GlobalLinkedValue,
	OfficialPdfLink,
	OwnLinkedValue,
	PaperFootnotes,
	ProvenanceBadge,
	useLineHighlight,
} from "./components/paper-primitives";
import type {
	LinkedSlot,
	NavigateToLine,
	PaperField,
	PaperSectionDef,
} from "./resolve-line";

/** A line on a read-only schedule whose figure is really a T2 amount kept in the working return — see `LinkedSlot`. */
export type LinkedLines = Record<string, { path: string; label: string }>;

/** The three-digit number the form prints, from the nine-digit line item id. */
const printedLine = (f: PaperField): string =>
	parseAt1LineItemId(f.line)?.field ?? f.line;

/**
 * Reorder a section's fields into the order the page prints them.
 *
 * Fields arrive sorted by line number. Where `printedAfter` says a line is
 * printed somewhere else, it is lifted out and reinserted directly after its
 * anchor. Applied repeatedly until nothing moves, so a chain of moves settles;
 * a key naming a line this section does not have is simply left alone, which is
 * why the definition side asserts both ends exist.
 */
function inPrintedOrder(
	fields: readonly PaperField[],
	printedAfter?: Readonly<Record<string, string>>,
): readonly PaperField[] {
	if (!printedAfter || Object.keys(printedAfter).length === 0) return fields;
	const out = [...fields];
	for (const [line, after] of Object.entries(printedAfter)) {
		const from = out.findIndex((f) => printedLine(f) === line);
		if (from === -1) continue;
		const [moved] = out.splice(from, 1);
		const to = out.findIndex((f) => printedLine(f) === after);
		if (to === -1 || !moved) {
			// Anchor not in this section — put it back rather than drop it.
			if (moved) out.splice(from, 0, moved);
			continue;
		}
		out.splice(to + 1, 0, moved);
	}
	return out;
}

function ReadOnlyRow({
	field,
	filedByField,
	highlightLine,
	onNavigate,
	linked,
	control,
	displayCaption,
}: {
	field: PaperField;
	filedByField: Map<string, string | number>;
	highlightLine?: string;
	onNavigate?: NavigateToLine;
	linked?: LinkedSlot;
	control?: Control<Record<string, unknown>>;
	/** See `ReadOnlyScheduleView`'s `captionFor` — undefined leaves the caption exactly as the form prints it. */
	displayCaption?: string;
}) {
	const lineNumber = parseAt1LineItemId(field.line)?.field ?? field.line;
	const shownCaption = displayCaption ?? field.caption;
	const value = filedByField.get(lineNumber);
	const isNegative = typeof value === "number" && value < 0;
	/*
	 * Only MONEY gets the money treatment. A `code` field is a selector the
	 * form prints as a bare digit — AT1 Schedule 18's line 084, "Specify:
	 * 1 = shares or 2 = debt", rendered as "$1" here, which reads as a
	 * one-dollar figure rather than the code it is. `rate` is likewise a
	 * decimal (Schedule 10's inclusion rate is filed to six places), and a
	 * `flag`/`date`/`text` value is already a string by the time it arrives.
	 */
	const display =
		typeof value === "number"
			? field.kind === "money"
				? formatSignedMoney(value)
				: String(value)
			: value != null
				? String(value)
				: "";
	const formula =
		field.role === "computed" || field.role === "total"
			? captionFormula(field.caption)
			: undefined;
	const { ref, active } = useLineHighlight<HTMLDivElement>(
		field.line,
		highlightLine,
	);

	return (
		<div
			ref={ref}
			className={cn(
				"flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-500",
				active && "bg-amber-100 dark:bg-amber-900/40",
			)}
		>
			<span className="w-16 shrink-0 rounded bg-muted px-1.5 py-0.5 text-center font-mono text-[11px] text-muted-foreground">
				{lineNumber}
			</span>
			<span className="min-w-0 flex-1 truncate" title={field.caption}>
				{shownCaption}
			</span>
			{/*
			 * The absent-figure state is the same dashed empty box `PaperLeaderRow`
			 * shows for a read-only line with nothing in it — an em dash, never a
			 * zero. A zero on a tax form is an assertion ("this line is nil"); a
			 * blank box is the truth here ("nothing has been computed for it").
			 */}
			{linked?.backing === "global" ? (
				<GlobalLinkedValue
					kind={field.kind}
					caption={field.caption}
					slot={linked}
					computedValue={value}
				/>
			) : linked?.backing === "own" && control ? (
				<OwnLinkedValue
					kind={field.kind}
					caption={field.caption}
					slot={linked}
					computedValue={value}
					control={control}
				/>
			) : (
			<span className="flex w-36 shrink-0 items-center justify-end gap-1.5">
				<TooltipWrapper content={display} side="top" disabled={!display}>
					<span
						className={cn(
							"h-8 flex-1 overflow-hidden truncate rounded-md border border-dashed bg-muted/50 px-1.5 text-right text-sm tabular-nums leading-8",
							isNegative
								? "text-red-600 dark:text-red-400"
								: "text-muted-foreground",
						)}
					>
						{display || "—"}
					</span>
				</TooltipWrapper>
			</span>
			)}
			<ProvenanceBadge
				role={field.role}
				note={field.note}
				formula={formula}
				from={field.from}
				sourceText={field.sourceText}
				to={field.to}
				onNavigate={onNavigate}
			/>
		</div>
	);
}

/**
 * The result cell a section ends on, where the page prints one without a line
 * number — see `ReadOnlyScheduleView`'s `sectionResult`.
 *
 * Deliberately shaped unlike a `ReadOnlyRow`: no line-number chip, because it
 * has no line, and the arithmetic set in mono where a field would show its
 * caption. A preparer reading "A" through "D" above it needs to see what the
 * four of them produce.
 */
function SectionResultRow({
	result,
}: {
	result?: {
		label: string;
		formula: string;
		formulaAsPrinted?: string;
		note?: string;
		to?: { form: string; line: string; note?: string };
	};
}) {
	if (!result) return null;
	const toLine = result.to
		? (parseAt1LineItemId(result.to.line)?.field ?? result.to.line)
		: undefined;
	return (
		<div className="flex items-center gap-3 bg-muted/30 px-4 py-2 text-sm">
			<span className="w-16 shrink-0 text-center font-mono text-[11px] text-muted-foreground">
				—
			</span>
			<span className="min-w-0 flex-1">
				<span className="text-muted-foreground">{result.label}</span>
				<TooltipWrapper
					content={
						result.formulaAsPrinted
							? `The form prints this as ${result.formulaAsPrinted}, using its column letters.`
							: undefined
					}
					side="top"
					disabled={!result.formulaAsPrinted}
				>
					<span className="ml-2 cursor-help rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">
						{result.formula}
					</span>
				</TooltipWrapper>
				{result.note && (
					<span className="ml-2 text-xs text-muted-foreground">
						{result.note}
					</span>
				)}
			</span>
			{result.to && (
				<TooltipWrapper content={result.to.note} side="top" disabled={!result.to.note}>
					<span className="shrink-0 cursor-help rounded-md border px-1.5 py-0.5 text-[10px] text-muted-foreground">
						{`→ ${result.to.form} line ${toLine}`}
					</span>
				</TooltipWrapper>
			)}
		</div>
	);
}

/**
 * Shared shell for schedules with no editable side at all — Schedule 12
 * (fully computed from other schedules' overrides), and Schedule 2/10 (no
 * dedicated `ReturnInput` slice; whatever this product does compute for
 * them lives entirely in OTHER schedules' fields). Each gets its own
 * nav entry outside the normal registry (see `return-editor.tsx`), the same
 * special-cased pattern as "Tax Summary (jacket)".
 *
 * The FORM always renders — every section, line number, caption, role badge,
 * note and carry-forward pill — whether or not a computed return exists. A
 * paper Form View exists to show the form; a preparer who opens one before
 * computing is looking for its shape, and an empty form answers that where a
 * single sentence does not. The two "why are the figures blank" explanations
 * moved to a line above the form rather than replacing it.
 */
export function ReadOnlyScheduleView({
	scheduleId,
	formId,
	sections,
	fields,
	footnotes,
	sectionResult,
	captionFor,
	grids,
	printedAfter,
	blockHeadings,
	computed,
	stale,
	notComputedMessage,
	nothingToReportMessage,
	onNavigate,
	highlightLine,
	linkedLines,
	returnInput,
	writeInput,
	control,
	ownSlice,
}: {
	scheduleId: string;
	/** The `FormDefinition.id` (e.g. `"AT1SCH12"`) — for the "View official PDF" link, when a vendored copy exists (see `OFFICIAL_PDF`). */
	formId?: string;
	sections: readonly PaperSectionDef[];
	fields: readonly PaperField[];
	/**
	 * The schedule's own `FormDefinition.footnotes` — the instructions the page
	 * prints in its margins, which belong to the whole form rather than any one
	 * line. Rendered beneath the last section, as the page prints them.
	 *
	 * Every read-only schedule had them in its data and none of them reached the
	 * screen, because this shell never accepted them. Schedule 2 is where that
	 * shows worst: the rule deciding WHICH Area B formula a multi-industry
	 * corporation completes is a printed instruction, not a line.
	 */
	footnotes?: readonly string[];
	/**
	 * A per-section result cell the page prints WITHOUT a line number — AT1
	 * Schedule 2's column I, the Alberta Allocation Factor, which every one of
	 * its eleven formulas has and none of them numbers.
	 *
	 * It cannot be a `PaperField` (there is no line to hang it on) and it
	 * cannot be dropped either: A, B, C and D are inputs to arithmetic a
	 * preparer otherwise cannot see. Rendered as the section's last row, which
	 * is where the page puts it.
	 */
	/**
	 * Rewrite a caption for display, where the page's own wording refers to
	 * something this view does not show. AT1 Schedule 2's lines 102 and 104 are
	 * the case: their captions ARE arithmetic — "(E/F) x (AT1 lines 062)" — in
	 * the column letters the page heads its grid with, and this view labels
	 * every row by its printed line number instead. The letters name nothing
	 * the reader can see.
	 *
	 * The stored caption stays verbatim and remains the hover title, so the
	 * form's own words are never lost — this only changes what is set in the
	 * row. Undefined leaves the caption exactly as printed.
	 */
	captionFor?: (field: PaperField) => string | undefined;
	/**
	 * Replace a run of rows with a grid, for the schedules the page lays out as
	 * a TABLE rather than a list of lines.
	 *
	 * The flat list is ordered by line number, which on a grid-shaped schedule
	 * is not the reading order at all: AT1 Schedule 18 numbers its four columns
	 * in four separate bands, so the flat view shows all six column-A lines,
	 * then all six column-B lines, and a preparer holding the paper cannot find
	 * a single row of it. Which cells share a row is exactly the structure a
	 * list of `PaperField`s cannot carry.
	 *
	 * Each block names the printed line it stands in for (`anchor`) and every
	 * printed line it renders (`lines`); those are dropped from the flat list,
	 * so nothing appears twice and anything the block does NOT claim still
	 * renders as an ordinary row. Given the filed values so the block and the
	 * rows read from one source.
	 */
	grids?: (
		filedByField: ReadonlyMap<string, string | number>,
	) => readonly {
		anchor: string;
		lines: readonly string[];
		node: ReactNode;
	}[];
	/**
	 * Where the page prints a line somewhere other than its number would put it.
	 * Keyed printed line → the printed line it follows on the page.
	 *
	 * Fields arrive sorted by line number, which is the right default and is
	 * correct nearly everywhere. AT1 Schedule 18's line 076 is not: it is the
	 * last figure on the schedule, struck from 099, but numbers below 077-099 —
	 * so by number the answer prints six rows above the arithmetic that produces
	 * it, captioned "Line 099 X 50%" while 099 is still further down.
	 */
	printedAfter?: Readonly<Record<string, string>>;
	/**
	 * Headings the page sets INSIDE a section, above the lines they govern.
	 * A `PaperSectionDef` cannot hold these — the block has one heading of its
	 * own and the page runs on beneath it — but the text is load-bearing where
	 * the captions below it do not stand alone.
	 */
	blockHeadings?: readonly { aboveLine: string; text: string }[];
	sectionResult?: (sectionId: string) =>
		| {
				label: string;
				formula: string;
				/** The same arithmetic in the page's own column letters, for the tooltip. */
				formulaAsPrinted?: string;
				note?: string;
				to?: { form: string; line: string; note?: string };
			}
		| undefined;
	computed?: ComputedReturn;
	stale?: boolean;
	/** Shown above the form when the return has never been computed at all — no figure on it reflects a real filing yet. */
	notComputedMessage: string;
	/** Shown above the form when the return HAS been computed but this schedule genuinely has nothing to report — a real, correct outcome, not a gap. */
	nothingToReportMessage: string;
	onNavigate?: NavigateToLine;
	highlightLine?: string;
	/**
	 * Lines (by printed three-digit number) that show a T2 figure the working
	 * return keeps in one slot — locked, with a toggle to type it in. Honoured
	 * only when `writeInput` is supplied; otherwise they stay plain read-only.
	 */
	linkedLines?: LinkedLines;
	returnInput?: ReturnInput;
	writeInput?: (path: string, value: number | undefined) => Promise<void>;
	/**
	 * Set when this view is a schedule's OWN Form View — the form whose slice
	 * (`ownSlice`) some linked lines live in. Those lines then bind through
	 * `control` and save with the schedule. Writing them through `writeInput`
	 * instead would be undone by the schedule's next save, which writes the
	 * form's (stale) copy of the same field back over it.
	 */
	control?: Control<Record<string, unknown>>;
	ownSlice?: string;
}) {
	const linkFor = (field: PaperField): LinkedSlot | undefined => {
		const slot = linkedLines?.[parseAt1LineItemId(field.line)?.field ?? field.line];
		if (!slot) return undefined;
		if (control && ownSlice && slot.path.startsWith(`${ownSlice}.`)) {
			return {
				backing: "own",
				name: slot.path.slice(ownSlice.length + 1),
				label: slot.label,
			};
		}
		if (!writeInput) return undefined;
		let stored: unknown = returnInput;
		for (const k of slot.path.split("."))
			stored = (stored as Record<string, unknown> | undefined)?.[k];
		return {
			backing: "global",
			path: slot.path,
			label: slot.label,
			stored: typeof stored === "number" ? stored : undefined,
			write: (v) => writeInput(slot.path, v),
		};
	};
	const filed = computed?.schedulePayloads?.find(
		(p) => p.scheduleId === scheduleId,
	);
	const filedByField = new Map(
		(filed?.values ?? []).flatMap((v) => {
			const parsed = parseAt1LineItemId(v.lineItemId);
			return parsed ? [[parsed.field, v.value] as const] : [];
		}),
	);

	// `computed` presence and `filed` presence answer two different questions —
	// conflating them into one message reads as "is this even real?" (the
	// exact question this distinction exists to answer). No computed return at
	// all is a genuinely different state from a computed return where this
	// schedule correctly had nothing to reconcile. Either way the form below is
	// the same form; only the reason its value cells are empty differs.
	const emptyReason = !computed
		? notComputedMessage
		: !filed
			? nothingToReportMessage
			: undefined;

	const gridBlocks = grids?.(filedByField) ?? [];

	return (
		<div className="space-y-4">
			{formId && (
				<div className="flex justify-end">
					<OfficialPdfLink formId={formId} />
				</div>
			)}
			{emptyReason && (
				<p className="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
					{emptyReason}
				</p>
			)}
			{stale && (
				<p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
					Inputs changed since — recompute to refresh these figures.
				</p>
			)}
			{sections.map((section) => {
				const sectionFields = inPrintedOrder(
					fields.filter((f) => f.section === section.id),
					printedAfter,
				);
				if (sectionFields.length === 0) return null;
				const blocks = gridBlocks.filter((b) =>
					sectionFields.some((f) => printedLine(f) === b.anchor),
				);
				const claimed = new Set(blocks.flatMap((b) => b.lines));
				return (
					<div key={section.id} className="rounded-lg border bg-card">
						<div className="border-b bg-muted/40 px-4 py-2">
							<h3 className="text-sm font-semibold">{section.title}</h3>
							{section.description && (
								<p className="mt-0.5 text-xs text-muted-foreground">
									{section.description}
								</p>
							)}
						</div>
						<div className="divide-y">
							{sectionFields.map((f) => {
								const line = printedLine(f);
								const block = blocks.find((b) => b.anchor === line);
								// The grid stands where its first line stood; the rest
								// of its lines drop out of the list entirely.
								if (block)
									return <div key={f.line}>{block.node}</div>;
								if (claimed.has(line)) return null;
								const heading = blockHeadings?.find(
									(h) => h.aboveLine === line,
								);
								const row = (
									<ReadOnlyRow
										key={f.line}
										field={f}
										filedByField={filedByField}
										highlightLine={highlightLine}
										onNavigate={onNavigate}
										linked={linkFor(f)}
										control={control}
										displayCaption={captionFor?.(f)}
									/>
								);
								if (!heading) return row;
								return (
									<div key={f.line}>
										<p className="px-4 pb-1 pt-3 text-sm font-semibold">
											{heading.text}
										</p>
										{row}
									</div>
								);
							})}
							<SectionResultRow result={sectionResult?.(section.id)} />
						</div>
					</div>
				);
			})}
			<PaperFootnotes notes={footnotes} />
		</div>
	);
}
