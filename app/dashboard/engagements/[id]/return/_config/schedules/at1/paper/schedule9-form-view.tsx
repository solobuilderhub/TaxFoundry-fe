"use client";

import { useWatch, type Control } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type { AlbertaSredCredit9Values } from "../../../../_lib/return-input";
import { parseAt1LineItemId } from "./at1-lines";
import {
	PaperClassGrid,
	PaperLeaderRow,
	PaperSection,
	type ClassGridColumn,
	type ClassGridRow,
} from "./components/paper-primitives";
import { AT1_SCHEDULE_9_FIELDS, AT1_SCHEDULE_9_SECTIONS } from "./generated/schedule9.layout";
import type { LineValue, ResolveLine } from "./resolve-line";

const SCHEDULE_ID = "009";

const OWN_FIELD: Partial<Record<string, keyof AlbertaSredCredit9Values>> = {
	"003": "federalQualifiedExpenditures",
	"005": "albertaPortionOfExpenditures",
	"007": "federalProxyAmountInAlbertaPortion",
	"009": "albertaProxyAmount",
	"011": "albertaCreditReducingFederalExpense",
	"015": "priorYearFederalItcReceived",
	"017": "totalAlbertaExpendituresAllYears",
	"019": "totalFederalExpendituresAllYears",
	"025": "albertaPortionOfRepayments",
	"031": "eligibleExpenditures",
	"040": "fieldOfScience",
	"100": "isAssociated",
	"102": "allocatedExpenditureLimit",
	"104": "daysInTaxYear",
	"112": "disposalRecapture",
	"116": "priorYearFederalItcAdjustment",
	"200": "longestYearCan",
	"202": "longestYearBegin",
	"204": "longestYearEnd",
	"206": "daysInLongestYear",
};

const GROUP_FIELD_NAME: Partial<Record<string, string>> = {
	"220": "name",
	"230": "albertaCan",
	"240": "allocated",
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
 * AT1 Schedule 9 paper Form View — the expenditure buildup and credit
 * calculation as flat leader-rows, plus page 3's associated-group allocation
 * grid (mirrors Schedule 29's own Agreement Among Associated Corporations).
 */
export function Schedule9FormView({
	control,
	disabled,
	computed,
}: {
	control: Control<Record<string, unknown>>;
	disabled?: boolean;
	computed?: ComputedReturn;
}) {
	const s9Control = control as unknown as Control<AlbertaSredCredit9Values>;
	const resolveLine = buildResolveLine(computed);
	const group = useWatch({ control: s9Control, name: "group" }) ?? [];

	const groupColumns: ClassGridColumn[] = AT1_SCHEDULE_9_FIELDS.filter(
		(f) => ["220", "230", "240"].includes(parseAt1LineItemId(f.line)?.field ?? f.line),
	).map((f) => {
		const field = parseAt1LineItemId(f.line)?.field ?? f.line;
		return { line: field, caption: f.caption, kind: f.kind, fieldName: GROUP_FIELD_NAME[field] };
	});
	const groupRows: ClassGridRow[] = group.map((m, i) => ({
		key: `member-${i}`,
		label: m?.name || `Row ${i + 1}`,
		arrayIndex: i,
	}));

	return (
		<div className="space-y-4">
			{AT1_SCHEDULE_9_SECTIONS.map((section) => {
				const fields = AT1_SCHEDULE_9_FIELDS.filter((f) => f.section === section.id);
				if (section.id === "group") {
					const headerFields = fields.filter((f) =>
						["200", "202", "204", "206"].includes(parseAt1LineItemId(f.line)?.field ?? f.line),
					);
					return (
						<PaperSection key={section.id} title={section.title} description={section.description}>
							{headerFields.map((f) => (
								<PaperLeaderRow
									key={f.line}
									line={parseAt1LineItemId(f.line)?.field ?? f.line}
									caption={f.caption}
									kind={f.kind}
									role={f.role}
									note={f.note}
									from={f.from}
									control={s9Control}
									resolveLine={resolveLine}
									disabled={disabled}
								/>
							))}
							<div className="p-2">
								<PaperClassGrid
									arrayName="group"
									rows={groupRows}
									columns={groupColumns}
									control={s9Control}
									disabled={disabled}
									resolveCell={() => undefined}
								/>
							</div>
							{groupRows.length === 0 && (
								<p className="px-4 pb-3 text-xs text-muted-foreground">
									No associated corporations entered — add one in Guided view if line 100 is Yes.
								</p>
							)}
						</PaperSection>
					);
				}
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
								control={s9Control}
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
