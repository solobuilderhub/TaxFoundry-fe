"use client";

import { useWatch, type Control } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type { AlbertaReconciliation12Values } from "../../../../_lib/return-input";
import { parseAt1LineItemId } from "./at1-lines";
import { PaperFootnotes, PaperLeaderRow, PaperSection } from "./components/paper-primitives";
import { buildResolveLine } from "./editability";
import {
	AT1_SCHEDULE_12_FIELDS,
	AT1_SCHEDULE_12_FOOTNOTES,
	AT1_SCHEDULE_12_SECTIONS,
} from "./generated/schedule12.layout";
import type { NavigateToLine } from "./resolve-line";
import { previewSchedule12 } from "./schedule12-preview";

const SCHEDULE_ID = "012";

/**
 * Line number → the `albertaReconciliation12` field it writes to.
 *
 * 46 of the form's 74 lines: everything the preparer states directly, plus
 * everything the form tells them to transcribe off the federal return. The 28
 * absent here are the 20 carried in from another AT1 schedule (resolved from
 * their source — see `editability.ts`) and the 8 the form computes.
 */
const OWN_FIELD: Partial<Record<string, string>> = {
	// Area A — federal column
	"002": "netIncomeFederal",
	"005": "ccaFederal",
	"007": "ccaRecaptureFederal",
	"009": "terminalLossFederal",
	"015": "farmingMandatoryCurrentFederal",
	"017": "farmingMandatoryPriorFederal",
	"019": "farmingOptionalCurrentFederal",
	"021": "farmingOptionalPriorFederal",
	"023": "depletionFederal",
	"027": "ceeFederal",
	"029": "cdeFederal",
	"031": "foreignExplorationFederal",
	"033": "cogpeFederal",
	"035": "sredFederal",
	"037": "taxReservesPriorFederal",
	"039": "taxReservesCurrentFederal",
	"041": "otherFederal",
	// Area A — Alberta boxes with no schedule behind them
	"014": "farmingMandatoryCurrentAlberta",
	"016": "farmingMandatoryPriorAlberta",
	"018": "farmingOptionalCurrentAlberta",
	"020": "farmingOptionalPriorAlberta",
	"040": "otherAlberta",
	"042": "capitalTaxOtherProvinces",
	"048": "otherExplanation",
	// Area B — federal column
	"057": "charitableDonationsFederal",
	"059": "giftsFederal",
	"061": "taxableDividendsFederal",
	"063": "partVI1Federal",
	"065": "nonCapitalLossesFederal",
	"067": "netCapitalLossesFederal",
	"069": "restrictedFarmLossesFederal",
	"071": "farmLossesFederal",
	"073": "limitedPartnershipLossesFederal",
	"131": "rifeFederal",
	"075": "centralCreditUnionFederal",
	"079": "prospectorSharesFederal",
	"141": "nonQualifiedSecuritiesFederal",
	"083": "section110AdditionsFederal",
	// Area B — Alberta boxes the form itself sources from the T2
	"060": "taxableDividendsAlberta",
	"062": "partVI1Alberta",
	"074": "centralCreditUnionAlberta",
	"078": "prospectorSharesAlberta",
	"140": "nonQualifiedSecuritiesAlberta",
	// ABI reconciliation
	"100": "abiDiffers",
	"102": "abiFederal",
	"104": "abiAdjustment",
};

/**
 * AT1 Schedule 12 paper Form View.
 *
 * This schedule used to render through `ReadOnlyScheduleView` with no editable
 * side at all, on the reasoning that the engine derives it from the other
 * schedules' Alberta overrides. That holds for the ALBERTA column of a
 * reconciling pair — and only for it. The federal column, the four Alberta
 * farming-inventory boxes, both "Other" boxes, the capital-tax line, the
 * explanation and the whole ABI block are the preparer's, and were unreachable.
 */
export function Schedule12FormView({
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
	const c = control as unknown as Control<AlbertaReconciliation12Values>;
	const liveValues = useWatch({ control: c }) as AlbertaReconciliation12Values;

	/** Reads a line resolved from another schedule — needed by the Alberta totals. */
	const resolvedLine = (field: string): number | undefined => {
		const definition = AT1_SCHEDULE_12_FIELDS.find(
			(f) => (parseAt1LineItemId(f.line)?.field ?? f.line) === field,
		);
		const ref = definition?.from;
		if (!ref) return undefined;
		const v = computed?.schedulePayloads
			?.find((p) => p.scheduleId === ref.line.slice(0, 3))
			?.values?.find((x) => x.lineItemId === ref.line)?.value;
		return typeof v === "number" ? v : undefined;
	};

	const derived = previewSchedule12(liveValues, resolvedLine);
	const resolveLine = buildResolveLine({
		scheduleId: SCHEDULE_ID,
		fields: AT1_SCHEDULE_12_FIELDS,
		ownField: OWN_FIELD,
		computed,
		derived,
	});

	return (
		<div className="space-y-4">
			{AT1_SCHEDULE_12_SECTIONS.map((section) => {
				const fields = AT1_SCHEDULE_12_FIELDS.filter((f) => f.section === section.id);
				if (fields.length === 0) return null;
				return (
					<PaperSection
						key={section.id}
						title={section.title}
						description={section.description}
						formId="AT1SCH12"
					>
						{fields.map((f) => (
							<PaperLeaderRow
								key={f.line}
								line={parseAt1LineItemId(f.line)?.field ?? f.line}
								caption={f.caption}
								kind={f.kind}
								role={f.role}
								note={f.note}
								formula={f.formula}
								from={f.from}
								to={f.to}
								onNavigate={onNavigate}
								highlightLine={highlightLine}
								control={c}
								resolveLine={resolveLine}
								disabled={disabled}
							/>
						))}
					</PaperSection>
				);
			})}
			<PaperFootnotes notes={AT1_SCHEDULE_12_FOOTNOTES} />
		</div>
	);
}
