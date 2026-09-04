"use client";

import { ResponsiveSplitLayout } from "@classytic/fluid/client/responsive-split-layout";
import { SchemaForm } from "@classytic/fluid/formkit";
import {
	AlertTriangle,
	ArrowLeft,
	Calculator,
	CloudDownload,
	FileText,
	FileUp,
	Printer,
	ScrollText,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import type { Client } from "@/api/clients";
import type { EngagementYear } from "@/api/engagements";
import type { GifiImportResult } from "@/api/gifi";
import { FORM_COMPONENTS } from "@/components/form/money-field";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useClient } from "@/hooks/query/use-clients";
import { useLatestComputedReturn } from "@/hooks/query/use-computed-returns";
import {
	useEngagement,
	useEngagementActions,
} from "@/hooks/query/use-engagements";
import { cn } from "@/lib/utils";
import {
	FACTOR_LINES,
	HIDDEN_LINES,
	labelForLine,
} from "../_config/line-labels";
import {
	formViewFor,
	isProgramSpecific,
	SCHEDULE_TREE,
	type ScheduleKey,
	scheduleTreeFor,
	schemaFor,
} from "../_config/registry";
import { Schedule10View } from "../_config/schedules/at1/paper/schedule10-view";
import { Schedule12View } from "../_config/schedules/at1/paper/schedule12-view";
import { Schedule2View } from "../_config/schedules/at1/paper/schedule2-view";
import type { NavigateToLine } from "../_config/schedules/shared/define";
import { bookNetIncomeOf } from "../_lib/calc";
import type { ReturnInput } from "../_lib/return-input";
import { useCcaPreviewTotal } from "../_lib/use-cca-preview";
import { AutoFillDialog } from "./auto-fill-dialog";
import { GifiImportDialog } from "./gifi-import-dialog";
import { ScheduleFiledValues } from "./schedule-filed-values";

const money = (n: number) =>
	new Intl.NumberFormat("en-CA", {
		style: "currency",
		currency: "CAD",
		maximumFractionDigits: 0,
	}).format(n);

/**
 * AT1 schedules with no `ScheduleDef`/editable side at all — each is fully
 * computed from OTHER schedules' fields (Schedule 12), or has no dedicated
 * `ReturnInput` slice to write to (Schedules 2 and 10). Special-cased nav
 * entries, the same pattern already used for "Tax Summary (jacket)", rather
 * than the normal registry (which requires a real `ReturnInput` key).
 */
const READ_ONLY_SCHEDULES = [
	{
		key: "schedule2" as const,
		num: "002",
		label: "Alberta Income Allocation Factor (S2)",
		hint: "Read-only — Area A only, carried in from federal Schedule 5",
		View: Schedule2View,
	},
	{
		key: "schedule10" as const,
		num: "010",
		label: "Alberta Loss Carry-Back Application (S10)",
		hint: "Read-only — non-capital and capital carrybacks, as filed",
		View: Schedule10View,
	},
	{
		key: "schedule12" as const,
		num: "012",
		label: "Alberta Income/Loss Reconciliation (S12)",
		hint: "Read-only — computed from the Alberta-override fields on CCA, Reserves, Dispositions and Loss Continuity",
		View: Schedule12View,
	},
];

/**
 * A paper Form View's cross-reference badges point at a `FormDefinition.id`
 * (`"AT1SCH12"`), not a `ScheduleKey` — the two vocabularies are deliberately
 * different (see `../_config/schedules/at1/forms` in `@classytic/ca-tax` for
 * the former). A schedule missing here just means its `to` badges render
 * inert (no `onNavigate` match) rather than throwing — safe by construction.
 * Two AT1 schedules fold into a FEDERAL schedule's own form-view rather than
 * getting their own `ScheduleKey` (Schedule 13's Alberta CCA override lives
 * under `"cca"`, Schedule 17's reserves under `"reserves"`) — confirmed by
 * reading each schedule file's own `formView:` wiring, not guessed.
 */
const FORM_ID_TO_SCHEDULE_KEY: Record<
	string,
	ScheduleKey | "schedule2" | "schedule10" | "schedule12"
