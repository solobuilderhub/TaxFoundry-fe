import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, MoreHorizontal } from "lucide-react";
import type { FlagSeverity, ReviewMemo } from "@/api/review-memos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const count = (memo: ReviewMemo, sev: FlagSeverity) =>
	(memo.flags ?? []).filter((f) => f.severity === sev).length;

const unresolvedReds = (memo: ReviewMemo) =>
	(memo.flags ?? []).filter((f) => f.severity === "red" && !f.resolved).length;

export function createReviewColumns(opts: {
	engagementLabel: (id: string) => string;
	onSignOff: (row: ReviewMemo) => void;
	signingId?: string | null;
}): ColumnDef<ReviewMemo>[] {
	return [
		{
			accessorKey: "engagementYearId",
			header: "Engagement",
			cell: ({ row }) => (
				<span className="font-medium">
					{opts.engagementLabel(String(row.original.engagementYearId))}
				</span>
			),
		},
		{
			id: "flags",
			header: "Flags",
			cell: ({ row }) => {
				const r = count(row.original, "red");
				const a = count(row.original, "amber");
				const g = count(row.original, "green");
				if (r + a + g === 0)
					return <span className="text-muted-foreground">—</span>;
				return (
					<div className="flex gap-1">
						{r > 0 && <Badge variant="destructive">{r} red</Badge>}
						{a > 0 && <Badge variant="secondary">{a} amber</Badge>}
						{g > 0 && <Badge variant="outline">{g} ok</Badge>}
					</div>
				);
			},
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => (
				<Badge
					variant={
						row.original.status === "signed_off" ? "default" : "secondary"
					}
				>
					{row.original.status.replace("_", " ")}
				</Badge>
			),
		},
		{
			id: "actions",
			header: "",
			cell: ({ row }) => {
				const reds = unresolvedReds(row.original);
				const signedOff = row.original.status === "signed_off";
				const blocked = signedOff || reds > 0;
				/**
				 * Why sign-off is unavailable, said on the item itself.
				 *
				 * The label was the bare word "Sign off" whatever the state, so
				 * "already done" and "you have three red flags to resolve" and "this
				 * is broken" all looked identical. The list view one screen over
				 * already says `Resolve N red flag(s) to sign off` in the same
				 * situation; this is the control a preparer actually reaches from the
				 * queue.
				 */
				const label = signedOff
					? "Already signed off"
					: reds > 0
						? `Resolve ${reds} red flag${reds > 1 ? "s" : ""} to sign off`
						: "Sign off";
				return (
					<span onClick={(e) => e.stopPropagation()}>
						<DropdownMenu>
							<DropdownMenuTrigger
								render={
									<Button variant="ghost" size="icon" aria-label="Actions">
										<MoreHorizontal className="size-4" />
									</Button>
								}
							/>
							<DropdownMenuContent align="end">
								<DropdownMenuItem
									disabled={
										blocked || opts.signingId === String(row.original._id)
									}
									onClick={() => opts.onSignOff(row.original)}
								>
									<CheckCircle2 className="size-4" />
									{label}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</span>
				);
			},
		},
	];
}
