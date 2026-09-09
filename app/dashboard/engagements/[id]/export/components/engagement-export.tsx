"use client";

import { HeaderSection } from "@classytic/fluid/dashboard";
import { SchemaFormDialog } from "@classytic/fluid/formkit";
import {
	ArrowLeft,
	Braces,
	Copy,
	Download,
	FileCode2,
	FileText,
	Info,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFilingChannels } from "@/hooks/query/use-certification";
import { useClient } from "@/hooks/query/use-clients";
import { useLatestComputedReturn } from "@/hooks/query/use-computed-returns";
import {
	useEngagement,
	useEngagementActions,
} from "@/hooks/query/use-engagements";
import { useReviewMemos } from "@/hooks/query/use-review-memos";
import { getCertificationSchema } from "../../../_config/certification-config";
import { FiledLinesReview } from "./filed-lines-review";

interface Payload {
	payloadHash: string;
	xml: string;
}

/** Browser download of an in-memory string as a file. */
function downloadFile(filename: string, content: string, type: string) {
	const blob = new Blob([content], { type });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

const slug = (s: string) =>
	s
		.replace(/[^a-z0-9]+/gi, "-")
		.replace(/^-|-$/g, "")
		.toLowerCase();

/**
 * Export & filing payload. A firm can GENERATE and DOWNLOAD the exact payload
 * (the CIF XML for T2, the Net File XML for AT1) for its records or for manual
 * submission. The same renderer feeds live transmission — export is not a mock,
 * it is the real payload.
 *
 * Which channels this deployment can transmit on is ASKED of the server
 * (`useFilingChannels`), never asserted here. Availability is a property of the
 * running configuration: Alberta Net File installs its SOAP client whenever
 * `TRA_NETFILE_ENDPOINT` is set, while CRA CIF and Revenu Québec keep a 503 stub
 * until their certification programmes release the schemas. Hard-coding "e-file
 * isn't enabled yet" made this screen contradict its own working transmit
 * button on every Alberta deployment.
 *
 * ── One payload per engagement, and a link to the other return ─────────────
 *
 * This used to render a second card on an Alberta engagement offering the
 * federal CIF, on the reasoning that Alberta is computed FROM the federal
 * figures so the engagement already holds everything the federal payload
 * needs. The first half is true; the second is not. That federal computation
 * is transient — what the engagement persists is the Alberta result, with no
 * federal line on it — so `composeT2FilingData` refuses rather than render a
 * federal return missing every federal amount. The card 400'd every time.
 *
 * Each engagement now offers exactly its own payload, and an Alberta one links
 * to the federal engagement instead, creating it with these figures copied
 * across. See the block comment above that card.
 */
export function EngagementExport({ id }: { id: string }) {
	const router = useRouter();
	const { data: engagement } = useEngagement(id);
	const { data: client } = useClient(engagement?.clientId);
	const { latest: computed } = useLatestComputedReturn(id);
	const { items: memos } = useReviewMemos({
		engagementYearId: id,
		limit: 1,
		sort: "-createdAt",
	});
	const { prepareCif, prepareCo17, prepare, createCompanionFiling } =
		useEngagementActions();
	// What this DEPLOYMENT can transmit, asked of the server rather than asserted
	// in copy. See the banner below.
	const { data: channels } = useFilingChannels();

	const [netfilePayload, setNetfilePayload] = useState<Payload | null>(null);
	const [certOpen, setCertOpen] = useState(false);

	const isT2 = engagement?.program === "T2";
	const isAt1 = engagement?.program === "AT1";
	const isCo17 = engagement?.program === "CO17";
	const hasComputed = !!computed;
	const memo = memos?.[0];
	const signedOff = memo?.status === "signed_off";
	const yearEnd = engagement?.taxYearEnd?.slice(0, 10) ?? "";
	const fileBaseFor = (label: string) =>
		`${engagement?.program ?? "return"}-${label.toLowerCase()}-${slug(client?.name ?? id)}-${yearEnd}`;

	/**
	 * What this engagement's payload is called, per program.
	 *
	 * This was `isT2 ? "CIF" : "Net File"`, so a Québec engagement offered a
	 * button reading "Generate Net File" that dispatched Alberta's action and
	 * was refused, after collecting an officer's name it never needed. Three
	 * programs, three payloads, and the server already names them on
	 * `/filing-channels` — read that when it has answered, and fall back to a
	 * per-program literal so the label is right before the request lands.
	 */
	const payloadLabel = isT2 ? "CIF" : isCo17 ? "CO-17" : "Net File";
	const payload = netfilePayload;
	const setPayload = setNetfilePayload;
	const fileBase = fileBaseFor(payloadLabel);

	const generating =
		prepareCif.isPending || prepareCo17.isPending || prepare.isPending;

	/** The channel this engagement actually files on, once the server has said. */
	const primaryChannel = channels
		? isT2
			? channels.T2
			: isAt1
				? channels.AT1
				: channels.CO17
		: undefined;

	/**
	 * Why the Generate button is unavailable, or `null` when it is available.
	 *
	 * A disabled button that gives no reason is indistinguishable from a broken
	 * one: live QA reported this control as "inert — no network request, no
	 * toast, no console error" and could not tell which it was without reading
	 * the source. Silence is the defect, whatever disabled it.
	 */
	const generateBlockedBecause = !hasComputed
		? "Run Compute on this engagement first — there is no computed return to build a payload from."
		: generating
			? "Generating…"
			: null;

	const onGenerate = async () => {
		// Belt and braces: if this is ever reached without a computed return
		// (a stale cache, a failed refetch), say so rather than returning quietly.
		if (!hasComputed) {
			toast.error(generateBlockedBecause ?? "Nothing to generate yet");
			return;
		}
		// Only Alberta's Net File needs a certifier collected first. The federal
		// CIF and the Québec CO-17 are draft previews and take none — asking for
		// one was how the Québec path ended up in Alberta's dialog.
		if (isAt1) {
			setCertOpen(true);
			return;
		}
		try {
			const r = await (isCo17 ? prepareCo17 : prepareCif).mutateAsync(id);
			setPayload(r);
			toast.success(`${payloadLabel} generated`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Generate failed");
		}
	};

	const onCertify = async (values: Record<string, unknown>) => {
		const certification = {
			firstName: String(values.firstName ?? ""),
			lastName: String(values.lastName ?? ""),
			position: String(values.position ?? ""),
		};
		try {
			const r = (await prepare.mutateAsync({ id, certification })) as Payload;
			setPayload(r);
			setCertOpen(false);
			toast.success("Net File generated");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Generate failed");
		}
	};

	/**
	 * Open the federal engagement, creating it from this return if it is not
	 * there yet. Idempotent on the server, so a second press lands on the same
	 * engagement rather than making another one.
	 */
	const onOpenFederalReturn = async () => {
		try {
			const r = await createCompanionFiling.mutateAsync(id);
			toast.success(
				r.created
					? r.returnInputCopied
						? "Federal T2 engagement opened with this return's figures copied across"
						: "Federal T2 engagement opened"
					: "Opening the federal T2 engagement for this year",
			);
			router.push(`/dashboard/engagements/${r.engagementYearId}/return`);
		} catch (err) {
			toast.error(
				err instanceof Error
					? err.message
					: "Could not open the federal engagement",
			);
		}
	};

	const onDownloadXml = () => {
		if (!payload) return;
		downloadFile(`${fileBase}.xml`, payload.xml, "application/xml");
	};

	const onCopyXml = async () => {
		if (!payload) return;
		await navigator.clipboard.writeText(payload.xml);
		toast.success("XML copied");
	};

	const onDownloadJson = () => {
		if (!computed) return;
		const data = {
			engagementId: id,
			program: engagement?.program,
			taxYearEnd: engagement?.taxYearEnd,
			engineVersion: computed.engineVersion,
			fields: computed.fields,
		};
		downloadFile(
			`${fileBase}-data.json`,
			JSON.stringify(data, null, 2),
			"application/json",
		);
	};

	return (
		<div className="space-y-6">
			<HeaderSection
				title="Export & filing payload"
				description={
					client?.name
						? `${client.name} · ${engagement?.program ?? ""}`
						: "Download the prepared return"
				}
				icon={Download}
			/>

			<Button
				variant="ghost"
				size="sm"
				className="-ml-2 w-fit"
				onClick={() => router.push(`/dashboard/engagements/${id}`)}
			>
				<ArrowLeft className="size-4" /> Back to engagement
			</Button>

			{/*
			 * What this deployment can actually do, from the server's own answer.
			 *
			 * This banner used to read "live e-file isn't enabled yet" for every
			 * program, unconditionally — on a build whose AT1 transmission reaches
			 * TRA and returns real response codes, next to a transmit button that
			 * works. Copy that contradicts the button teaches people to stop
			 * believing the screen, so it now states the channel's real state.
			 */}
			<div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4">
				<Info className="mt-0.5 size-5 text-amber-600" />
				<div className="text-sm">
					<p className="font-medium">
						{primaryChannel === undefined
							? "Checking which filing channels this server can transmit on…"
							: primaryChannel.transmit
								? `${primaryChannel.authority} ${primaryChannel.channel} transmission is enabled on this server.`
								: `${primaryChannel.authority} ${primaryChannel.channel} transmission is not enabled on this server.`}
					</p>
					<p className="text-muted-foreground">
						{primaryChannel?.transmit
							? "Transmit from the engagement page once the review is signed off and the officer's T183 is recorded. Download the payload here for your own records — it is the exact XML that goes on the wire."
							: "Export the prepared payload for your records or manual submission. This is the exact XML that will be transmitted once the channel is configured. Not a mock."}
					</p>
					{isAt1 && channels && !channels.T2.transmit && (
						<p className="mt-1 text-muted-foreground">
							The federal CIF payload below is for download only — CRA
							transmission is not enabled on this server.
						</p>
					)}
				</div>
			</div>

			{/*
			 * What is going to TRA, captioned — placed BEFORE the raw XML because a
			 * preparer reviews the return, not the serialisation. The XML card below
			 * is still the authority on what is on the wire; this is the same values
			 * against the lines they are filed as, which is the form a mistake is
			 * actually visible in.
			 *
			 * AT1 only for now: the captions come from the AT1 paper layouts, and the
			 * federal T2 and Québec CO-17 have no equivalent generated set yet.
			 */}
			{isAt1 && <FiledLinesReview computed={computed} />}

			{/* Filing payload (XML). */}
			<Card>
				<CardHeader className="flex-row items-center gap-2 space-y-0">
					<FileCode2 className="size-5" />
					<CardTitle className="text-base">
						{payloadLabel} filing payload (XML)
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					{!hasComputed && (
						<p className="text-sm text-muted-foreground">
							Compute the return before generating the {payloadLabel} payload.
						</p>
					)}

					{hasComputed && (
						<p className="text-xs text-muted-foreground">
							Filing needs three things beyond the payload: a signed-off review,
							the officer&apos;s T183 authorization for <em>this</em>{" "}
							computation, and a person to transmit. A recompute invalidates a
							prior authorization, so record it last.
						</p>
					)}

					{!payload ? (
						<div className="flex flex-wrap items-center gap-3">
							<Button
								disabled={!hasComputed || generating}
								onClick={onGenerate}
								title={generateBlockedBecause ?? undefined}
							>
								Generate {payloadLabel}
							</Button>
							{generateBlockedBecause && !generating && (
								<span className="text-xs text-muted-foreground">
									{generateBlockedBecause}
								</span>
							)}
							<Button
								variant="outline"
								disabled={!hasComputed}
								onClick={() => router.push(`/dashboard/engagements/${id}/t183`)}
							>
								T183 authorization
							</Button>
							{hasComputed && !signedOff && (
								<span className="text-xs text-muted-foreground">
									Note: the review isn't signed off. This is a draft payload for
									preview.
								</span>
							)}
						</div>
					) : (
						<>
							<div className="flex flex-wrap items-center gap-2">
								<Badge variant={signedOff ? "default" : "secondary"}>
									{signedOff ? "signed-off return" : "draft"}
								</Badge>
								<span className="font-mono text-xs text-muted-foreground">
									sha256 {payload.payloadHash.slice(0, 16)}…
								</span>
							</div>
							<div className="flex flex-wrap items-center gap-2">
								<Button size="sm" onClick={onDownloadXml}>
									<Download className="size-4" /> Download .xml
								</Button>
								<Button size="sm" variant="outline" onClick={onCopyXml}>
									<Copy className="size-4" /> Copy
								</Button>
								<Button
									size="sm"
									variant="ghost"
									disabled={generating}
									onClick={onGenerate}
								>
									Regenerate
								</Button>
							</div>
							<pre className="max-h-96 overflow-auto rounded-md bg-muted p-3 text-xs">
								{payload.xml}
							</pre>
						</>
					)}
				</CardContent>
			</Card>

			{/*
			 * The federal return that belongs beside this Alberta one.
			 *
			 * This used to be a "Generate CIF" button, on the reasoning that an AT1
			 * engagement already holds everything the federal payload needs. The
			 * first half of that is true and the second is not: Alberta IS computed
			 * from the federal figures, but that federal computation is transient.
			 * What the engagement persists is the Alberta result — albertaTaxableIncome,
			 * albertaTaxPayable — and no federal line at all, so `composeT2FilingData`
			 * refuses rather than render a federal return with every federal figure
			 * missing. The button 400'd every time it was pressed, on a screen that
			 * had just promised the payload.
			 *
			 * Two returns need two engagements, because each carries its own review
			 * sign-off, its own authorization and its own filing record. What they do
			 * not need is the data entered twice, which is what this does instead.
			 */}
			{isAt1 && (
				<Card>
					<CardHeader className="flex-row items-center gap-2 space-y-0">
						<FileCode2 className="size-5" />
						<CardTitle className="text-base">
							The federal T2 return for this year
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<p className="text-sm text-muted-foreground">
							This corporation files twice: the AT1 to Alberta TRA, and a
							federal T2 to CRA. Alberta is computed from the federal figures
							you entered here, but the two returns are filed separately, each
							with its own review sign-off and authorization, so the federal one
							is its own engagement.
						</p>
						<p className="text-sm text-muted-foreground">
							Opening it here copies this return's figures across, so nothing is
							typed a second time. The two diverge from that point, which is
							what Alberta's reconciliation schedules exist to record.
						</p>
						<Button
							disabled={createCompanionFiling.isPending}
							onClick={onOpenFederalReturn}
						>
							{createCompanionFiling.isPending
								? "Opening…"
								: "Open the federal T2 engagement"}
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Printable PDF. */}
			<Card>
				<CardHeader className="flex-row items-center gap-2 space-y-0">
					<FileText className="size-5" />
					<CardTitle className="text-base">Printable return (PDF)</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-wrap items-center justify-between gap-3">
					<p className="text-sm text-muted-foreground">
						Open the formatted return, then use your browser's “Save as PDF”.
					</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => router.push(`/dashboard/engagements/${id}/print`)}
					>
						<FileText className="size-4" /> Open printable return
					</Button>
				</CardContent>
			</Card>

			{/* Computed data (JSON). */}
			<Card>
				<CardHeader className="flex-row items-center gap-2 space-y-0">
					<Braces className="size-5" />
					<CardTitle className="text-base">Computed data (JSON)</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-wrap items-center justify-between gap-3">
					<p className="text-sm text-muted-foreground">
						The provenance-tagged engine fold. For your working papers or
						import.
					</p>
					<Button
						variant="outline"
						size="sm"
						disabled={!hasComputed}
						onClick={onDownloadJson}
					>
						<Download className="size-4" /> Download .json
					</Button>
				</CardContent>
			</Card>

			<SchemaFormDialog
				open={certOpen}
				onOpenChange={(open: boolean) => !open && setCertOpen(false)}
				title="Certify & prepare Net File"
				submitLabel="Generate"
				submitLoading={prepare.isPending}
				schema={getCertificationSchema()}
				onSubmit={onCertify}
			/>
		</div>
	);
}
