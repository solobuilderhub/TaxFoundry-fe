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
import { useClient } from "@/hooks/query/use-clients";
import { useLatestComputedReturn } from "@/hooks/query/use-computed-returns";
import {
	useEngagement,
	useEngagementActions,
} from "@/hooks/query/use-engagements";
import { useReviewMemos } from "@/hooks/query/use-review-memos";
import { getCertificationSchema } from "../../../_config/certification-config";

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
 * Export & filing payload — the pre-certification bridge. Live CRA/TRA e-file
 * isn't wired yet (the transmission gateway 503s by design), so this surface
 * lets a firm GENERATE and DOWNLOAD the exact certified payload (the CIF XML for
 * T2, the Net File XML for AT1) for their records or manual submission. The same
 * renderer feeds live transmission once integration lands — export is not a
 * mock, it's the real payload minus the wire.
 *
 * ── Why AT1 gets TWO payload cards, not one ─────────────────────────────────
 *
 * Alberta tax is computed FROM the federal figures, so an AT1 engagement
 * already collects everything the federal CIF needs — the server has always
 * been able to render both (`prepare-cif` and `prepare-netfile` both read the
 * same computed return). Showing only the Net File button here left that
 * federal payload unreachable except through a second, T2-program engagement
 * that duplicates the same data entry. A firm filing AT1 needs the federal
 * return too — every AT1 corporation has one — so the CIF card renders
 * alongside the Net File card for an AT1 engagement, at the same "draft,
 * pre-certified-serializer" maturity T2 has always shown here. T2 and CO17
 * engagements are unchanged: one payload each.
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
	const { prepareCif, prepare } = useEngagementActions();

	const [netfilePayload, setNetfilePayload] = useState<Payload | null>(null);
	const [cifPayload, setCifPayload] = useState<Payload | null>(null);
	const [certOpen, setCertOpen] = useState(false);

	const isT2 = engagement?.program === "T2";
	const isAt1 = engagement?.program === "AT1";
	const hasComputed = !!computed;
	const memo = memos?.[0];
	const signedOff = memo?.status === "signed_off";
	const yearEnd = engagement?.taxYearEnd?.slice(0, 10) ?? "";
	const fileBaseFor = (label: string) =>
		`${engagement?.program ?? "return"}-${label.toLowerCase()}-${slug(client?.name ?? id)}-${yearEnd}`;

	// The primary card: Net File for AT1/CO17, CIF for T2. AT1 additionally gets
	// its own federal CIF card below (see the note above).
	const payloadLabel = isT2 ? "CIF" : "Net File";
	const payload = netfilePayload;
	const setPayload = setNetfilePayload;
	const fileBase = fileBaseFor(payloadLabel);

	const generating = prepareCif.isPending || prepare.isPending;

	const onGenerate = async () => {
		if (isT2) {
			try {
				const r = await prepareCif.mutateAsync(id);
				setPayload(r);
				toast.success(`${payloadLabel} generated`);
			} catch (err) {
				toast.error(err instanceof Error ? err.message : "Generate failed");
			}
		} else {
			// AT1/CO17 Net File requires a certifier — collect it, then render.
			setCertOpen(true);
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

	const onDownloadXml = () => {
		if (!payload) return;
		downloadFile(`${fileBase}.xml`, payload.xml, "application/xml");
	};

	const onCopyXml = async () => {
		if (!payload) return;
		await navigator.clipboard.writeText(payload.xml);
		toast.success("XML copied");
	};

	// The AT1-only federal CIF card. No certification dialog — `prepare-cif`
	// (mirroring T2's own flow) doesn't need a certifier at draft/preview stage.
	const cifFileBase = fileBaseFor("CIF");
	const generatingCif = prepareCif.isPending;

	const onGenerateCif = async () => {
		try {
			const r = await prepareCif.mutateAsync(id);
			setCifPayload(r);
			toast.success("CIF generated");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Generate failed");
		}
	};

	const onDownloadCifXml = () => {
		if (!cifPayload) return;
		downloadFile(`${cifFileBase}.xml`, cifPayload.xml, "application/xml");
	};

	const onCopyCifXml = async () => {
		if (!cifPayload) return;
		await navigator.clipboard.writeText(cifPayload.xml);
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

			{/* Honest pre-certification banner. */}
			<div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4">
				<Info className="mt-0.5 size-5 text-amber-600" />
				<div className="text-sm">
					<p className="font-medium">
						Live {isT2 ? "CRA" : isAt1 ? "CRA and Alberta TRA" : "Alberta TRA"}{" "}
						e-file isn't enabled yet.
					</p>
					<p className="text-muted-foreground">
						Export the prepared payload{isAt1 ? "s" : ""} for your records or
						manual submission. This is the exact certified XML we'll transmit
						once integration lands. Not a mock.
					</p>
				</div>
			</div>

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
							>
								Generate {payloadLabel}
							</Button>
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

			{/* Federal CIF — AT1 only. Alberta tax is derived from the federal return,
          so this engagement already has everything the CIF needs; the button
          used to exist only on a separate T2 engagement, forcing double entry. */}
			{isAt1 && (
				<Card>
					<CardHeader className="flex-row items-center gap-2 space-y-0">
						<FileCode2 className="size-5" />
						<CardTitle className="text-base">
							Federal CIF filing payload (XML)
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{!hasComputed && (
							<p className="text-sm text-muted-foreground">
								Compute the return before generating the CIF payload.
							</p>
						)}

						{!cifPayload ? (
							<div className="flex flex-wrap items-center gap-3">
								<Button
									disabled={!hasComputed || generatingCif}
									onClick={onGenerateCif}
								>
									Generate CIF
								</Button>
							</div>
						) : (
							<>
								<div className="flex flex-wrap items-center gap-2">
									<Badge variant="secondary">draft</Badge>
									<span className="font-mono text-xs text-muted-foreground">
										sha256 {cifPayload.payloadHash.slice(0, 16)}…
									</span>
								</div>
								<div className="flex flex-wrap items-center gap-2">
									<Button size="sm" onClick={onDownloadCifXml}>
										<Download className="size-4" /> Download .xml
									</Button>
									<Button size="sm" variant="outline" onClick={onCopyCifXml}>
										<Copy className="size-4" /> Copy
									</Button>
									<Button
										size="sm"
										variant="ghost"
										disabled={generatingCif}
										onClick={onGenerateCif}
									>
										Regenerate
									</Button>
								</div>
								<pre className="max-h-96 overflow-auto rounded-md bg-muted p-3 text-xs">
									{cifPayload.xml}
								</pre>
							</>
						)}
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
