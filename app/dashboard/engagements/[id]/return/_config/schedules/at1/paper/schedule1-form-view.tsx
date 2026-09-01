"use client";

import { useWatch, type Control } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type { AlbertaSbdValues } from "../../../../_lib/return-input";
import { parseAt1LineItemId } from "./at1-lines";
import {
	PaperClassGrid,
	PaperFootnotes,
	PaperLeaderRow,
	PaperSection,
	type ClassGridColumn,
	type ClassGridRow,
} from "./components/paper-primitives";
import { AT1_SCHEDULE_1_FIELDS, AT1_SCHEDULE_1_FOOTNOTES, AT1_SCHEDULE_1_SECTIONS } from "./generated/schedule1.layout";
import type { LineValue, NavigateToLine, ResolveLine } from "./resolve-line";

const SCHEDULE_ID = "001";

/**
 * Lines 005 and 011 both file the SAME entered value (`royaltyTaxDeduction`)
 * against two different income bases — see `schedule1.ts`'s own doc comment.
 * Everything else on this schedule is carried in from elsewhere or computed;
 * only these two boxes are genuinely this schedule's own input.
 */
const OWN_FIELD: Partial<Record<string, keyof AlbertaSbdValues>> = {
	"005": "royaltyTaxDeduction",
	"011": "royaltyTaxDeduction",
};

/** Area A's own three columns (041/043/045), each bound to `associatedCorpAgreement`'s row shape. */
const AGREEMENT_FIELD_NAME: Record<string, string> = {
	"041": "name",
	"043": "albertaCan",
	"045": "allocatedAmount",
};

function buildResolveLine(computed: ComputedReturn | undefined): ResolveLine {
	const filed = computed?.schedulePayloads?.find((p) => p.scheduleId === SCHEDULE_ID);
	const filedByField = new Map(
		(filed?.values ?? []).flatMap((v) => {
			const parsed = parseAt1LineItemId(v.lineItemId);
			return parsed ? [[parsed.field, v.value] as const] : [];
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
 * AT1 Schedule 1 paper Form View — lines 001-013 (the eligibility test and
 * the two balance calculations this product computes) plus Area A's
 * Agreement Among Associated Corporations (041/043/045), rendered as a grid
 * since it repeats per associated corp. Line 015 onward (the base amount,
 * the SBD calculation table, the business-limit reduction cascade) is not
 * modelled — see `schedule1.ts`'s own doc comment for the full list.
 */
export function Schedule1FormView({
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
	const sbdControl = control as unknown as Control<AlbertaSbdValues>;
	const resolveLine = buildResolveLine(computed);
	const members = useWatch({ control: sbdControl, name: "associatedCorpAgreement" }) ?? [];

	const agreementRows: ClassGridRow[] = members.map((m, i) => ({
		key: `member-${i}`,
		label: m?.name || `Corporation ${i + 1}`,
		arrayIndex: i,
	}));
	const agreementColumns: ClassGridColumn[] = AT1_SCHEDULE_1_FIELDS.filter(
		(f) => f.section === "agreement",
	).map((f) => {
		const field = parseAt1LineItemId(f.line)?.field ?? f.line;
		return { line: field, caption: f.caption, kind: f.kind, fieldName: AGREEMENT_FIELD_NAME[field] };
	});

	return (
		<div className="space-y-4">
			{AT1_SCHEDULE_1_SECTIONS.map((section, i) => {
				const fields = AT1_SCHEDULE_1_FIELDS.filter((f) => f.section === section.id);
				if (fields.length === 0) return null;
				const formId = i === 0 ? "AT1SCH1" : undefined;
				if (section.id === "agreement") {
					return (
						<PaperSection key={section.id} title={section.title} description={section.description} formId={formId}>
							<div className="p-2">
								<PaperClassGrid
									arrayName="associatedCorpAgreement"
									rows={agreementRows}
									columns={agreementColumns}
									control={sbdControl}
									disabled={disabled}
									resolveCell={() => undefined}
								/>
							</div>
							{agreementRows.length === 0 && (
								<p className="px-4 pb-3 text-xs text-muted-foreground">
									No associated corporations entered — add one in Guided view if line 001 is Yes.
								</p>
							)}
						</PaperSection>
					);
				}
				return (
					<PaperSection key={section.id} title={section.title} description={section.description} formId={formId}>
						{fields.map((f) => (
							<PaperLeaderRow
								key={f.line}
								line={parseAt1LineItemId(f.line)?.field ?? f.line}
								caption={f.caption}
								kind={f.kind}
								role={f.role}
								note={f.note}
								from={f.from}
								to={f.to}
								onNavigate={onNavigate}
								highlightLine={highlightLine}
								control={sbdControl}
								resolveLine={resolveLine}
								disabled={disabled}
							/>
						))}
					</PaperSection>
				);
			})}
			<PaperFootnotes notes={AT1_SCHEDULE_1_FOOTNOTES} />
		</div>
	);
}
