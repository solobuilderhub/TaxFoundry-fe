"use client";

import { useDebounce } from "@classytic/fluid/client/hooks";
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
import { useEffect, useRef, useState } from "react";
import {
	type Control,
	type UseFormReturn,
	useForm,
	useWatch,
} from "react-hook-form";
import { toast } from "sonner";
import type { Client } from "@/api/clients";
import type { ReturnPreview } from "@/api/computed-returns";
import { type EngagementYear, engagementsApi } from "@/api/engagements";
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
import { FORM_ID_TO_SCHEDULE_KEY } from "../_config/form-nav";
import {
	FACTOR_LINES,
	HIDDEN_LINES,
	labelForLine,
} from "../_config/line-labels";
import {
	formViewFor,
	initialValuesFor,
	isFormOnly,
	isProgramSpecific,
	SCHEDULE_TREE,
	type ScheduleKey,
	scheduleTreeFor,
	schemaFor,
} from "../_config/registry";
import { Schedule2View } from "../_config/schedules/at1/paper/schedule2-view";
import { Schedule10View } from "../_config/schedules/at1/paper/schedule10-view";
import type { NavigateToLine } from "../_config/schedules/shared/define";
import { bookNetIncomeOf } from "../_lib/calc";
import type { CcaClass, ReturnInput } from "../_lib/return-input";
import {
	normalizeSchedule2,
	normalizeSchedule10,
	withoutNulls,
} from "../_lib/save-normalize";
import { useCcaPreviewTotal } from "../_lib/use-cca-preview";
import { AutoFillDialog } from "./auto-fill-dialog";
import { GifiImportDialog } from "./gifi-import-dialog";
import { GoToLine } from "./go-to-line";
import { ScheduleFiledValues } from "./schedule-filed-values";

const money = (n: number) =>
	new Intl.NumberFormat("en-CA", {
		style: "currency",
		currency: "CAD",
		maximumFractionDigits: 0,
	}).format(n);

/**
 * AT1 forms with no `ReturnInput` slice of their own (Schedules 2 and 10).
 * Each edits a slice another form owns — Schedule 2's Area A lives on the
 * jacket's `alberta` slice, Schedule 10's requests on Schedule 21's
 * `albertaContinuity` — so they sit outside the registry, which pins one nav
 * entry per slice, and are bound to that slice here.
 */
const SLICE_SCHEDULES = [
	{
		key: "schedule2" as const,
		num: "002",
		label: "Alberta Income Allocation Factor (S2)",
		hint: "Area A or your industry's Area B formula",
		slice: "alberta" as const,
	},
	{
		key: "schedule10" as const,
		num: "010",
		label: "Alberta Loss Carry-Back Application (S10)",
		hint: "Carry a loss back to the three preceding years",
		slice: "albertaContinuity" as const,
	},
];

/** One schedule in the sidebar: its form-number chip, name, hint and "has data" dot. */
function NavItem({
	num,
	label,
	hint,
	active,
	hasData,
	onClick,
}: {
	num: string;
	label: string;
	hint: string;
	active: boolean;
	hasData: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent",
				active && "bg-accent",
			)}
		>
			<span className="mt-0.5 inline-flex w-9 shrink-0 justify-center rounded bg-muted px-1 py-0.5 font-mono text-[11px] text-muted-foreground">
				{num}
			</span>
			<span className="min-w-0 flex-1">
				<span className="flex items-center gap-1.5">
					<span className="truncate font-medium">{label}</span>
					{hasData && (
						<span
							className="size-1.5 shrink-0 rounded-full bg-primary"
							title="Has entered data"
						/>
					)}
				</span>
				<span className="block truncate text-xs text-muted-foreground">
					{hint}
				</span>
			</span>
		</button>
	);
}

/** True if a schedule slice carries any entered value (drives the nav "has data" dot). */
const hasData = (v: unknown): boolean =>
	!!v &&
	typeof v === "object" &&
	Object.values(v as Record<string, unknown>).some(
		(x) => x != null && x !== "" && !(Array.isArray(x) && x.length === 0),
	);

/**
 * The working return with ONE value replaced at a dotted path, every object on
 * the way copied rather than mutated — `undefined` removes the key, so a
 * cleared box goes back to "not entered" rather than storing an explicit
 * nothing the contract would have to interpret.
 */
