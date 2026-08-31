"use client";

import { useWatch, type Control } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type { AlbertaRoyaltySupplemental7Values } from "../../../../_lib/return-input";
import { parseAt1LineItemId } from "./at1-lines";
import {
	PaperClassGrid,
	PaperLeaderRow,
	PaperSection,
	type ClassGridColumn,
	type ClassGridRow,
} from "./components/paper-primitives";
import { AT1_SCHEDULE_7_FIELDS, AT1_SCHEDULE_7_SECTIONS } from "./generated/schedule7.layout";
import type { LineValue, ResolveLine } from "./resolve-line";

const SCHEDULE_ID = "007";

const OWN_FIELD: Partial<Record<string, keyof AlbertaRoyaltySupplemental7Values>> = {
	"003": "eligibleCrownRoyalty",
	"005": "otherRoyaltiesNotEligible",
	"007": "royaltyPaidToOtherJurisdictions",
	"009": "nonDeductibleCrownLeaseRentals",
	"011": "mineralTaxes",
	"013": "saskatchewanResourcesSurcharge",
	"014": "otherNonDeductibleCrownChargeType1",
	"015": "otherNonDeductibleCrownChargeType2",
	"016": "otherNonDeductibleCrownChargeType3",
	"017": "otherNonDeductibleCrownCharges",
	"025": "crownLeaseRentalsCapitalized",
	"027": "otherBalanceSheetDeductionName",
	"029": "otherBalanceSheetDeduction",
};

const PITI_FIELD_NAME: Partial<Record<string, string>> = {
	"071": "name",
	"073": "interestPercent",
	"075": "fiscalPeriodEnd",
	"077": "shareEligibleForCredit",
	"079": "shareOtherRoyaltiesNotEligible",
	"081": "shareOtherCrownChargesEligibleForDeduction",
};

const ACRA_FIELD_NAME: Partial<Record<string, string>> = {
	"083": "priorProductionPeriodEnd",
	"085": "sourceOfAdjustment",
	"087": "increase",
	"089": "decrease",
	"091": "adjustmentNotEligibleForCredit",
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
 * AT1 Schedule 7 paper Form View — CPI's flat crown-payment lines, then two
 * dynamic grids (PITI per partnership, ACRA per prior-year correction), then
 * the two computed totals (051/061), neither of which has a preparer box.
 */
export function Schedule7FormView({
	control,
	disabled,
	computed,
}: {
	control: Control<Record<string, unknown>>;
	disabled?: boolean;
	computed?: ComputedReturn;
}) {
	const s7Control = control as unknown as Control<AlbertaRoyaltySupplemental7Values>;
	const resolveLine = buildResolveLine(computed);
	const partnerships = useWatch({ control: s7Control, name: "partnerships" }) ?? [];
	const adjustments = useWatch({ control: s7Control, name: "priorYearAdjustments" }) ?? [];

	const pitiColumns: ClassGridColumn[] = AT1_SCHEDULE_7_FIELDS.filter((f) => f.section === "piti").map(
		(f) => {
			const field = parseAt1LineItemId(f.line)?.field ?? f.line;
			return { line: field, caption: f.caption, kind: f.kind, fieldName: PITI_FIELD_NAME[field] };
		},
	);
	const pitiRows: ClassGridRow[] = partnerships.map((p, i) => ({
		key: `partnership-${i}`,
		label: p?.name || `Row ${i + 1}`,
		arrayIndex: i,
	}));

	const acraColumns: ClassGridColumn[] = AT1_SCHEDULE_7_FIELDS.filter((f) => f.section === "acra").map(
		(f) => {
			const field = parseAt1LineItemId(f.line)?.field ?? f.line;
			return { line: field, caption: f.caption, kind: f.kind, fieldName: ACRA_FIELD_NAME[field] };
		},
	);
	const acraRows: ClassGridRow[] = adjustments.map((_, i) => ({
		key: `adjustment-${i}`,
		label: `Row ${i + 1}`,
		arrayIndex: i,
	}));

	return (
		<div className="space-y-4">
			{AT1_SCHEDULE_7_SECTIONS.map((section) => {
				if (section.id === "piti" || section.id === "acra") {
					const isPiti = section.id === "piti";
					const columns = isPiti ? pitiColumns : acraColumns;
					const rows = isPiti ? pitiRows : acraRows;
					return (
						<PaperSection key={section.id} title={section.title} description={section.description}>
							<div className="p-2">
								<PaperClassGrid
									arrayName={isPiti ? "partnerships" : "priorYearAdjustments"}
									rows={rows}
									columns={columns}
									control={s7Control}
									disabled={disabled}
									resolveCell={() => undefined}
								/>
							</div>
							{rows.length === 0 && (
								<p className="px-4 pb-3 text-xs text-muted-foreground">
									No rows entered yet — add one in Guided view.
								</p>
							)}
						</PaperSection>
					);
				}
				const fields = AT1_SCHEDULE_7_FIELDS.filter((f) => f.section === section.id);
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
								control={s7Control}
								resolveLine={resolveLine}
								disabled={disabled}
							/>
						))}
					</PaperSection>
				);
			})}
		</div>
	);
}
