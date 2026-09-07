"use client";

import { parseT2LineItemId } from "@classytic/ca-tax/t2";
import type { Control } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import {
	PaperLeaderRow,
	PaperSection,
} from "../../at1/paper/components/paper-primitives";
import type {
	LineValue,
	NavigateToLine,
	ResolveLine,
} from "../../at1/paper/resolve-line";

/**
 * The figures this computed return filed for one schedule, keyed `line-occurrence`.
 *
 * `parseT2LineItemId` is the engine's own parser and it rejects anything that
 * is not a six-digit federal id — an Alberta nine-digit id included. That
 * refusal is the point: reading the first three characters of an Alberta id as
 * a federal line number would put a real Alberta figure against a federal line,
 * which looks exactly like a correct return.
 */
export function filedValuesFor(
	computed: ComputedReturn | undefined,
	scheduleId: string,
): Map<string, string | number> {
	const filed = computed?.schedulePayloads?.find(
		(p) => p.scheduleId === scheduleId,
	);
	return new Map(
		(filed?.values ?? []).flatMap((v) => {
			const parsed = parseT2LineItemId(v.lineItemId);
			return parsed
				? [[`${parsed.line}-${parsed.occurrence}`, v.value] as const]
				: [];
		}),
	);
}

/**
 * One field of a generated paper layout. Structurally identical across every
 * emitted `*.layout.ts`, which each declare their own copy of this type, so it
 * is restated here rather than imported from one arbitrary layout file.
 */
export interface PaperLayoutField {
	line: string;
	caption: string;
	kind: "money" | "date" | "text" | "rate" | "flag" | "code";
	role: "input" | "computed" | "total" | "carried-in";
	section: string;
	note?: string;
	from?: { form: string; line: string; note?: string };
	to?: { form: string; line: string; note?: string };
}

export interface PaperLayoutSection {
	id: string;
	title: string;
	description?: string;
}

/**
 * Render a whole generated form layout, section by section, as paper rows.
 *
 * Every federal paper view was repeating the same twenty-line block: filter the
 * fields by section, drop empty sections, map each to a `PaperLeaderRow`. Eight
 * copies of that is eight places for the roles, notes and cross-references to be
 * dropped one at a time — and several of them already had.
 *
 * `boundFields` names the lines this app actually collects, mapping a line
 * number to the form field that holds it. A named line renders editable and
 * takes the `input` role whatever the definition says.
 *
 * Every other line renders read-only, showing the figure the last compute
 * filed for it when there is one. Federal returns did not carry per-line
 * figures at all until `federalSchedulePayloads` was built, which is why these
 * views used to show "not available" against every computed line of every
 * schedule; pass `computed` and `scheduleId` and they show the number instead.
 * A line the engine did not compute still shows nothing, because a schedule
 * only reports a figure whose line is recorded in code rather than inferred.
 */
export function PaperFormSections({
	sections,
	fields,
	control,
	boundFields,
	computed,
	scheduleId,
	disabled,
	onNavigate,
	highlightLine,
	formId,
	titleSuffix,
}: {
	sections: readonly PaperLayoutSection[];
	fields: readonly PaperLayoutField[];
	control: Control<Record<string, unknown>>;
	/** Line number → the form field name that holds it, for lines this app collects. */
	boundFields?: Readonly<Record<string, string | undefined>>;
	/** The last computed return, so a read-only line can show its filed figure. */
	computed?: ComputedReturn;
	/** Which schedule's filed values to read — the form id, e.g. `T2SCH1`. */
	scheduleId?: string;
	disabled?: boolean;
	onNavigate?: NavigateToLine;
	highlightLine?: string;
	/** Stamped on the first section, so the form is identified once, not per part. */
	formId?: string;
	/** Appended to each section title, e.g. " — as printed, not collected here". */
	titleSuffix?: string;
}) {
	const filed = scheduleId ? filedValuesFor(computed, scheduleId) : undefined;
	const resolveLine: ResolveLine = (line): LineValue => {
		const name = boundFields?.[line];
		if (name) return { editable: true, name };
		// Occurrence 1: these are the leader-row forms, one row per line. Grid
		// forms resolve per row and do not come through here.
		return { editable: false, value: filed?.get(`${line}-1`) };
	};

	let first = true;
	return (
		<>
			{sections.map((section) => {
				const inSection = fields.filter((f) => f.section === section.id);
				if (inSection.length === 0) return null;
				const stampForm = first ? formId : undefined;
				first = false;
				return (
					<PaperSection
						key={section.id}
						title={
							titleSuffix ? `${section.title}${titleSuffix}` : section.title
						}
						description={section.description}
						formId={stampForm}
					>
						{inSection.map((f) => (
							<PaperLeaderRow
								key={f.line}
								line={f.line}
								caption={f.caption}
								kind={f.kind}
								role={boundFields?.[f.line] ? "input" : f.role}
								note={f.note}
								from={f.from}
								to={f.to}
								onNavigate={onNavigate}
								highlightLine={highlightLine}
								control={control}
								resolveLine={resolveLine}
								disabled={disabled}
							/>
						))}
					</PaperSection>
				);
			})}
		</>
	);
}
