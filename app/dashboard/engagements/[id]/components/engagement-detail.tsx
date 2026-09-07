"use client";

import { DetailView } from "@classytic/fluid/client/detail-view";
import { HeaderSection } from "@classytic/fluid/dashboard";
import { SchemaFormDialog } from "@classytic/fluid/formkit";
import {
	Calculator,
	Check,
	ClipboardCheck,
	Download,
	FileCheck2,
	FileText,
	Printer,
	ScrollText,
	Send,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { FieldProvenance } from "@/api/computed-returns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useClient } from "@/hooks/query/use-clients";
import { useLatestComputedReturn } from "@/hooks/query/use-computed-returns";
import {
	useEngagement,
	useEngagementActions,
} from "@/hooks/query/use-engagements";
import { useReviewMemos } from "@/hooks/query/use-review-memos";
import { getCertificationSchema } from "../../_config/certification-config";
import { HIDDEN_LINES, labelForLine } from "../return/_config/line-labels";

const fmtDate = (iso?: string) =>
	iso ? new Date(iso).toLocaleDateString("en-CA") : "—";

const PROV_VARIANT: Record<
	FieldProvenance,
	"default" | "secondary" | "outline"
> = {
	engine: "default",
	imported: "secondary",
	human: "outline",
};

// Friendly labels for the engine's summary lines (the T2 jacket).
const money = (n: number) =>
	new Intl.NumberFormat("en-CA", {
		style: "currency",
		currency: "CAD",
		maximumFractionDigits: 0,
	}).format(n);

// `totalOwing` is in cents (integer minor units); every other line is whole dollars.
const fmtLine = (line: string, v: unknown) => {
	const n = Number(v);
	if (!Number.isFinite(n)) return String(v);
	return money(line === "totalOwing" ? n / 100 : n);
};

type StageState = "done" | "current" | "todo";

const STAGE_META = [
	{ key: "compute", label: "Compute", icon: Calculator },
	{ key: "review", label: "Review", icon: ClipboardCheck },
	{ key: "signoff", label: "Sign-off", icon: FileCheck2 },
	{ key: "file", label: "File", icon: Send },
] as const;

/** Horizontal progress stepper — shows where the engagement is in its lifecycle. */
function WorkflowStepper({ states }: { states: StageState[] }) {
	return (
		<ol className="flex items-center">
			{STAGE_META.map((stage, i) => {
				const state = states[i];
				const Icon = stage.icon;
				return (
					<li
						key={stage.key}
						className="flex flex-1 items-center last:flex-none"
					>
						<div className="flex items-center gap-2">
							<span
								className={[
									"flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium transition-colors",
									state === "done"
										? "border-primary bg-primary text-primary-foreground"
										: state === "current"
											? "border-primary text-primary ring-2 ring-primary/25"
											: "border-border text-muted-foreground",
								].join(" ")}
							>
								{state === "done" ? (
									<Check className="size-4" />
								) : (
									<Icon className="size-4" />
								)}
							</span>
							<span
								className={
									state === "todo"
										? "text-sm text-muted-foreground"
										: "text-sm font-medium"
								}
							>
								{stage.label}
							</span>
						</div>
						{i < STAGE_META.length - 1 && (
							<span
								className={[
									"mx-3 h-px flex-1",
									state === "done" ? "bg-primary" : "bg-border",
								].join(" ")}
							/>
						)}
					</li>
				);
			})}
		</ol>
	);
}

export function EngagementDetail({ id }: { id: string }) {
	const router = useRouter();
	const { data: engagement, isLoading } = useEngagement(id);
	const { transmit } = useEngagementActions();
	const { latest: computed, isLoading: computedLoading } =
		useLatestComputedReturn(id);
	const { items: memos, isLoading: memosLoading } = useReviewMemos({
		engagementYearId: id,
		limit: 1,
		sort: "-createdAt",
	});
	const { data: client } = useClient(engagement?.clientId);

	const clientName = client?.name ?? engagement?.clientId ?? "";

	const [transmitOpen, setTransmitOpen] = useState(false);

	if (isLoading || !engagement) {
		return <div className="text-muted-foreground">Loading engagement…</div>;
	}

	const memo = memos?.[0];
	const period = `${fmtDate(engagement.taxYearStart)} → ${fmtDate(engagement.taxYearEnd)}`;
	const isT2 = engagement.program === "T2";

	// ── Workflow state (derived from the return + review + status) ──────────────
	const hasComputed = !!computed;
	const flags = memo?.flags ?? [];
	const unresolvedReds = flags.filter(
		(f) => f.severity === "red" && !f.resolved,
	).length;
	const reviewClear = !!memo && unresolvedReds === 0;
	const memoSignedOff = memo?.status === "signed_off";
	const isFiled = engagement.status === "filed";

	const stageDone = [
		hasComputed,
		hasComputed && reviewClear,
		memoSignedOff,
		isFiled,
	];
	const currentStage = stageDone.findIndex((d) => !d); // -1 when everything is done
	const stageStates: StageState[] = stageDone.map((done, i) =>
		done ? "done" : i === currentStage ? "current" : "todo",
	);

	const goExport = () => router.push(`/dashboard/engagements/${id}/export`);
	const goReview = () => router.push(`/dashboard/engagements/${id}/review`);

	// The single contextual next step. Never surfaces an action that would 409.
	const nextStep = (() => {
		if (isFiled) {
			return {
				title: "Return filed",
				hint: `Transmitted to ${isT2 ? "CRA" : "Alberta TRA"}.`,
				cta: null as string | null,
				onClick: () => {},
				loading: false,
			};
		}
		switch (currentStage) {
			case 0:
				return {
					title: "Compute the return",
					hint: "Open the return, fill the schedules, and run the engine.",
					cta: "Open return",
					onClick: () => router.push(`/dashboard/engagements/${id}/return`),
					loading: false,
				};
			case 1:
				return {
					title:
						unresolvedReds > 0
							? `Resolve ${unresolvedReds} red flag${unresolvedReds > 1 ? "s" : ""}`
							: "Review the return",
					hint:
						unresolvedReds > 0
							? "Cited red diagnostics block filing until they're resolved."
							: "Work the cited diagnostics, then sign off.",
					cta: "Open review",
					onClick: goReview,
					loading: false,
				};
			case 2:
				return {
					title: "Sign off the review",
					hint: "A signed-off review memo is required before filing.",
					cta: "Open review",
					onClick: goReview,
					loading: false,
				};
			default:
				return {
					title: `Prepare & export the ${isT2 ? "CIF" : "Net File"}`,
					hint: "Generate and download the filing payload for records or manual submission.",
					cta: "Open export",
					onClick: goExport,
					loading: false,
				};
		}
	})();

	const onTransmit = async (values: Record<string, unknown>) => {
		const certification = {
			firstName: String(values.firstName ?? ""),
			lastName: String(values.lastName ?? ""),
			position: String(values.position ?? ""),
		};
		try {
			const result = (await transmit.mutateAsync({ id, certification })) as {
				status?: string;
				confirmationNumber?: string | null;
				errorCodes?: string[];
				errorMessages?: string[];
			};
			setTransmitOpen(false);

			// A REJECTION ARRIVES ON A 200. The request succeeded; the filing did
			// not. Reporting "Return filed" off the HTTP status alone told a preparer
			// the opposite of what happened — and left them able to re-transmit a
			// return the authority had already refused, for a reason nothing showed.
			if (result?.status === "accepted") {
				toast.success(
					result.confirmationNumber
						? `Return filed — confirmation ${result.confirmationNumber}`
						: "Return filed",
				);
				return;
			}

			const reason = result?.errorMessages?.length
				? result.errorMessages.join("; ")
				: result?.errorCodes?.length
					? `Error code ${result.errorCodes.join(", ")}`
					: "no reason given";
			toast.error(
				`${isT2 ? "CRA" : "Alberta TRA"} rejected the filing — ${reason}. The return was NOT filed.`,
				{ duration: 15000 },
			);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Transmission failed");
		}
	};

	// Caption under the action row explaining the current gate (why buttons are off).
	const gateHint = !hasComputed
		? "Filing actions unlock after you compute the return."
		: !memoSignedOff
			? "Transmit unlocks once the review is signed off."
			: !isFiled
				? `Ready to transmit to ${isT2 ? "CRA." : "Alberta TRA."}`
				: null;

	return (
		<div className="space-y-6">
			<HeaderSection
				title={clientName}
				description={`${engagement.program} · ${period}`}
				badge={
					isFiled
						? { text: "Filed", variant: "default" }
						: {
								text: engagement.status.replace("_", " "),
								variant: "secondary",
							}
				}
			/>

			{/* State-aware workflow: stepper + the one next action + gated controls. */}
			<Card>
				<CardContent className="space-y-4 py-5">
					{computedLoading || memosLoading ? (
						<p className="text-sm text-muted-foreground">Loading workflow…</p>
					) : (
						<>
							<WorkflowStepper states={stageStates} />

							<div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<p className="font-medium">{nextStep.title}</p>
									<p className="text-sm text-muted-foreground">
										{nextStep.hint}
									</p>
								</div>
								{nextStep.cta && (
									<Button
										onClick={nextStep.onClick}
										disabled={nextStep.loading}
										className="shrink-0"
									>
										{nextStep.cta}
									</Button>
								)}
							</div>

							<div className="flex flex-wrap items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() =>
										router.push(`/dashboard/engagements/${id}/return`)
									}
								>
									<FileText className="size-4" /> Open return
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() =>
										router.push(`/dashboard/engagements/${id}/jacket`)
									}
								>
									<ScrollText className="size-4" /> Jacket
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() =>
										router.push(`/dashboard/engagements/${id}/print`)
									}
								>
									<Printer className="size-4" /> Print / PDF
								</Button>
								<Button
									variant="outline"
									size="sm"
									disabled={!hasComputed}
									onClick={goExport}
								>
									<Download className="size-4" /> Export
								</Button>
								<Button
									variant="outline"
									size="sm"
									disabled={!memoSignedOff || isFiled || transmit.isPending}
									onClick={() => setTransmitOpen(true)}
								>
									<Send className="size-4" /> Transmit
								</Button>
							</div>
							{gateHint && (
								<p className="text-xs text-muted-foreground">{gateHint}</p>
							)}
						</>
					)}
				</CardContent>
			</Card>

			<DetailView
				bordered
				title="Engagement"
				columns={2}
				items={[
					{ label: "Client", value: clientName },
					{
						label: "Program",
						value: <Badge variant="secondary">{engagement.program}</Badge>,
					},
					{ label: "Tax year", value: period },
					{
						label: "Status",
						value: <Badge>{engagement.status.replace("_", " ")}</Badge>,
					},
					{
						label: "First return",
						value: engagement.firstReturn ? "Yes" : "No",
					},
					// Version traceability for the audit trail, without the internal package slug.
					{
						label: "Calculation version",
						value: engagement.engineVersion
							? `TaxFoundry ${engagement.engineVersion.split("@").pop()}`
							: "—",
					},
					...(engagement.amendsEngagementYearId
						? [
								{
									label: "Amends",
									value: <Badge variant="outline">Amended return</Badge>,
								},
								{
									label: "Description of changes",
									value: engagement.amendmentDescription || "—",
								},
							]
						: []),
				]}
			/>

			{computed ? (
				<DetailView
					bordered
					title="Tax summary"
					description="How each figure was determined. Computed by the engine, imported, or entered. A filed value is never guessed."
					columns={2}
					items={(computed.fields ?? [])
						.filter((f) => !HIDDEN_LINES.has(f.line))
						.map((f) => ({
							label: labelForLine(f.line),
							fullWidth: f.line === "totalOwing",
							value: (
								<span className="inline-flex items-center gap-2 tabular-nums">
									<span
										className={
											f.line === "totalOwing"
												? "text-lg font-semibold"
												: "font-medium"
										}
									>
										{fmtLine(f.line, f.value)}
									</span>
									<Badge variant={PROV_VARIANT[f.provenance] ?? "outline"}>
										{f.provenance}
									</Badge>
								</span>
							),
						}))}
				/>
			) : (
				<DetailView
					bordered
					title="T2 return"
					items={[
						{
							label: "Not computed yet",
							value:
								"Open the return, fill the schedules (Income Statement, S1, CCA…), then compute.",
							fullWidth: true,
						},
					]}
				/>
			)}

			{memo && (
				<DetailView
					bordered
					title="Review"
					columns={2}
					items={[
						{
							label: "Status",
							value: (
								<Badge
									variant={
										memo.status === "signed_off" ? "default" : "secondary"
									}
								>
									{memo.status.replace("_", " ")}
								</Badge>
							),
						},
						{
							label: "Flags",
							value: `${flags.length} total · ${unresolvedReds} unresolved red`,
						},
					]}
				/>
			)}

			<SchemaFormDialog
				open={transmitOpen}
				onOpenChange={(open: boolean) => !open && setTransmitOpen(false)}
				title={`Certify & transmit to ${isT2 ? "CRA" : "Alberta TRA"}`}
				submitLabel="Transmit"
				submitLoading={transmit.isPending}
				schema={getCertificationSchema()}
				onSubmit={onTransmit}
			/>
		</div>
	);
}