> = {
	AT1: "alberta",
	AT1SCH1: "albertaSbd",
	AT1SCH2: "schedule2",
	AT1SCH03: "albertaOtherCredits3",
	AT1SCH04: "albertaForeignInvestment4",
	AT1SCH05: "albertaRoyaltyDeduction5",
	AT1SCH06: "albertaRoyaltyCredit6",
	AT1SCH07: "albertaRoyaltySupplemental7",
	AT1SCH08: "albertaPoliticalContributions8",
	AT1SCH09: "albertaSredCredit9",
	AT1SCH10: "schedule10",
	AT1SCH12: "schedule12",
	AT1SCH13: "cca",
	AT1SCH15: "albertaResourceDeductions15",
	AT1SCH17: "reserves",
	AT1SCH20: "albertaDonations",
	AT1SCH21: "albertaContinuity",
	AT1SCH29: "albertaIeg",
};

/** True if a schedule slice carries any entered value (drives the nav "has data" dot). */
const hasData = (v: unknown): boolean =>
	!!v &&
	typeof v === "object" &&
	Object.values(v as Record<string, unknown>).some(
		(x) => x != null && x !== "" && !(Array.isArray(x) && x.length === 0),
	);

export function ReturnEditor({ id }: { id: string }) {
	const { data: engagement, isLoading } = useEngagement(id);
	const { saveInput, compute } = useEngagementActions();
	const { latest: computed } = useLatestComputedReturn(id);
	const { data: client } = useClient(engagement?.clientId);

	const [active, setActive] = useState<
		ScheduleKey | "summary" | "schedule12" | "schedule2" | "schedule10"
	>("incomeStatement");
	// The line to scroll to and briefly highlight after a paper Form View's
	// cross-reference badge switches `active` to another schedule — cleared on
	// a timer so clicking the same badge again re-triggers the highlight (a
	// second `setHighlightLine` to the same value wouldn't otherwise change
	// state and re-fire the effect).
	const [highlightLine, setHighlightLine] = useState<string | undefined>(undefined);
	const onNavigate: NavigateToLine = (form, line) => {
		const key = FORM_ID_TO_SCHEDULE_KEY[form];
		if (!key) return;
		setActive(key);
		setHighlightLine(line);
		setTimeout(() => setHighlightLine(undefined), 2500);
	};
	const [onlyProgramSpecific, setOnlyProgramSpecific] = useState(false);
	const [ri, setRi] = useState<ReturnInput | null>(null);
	// Inputs edited since the last compute → the summary is stale until recomputed.
	const [dirty, setDirty] = useState(false);
	const [gifiOpen, setGifiOpen] = useState(false);
	const [afrOpen, setAfrOpen] = useState(false);
	// Bumped when values change outside the form (GIFI import) to force a remount
	// so SchemaForm's mount-only defaultValues pick up the new numbers.
	const [formVersion, setFormVersion] = useState(0);

	// Seed local working copy from the persisted returnInput once loaded.
	const seeded =
		ri ?? (engagement?.returnInput as ReturnInput | undefined) ?? {};
	const clientName = client?.name ?? engagement?.clientId ?? "";
	// Called unconditionally, ABOVE the loading early-return below — a hook
	// placed after a conditional return fires on some renders and not others
	// (nothing to preview before `engagement` loads anyway), which breaks
	// React's "same hooks, same order, every render" rule and throws.
	const { total: cca } = useCcaPreviewTotal(id, seeded.cca?.classes);

	if (isLoading || !engagement) {
		return <div className="text-muted-foreground">Loading return…</div>;
	}

	// Only the schedules that apply to this engagement's program (CO17 shows the
	// Québec block; T2/AT1 hide it).
	const tree = scheduleTreeFor(engagement.program);
	// Schedules the PROGRAM ITSELF owns (e.g. AT1's own jacket/loss-continuity/IEG
	// blocks) vs shared federal ones the program also needs as input (CCA, SR&ED,
	// …). Filtering to "this program only" is offered only when it would narrow
	// anything — an engagement whose whole tree is program-specific already (or
	// has none) gets no filter row.
	const specificCount = tree.filter((s) =>
		isProgramSpecific(s, engagement.program),
	).length;
	const showProgramFilter = specificCount > 0 && specificCount < tree.length;
	const visibleTree =
		onlyProgramSpecific && showProgramFilter
			? tree.filter((s) => isProgramSpecific(s, engagement.program))
			: tree;

	const saveSlice = async (
		key: ScheduleKey,
		values: Record<string, unknown>,
	) => {
		const next: ReturnInput = { ...seeded, [key]: values };
		setRi(next);
		try {
			await saveInput.mutateAsync({ id, returnInput: next });
			setDirty(true);
			toast.success("Saved");
		} catch {
			toast.error("Save failed");
		}
	};

	// Apply a GIFI import: populate the income statement + balance sheet slices
	// in one save, then mark the summary stale so the preparer recomputes.
	const applyGifi = async (r: GifiImportResult) => {
		const next: ReturnInput = {
			...seeded,
			incomeStatement: r.incomeStatement,
			balanceSheet: r.balanceSheet,
		};
		setRi(next);
		try {
			await saveInput.mutateAsync({ id, returnInput: next });
			setDirty(true);
			setFormVersion((v) => v + 1); // remount the form to show imported values
			setActive("incomeStatement");
		} catch {
			toast.error("Save failed");
		}
	};

	const runCompute = async () => {
		try {
			// Send the STRUCTURED working return — the server persists it and assembles
			// the engine input authoritatively, so calculation and the frozen filing
			// package derive from one source (not a separate client-built engine input).
			await compute.mutateAsync({ id, input: { returnInput: seeded } });
			setDirty(false);
			toast.success("Return computed");
			setActive("summary");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Compute failed");
		}
	};

	const bookNI = bookNetIncomeOf(seeded);
	// Computed once, but inputs have changed since → the shown numbers are stale.
	const stale = !!computed && dirty;
	// `cca` (from `useCcaPreviewTotal`) is a pre-compute LIVE PREVIEW that only
	// covers the ordinary declining-balance "CCA classes" array — it deliberately
	// does not model a new class 13 leasehold layer or class 14 property (see
	// `cca-preview.service.ts`'s own doc comment), so it under-reports whenever
	// one of those is entered. Once a fresh (non-stale) compute exists, its own
	// `ccaClaimed` field is the real combined total (ordinary + class 13/14 +
	// the class 14.1 transitional allowance) — prefer that instead.
	const computedCcaField = computed?.fields?.find((f) => f.line === "ccaClaimed")?.value;
	const ccaDisplay =
		!stale && computedCcaField != null ? Number(computedCcaField) : cca;
	const computeLabel = compute.isPending
		? "Computing…"
		: computed
			? "Recompute"
			: "Compute return";

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<Link
						href={`/dashboard/engagements/${id}`}
						className="mb-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
					>
						<ArrowLeft className="size-3.5" /> {clientName}
					</Link>
					<h1 className="text-xl font-semibold">
						{engagement.program} return ·{" "}
						{new Date(engagement.taxYearEnd).getFullYear()}
					</h1>
				</div>
				<div className="flex items-center gap-2">
					{stale && (
						<Badge variant="secondary" className="gap-1">
							<AlertTriangle className="size-3.5" /> Recompute needed
						</Badge>
					)}
					<Button variant="outline" onClick={() => setAfrOpen(true)}>
						<CloudDownload className="size-4" />
						Auto-fill from CRA
					</Button>
					<Button variant="outline" onClick={() => setGifiOpen(true)}>
						<FileUp className="size-4" />
						Import GIFI
					</Button>
					<Link
						href={`/dashboard/engagements/${id}/jacket`}
						className={buttonVariants({ variant: "outline" })}
					>
						<ScrollText className="size-4" />
						Jacket
					</Link>
					<Link
						href={`/dashboard/engagements/${id}/print`}
						className={buttonVariants({ variant: "outline" })}
					>
						<Printer className="size-4" />
						Print / PDF
					</Link>
					<Button onClick={runCompute} disabled={compute.isPending}>
						<Calculator className="size-4" />
						{computeLabel}
					</Button>
				</div>
			</div>

			<GifiImportDialog
				open={gifiOpen}
				onOpenChange={setGifiOpen}
				onApply={applyGifi}
			/>
			<AutoFillDialog
				open={afrOpen}
				onOpenChange={setAfrOpen}
				engagementId={id}
				businessNumber={client?.businessNumber}
				onApplied={() => {
					// The mutation refreshed the engagement; drop the local working copy so
					// the editor re-seeds from the CRA-filled return, and remount the form.
					setRi(null);
					setDirty(true);
					setFormVersion((v) => v + 1);
				}}
			/>

			<div className="h-[calc(100dvh-13rem)] min-h-[480px] overflow-hidden rounded-lg border">
				<ResponsiveSplitLayout
					variant="default"
					defaultLayout={[26, 74]}
					minSizes={[18, 45]}
					persistLayoutKey="tf-return-editor"
					leftPanel={{
						title: "Schedules",
						content: (
							<nav className="space-y-1 p-2">
								<div className="flex items-center justify-between px-2 py-1">
									<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
										Schedules
									</p>
									{showProgramFilter && (
										<div className="flex gap-0.5 rounded-md bg-muted p-0.5 text-[11px]">
											<button
												type="button"
												onClick={() => setOnlyProgramSpecific(false)}
												className={cn(
													"rounded px-1.5 py-0.5 font-medium transition-colors",
													!onlyProgramSpecific
														? "bg-background shadow-sm"
														: "text-muted-foreground",
												)}
											>
												All
											</button>
											<button
												type="button"
												onClick={() => setOnlyProgramSpecific(true)}
												className={cn(
													"rounded px-1.5 py-0.5 font-medium transition-colors",
													onlyProgramSpecific
														? "bg-background shadow-sm"
														: "text-muted-foreground",
												)}
												title={`Hide the shared federal schedules — show only ${engagement.program}'s own`}
											>
												{engagement.program} only
											</button>
										</div>
									)}
								</div>
								{onlyProgramSpecific && visibleTree.length === 0 && (
									<p className="px-2 py-1 text-xs text-muted-foreground">
										No {engagement.program}-only schedules on this return yet.
									</p>
								)}
								{visibleTree.map((s) => (
									<button
										type="button"
										key={s.key}
										onClick={() => setActive(s.key)}
										className={cn(
											"flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent",
											active === s.key && "bg-accent",
										)}
									>
										<span className="mt-0.5 inline-flex w-9 shrink-0 justify-center rounded bg-muted px-1 py-0.5 font-mono text-[11px] text-muted-foreground">
											{s.num}
										</span>
										<span className="min-w-0 flex-1">
											<span className="flex items-center gap-1.5">
												<span className="truncate font-medium">{s.label}</span>
												{hasData(seeded[s.key]) && (
													<span
														className="size-1.5 shrink-0 rounded-full bg-primary"
														title="Has entered data"
													/>
												)}
											</span>
											<span className="block truncate text-xs text-muted-foreground">
												{s.hint}
											</span>
										</span>
									</button>
								))}
								{engagement.program === "AT1" &&
									READ_ONLY_SCHEDULES.map((s) => (
										<button
											type="button"
											key={s.key}
											onClick={() => setActive(s.key)}
											className={cn(
												"flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent",
												active === s.key && "bg-accent",
											)}
										>
											<span className="mt-0.5 inline-flex w-9 shrink-0 justify-center rounded bg-muted px-1 py-0.5 font-mono text-[11px] text-muted-foreground">
												{s.num}
											</span>
											<span className="min-w-0 flex-1">
												<span className="truncate font-medium">{s.label}</span>
												<span className="block truncate text-xs text-muted-foreground">
													Read-only — as filed
												</span>
											</span>
										</button>
									))}
								<button
									type="button"
									onClick={() => setActive("summary")}
									className={cn(
										"flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent",
										active === "summary" && "bg-accent",
									)}
								>
									<span className="inline-flex w-9 shrink-0 justify-center rounded bg-primary/10 px-1 py-0.5 font-mono text-[11px] text-primary">
										9
									</span>
									<span className="font-medium">Tax Summary (jacket)</span>
								</button>
							</nav>
						),
					}}
					rightPanel={{
						title: "Form",
						content: (
							<div className="p-5">
								{active === "summary" ? (
									<TaxSummary
										program={engagement.program}
										computed={computed}
										stale={stale}
										bookNI={bookNI}
										cca={ccaDisplay}
										onCompute={runCompute}
										computeLabel={computeLabel}
										computing={compute.isPending}
									/>
								) : READ_ONLY_SCHEDULES.some((s) => s.key === active) ? (
									(() => {
										const meta = READ_ONLY_SCHEDULES.find((s) => s.key === active)!;
										const View = meta.View;
										return (
											<div className="space-y-4">
												<div>
													<div className="flex items-center gap-2">
														<Badge variant="secondary" className="font-mono">
															{meta.num}
														</Badge>
														<h2 className="text-lg font-semibold">{meta.label}</h2>
													</div>
													<p className="text-sm text-muted-foreground">{meta.hint}</p>
												</div>
												<View
													computed={computed}
													stale={stale}
													onNavigate={onNavigate}
													highlightLine={active === meta.key ? highlightLine : undefined}
												/>
											</div>
										);
									})()
								) : (
									<ScheduleForm
										key={`${active}-${formVersion}`}
										schedule={active as ScheduleKey}
										value={(seeded[active as ScheduleKey] as Record<string, unknown>) ?? {}}
										saving={saveInput.isPending}
										onSave={(v) => saveSlice(active as ScheduleKey, v)}
										computed={computed}
										stale={stale}
										engagement={engagement}
										client={client}
										onNavigate={onNavigate}
										highlightLine={highlightLine}
										footer={
											active === "incomeStatement" ? (
												<p className="text-sm text-muted-foreground">
													Net income (GIFI 9999):{" "}
													<span className="font-medium tabular-nums text-foreground">
														{money(bookNI)}
													</span>
												</p>
											) : active === "cca" ? (
												<p className="text-sm text-muted-foreground">
													Total CCA (Schedule 8):{" "}
													<span className="font-medium tabular-nums text-foreground">
														{money(ccaDisplay)}
													</span>
												</p>
											) : null
										}
									/>
								)}
							</div>
						),
					}}
				/>
			</div>
		</div>
	);
}

