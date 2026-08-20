import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FlagSeverity, ReviewMemo } from "@/api/review-memos";

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
          variant={row.original.status === "signed_off" ? "default" : "secondary"}
        >
          {row.original.status.replace("_", " ")}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const blocked =
          row.original.status === "signed_off" ||
          unresolvedReds(row.original) > 0;
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
                  Sign off
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </span>
        );
      },
    },
  ];
}
