"use client";

import { type Control, useFieldArray, useWatch } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type {
	AlbertaIegValues,
	IegAgreementMember,
} from "../../../../_lib/return-input";
import { at1Money, parseAt1LineItemId } from "./at1-lines";
import {
	PaperMoney,
	PaperNumber,
	PaperSelect,
	PaperText,
} from "./components/paper-inputs";
import {
	PaperFootnotes,
	PaperLeaderRow,
	PaperSection,
	readFootnotePlacement,
} from "./components/paper-primitives";
import { WorksheetTable } from "./components/worksheet-table";
import {
	AT1_SCHEDULE_29_ALLOCATION_COLUMNS,
	AT1_SCHEDULE_29_ALLOCATION_TOTALS_LABEL,
	AT1_SCHEDULE_29_BLOCK_HEADINGS,
	AT1_SCHEDULE_29_FIELDS,
	AT1_SCHEDULE_29_FOOTNOTE_PLACEMENT,
	AT1_SCHEDULE_29_FOOTNOTES,
	AT1_SCHEDULE_29_SECTIONS,
	type PaperField,
} from "./generated/schedule29.layout";
import type { LineValue, NavigateToLine, ResolveLine } from "./resolve-line";
import { filedByFieldFor } from "./resolve-line";

const SCHEDULE_ID = "029";

/**
 * The fields this schedule collects on its own slice, by 3-digit line.
 *
 * Most of Schedule 29 is computed (104/108/110/112/118/125/128/130 and every
 * page-3 total) or — for 114/116/126 — genuinely ambiguous which `group` row is
 * "this corporation", since that array holds every associated member and
 * nothing marks the claimant's own. Those stay read-only rather than guessed.
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

/**
 * Page 3's allocation grid, by printed line → the field on a member row.
 *
 * Line 220 used to be absent here, and the column rendered permanently blank:
 * `IegAgreementMember` had no FBN field, so the page's FIRST numbered column
 * could not be filled. It is `fbn` now — see the contract's own comment, and
 * note that `name` beside it is NOT a line on this form (the page numbers ten
 * columns and none of them is a corporation name). `name` is ours, for the row
 * label, and `schedule29Values` must never file it at 220.
 */
const MEMBER_FIELD: Partial<Record<string, keyof IegAgreementMember>> = {
	"220": "fbn",
	"230": "albertaCan",
	"235": "currentTaxationYearEnd",
	"240": "allocatedExpenditureLimit",
	"245": "currentYearExpenditures",
	"250": "priorYear1",
	"260": "priorYear2",
	"265": "taxableCapitalPriorYear",
};

const printed = (line: string) => parseAt1LineItemId(line)?.field ?? line;

function buildResolveLine(computed: ComputedReturn | undefined): ResolveLine {
	const filedByField = filedByFieldFor(
		computed,
		SCHEDULE_ID,
		(l) => parseAt1LineItemId(l)?.field,
	);

	return (line: string): LineValue => {
		const field = printed(line);
		const ownName = OWN_FIELD[field];
		if (ownName) return { editable: true, name: ownName };
		return {
			editable: false,
			value: filedByField.get(field) as string | number | undefined,
		};
	};
}

