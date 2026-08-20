import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpRight, MoreHorizontal, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { EngagementStatus, EngagementYear } from "@/api/engagements";

const STATUS_VARIANT: Record<
  EngagementStatus,
  "secondary" | "default" | "outline"
> = {
  draft: "secondary",
  in_progress: "default",
  ready: "outline",
  filed: "default",
};

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-CA") : "—";

export function createEngagementColumns(opts: {
  clientName: (id: string) => string;
  onOpen: (row: EngagementYear) => void;
  onEdit: (row: EngagementYear) => void;
}): ColumnDef<EngagementYear>[] {
  return [
    {
      accessorKey: "clientId",
      header: "Client",
      cell: ({ row }) => (
        <span className="font-medium">{opts.clientName(row.original.clientId)}</span>
      ),
    },
    {
      accessorKey: "program",
      header: "Program",
      cell: ({ row }) => <Badge variant="secondary">{row.original.program}</Badge>,
    },
    {
      id: "period",
      header: "Tax year",
      cell: ({ row }) =>
        `${fmtDate(row.original.taxYearStart)} → ${fmtDate(row.original.taxYearEnd)}`,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={STATUS_VARIANT[row.original.status] ?? "secondary"}>
          {row.original.status.replace("_", " ")}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        // stop row-click (edit sheet) from firing when using the menu
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
              <DropdownMenuItem onClick={() => opts.onOpen(row.original)}>
                <ArrowUpRight className="size-4" />
                Open
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => opts.onEdit(row.original)}>
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </span>
      ),
    },
  ];
}
