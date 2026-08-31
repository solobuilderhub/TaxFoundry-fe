"use client";

import { useWatch, type Control } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type { AlbertaPoliticalContributions8Values } from "../../../../_lib/return-input";
import { parseAt1LineItemId } from "./at1-lines";
import {
	PaperClassGrid,
	PaperLeaderRow,
	PaperSection,
	type ClassGridColumn,
	type ClassGridRow,
} from "./components/paper-primitives";
import { AT1_SCHEDULE_8_FIELDS, AT1_SCHEDULE_8_SECTIONS } from "./generated/schedule8.layout";
import type { LineValue, ResolveLine } from "./resolve-line";

const SCHEDULE_ID = "008";

const CONTRIBUTION_FIELD_NAME: Partial<Record<string, string>> = {
	"002": "name",
	"004": "receiptNumber",
	"006": "dateOfDonation",
	"008": "amount",
};

const OWN_FIELD: Partial<Record<string, keyof AlbertaPoliticalContributions8Values>> = {
	"012": "partnershipContributionsTo2003",
	"013": "partnershipContributionsFrom2004",
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
 * AT1 Schedule 8 paper Form View — a dynamic per-receipt grid (contributions,
 * 002-008) plus two flat partnership totals (012-013) with no federal
 * equivalent at all.
 */
export function Schedule8FormView({
	control,
	disabled,
	computed,
}: {
	control: Control<Record<string, unknown>>;
	disabled?: boolean;
	computed?: ComputedReturn;
}) {
	const s8Control = control as unknown as Control<AlbertaPoliticalContributions8Values>;
	const contributions = useWatch({ control: s8Control, name: "contributions" }) ?? [];
	const resolveLine = buildResolveLine(computed);

	const contributionColumns: ClassGridColumn[] = AT1_SCHEDULE_8_FIELDS.filter(
		(f) => f.section === "contributions",
	).map((f) => {
		const field = parseAt1LineItemId(f.line)?.field ?? f.line;
		return { line: field, caption: f.caption, kind: f.kind, fieldName: CONTRIBUTION_FIELD_NAME[field] };
	});
	const contributionRows: ClassGridRow[] = contributions.map((c, i) => ({
		key: `contribution-${i}`,
		label: c?.name || `Row ${i + 1}`,
		arrayIndex: i,
	}));

	return (
		<div className="space-y-4">
			{AT1_SCHEDULE_8_SECTIONS.map((section) => {
				if (section.id === "contributions") {
					return (
						<PaperSection key={section.id} title={section.title} description={section.description}>
							<div className="p-2">
								<PaperClassGrid
									arrayName="contributions"
									rows={contributionRows}
									columns={contributionColumns}
									control={s8Control}
									disabled={disabled}
									resolveCell={() => undefined}
								/>
							</div>
							{contributionRows.length === 0 && (
								<p className="px-4 pb-3 text-xs text-muted-foreground">
									No contributions entered yet — add one in Guided view.
								</p>
							)}
						</PaperSection>
					);
				}
				const fields = AT1_SCHEDULE_8_FIELDS.filter((f) => f.section === section.id);
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
								control={s8Control}
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
