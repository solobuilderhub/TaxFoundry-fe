"use client";

import { useWatch, type Control } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type { AlbertaRoyaltyDeduction5Values } from "../../../../_lib/return-input";
import { parseAt1LineItemId } from "./at1-lines";
import {
	PaperClassGrid,
	PaperLeaderRow,
	PaperSection,
	type ClassGridColumn,
	type ClassGridRow,
} from "./components/paper-primitives";
import { AT1_SCHEDULE_5_FIELDS, AT1_SCHEDULE_5_SECTIONS } from "./generated/schedule5.layout";
import type { LineValue, ResolveLine } from "./resolve-line";

const SCHEDULE_ID = "005";

const OWN_FIELD: Partial<Record<string, string>> = {
	"001": "crownChargesFromSchedule7",
	"005": "resourceAllowanceFromSchedule12OrFederal",
	"007": "reimbursementsForCrownCharges",
	"016": "crtdAmountClaimed",
	"023": "transferredOnDisposal",
	"026": "poolTransfer.type",
	"027": "poolTransfer.acquirerName",
	"100": "changeInControlEndedPrecedingYear",
};

const PREDECESSOR_COLUMNS = [
	{ line: "031", caption: "Predecessor's Name", kind: "text" as const, fieldName: "predecessorName" },
	{ line: "033", caption: "Alberta Corporate Account Number", kind: "code" as const, fieldName: "albertaCorporateAccountNumber" },
	{ line: "035", caption: "Date of Event", kind: "date" as const, fieldName: "dateOfEvent" },
	{ line: "037", caption: "C/F Amount Transferred", kind: "money" as const, fieldName: "amountTransferred" },
];

const SUCCESSORED_FIELD_NAME: Partial<Record<string, string>> = {
	vendorName: "vendorName",
	dateOfEvent: "dateOfEvent",
	poolBroughtForward: "poolBroughtForward",
	acquisitionAmount: "acquisitionAmount",
	propertyIncome: "propertyIncome",
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
 * Renders one successored-pool section (SSPI or FSPI) as a dynamic grid.
 * Field ids ("101"/"103"/... vs "121"/"123"/...) come from the matching
 * `AT1_SCHEDULE_5_FIELDS` section so the SAME component works for both.
 */
function SuccessoredPoolGrid({
	sectionId,
	arrayName,
	control,
	disabled,
}: {
	sectionId: "sspi" | "fspi";
	arrayName: "secondSuccessoredPools" | "firstSuccessoredPools";
	control: Control<AlbertaRoyaltyDeduction5Values>;
	disabled?: boolean;
}) {
	const rows = useWatch({ control, name: arrayName }) ?? [];
	const conceptOrder = ["vendorName", "dateOfEvent", "poolBroughtForward", "acquisitionAmount", "propertyIncome"];
	const sectionFields = AT1_SCHEDULE_5_FIELDS.filter((f) => f.section === sectionId);
	const columns: ClassGridColumn[] = conceptOrder.map((concept, i) => {
		const f = sectionFields[i];
		return {
			line: f ? (parseAt1LineItemId(f.line)?.field ?? f.line) : concept,
			caption: f?.caption ?? concept,
			kind: f?.kind ?? "money",
			fieldName: SUCCESSORED_FIELD_NAME[concept],
		};
	});
	const gridRows: ClassGridRow[] = rows.map((r, i) => ({
		key: `${arrayName}-${i}`,
		label: r?.vendorName || `Row ${i + 1}`,
		arrayIndex: i,
	}));

	return (
		<>
			<div className="p-2">
				<PaperClassGrid
					arrayName={arrayName}
					rows={gridRows}
					columns={columns}
					control={control}
					disabled={disabled}
					resolveCell={() => undefined}
				/>
			</div>
			{gridRows.length === 0 && (
				<p className="px-4 pb-3 text-xs text-muted-foreground">
					No occurrences entered — leave empty unless line 200 is Yes.
				</p>
			)}
		</>
	);
}

/**
 * AT1 Schedule 5 paper Form View. Lines 031-037 (Area B predecessor
 * transfers) have no filed line of their own — they aggregate into line 011
 * — so they render as a worksheet grid using hand-specified line numbers,
 * the same pattern Schedule 6's quarters table uses for line 008.
 */
export function Schedule5FormView({
	control,
	disabled,
	computed,
}: {
	control: Control<Record<string, unknown>>;
	disabled?: boolean;
	computed?: ComputedReturn;
}) {
	const s5Control = control as unknown as Control<AlbertaRoyaltyDeduction5Values>;
	const resolveLine = buildResolveLine(computed);
	const predecessorTransfers = useWatch({ control: s5Control, name: "predecessorTransfers" }) ?? [];

	const predecessorRows: ClassGridRow[] = predecessorTransfers.map((p, i) => ({
		key: `predecessor-${i}`,
		label: p?.predecessorName || `Row ${i + 1}`,
		arrayIndex: i,
	}));

	return (
		<div className="space-y-4">
			{AT1_SCHEDULE_5_SECTIONS.map((section) => {
				if (section.id === "sspi" || section.id === "fspi") {
					return (
						<PaperSection key={section.id} title={section.title} description={section.description}>
							<SuccessoredPoolGrid
								sectionId={section.id}
								arrayName={section.id === "sspi" ? "secondSuccessoredPools" : "firstSuccessoredPools"}
								control={s5Control}
								disabled={disabled}
							/>
						</PaperSection>
					);
				}
				const fields = AT1_SCHEDULE_5_FIELDS.filter((f) => f.section === section.id);
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
								control={s5Control}
								resolveLine={resolveLine}
								disabled={disabled}
							/>
						))}
						{section.id === "crtd" && (
							<div className="p-2">
								<div className="mb-1 px-2 text-xs font-medium text-muted-foreground">
									031-037 — Predecessor transfers into the unsuccessored pool (feeds line 011 above)
								</div>
								<PaperClassGrid
									arrayName="predecessorTransfers"
									rows={predecessorRows}
									columns={PREDECESSOR_COLUMNS}
									control={s5Control}
									disabled={disabled}
									resolveCell={() => undefined}
								/>
							</div>
						)}
					</PaperSection>
				);
			})}
		</div>
	);
}