/**
 * AT1 Schedule 29 paper Form View — the page's FIVE boxes, in order.
 *
 * ── What this used to be, and why the shape was wrong ───────────────────────
 *
 * Three flat leader-line sections, then "Agreement — group", "Agreement —
 * members" and "Agreement — totals". Three of those six headings are not on the
 * page; it prints "Alberta Innovation Employment Grant Agreement Among
 * Associated Corporations" and, below a rule, "Allocation of the Maximum
 * Expenditure Limit". The old view had to split one `agreement` section by a
 * hard-coded list of line numbers to get even that far, and said so in a
 * comment. Both boxes are real sections in the form definition now.
 *
 * Three more things the page has and this did not:
 *
 *   - **The Part I / Part II (a) / (b) headings.** Lines 112 and 125 are two
 *     mutually exclusive formulas for the same credit — one per return, chosen
 *     by whether the corporation is associated — and those headings are the only
 *     printed statement of it. Rendered as three rates in a list, the form reads
 *     as though all three apply.
 *   - **The totals are a ROW of the grid, not a list below it.** Lines
 *     270-320 are cells under the columns they sum, captioned only "Totals". As
 *     seven leader rows they were seven rows all captioned the same thing.
 *   - **Line 325 sits outside the grid**, and is not one of those totals.
 *
 * ── The line-220 column ─────────────────────────────────────────────────────
 *
 * It was a permanently blank column with a code comment explaining that the
 * product did not collect an FBN. The engine had supported it end to end the
 * whole time; only the contract field was missing. It is editable here now.
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
	/*
	 * Where the page prints each footnote, and with what glyph — read from the
	 * form definition, not restated here.
	 *
	 * This view carried its own `PRINTED_MARK` map of the page's asterisks. Wrong
	 * home: the glyph is printed on the page, so it is transcription and belongs
	 * with the transcription. AT1 Schedule 1 needing the same thing is what moved
	 * it to `FormFootnotePlacement` in ca-tax.
	 */
	const footnotes = readFootnotePlacement(
		AT1_SCHEDULE_29_FOOTNOTES,
		AT1_SCHEDULE_29_FOOTNOTE_PLACEMENT,
	);

	const sectionMeta = (id: string) =>
		AT1_SCHEDULE_29_SECTIONS.find((s) => s.id === id);
	const sectionFields = (id: string) =>
		AT1_SCHEDULE_29_FIELDS.filter((f) => f.section === id);

	/** Every line the allocation grid draws — a leader row would double them. */
	const gridLines = new Set(
		AT1_SCHEDULE_29_ALLOCATION_COLUMNS.flatMap((c) =>
			c.totalsLine ? [c.line, c.totalsLine] : [c.line],
		),
	);

	const row = (f: PaperField) => (
		<PaperLeaderRow
			key={f.line}
			line={printed(f.line)}
			caption={f.caption}
			kind={f.kind}
			role={f.role}
			note={f.note}
			sourceText={f.sourceText}
			from={f.from}
			to={f.to}
			footnoteMarks={f.footnoteMarks}
			footnotes={AT1_SCHEDULE_29_FOOTNOTES}
			footnoteSymbol={(mark) => footnotes.marks[mark]}
			onNavigate={onNavigate}
			highlightLine={highlightLine}
			control={iegControl}
			resolveLine={resolveLine}
			disabled={disabled}
		/>
	);

	/** A row, preceded by any heading the page prints immediately above it. */
	const rowWithHeadings = (f: PaperField) => {
		const headings = AT1_SCHEDULE_29_BLOCK_HEADINGS.filter(
			(h) => h.aboveLine === printed(f.line),
		);
		if (headings.length === 0) return row(f);
		return (
			<div key={f.line}>
				{headings.map((h) => (
					<p
						key={h.text}
						className="px-4 pb-1 pt-3 text-sm font-semibold leading-tight"
					>
						{h.text}
					</p>
				))}
				{row(f)}
			</div>
		);
	};

	const eligible = sectionMeta("eligible");

	return (
		<div className="space-y-4">
			{/*
			 * The NOTE the page prints above the first heading: which federal line
			 * to use turns on a date (T661 line 559 before 2024-12-16, line 557
			 * after), and this is the only place the form says so. Outside the card
			 * because the page sets it in the identification box above, not under
			 * the heading — the same treatment Schedule 20's medicine-gift
			 * paragraph gets.
			 */}
			{eligible?.printedBefore && (
				<p className="px-1 text-sm font-medium text-muted-foreground">
					{eligible.printedBefore}
				</p>
			)}
			<PaperSection
				title={eligible?.title ?? "Eligible Expenditures for IEG Purposes"}
				description={eligible?.description}
				formId="AT1SCH29"
			>
				{sectionFields("eligible")
					.filter((f) => printed(f.line) !== "040")
					.map(row)}
			</PaperSection>

			{/*
			 * Line 040 is in a box of its OWN on page 1 — below the eligible
			 * box, with no heading at all. `PaperSection` requires a title and
			 * inventing one is how a phantom heading got into Schedule 18, so
			 * this is the card without a header rather than a card called
			 * something the page never says.
			 */}
			<div className="divide-y rounded-lg border bg-card">
				{sectionFields("eligible")
					.filter((f) => printed(f.line) === "040")
					.map(row)}
			</div>

			{(["limit", "grant", "agreement"] as const).map((id) => {
				const meta = sectionMeta(id);
				if (!meta) return null;
				return (
					<PaperSection
						key={id}
						title={meta.title}
						description={meta.description}
					>
						{sectionFields(id).map(rowWithHeadings)}
						{/*
						 * The page prints this box's own notes at ITS foot, with the
						 * glyphs that box uses — and the runs restart per box, so
						 * "*" here is not "*" in the box above. That is precisely
						 * what a single list at the end of the form cannot express.
						 */}
						<PaperFootnotes
							notes={AT1_SCHEDULE_29_FOOTNOTES}
							only={footnotes.forSection(id)}
							marks={footnotes.marks}
						/>
					</PaperSection>
				);
			})}

			{/*
			 * The worksheet behind 114, 116 and 126. Placed before the allocation
			 * grid because it feeds the grant itself, whereas the allocation grid
			 * only splits an agreed limit between members.
			 */}
			<PaperSection
				title="Associated group — taxable capital and prior-year expenditures"
				description="Not a printed table: lines 114, 116 and 126 are single boxes on the page, and this is the group they are struck from. Include this corporation even when it has no associates — its own taxable capital and prior-year eligible expenditures are what the grind is measured on, and without them the grant computes as nil."
			>
				<GroupRoster control={iegControl} disabled={disabled} />
			</PaperSection>

			<PaperSection
				title={sectionMeta("allocation")?.title ?? "Allocation"}
				description={sectionMeta("allocation")?.description}
			>
				<AllocationGrid
					control={iegControl}
					disabled={disabled}
					computed={computed}
					printedNotes={footnotes.forSection("allocation")}
				/>
				{/*
				 * 325 is printed BELOW the grid, outside it — the claiming
				 * corporation's own line 268 restated, and the figure line 125
				 * actually draws on. Not a Totals cell, so not in the table.
				 */}
				{sectionFields("allocation")
					.filter((f) => !gridLines.has(printed(f.line)))
					.map(row)}
				<MemberDetails control={iegControl} disabled={disabled} />
			</PaperSection>

			{/*
			 * AT4970 — the attachment TRA requires whenever the grant is claimed,
			 * listing the Alberta SR&ED projects. Its project totals feed this
			 * schedule's lines 005/007/009 automatically. Collected in the guided
			 * view only until now.
			 */}
			<PaperSection
				title="AT4970 — Listing of IEG projects carried out in Alberta"
				description="One row per project (lines 101-113). The totals across projects fill lines 005, 007 and 009 above unless those are entered directly."
			>
				<WorksheetTable
					control={iegControl}
					name="projects"
					disabled={disabled}
					addLabel="+ Add a project"
					emptyText="No projects listed."
					columns={[
						{
							name: "title",
							label: "Title (101)",
							kind: "text",
							hint: "Same as line 200 of federal T661 Part 2.",
						},
						{
							name: "projectCode",
							label: "Project code (103)",
							kind: "text",
							hint: "Federal T661 line 206.",
						},
						{
							name: "albertaPortion",
							label: "Alberta portion (105)",
							kind: "money",
						},
						{
							name: "otherPortion",
							label: "Not in Alberta (107)",
							kind: "money",
						},
						{
							name: "salariesAndWages",
							label: "Salaries and wages (109)",
							kind: "money",
						},
						{
							name: "federalProxyAmount",
							label: "Federal proxy (111)",
							kind: "money",
						},
						{
							name: "albertaProxyAmount",
							label: "Alberta proxy (113)",
							kind: "money",
						},
					]}
				/>
			</PaperSection>
			<PaperSection
				title="AT4970 — SR&ED expenditures by jurisdiction"
				description="Informational (lines 135-161): where the SR&ED spending was incurred."
			>
				<WorksheetTable
					control={iegControl}
					name="jurisdictions"
					disabled={disabled}
					addLabel="+ Add a jurisdiction"
					emptyText="No jurisdictions listed."
					columns={[
						{
							name: "jurisdiction",
							label: "Jurisdiction",
							kind: "select",
							options: JURISDICTIONS,
						},
						{ name: "amountIncurred", label: "Amount incurred", kind: "money" },
					]}
				/>
			</PaperSection>

			{/*
			 * Only what belongs to no box: this form's three unmarked instruction
			 * blocks (the 15-month filing deadline, the dollars-not-cents rule, the
			 * agreement's own preamble). Everything else is now printed at the foot
			 * of the box it qualifies, which is where the page puts it.
			 */}
			<PaperFootnotes
				notes={AT1_SCHEDULE_29_FOOTNOTES}
				only={footnotes.unplaced}
				marks={footnotes.marks}
			/>
		</div>
	);
}