function ScheduleForm({
	schedule,
	value,
	saving,
	onSave,
	footer,
	computed,
	stale,
	engagement,
	client,
	onNavigate,
	highlightLine,
}: {
	schedule: ScheduleKey;
	value: Record<string, unknown>;
	saving: boolean;
	onSave: (v: Record<string, unknown>) => void;
	footer?: React.ReactNode;
	computed: ReturnType<typeof useLatestComputedReturn>["latest"];
	stale: boolean;
	engagement?: EngagementYear;
	client?: Client;
	onNavigate?: NavigateToLine;
	highlightLine?: string;
}) {
	const meta = SCHEDULE_TREE.find((s) => s.key === schedule)!;
	const formView = formViewFor(schedule);
	const [viewMode, setViewMode] = useState<"guided" | "form">("guided");

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div>
					<div className="flex items-center gap-2">
						<Badge variant="secondary" className="font-mono">
							{meta.num}
						</Badge>
						<h2 className="text-lg font-semibold">{meta.label}</h2>
					</div>
					<p className="text-sm text-muted-foreground">{meta.hint}</p>
				</div>
				{formView && (
					<ToggleGroup
						value={[viewMode]}
						onValueChange={(v) => {
							const next = v[0];
							if (next === "guided" || next === "form") setViewMode(next);
						}}
						variant="outline"
						size="sm"
						aria-label="Schedule view"
					>
						<ToggleGroupItem value="guided">Guided</ToggleGroupItem>
						<ToggleGroupItem value="form">Form View</ToggleGroupItem>
					</ToggleGroup>
				)}
			</div>
			{/*
			 * `SchemaForm` always mounts its guided `FormGenerator` (there is no
			 * prop to suppress it — see its own source), so Form View is a CSS
			 * visibility swap rather than a conditional mount: both views read the
			 * SAME `form.control` from `SchemaForm`'s `children(form)` render-prop,
			 * so toggling never drops an in-progress edit the way remounting a
			 * second `SchemaForm` would. `[data-formkit-root]` is `FormGenerator`'s
			 * own wrapper element.
			 */}
			<div className={viewMode === "form" ? "[&_[data-formkit-root]]:hidden" : undefined}>
				<SchemaForm
					schema={schemaFor(schedule)}
					defaultValues={value}
					components={FORM_COMPONENTS}
					onSubmit={(v: Record<string, unknown>) => onSave(v)}
				>
					{(form) => (
						<>
							{formView && (
								<div className={viewMode === "guided" ? "hidden" : "mt-4"}>
									{formView({
										control: form.control,
										disabled: saving,
										computed,
										engagement,
										client,
										onNavigate,
										highlightLine,
									})}
								</div>
							)}
							<div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
								{footer ?? <span />}
								<Button type="submit" disabled={saving}>
									{saving ? "Saving…" : "Save schedule"}
								</Button>
							</div>
						</>
					)}
				</SchemaForm>
			</div>
			<ScheduleFiledValues
				computed={computed}
				stale={stale}
				scheduleNum={meta.num}
			/>
		</div>
	);
}

