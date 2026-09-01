"use client";

import { useWatch, type Control } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type { AlbertaIegValues, IegAgreementMember } from "../../../../_lib/return-input";
import { parseAt1LineItemId } from "./at1-lines";
import {
	PaperClassGrid,
	PaperFootnotes,
	PaperLeaderRow,
	PaperSection,
	type ClassGridColumn,
	type ClassGridRow,
} from "./components/paper-primitives";
import { AT1_SCHEDULE_29_FIELDS, AT1_SCHEDULE_29_FOOTNOTES, AT1_SCHEDULE_29_SECTIONS } from "./generated/schedule29.layout";
import type { LineValue, NavigateToLine, ResolveLine } from "./resolve-line";

const SCHEDULE_ID = "029";

/**
 * Own editable fields, by 3-digit line. Most of this schedule is computed
 * (110/112/118/125/128/130/104/108/208/267/268 and the page-3 totals) or —
 * for 114/116/126 specifically — genuinely ambiguous which `group` array row
 * is "this corporation" (the array holds every associated member, and
 * nothing marks the claimant's own row), so those are left read-only rather
 * than guessed. Line 220 (FBN) is a documented gap: `agreementMembers` has
 * no FBN field at all — see `schedule29.ts`'s provenance note about a PRIOR
 * bug that filed the member's free-text name there instead. Not fixed here.
 */
const OWN_FIELD: Partial<Record<string, keyof AlbertaIegValues>> = {
	"003": "federalAmount",
	"005": "albertaPortion",
	"007": "federalProxyAmount",
	"009": "albertaProxyAmount",
	"011": "iegReducingFederalExpenditure",
	"025": "repaymentOrContractPayment",
	"040": "primaryFieldCode",
	"102": "allocatedLimit",
	"132": "recapture",
	"200": "agreementLongestYearCan",
	"202": "agreementLongestYearBegin",
	"204": "agreementLongestYearEnd",
	"206": "agreementDaysInLongestYear",
};

const MEMBER_FIELD_NAMES: Partial<Record<string, keyof IegAgreementMember>> = {
	"230": "albertaCan",
	"235": "currentTaxationYearEnd",
	"240": "allocatedExpenditureLimit",
	"245": "currentYearExpenditures",
	"250": "priorYear1",
	"260": "priorYear2",
	"265": "taxableCapitalPriorYear",
};

const MEMBER_COLUMN_BASE: readonly Omit<ClassGridColumn, "fieldName">[] = [
	{ line: "220", caption: "Federal Business Number", kind: "text" }, // not collected — see OWN_FIELD's doc comment
	{ line: "230", caption: "Alberta CAN", kind: "text" },
	{ line: "235", caption: "Tax year end", kind: "date" },
	{ line: "240", caption: "Allocated expenditure limit", kind: "money" },
	{ line: "245", caption: "Current-year expenditures", kind: "money" },
	{ line: "250", caption: "1st preceding year", kind: "money" },
	{ line: "260", caption: "2nd preceding year", kind: "money" },
	{ line: "265", caption: "Taxable capital, 1st preceding year", kind: "money" },
];

const MEMBER_COLUMNS: ClassGridColumn[] = MEMBER_COLUMN_BASE.map((c) => ({
	...c,
	fieldName: MEMBER_FIELD_NAMES[c.line],
}));

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
		if (ownName) return { editable: true, name: ownName as keyof AlbertaIegValues };
		return { editable: false, value: filedByField.get(field) as string | number | undefined };
	};
}

/**
 * AT1 Schedule 29 paper Form View — 3 flat leader-line sections (eligible
 * expenditures, expenditure limit, the grant calculation) followed by the
 * Agreement Among Associated Corporations: 4 group-level fields, a
 * per-member table (one row per `agreementMembers` entry — a plain 1:1
 * array, unlike Schedule 17's type-matched one), then 8 group totals.
 */
export function Schedule29FormView({
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
	const iegControl = control as unknown as Control<AlbertaIegValues>;
	const resolveLine = buildResolveLine(computed);

	const sectionFields = (id: string) => AT1_SCHEDULE_29_FIELDS.filter((f) => f.section === id);
	const sectionMeta = (id: string) => AT1_SCHEDULE_29_SECTIONS.find((s) => s.id === id);

	// The agreement section mixes group-level fields, a per-member table, and
	// group totals — split its flat field list by line range rather than by
	// `section` (the FormDefinition has all of it under one section id).
	const agreementFields = sectionFields("agreement");
	const groupLevel = agreementFields.filter((f) => ["200", "202", "204", "206", "208"].includes(f.line.slice(3, 6)));
	const memberLines = new Set(["220", "230", "235", "240", "245", "250", "260", "265", "267", "268"]);
	const totals = agreementFields.filter((f) => !groupLevel.includes(f) && !memberLines.has(f.line.slice(3, 6)));

	return (
		<div className="space-y-4">
			{(["eligible", "limit", "grant"] as const).map((id, i) => {
				const meta = sectionMeta(id);
				if (!meta) return null;
				return (
					<PaperSection key={id} title={meta.title} description={meta.description} formId={i === 0 ? "AT1SCH29" : undefined}>
						{sectionFields(id).map((f) => (
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
								control={iegControl}
								resolveLine={resolveLine}
								disabled={disabled}
							/>
						))}
					</PaperSection>
				);
			})}
			<PaperSection
				title="Agreement — group"
				description="Filed only when associated (page 3). The member with the longest taxation year sets the group's shared expenditure limit."
			>
				{groupLevel.map((f) => (
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
						control={iegControl}
						resolveLine={resolveLine}
						disabled={disabled}
					/>
				))}
			</PaperSection>
			<PaperSection
				title="Agreement — members"
				description="One row per associated member — put the claiming corporation first. Federal Business Number (line 220) isn't collected in this product yet — see the code comment."
			>
				<div className="p-2">
					<PaperClassGridForMembers control={iegControl} disabled={disabled} />
				</div>
			</PaperSection>
			<PaperSection title="Agreement — totals">
				{totals.map((f) => (
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
						control={iegControl}
						resolveLine={resolveLine}
						disabled={disabled}
					/>
				))}
			</PaperSection>
			<PaperFootnotes notes={AT1_SCHEDULE_29_FOOTNOTES} />
		</div>
	);
}

function PaperClassGridForMembers({
	control,
	disabled,
}: {
	control: Control<AlbertaIegValues>;
	disabled?: boolean;
}) {
	const members = useWatch({ control, name: "agreementMembers" }) ?? [];
	const rows: ClassGridRow[] = members.map((m, i) => ({
		key: `member-${i}`,
		label: m?.name || `Member ${i + 1}`,
		arrayIndex: i,
	}));
	return (
		<PaperClassGrid
			arrayName="agreementMembers"
			rows={rows}
			columns={MEMBER_COLUMNS}
			control={control}
			disabled={disabled}
			resolveCell={() => undefined}
		/>
	);
}
