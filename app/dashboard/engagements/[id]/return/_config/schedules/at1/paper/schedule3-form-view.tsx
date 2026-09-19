"use client";

import type { Control } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type { AlbertaOtherCredits3Values } from "../../../../_lib/return-input";
import { CreditVintageTables } from "../alberta-credit-vintage-tables";
import { parseAt1LineItemId } from "./at1-lines";
import {
	PaperFootnotes,
	PaperLeaderRow,
	PaperSection,
	readFootnotePlacement,
} from "./components/paper-primitives";
import {
	AT1_SCHEDULE_3_FIELDS,
	AT1_SCHEDULE_3_FOOTNOTE_PLACEMENT,
	AT1_SCHEDULE_3_FOOTNOTES,
	AT1_SCHEDULE_3_SECTIONS,
} from "./generated/schedule3.layout";
import type { LineValue, NavigateToLine, ResolveLine } from "./resolve-line";
import { filedByFieldFor } from "./resolve-line";

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
/*
 * ── Schedule 3's MAD section has THREE boxes: 600, 602, 604 ───────────────
 *
 * There were five more rows here — 000068, 000070, 000071, 000072, 000074 —
 * and the page prints none of them. They are AT1 JACKET lines, which Schedule
 * 3 only ever REFERENCES, inside line 602's own caption:
 *
 *     602   "From AT1 page 2, line 068 - (lines 070 + 072)"
 *
 * They were first added as five editable money boxes, which was the worse
 * version of the same mistake: three of the five are not a preparer's to give
 * at all (the jacket types 068 `computed`, and 070/072 `carried-in` from
 * Schedules 1 and 4), so a return could state one ceiling here and transmit a
 * different jacket. Making them read-only fixed that and still left five boxes
 * on a form that has three.
 *
 * So they are gone. The room is derived by the engine (`SCHEDULE_3_ROOM` in
 * ca-tax's `alberta-return.ts`) and line 602 states its own provenance exactly
 * as the page does: `sourceText` carries the printed formula and `from` points
 * at jacket 000068001, so the derivation is one hop away in the UI without
 * inventing a row for each term.
 *
 * Jacket 071 and 074 — the two terms that ARE the preparer's — are entered on
 * the Alberta jacket schedule, where the form prints them.
 */

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
	const filedByField = filedByFieldFor(
		computed,
		SCHEDULE_ID,
		(l) => parseAt1LineItemId(l)?.field,
	);

	return (line: string): LineValue => {
		const field = parseAt1LineItemId(line)?.field ?? line;
		const ownName = READ_ONLY_DESPITE_INPUT_ROLE.has(field)
			? undefined
			: OWN_FIELD[field];
		if (ownName) return { editable: true, name: ownName };
		return {
			editable: false,
			value: filedByField.get(field) as string | number | undefined,
		};
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
	const footnotes = readFootnotePlacement(
		AT1_SCHEDULE_3_FOOTNOTES,
		AT1_SCHEDULE_3_FOOTNOTE_PLACEMENT,
	);

	return (
		<div className="space-y-4">
			{/*
			 * The eligibility instruction, where the page prints it: above the
			 * first box. Without a certificate from the appropriate ministry none
			 * of this schedule can be claimed at all, which makes it the first
			 * thing a preparer should read rather than a footnote at the end.
			 */}
			{AT1_SCHEDULE_3_SECTIONS[0]?.printedBefore && (
				<p className="px-1 text-sm font-medium text-muted-foreground">
					{AT1_SCHEDULE_3_SECTIONS[0].printedBefore}
				</p>
			)}
			{AT1_SCHEDULE_3_SECTIONS.map((section, i) => {
				const fields = AT1_SCHEDULE_3_FIELDS.filter(
					(f) => f.section === section.id,
				);
				/*
				 * Pages 2 and 3 are three tables, not twenty-one leader rows.
				 * Every column of them is a real field in `AT1_SCHEDULE_3_FIELDS`
				 * — at occurrence 1, one per column — so the generic loop below
				 * would otherwise render each table's seven headings as seven
				 * stacked rows with no rows under them.
				 */
				if (section.id.endsWith("-vintage")) return null;
				return (
					<PaperSection
						key={section.id}
						title={section.title}
						description={section.description}
						formId={i === 0 ? "AT1SCH03" : undefined}
					>
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
						<PaperFootnotes
							notes={AT1_SCHEDULE_3_FOOTNOTES}
							only={footnotes.forSection(section.id)}
							marks={footnotes.marks}
						/>
					</PaperSection>
				);
			})}

			{/*
			 * Pages 2 and 3. Each table carries its own printed footnotes at its
			 * own foot — the Agri-processing one alone has three, running *** to
			 * *****, and the last of them is what states the current-year row's
			 * arithmetic and so proves which cells the page shades.
			 */}
			{AT1_SCHEDULE_3_SECTIONS.filter((sec) => sec.id.endsWith("-vintage")).map(
				(sec) => (
					<PaperSection
						key={sec.id}
						title={sec.title}
						description={sec.description}
					>
						<CreditVintageTables
							control={s3Control}
							disabled={disabled}
							section={sec.id}
							footnoteSymbol={(mark) => footnotes.marks[mark]}
						/>
						<PaperFootnotes
							notes={AT1_SCHEDULE_3_FOOTNOTES}
							only={footnotes.forSection(sec.id)}
							marks={footnotes.marks}
						/>
					</PaperSection>
				),
			)}

			{/* Anything belonging to no box. */}
			<PaperFootnotes
				notes={AT1_SCHEDULE_3_FOOTNOTES}
				only={footnotes.unplaced}
				marks={footnotes.marks}
			/>
		</div>
	);
}