const SUMMARY_TITLE: Record<string, string> = {
	T2: "Tax Summary: T2 jacket page 9",
	AT1: "Tax Summary: Alberta AT1",
	CO17: "Tax Summary: Québec CO-17",
};

function TaxSummary({
	program,
	computed,
	stale,
	bookNI,
	cca,
	onCompute,
	computeLabel,
	computing,
}: {
	program: string;
	computed: ReturnType<typeof useLatestComputedReturn>["latest"];
	stale: boolean;
	bookNI: number;
	cca: number;
	onCompute: () => void;
	computeLabel: string;
	computing: boolean;
}) {
	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<FileText className="size-5 text-primary" />
				<h2 className="text-lg font-semibold">
					{SUMMARY_TITLE[program] ?? "Tax Summary"}
				</h2>
			</div>
			<div className="flex gap-6 text-sm text-muted-foreground">
				<span>
					Book net income:{" "}
					<span className="font-medium tabular-nums text-foreground">
						{money(bookNI)}
					</span>
				</span>
				<span>
					CCA:{" "}
					<span className="font-medium tabular-nums text-foreground">
						{money(cca)}
					</span>
				</span>
			</div>

			{stale && (
				<div className="flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/5 px-3 py-2 text-sm">
					<AlertTriangle className="size-4 shrink-0 text-amber-600" />
					<span>
						Inputs changed since the last compute. Recompute to refresh these
						numbers.
					</span>
				</div>
			)}

			{computed ? (
				<div className="divide-y rounded-lg border">
					{(computed.fields ?? [])
						.filter((f) => !HIDDEN_LINES.has(f.line))
						.map((f) => {
							const n = Number(f.value);
							const isTotal = f.line === "totalOwing";
							const isFactor = FACTOR_LINES.has(f.line);
							const display = isFactor
								? `${(n * 100).toFixed(2)}%`
								: money(f.line === "totalOwing" ? n / 100 : n);
							return (
								<div
									key={f.line}
									className={cn(
										"flex items-center justify-between px-4 py-2.5",
										isTotal && "bg-primary/5",
									)}
								>
									<span className={cn("text-sm", isTotal && "font-semibold")}>
										{labelForLine(f.line)}
									</span>
									<span
										className={cn(
											"tabular-nums",
											isTotal ? "text-lg font-semibold" : "font-medium",
										)}
									>
										{display}
										<Badge variant="outline" className="ml-2 align-middle">
											{f.provenance}
										</Badge>
									</span>
								</div>
							);
						})}
				</div>
			) : (
				<div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
					Not computed yet. Fill the schedules, then compute.
				</div>
			)}

			<Button onClick={onCompute} disabled={computing}>
				<Calculator className="size-4" />
				{computeLabel}
			</Button>
		</div>
	);
}