/**
 * Page 3's allocation grid: ten columns per member, then the Totals row.
 *
 * One row per `agreementMembers` entry, added and removed here — a plain 1:1
 * array, unlike Schedule 17's type-matched grid, so a row's array index IS its
 * occurrence on the form. The claiming corporation goes first; that is the
 * page's own instruction in this box's heading, and it is load-bearing (row 1's
 * line 268 is what becomes line 325 and switches the grant to the associated
 * formula).
 *
 * The Totals row reads the last computed return rather than summing the visible
 * cells. Lines 310 and 320 are not sums at all — 310 is the page's own
 * X − ((Y + Z) / 2), and 267/268 are floored at nil per member — so adding up
 * the column would show a number the return does not file.
 */
/**
 * The associated-group roster — the worksheet lines 114, 116 and 126 are struck
 * from.
 *
 * It existed only in the Guided view, and the consequence was not cosmetic: a
 * preparer working in Form View had no way to enter the group at all, so the
 * base amount (118) and taxable capital (126) computed nil and the Innovation
 * Employment Grant came out $0 — on a return that had claimed one. A bench run
 * needed the Guided view as an exception to get a grant to compute at all, and
 * an earlier case moved from $0 to $31,250 the moment the roster was filled.
 *
 * Rendered as the roster rather than by making 114/116/126 editable, which was
 * the other way to close it. Those three are struck FROM this table — the
 * claimant's own row, and the group's taxable capital — so typing them directly
 * would create a second source for figures the engine derives, and the two
 * would disagree the moment a member changed. This codebase has that rule
 * everywhere else; it holds here too.
 *
 * The printed form carries no grid for this (114/116/126 are single boxes, and
 * the group behind them is a worksheet), so it renders as its own block rather
 * than as a facsimile of a table that is not on the page.
 *
 * A group of one is still a group: the claimant corporation belongs in this
 * table even with no associates, because its own taxable capital and prior-year
 * expenditures are what the grind is measured on.
 */
