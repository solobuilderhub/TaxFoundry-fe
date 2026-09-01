"use client";

import type { Control } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type { AlbertaOtherCredits3Values } from "../../../../_lib/return-input";
import { parseAt1LineItemId } from "./at1-lines";
import { PaperFootnotes, PaperLeaderRow, PaperSection } from "./components/paper-primitives";
import { AT1_SCHEDULE_3_FIELDS, AT1_SCHEDULE_3_FOOTNOTES, AT1_SCHEDULE_3_SECTIONS } from "./generated/schedule3.layout";
import type { LineValue, NavigateToLine, ResolveLine } from "./resolve-line";

const SCHEDULE_ID = "003";

/**
 * Every 003-prefixed line in `AT1_SCHEDULE_3_FIELDS` with an `input` role
 * maps straight to one of this schedule's own fields — no carry-ins, since
 * ITC/CITC/APITC are Alberta-only regimes with no federal equivalent at all.
 */
const OWN_FIELD: Partial<Record<string, keyof AlbertaOtherCredits3Values>> = {
	"100": "itcCertificatesIssued",
	"102": "itcCarryforwardFromPriorYear",
	"104": "itcAmountApplied",
	"106": "itcExpired",
	"200": "citcCertificatesIssued",
	"202": "citcCarryforwardFromPriorYear",
	"204": "citcAmountApplied",
	"206": "citcExpired",
	"300": "apitcCurrentReceived",
	"304": "apitcCurrentApplied",
	"306": "apitcFirstApplied",
	"308": "apitcSecondApplied",
	"310": "apitcThirdToTenthApplied",
	"314": "apitcExpired",
};

/**
 * MAD's own five inputs are AT1 JACKET page-2 lines (068/070/071/072/074),
 * not Schedule 3 lines — `AT1_SCHEDULE_3` deliberately does not renumber them
 * as 003-prefixed fields (see that module's doc comment), so they are not in
 * `AT1_SCHEDULE_3_FIELDS` for the generic loop below to pick up. Rendered by
 * hand here, under their own real jacket line numbers, so the paper view has
 * the same MAD section the guided editor does.
 */
const MAD_JACKET_ROWS: { line: string; caption: string; name: keyof AlbertaOtherCredits3Values }[] = [
	{ line: "000068", caption: "Alberta tax payable before this deduction", name: "taxPayableBeforeDeduction" },
	{ line: "000070", caption: "AT1 page 2, line 070", name: "line070" },
	{ line: "000071", caption: "AT1 page 2, line 071", name: "line071" },
	{ line: "000072", caption: "AT1 page 2, line 072", name: "line072" },
	{ line: "000074", caption: "AT1 page 2, line 074", name: "line074" },
];

/**
 * 302 (APITC carried forward from prior years, all vintages) has no single
 * UI field of its own — the guided editor collects it pre-split, by vintage
 * (`apitcFirstAvailable` + `apitcSecondAvailable` + `apitcThirdToTenthAvailable`).
 * Rather than inventing a fourth, redundant "total" input, 302 is read-only
 * here too, sourced from the last computed return like any other derived
 * figure — matching the "never render a computed line as an editable box"
 * rule the generator enforces everywhere else.
 */
const READ_ONLY_DESPITE_INPUT_ROLE = new Set(["302"]);

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
		const ownName = READ_ONLY_DESPITE_INPUT_ROLE.has(field) ? undefined : OWN_FIELD[field];
		if (ownName) return { editable: true, name: ownName };
		return { editable: false, value: filedByField.get(field) as string | number | undefined };
	};
}

/**
 * AT1 Schedule 3 paper Form View — three independent investment-tax-credit
 * continuities (ITC, CITC, APITC) sharing one ceiling (MAD), following
 * `AT1SCH03-...-TRA11725.pdf`'s own section grouping and line order.
 */
export function Schedule3FormView({
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
	const s3Control = control as unknown as Control<AlbertaOtherCredits3Values>;
	const resolveLine = buildResolveLine(computed);

	return (
		<div className="space-y-4">
			{AT1_SCHEDULE_3_SECTIONS.map((section, i) => {
				const fields = AT1_SCHEDULE_3_FIELDS.filter((f) => f.section === section.id);
				return (
					<PaperSection
						key={section.id}
						title={section.title}
						description={section.description}
						formId={i === 0 ? "AT1SCH03" : undefined}
					>
						{section.id === "mad" &&
							MAD_JACKET_ROWS.map((row) => (
								<PaperLeaderRow
									key={row.line}
									line={row.line}
									caption={row.caption}
									kind="money"
									control={s3Control}
									resolveLine={() => ({ editable: true, name: row.name })}
									disabled={disabled}
								/>
							))}
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
								control={s3Control}
								resolveLine={resolveLine}
								disabled={disabled}
							/>
						))}
					</PaperSection>
				);
			})}
			<PaperFootnotes notes={AT1_SCHEDULE_3_FOOTNOTES} />
		</div>
	);
}
