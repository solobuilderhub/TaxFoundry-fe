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
import type { GifiImportResult } from "@/api/gifi";
import { FORM_COMPONENTS } from "@/components/form/money-field";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
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
	isProgramSpecific,
	SCHEDULE_TREE,
	type ScheduleKey,
	scheduleTreeFor,
	schemaFor,
} from "../_config/registry";
import { bookNetIncomeOf, ccaTotalOf } from "../_lib/calc";
import type { ReturnInput } from "../_lib/return-input";
import { AutoFillDialog } from "./auto-fill-dialog";
import { GifiImportDialog } from "./gifi-import-dialog";
import { ScheduleFiledValues } from "./schedule-filed-values";

const money = (n: number) =>
	new Intl.NumberFormat("en-CA", {
		style: "currency",
		currency: "CAD",
		maximumFractionDigits: 0,
	}).format(n);

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

	const [active, setActive] = useState<ScheduleKey | "summary">(
		"incomeStatement",
	);
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
	const cca = ccaTotalOf(seeded);
	// Computed once, but inputs have changed since → the shown numbers are stale.
	const stale = !!computed && dirty;
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
										cca={cca}
										onCompute={runCompute}
										computeLabel={computeLabel}
										computing={compute.isPending}
									/>
								) : (
									<ScheduleForm
										key={`${active}-${formVersion}`}
										schedule={active}
										value={(seeded[active] as Record<string, unknown>) ?? {}}
										saving={saveInput.isPending}
										onSave={(v) => saveSlice(active, v)}
										computed={computed}
										stale={stale}
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
														{money(cca)}
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
}: {
	schedule: ScheduleKey;
	value: Record<string, unknown>;
	saving: boolean;
	onSave: (v: Record<string, unknown>) => void;
	footer?: React.ReactNode;
	computed: ReturnType<typeof useLatestComputedReturn>["latest"];
	stale: boolean;
}) {
	const meta = SCHEDULE_TREE.find((s) => s.key === schedule)!;
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
			<SchemaForm
				schema={schemaFor(schedule)}
				defaultValues={value}
				components={FORM_COMPONENTS}
				onSubmit={(v: Record<string, unknown>) => onSave(v)}
			>
				<div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
					{footer ?? <span />}
					<Button type="submit" disabled={saving}>
						{saving ? "Saving…" : "Save schedule"}
					</Button>
				</div>
			</SchemaForm>
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