function GroupRoster({
	control,
	disabled,
}: {
	control: Control<AlbertaIegValues>;
	disabled?: boolean;
}) {
	const members = useWatch({ control, name: "group" }) ?? [];
	const { append, remove } = useFieldArray({ control, name: "group" });
	const COLUMNS = [
		{ name: "name", heading: "Corporation name", kind: "text" },
		{
			name: "taxableCapital",
			heading: "Taxable capital employed in Canada",
			kind: "money",
		},
		{
			name: "priorYear1",
			heading: "Eligible Alberta SR&ED — 1st preceding year",
			kind: "money",
		},
		{
			name: "priorYear2",
			heading: "Eligible Alberta SR&ED — 2nd preceding year",
			kind: "money",
		},
	] as const;

	return (
		<div className="space-y-2 p-2">
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-sm">
					<thead>
						<tr>
							<th className="w-8 border-b px-1 pb-2" />
							{COLUMNS.map((col) => (
								<th
									key={col.name}
									className="min-w-[10rem] border-b px-2 pb-2 text-left align-bottom font-medium"
								>
									<span className="block leading-tight">{col.heading}</span>
								</th>
							))}
							<th className="w-10 border-b px-1 pb-2" />
						</tr>
					</thead>
					<tbody>
						{members.map((_m, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: row order is the preparer's own, and removing by index is how the grid edits
							<tr key={`group-${i}`} className="border-b">
								<td className="px-1 py-1.5 text-center font-mono text-[11px] text-muted-foreground">
									{i + 1}
								</td>
								{COLUMNS.map((col) => (
									<td key={col.name} className="px-2 py-1.5">
										{col.kind === "money" ? (
											<PaperMoney
												control={control}
												name={`group.${i}.${col.name}`}
												label={`${col.heading} — member ${i + 1}`}
												disabled={disabled}
											/>
										) : (
											<PaperText
												control={control}
												name={`group.${i}.${col.name}`}
												label={`${col.heading} — member ${i + 1}`}
												disabled={disabled}
											/>
										)}
									</td>
								))}
								<td className="px-1 py-1.5 text-right">
									<button
										type="button"
										onClick={() => remove(i)}
										disabled={disabled}
										className="rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
										aria-label={`Remove member ${i + 1}`}
									>
										✕
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<button
				type="button"
				onClick={() => append({})}
				disabled={disabled}
				className="rounded-md border px-2 py-1 text-xs hover:bg-accent disabled:opacity-50"
			>
				Add member
			</button>
			{members.length === 0 && (
				<p className="px-1 text-xs text-muted-foreground">
					No members yet. Add this corporation even if it has no associates —
					lines 114, 116 and 126 are struck from this table, and without it the
					grant computes as nil.
				</p>
			)}
		</div>
	);
}

const JURISDICTIONS = [
	{ value: "alberta", label: "Alberta" },
	{ value: "britishColumbia", label: "British Columbia" },
	{ value: "manitoba", label: "Manitoba" },
	{ value: "newBrunswick", label: "New Brunswick" },
	{ value: "newfoundlandAndLabrador", label: "Newfoundland and Labrador" },
	{ value: "northwestTerritories", label: "Northwest Territories" },
	{ value: "novaScotia", label: "Nova Scotia" },
	{ value: "nunavut", label: "Nunavut" },
	{ value: "ontario", label: "Ontario" },
	{ value: "princeEdwardIsland", label: "Prince Edward Island" },
	{ value: "quebec", label: "Québec" },
	{ value: "saskatchewan", label: "Saskatchewan" },
	{ value: "yukon", label: "Yukon" },
	{ value: "other", label: "Other" },
] as const;

/**
 * What the agreement needs about each member beyond its printed columns: a
 * name (not a printed line — line 220's BN identifies a member on the page,
 * so this is never filed), the member's own days in its tax year, and whether
 * it has an Alberta permanent establishment (a member without one gets no
 * allowed amount at 268). One row per member, in the grid's order.
 */
function MemberDetails({
	control,
	disabled,
}: {
	control: Control<AlbertaIegValues>;
	disabled?: boolean;
}) {
	const members = useWatch({ control, name: "agreementMembers" }) ?? [];
	if (members.length === 0) return null;
	return (
		<div className="space-y-1 p-2">
			<p className="px-2 text-xs font-semibold">Member details</p>
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-sm">
					<thead>
						<tr>
							<th className="w-8 border-b px-1 pb-2" />
							<th className="border-b px-2 pb-2 text-left font-medium">
								Name (not filed)
							</th>
							<th className="border-b px-2 pb-2 text-left font-medium">
								Days in this member's tax year
							</th>
							<th className="border-b px-2 pb-2 text-left font-medium">
								Permanent establishment in Alberta?
							</th>
						</tr>
					</thead>
					<tbody>
						{members.map((_m, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: same order as the allocation grid above
							<tr key={`detail-${i}`} className="border-b">
								<td className="px-1 py-1.5 text-center font-mono text-[11px] text-muted-foreground">
									{i + 1}
								</td>
								<td className="px-2 py-1.5">
									<PaperText
										control={control}
										name={`agreementMembers.${i}.name`}
										label={`Name — member ${i + 1}`}
										disabled={disabled}
									/>
								</td>
								<td className="px-2 py-1.5">
									<PaperNumber
										control={control}
										name={`agreementMembers.${i}.daysInTaxYear`}
										label={`Days in tax year — member ${i + 1}`}
										placeholder="365"
										disabled={disabled}
									/>
								</td>
								<td className="px-2 py-1.5">
									<PaperSelect
										control={control}
										name={`agreementMembers.${i}.hasAlbertaPermanentEstablishment`}
										label={`Alberta permanent establishment — member ${i + 1}`}
										options={[
											{ value: "yes", label: "Yes" },
											{ value: "no", label: "No" },
										]}
										blankLabel="— not answered"
										disabled={disabled}
									/>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

function AllocationGrid({
	control,
	disabled,
	computed,
	printedNotes,
}: {
	control: Control<AlbertaIegValues>;
	disabled?: boolean;
	computed?: ComputedReturn;
	/** Footnote indices the page prints at the foot of THIS box, in page order. */
	printedNotes: readonly number[];
}) {
	const members = useWatch({ control, name: "agreementMembers" }) ?? [];
	const { append, remove } = useFieldArray({
		control,
		name: "agreementMembers",
	});

	const filed = computed?.schedulePayloads?.find(
		(p) => p.scheduleId === SCHEDULE_ID,
	);
	const filedByFieldOccurrence = new Map(
		(filed?.values ?? []).flatMap((v) => {
			const p = parseAt1LineItemId(v.lineItemId);
			return p ? [[`${p.field}-${p.occurrence}`, v.value] as const] : [];
		}),
	);

	/** Where the page sets "Totals": the cell just left of the first sum. */
	const labelColumnIndex =
		AT1_SCHEDULE_29_ALLOCATION_COLUMNS.findIndex((c) => c.totalsLine) - 1;

	return (
		<div className="space-y-2 p-2">
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-sm">
					<thead>
						<tr>
							<th className="w-8 border-b px-1 pb-2" />
							{AT1_SCHEDULE_29_ALLOCATION_COLUMNS.map((col) => (
								<th
									key={col.line}
									className="min-w-[10rem] border-b px-2 pb-2 text-left align-bottom font-medium"
								>
									<span className="block leading-tight">{col.heading}</span>
									<span className="mt-0.5 block w-fit rounded bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
										{col.line}
									</span>
								</th>
							))}
							<th className="w-10 border-b px-1 pb-2" />
						</tr>
					</thead>
					<tbody>
						{members.map((_m, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: the array index IS the row's printed occurrence — reordering would change which member files at which occurrence
							<tr key={`member-${i}`} className="border-b">
								<td className="px-1 py-1.5 text-center font-mono text-[11px] text-muted-foreground">
									{i + 1}
								</td>
								{AT1_SCHEDULE_29_ALLOCATION_COLUMNS.map((col) => {
									const name = MEMBER_FIELD[col.line];
									if (!name) {
										/*
										 * 267 and 268 — the page derives both from the
										 * row's own entries, so they are shown, never
										 * typed. Read from the last computed return at
										 * this row's occurrence.
										 */
										const value = filedByFieldOccurrence.get(
											`${col.line}-${i + 1}`,
										);
										return (
											<td
												key={col.line}
												className="px-2 py-1.5 text-right tabular-nums text-muted-foreground"
											>
												{typeof value === "number"
													? at1Money(value)
													: (value ?? "—")}
											</td>
										);
									}
									return (
										<td key={col.line} className="px-2 py-1.5">
											{col.kind === "money" ? (
												<PaperMoney
													control={control}
													name={`agreementMembers.${i}.${name}`}
													label={`${col.heading} — member ${i + 1}`}
													disabled={disabled}
												/>
											) : (
												<PaperText
													control={control}
													name={`agreementMembers.${i}.${name}`}
													label={`${col.heading} — member ${i + 1}`}
													type={col.kind === "date" ? "date" : "text"}
													disabled={disabled}
												/>
											)}
										</td>
									);
								})}
								<td className="px-1 py-1.5 text-right">
									<button
										type="button"
										onClick={() => remove(i)}
										disabled={disabled}
										className="rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
										aria-label={`Remove member ${i + 1}`}
									>
										✕
									</button>
								</td>
							</tr>
						))}
						{/* The Totals row, printed inside the grid with its own lines. */}
						<tr className="bg-muted/30">
							<td className="px-1 py-1.5" />
							{AT1_SCHEDULE_29_ALLOCATION_COLUMNS.map((col, i) => {
								if (!col.totalsLine) {
									// Three columns are not totalled — there is no sum of a
									// business number, an account number or a year end. The
									// page prints its "Totals" label in the last of them,
									// immediately left of the first figure it sums.
									return (
										<td
											key={col.line}
											className="px-2 py-1.5 text-right font-semibold"
										>
											{i === labelColumnIndex
												? AT1_SCHEDULE_29_ALLOCATION_TOTALS_LABEL
												: null}
										</td>
									);
								}
								const value = filedByFieldOccurrence.get(`${col.totalsLine}-1`);
								return (
									<td key={col.line} className="px-2 py-1.5">
										<div className="flex items-center gap-1.5">
											<span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
												{col.totalsLine}
											</span>
											<span className="flex-1 text-right tabular-nums text-muted-foreground">
												{typeof value === "number" ? at1Money(value) : "—"}
											</span>
										</div>
									</td>
								);
							})}
							<td className="px-1 py-1.5" />
						</tr>
					</tbody>
				</table>
			</div>
			<div className="flex items-center justify-between gap-3 px-1">
				<button
					type="button"
					onClick={() => append({})}
					disabled={disabled}
					className="rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted disabled:opacity-50"
				>
					+ Add an associated corporation
				</button>
				{members.length === 0 && (
					<p className="text-xs text-muted-foreground">
						Leave empty for a non-associated claim — the grant then uses line
						112, not line 125.
					</p>
				)}
			</div>
			{/*
			 * The page's own "Notes" block, printed at the foot of this grid.
			 *
			 * It anchors each entry by NAMING the line it governs ("Line 270: total
			 * must not exceed line 208") rather than with an asterisk, which is why
			 * these carry no glyph — `footnotePlacement` leaves `mark` unset for
			 * them, and inventing one would send a reader hunting the page for it.
			 * Headed "Notes", as the page heads it.
			 *
			 * The indices come from the form definition rather than being derived
			 * from the grid's own fields, which is what this used to do: that
			 * version could only find a note some FIELD marked, so a note attached
			 * to the box rather than to a line silently vanished.
			 */}
			{printedNotes.length > 0 && (
				<div className="border-t px-2 pt-2">
					<p className="mb-1 text-xs font-semibold text-muted-foreground">
						Notes
					</p>
					<ul className="space-y-0.5 text-xs text-muted-foreground">
						{printedNotes.map((i) => (
							<li key={i}>{AT1_SCHEDULE_29_FOOTNOTES[i]}</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