function withValueAt(
	ri: ReturnInput,
	path: string,
	value: unknown,
): ReturnInput {
	const [head, ...rest] = path.split(".");
	const root: Record<string, unknown> = { ...(ri as Record<string, unknown>) };
	let parent = root;
	let key = head as string;
	for (const next of rest) {
		const child = {
			...((parent[key] as Record<string, unknown> | undefined) ?? {}),
		};
		parent[key] = child;
		parent = child;
		key = next;
	}
	if (value === undefined) delete parent[key];
	else parent[key] = value;
	return root as ReturnInput;
}

export function ReturnEditor({ id }: { id: string }) {
	const { data: engagement, isLoading } = useEngagement(id);
	const { saveInput, compute } = useEngagementActions();
	const { latest: computed } = useLatestComputedReturn(id);
	const { data: client } = useClient(engagement?.clientId);

	// `null` until the preparer picks one — the landing schedule depends on the
	// program, which is not known until the engagement loads (see `active`).
	const [chosen, setActive] = useState<
		ScheduleKey | "summary" | "schedule2" | "schedule10" | null
	>(null);
	// The line to scroll to and briefly highlight after a paper Form View's
	// cross-reference badge switches `active` to another schedule — cleared on
	// a timer so clicking the same badge again re-triggers the highlight (a
	// second `setHighlightLine` to the same value wouldn't otherwise change
	// state and re-fire the effect).
	const [highlightLine, setHighlightLine] = useState<string | undefined>(
		undefined,
	);
	const onNavigate: NavigateToLine = (form, line) => {
		const key = FORM_ID_TO_SCHEDULE_KEY[form];
		if (!key) return;
		setActive(key);
		setHighlightLine(line);
		setTimeout(() => setHighlightLine(undefined), 2500);
	};
	// The collapsed "Federal figures" group: `null` = follow the active schedule.
	const [federalOpenChoice, setFederalOpen] = useState<boolean | null>(null);
	const [ri, setRi] = useState<ReturnInput | null>(null);
	// Inputs edited since the last compute → the summary is stale until recomputed.
	const [dirty, setDirty] = useState(false);
	const [gifiOpen, setGifiOpen] = useState(false);
	const [afrOpen, setAfrOpen] = useState(false);
	// Bumped when values change outside the form (GIFI import) to force a remount
	// so SchemaForm's mount-only defaultValues pick up the new numbers.
	const [formVersion, setFormVersion] = useState(0);
	// The newest working return, for `writeInput` — see its doc comment.
	const latestRi = useRef<ReturnInput>({});
	/*
	 * Live recalculation. Every save returns the engine's figures for the
	 * return as saved (`save-input`), and opening the return asks for them once
	 * (`preview`) — so the forms fill in as the preparer types, like every tax
	 * package, instead of staying blank until Compute. Nothing is recorded:
	 * Compute is still what records the return and runs review.
	 */
	const [preview, setPreview] = useState<ReturnPreview | null>(null);
	const [saveState, setSaveState] = useState<
		"idle" | "saving" | "saved" | "error"
	>("idle");
	const saveSeq = useRef(0);
	const inflight = useRef(0);
	const [previewError, setPreviewError] = useState<string | null>(null);
	const takePreview = (res: unknown) => {
		const r = res as
			| { preview?: ReturnPreview; previewError?: string }
			| undefined;
		if (r?.preview) {
			setPreview(r.preview);
			setPreviewError(null);
		} else if (r?.previewError) {
			setPreviewError(r.previewError);
		}
	};
	const refreshPreview = () =>
		engagementsApi
			.dispatchAction({ id, action: "preview", data: {} })
			.then(takePreview)
			.catch(() => undefined);
	const previewedFor = useRef<string | null>(null);
	// biome-ignore lint/correctness/useExhaustiveDependencies: once per engagement, not per render
	useEffect(() => {
		if (!engagement || previewedFor.current === id) return;
		previewedFor.current = id;
		void refreshPreview();
	}, [engagement, id]);

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

	// An AT1 opens on its jacket, like every other tax package; T2 and CO-17 on
	// the income statement.
	const active =
		chosen ?? (engagement.program === "AT1" ? "alberta" : "incomeStatement");

	// Only the schedules that apply to this engagement's program (CO17 shows the
	// Québec block; T2/AT1 hide it).
	const tree = scheduleTreeFor(engagement.program);
	/*
	 * The return's OWN forms vs the federal schedules a provincial return reads
	 * figures from. A T2 is all its own. A provincial return lists its own
	 * forms — including the read-only AT1 schedules — in form-number order
	 * (000 first, the EDI transmitter record last), and the federal inputs in a
	 * collapsed group of their own.
	 */
	const isProvincial = engagement.program !== "T2";
	const formOrder = (num: string) =>
		/^\d+$/.test(num) ? Number(num) : Number.POSITIVE_INFINITY;
	const ownForms = [
		...tree
			.filter((s) => !isProvincial || isProgramSpecific(s, engagement.program))
			.map((s) => ({ ...s, editable: true })),
		...(engagement.program === "AT1"
			? SLICE_SCHEDULES.map((s) => ({
					key: s.key,
					num: s.num,
					label: s.label,
					hint: s.hint,
					editable: false,
				}))
			: []),
	].sort((a, b) => (isProvincial ? formOrder(a.num) - formOrder(b.num) : 0));
	const federalForms = isProvincial
		? tree.filter((s) => !isProgramSpecific(s, engagement.program))
		: [];
	const federalOpen =
		federalOpenChoice ?? federalForms.some((s) => s.key === active);

	/*
	 * Built on `latestRi.current`, not the render's `seeded` — matching
	 * `writeInput` below, and for the same reason: `seeded` is a closure
	 * variable captured at render time, so two saves fired in quick
	 * succession (a schedule save racing a paper-view `writeInput`, or two
	 * schedule saves before the first's response re-renders this component)
	 * can each build their `next` from the SAME stale snapshot. Whichever
	 * request's response lands second then persists a `returnInput` that is
	 * missing whatever the other one wrote — reported as a successful save
	 * whose values are gone on reopen (TF_DEV_BUG_LIST_2026-09-18.md,
	 * BUG-107). `latestRi.current` is a ref, updated synchronously the
	 * instant either function runs, so the second save in a race always
	 * builds on the first's result rather than overwriting it.
	 */
	/*
	 * Every save goes through here — the forms save themselves as the preparer
	 * types, like every tax package, so there is no Save button and no pop-up
	 * per save; the header shows one quiet status instead.
	 *
	 * Saves can overlap, so each is numbered and only the NEWEST response's
	 * live figures are shown: an older response landing late must not replace
	 * figures computed from a later return.
	 */
	const persist = async (next: ReturnInput) => {
		const seq = ++saveSeq.current;
		inflight.current += 1;
		setSaveState("saving");
		let failed = false;
		try {
			const res = await saveInput.mutateAsync({ id, returnInput: next });
			if (seq === saveSeq.current) takePreview(res);
			setDirty(true);
		} catch (err) {
			failed = true;
			setSaveState("error");
			toast.error(
				"Could not save your last change — check your connection and try again.",
			);
			throw err;
		} finally {
			inflight.current -= 1;
			if (!failed && inflight.current === 0) setSaveState("saved");
		}
	};

	const saveSlice = async (
		key: ScheduleKey,
		values: Record<string, unknown>,
	) => {
		const next: ReturnInput = {
			...latestRi.current,
			[key]: withoutNulls(values) as Record<string, unknown>,
		};
		latestRi.current = next;
		setRi(next);
		await persist(next).catch(() => undefined);
	};

	/**
	 * Write ONE value into the working return, wherever it lives — the path a
	 * paper Form View's linked T2 box names ("albertaSchedule12.prospectorsShares").
	 *
	 * Distinct from `saveSlice`, which replaces a whole slice with a form's
	 * values: a Schedule 21 box that edits a figure Schedule 12's slice owns must
	 * change exactly that field and nothing else in either slice. The schedule
	 * being edited is not remounted (its key does not change), so an unsaved
	 * edit elsewhere on it survives; and its own later save spreads over the
	 * return this wrote, so it cannot undo this.
	 *
	 * Based on `latestRi`, not the render's `seeded`, so two edits made in quick
	 * succession each build on the other rather than the second silently
	 * dropping the first.
	 */
	latestRi.current = seeded;
	const writeInput = async (path: string, value: unknown) => {
		const next = withValueAt(latestRi.current, path, value);
		latestRi.current = next;
		setRi(next);
		await persist(next); // rethrows, so a box can keep the typed figure
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
			await persist(next);
			setFormVersion((v) => v + 1); // remount the form to show imported values
			setActive("incomeStatement");
		} catch {
			// `persist` already reported it.
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
	/*
	 * What the forms show: the live preview when there is one, else the last
	 * recorded compute. `stale` is now only true when neither is current — a
	 * save whose preview failed — because a live preview IS the current figures.
	 * `unrecorded` is the different, honest statement: figures are current but
	 * Compute has not recorded them for review yet.
	 */
	const live: typeof computed = preview
		? ({
				...(computed ?? {
					_id: "preview",
					engagementYearId: id,
					program: engagement.program,
					engineVersion: "preview",
				}),
				fields: preview.fields,
				schedulePayloads: preview.schedulePayloads ?? null,
				issues: preview.issues ?? null,
			} as NonNullable<typeof computed>)
		: computed;
	const stale = !!computed && dirty && !preview;
	const unrecorded = !!preview && (dirty || !computed);
	// `cca` (from `useCcaPreviewTotal`) is a pre-compute LIVE PREVIEW that only
	// covers the ordinary declining-balance "CCA classes" array — it deliberately
	// does not model a new class 13 leasehold layer or class 14 property (see
	// `cca-preview.service.ts`'s own doc comment), so it under-reports whenever
	// one of those is entered. Once a fresh (non-stale) compute exists, its own
	// `ccaClaimed` field is the real combined total (ordinary + class 13/14 +
	// the class 14.1 transitional allowance) — prefer that instead.
	const computedCcaField = live?.fields?.find(
		(f) => f.line === "ccaClaimed",
	)?.value;
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
					<span
						className={cn(
							"text-xs",
							saveState === "error"
								? "font-medium text-destructive"
								: "text-muted-foreground",
						)}
						aria-live="polite"
					>
						{saveState === "saving"
							? "Saving…"
							: saveState === "saved"
								? "All changes saved"
								: saveState === "error"
									? "Not saved"
									: ""}
					</span>
					{previewError ? (
						<Badge
							variant="secondary"
							className="max-w-80 gap-1 truncate"
							title={previewError}
						>
							<AlertTriangle className="size-3.5 shrink-0" /> Can't calculate
							yet: {previewError}
						</Badge>
					) : (
						unrecorded && (
							<Badge
								variant="outline"
								className="gap-1"
								title="Figures on every form are live. Compute records this version of the return and runs review."
							>
								Live figures — not yet recorded
							</Badge>
						)
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
				clientBusinessNumber={client?.businessNumber}
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
					void refreshPreview();
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
								{/*
								 * One return, one list. A provincial return shows ITS OWN forms
								 * first, in form-number order, like the printed return — the
								 * federal schedules it reads figures from are a separate,
								 * collapsed group below, because they are inputs to this return
								 * and not forms of it. The old "All / AT1 only" toggle mixed the
								 * two into one long list and then hid half of it.
								 */}
								{engagement.program === "AT1" && (
									<div className="pb-2">
										<GoToLine onGo={onNavigate} />
									</div>
								)}
								{isProvincial && (
									<p className="px-2 pb-1 pt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
										{engagement.program} return
									</p>
								)}
								{ownForms.map((s) => (
									<NavItem
										key={s.key}
										num={s.num}
										label={s.label}
										hint={s.hint}
										active={active === s.key}
										hasData={
											s.editable && hasData(seeded[s.key as ScheduleKey])
										}
										onClick={() => setActive(s.key)}
									/>
								))}
								<NavItem
									num="∑"
									label="Tax summary"
									hint={
										isProvincial
											? `${engagement.program} totals`
											: "T2 jacket page 9"
									}
									active={active === "summary"}
									hasData={false}
									onClick={() => setActive("summary")}
								/>
								{federalForms.length > 0 && (
									<details
										className="group pt-2"
										open={federalOpen}
										onToggle={(e) =>
											setFederalOpen(
												(e.currentTarget as HTMLDetailsElement).open,
											)
										}
									>
										<summary className="cursor-pointer list-none rounded-md px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:bg-accent">
											<span className="mr-1 inline-block transition-transform group-open:rotate-90">
												›
											</span>
											Federal figures ({federalForms.length})
										</summary>
										<p className="px-2 pb-2 text-[11px] leading-snug text-muted-foreground">
											Inputs this {engagement.program} reads federal amounts
											from. Not a return to file — leave them empty if the T2
											was prepared elsewhere and type the figures on the{" "}
											{engagement.program} forms above.
										</p>
										{federalForms.map((s) => (
											<NavItem
												key={s.key}
												num={s.num}
												label={s.label}
												hint={s.hint}
												active={active === s.key}
												hasData={hasData(seeded[s.key])}
												onClick={() => setActive(s.key)}
											/>
										))}
									</details>
								)}
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
										computed={live}
										stale={stale}
										bookNI={bookNI}
										cca={ccaDisplay}
										onCompute={runCompute}
										computeLabel={computeLabel}
										computing={compute.isPending}
									/>
								) : SLICE_SCHEDULES.some((s) => s.key === active) ? (
									(() => {
										const meta = SLICE_SCHEDULES.find((s) => s.key === active)!;
										return (
											<div className="space-y-4">
												<div>
													<div className="flex items-center gap-2">
														<Badge variant="secondary" className="font-mono">
															{meta.num}
														</Badge>
														<h2 className="text-lg font-semibold">
															{meta.label}
														</h2>
													</div>
													<p className="text-sm text-muted-foreground">
														{meta.hint}
													</p>
												</div>
												<SliceForm
													key={`${meta.key}-${formVersion}`}
													value={
														(seeded[meta.slice] as Record<string, unknown>) ??
														{}
													}
													onSave={(v) =>
														saveSlice(
															meta.slice,
															meta.key === "schedule10"
																? normalizeSchedule10(v)
																: normalizeSchedule2(v),
														)
													}
												>
													{(form) =>
														meta.key === "schedule10" ? (
															<Schedule10View
																control={form.control}
																setValue={(name, value, options) =>
																	form.setValue(name, value, options)
																}
																computed={live}
																engagement={engagement}
															/>
														) : (
															<Schedule2View
																control={form.control}
																computed={live}
																stale={stale}
																onNavigate={onNavigate}
																highlightLine={highlightLine}
															/>
														)
													}
												</SliceForm>
											</div>
										);
									})()
								) : (
									<ScheduleForm
										key={`${active}-${formVersion}`}
										schedule={active as ScheduleKey}
										value={
											(seeded[active as ScheduleKey] as Record<
												string,
												unknown
											>) ?? {}
										}
										onSave={(v) => saveSlice(active as ScheduleKey, v)}
										computed={live}
										stale={stale}
										engagement={engagement}
										client={client}
										onNavigate={onNavigate}
										highlightLine={highlightLine}
										returnInput={seeded}
										writeInput={writeInput}
										footer={
											active === "incomeStatement"
												? /*
													 * A render-prop, so this reads the LIVE form rather than
													 * the saved return. It was `money(bookNI)`, computed from
													 * `seeded` — what was last persisted — so typing a revenue
													 * figure left this line reporting the PREVIOUS one until
													 * "Save schedule" was pressed: two totals on one screen
													 * disagreeing, with nothing to say which the return would
													 * use.
													 */
													(form) => (
														<LiveNetIncomeFooter control={form.control} />
													)
												: active === "cca"
													? (form) => (
															<LiveCcaFooter
																engagementId={id}
																control={form.control}
															/>
														)
													: null
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

/**
 * GIFI 9999 beside the save button, from the boxes as they are being typed.
 *
 * Same arithmetic as `bookNetIncomeOf` — revenue less the four expense lines —
 * but over the LIVE form instead of the persisted return, which is the whole
 * point: the saved figure and the figures on screen are different things until
 * a save lands, and showing the saved one under boxes holding the other is how
 * a preparer ends up trusting a number the return will not use.
 *
 * It stays a separate component because `useWatch` is a hook and the footer is
 * built inside a render-prop.
 */
function LiveNetIncomeFooter({ control }: { control: Control<never> }) {
	const v = useWatch({ control }) as Record<string, unknown> | undefined;
	const n = (x: unknown) =>
		typeof x === "number" && Number.isFinite(x) ? x : 0;
	const total =
		n(v?.revenue) -
		n(v?.costOfSales) -
		n(v?.salariesAndWages) -
		n(v?.amortization) -
		n(v?.otherExpenses);
	return (
		<p className="text-sm text-muted-foreground">
			Net income (GIFI 9999):{" "}
			<span className="font-medium tabular-nums text-foreground">
				{money(total)}
			</span>
		</p>
	);
}

/**
 * Total CCA beside the save button, previewed from the rows as they are typed.
 *
 * Same staleness the net income footer had: this read `seeded.cca?.classes`,
 * so adding a class or changing a claim left the total reporting the LAST
 * SAVED set of rows. `useCcaPreviewTotal` was already debounced and already
 * re-queried whenever its argument changed — it was simply being handed the
 * saved slice instead of the live one.
 *
 * Unlike net income this is not local arithmetic: the hook asks the server to
 * run the real `computeCcaClass`, because a second implementation of the
 * declining-balance, half-year, AIIP and immediate-expensing rules is exactly
 * what this app removed once already.
 *
 * It is a PREVIEW and deliberately narrower than the filed figure — it covers
 * the ordinary declining-balance classes only, not a new class 13 leasehold
 * layer or class 14 property (`cca-preview.service.ts` says so itself), so it
 * under-reports when one of those is entered. The Tax Summary still prefers a
 * fresh compute's own `ccaClaimed` for that reason; here, where the preparer is
 * editing the rows, the number that matches the rows is the useful one.
 */
function LiveCcaFooter({
	engagementId,
	control,
}: {
	engagementId: string;
	control: Control<never>;
}) {
	const v = useWatch({ control }) as { classes?: CcaClass[] } | undefined;
	const { total, loading } = useCcaPreviewTotal(engagementId, v?.classes);
	return (
		<p className="text-sm text-muted-foreground">
			Total CCA (Schedule 8):{" "}
			<span className="font-medium tabular-nums text-foreground">
				{money(total)}
			</span>
			{loading && <span className="ml-2 text-xs">updating…</span>}
		</p>
	);
}

function ScheduleForm({
	schedule,
	value,
	onSave,
	footer,
	computed,
	stale,
	engagement,
	client,
	onNavigate,
	highlightLine,
	returnInput,
	writeInput,
}: {
	schedule: ScheduleKey;
	value: Record<string, unknown>;
	onSave: (v: Record<string, unknown>) => void;
	/**
	 * A summary line beside the save button. Pass a FUNCTION to read the live
	 * form (a running total that must track what is being typed); pass a node
	 * for anything whose source is outside the form, like the server-computed
	 * CCA preview.
	 */
	footer?:
		| React.ReactNode
		| ((form: { control: Control<never> }) => React.ReactNode);
	computed: ReturnType<typeof useLatestComputedReturn>["latest"];
	stale: boolean;
	engagement?: EngagementYear;
	client?: Client;
	onNavigate?: NavigateToLine;
	highlightLine?: string;
	returnInput?: ReturnInput;
	writeInput?: (path: string, value: unknown) => Promise<void>;
}) {
	const meta = SCHEDULE_TREE.find((s) => s.key === schedule)!;
	const formView = formViewFor(schedule);
	/*
	 * Land on the printed form where a schedule has one.
	 *
	 * A preparer reconciling against the paper return should not have to find
	 * the view that looks like it. Guided stays one click away and is NOT
	 * redundant: several schedules collect fields the paper grid has no column
	 * for — Schedule 12's reconciliation, Schedule 21's loss carry-backs,
	 * Schedule 29's project detail, and the straight-line classes 13 and 14 on
	 * Schedule 13 — so this changes the default, never the availability.
	 */
	const [viewMode, setViewMode] = useState<"guided" | "form">(
		formView ? "form" : "guided",
	);
	/*
	 * Only schedules that HAVE a paper view can be in it. The state above is
	 * seeded once, so a preparer who leaves Form View open and moves to a
	 * schedule without one would otherwise keep a mode that hides the guided
	 * form and renders nothing in its place — a blank editor.
	 */
	const formOnly = isFormOnly(schedule);
	const activeView = formOnly ? "form" : formView ? viewMode : "guided";

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
				{formView && !formOnly && (
					<ToggleGroup
						value={[activeView]}
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
			<div
				className={
					activeView === "form" ? "[&_[data-formkit-root]]:hidden" : undefined
				}
			>
				<FormHost
					formOnly={formOnly}
					schedule={schedule}
					value={value}
					onSave={onSave}
				>
					{(form) => (
						<>
							{formView && (
								<div className={activeView === "guided" ? "hidden" : "mt-4"}>
									{formView({
										control: form.control,
										// Never locked while saving: the form saves as the
										// preparer types, so a lock would freeze typing mid-save.
										disabled: false,
										computed,
										engagement,
										client,
										onNavigate,
										highlightLine,
										returnInput,
										writeInput,
									})}
								</div>
							)}
							<AutoSave
								control={
									form.control as unknown as Control<Record<string, unknown>>
								}
								getValues={() =>
									(
										form as unknown as {
											getValues: () => Record<string, unknown>;
										}
									).getValues()
								}
								onSave={onSave}
							/>
							{(() => {
								const f =
									typeof footer === "function"
										? footer(form as unknown as { control: Control<never> })
										: footer;
								return f ? (
									<div className="mt-8 flex flex-wrap items-center gap-3 border-t pt-4">
										{f}
									</div>
								) : null;
							})()}
						</>
					)}
				</FormHost>
			</div>
			<ScheduleFiledValues
				computed={computed}
				stale={stale}
				scheduleNum={meta.num}
			/>
		</div>
	);
}

/**
 * The form behind a schedule.
 *
 * A form-only schedule gets a plain react-hook-form instance. The guided
 * SchemaForm always mounts its own field set, so rendering it hidden behind
 * the printed form put every box on the page twice — two elements per field
 * with the same id, the hidden one first, so a label click could focus the
 * box nobody can see.
 */
function FormHost({
	formOnly,
	schedule,
	value,
	onSave,
	children,
}: {
	formOnly: boolean;
	schedule: ScheduleKey;
	value: Record<string, unknown>;
	onSave: (v: Record<string, unknown>) => void;
	children: (form: {
		control: Control<Record<string, unknown>>;
	}) => React.ReactNode;
}) {
	const plain = useForm<Record<string, unknown>>({
		defaultValues: { ...initialValuesFor(schedule), ...value },
	});
	if (formOnly) {
		return (
			<form onSubmit={plain.handleSubmit((v) => onSave(v))}>
				{children(plain)}
			</form>
		);
	}
	return (
		<SchemaForm
			schema={schemaFor(schedule)}
			defaultValues={value}
			components={FORM_COMPONENTS}
			onSubmit={(v: Record<string, unknown>) => onSave(v)}
		>
			{(form) =>
				children(
					form as unknown as { control: Control<Record<string, unknown>> },
				)
			}
		</SchemaForm>
	);
}

/**
 * A form over one working-return slice, for the AT1 forms that edit a slice
 * another form owns (see `SLICE_SCHEDULES`). Same plain form and the same
 * automatic save as every form-only schedule.
 */
function SliceForm({
	value,
	onSave,
	children,
}: {
	value: Record<string, unknown>;
	onSave: (v: Record<string, unknown>) => void;
	children: (form: UseFormReturn<Record<string, unknown>>) => React.ReactNode;
}) {
	const form = useForm<Record<string, unknown>>({ defaultValues: value });
	return (
		<form onSubmit={(e) => e.preventDefault()}>
			{children(form)}
			<AutoSave
				control={form.control}
				getValues={form.getValues}
				onSave={onSave}
			/>
		</form>
	);
}

/**
 * Saves the schedule as the preparer types — about 0.8 s after the last
 * change — and once more on the way out if a change is still pending, so
 * switching schedules mid-sentence never loses it.
 *
 * Compares serialized values, so re-renders that change nothing do not save,
 * and the values the form opened with are never re-saved.
 */
function AutoSave({
	control,
	getValues,
	onSave,
}: {
	control: Control<Record<string, unknown>>;
	getValues: () => Record<string, unknown>;
	onSave: (v: Record<string, unknown>) => void;
}) {
	const values = useWatch({ control });
	const serialized = JSON.stringify(values ?? {});
	const debounced = useDebounce(serialized, 800);
	const saved = useRef<string | null>(null);
	const latest = useRef({ getValues, onSave });
	latest.current = { getValues, onSave };

	useEffect(() => {
		// The first value seen is what the form opened with — nothing to save.
		if (saved.current === null) {
			saved.current = debounced;
			return;
		}
		if (debounced === saved.current) return;
		saved.current = debounced;
		latest.current.onSave(JSON.parse(debounced) as Record<string, unknown>);
	}, [debounced]);

	useEffect(
		() => () => {
			const now = JSON.stringify(latest.current.getValues() ?? {});
			if (saved.current !== null && now !== saved.current) {
				latest.current.onSave(JSON.parse(now) as Record<string, unknown>);
			}
		},
		[],
	);
	return null;
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
