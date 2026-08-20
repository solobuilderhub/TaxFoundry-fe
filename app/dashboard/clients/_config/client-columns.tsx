import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { Client } from "@/api/clients";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const monthLabel = (m: number | undefined) =>
  typeof m === "number" && m >= 1 && m <= 12 ? MONTHS[m - 1] : "—";

/**
 * File-readiness of a client — the identifying data a return can't be filed
 * without. Mirrors the engine's review rules (a missing/invalid BN raises the
 * red `BN_MISSING` flag at compute time); surfacing it here lets a preparer see
 * which clients need data BEFORE starting a return.
 */
export function clientReadiness(c: Client): { ready: boolean; missing: string[] } {
  const missing: string[] = [];
  // A valid 9-digit BN is the hard filing blocker (engine's red BN_MISSING).
  if (!/^\d{9}/.test(c.businessNumber ?? "")) missing.push("BN");
  // Corp type drives the CCPC/SBD math — a return without it computes wrong.
  if (!c.corpType) missing.push("type");
  return { ready: missing.length === 0, missing };
}

/** ColumnDef[] for fluid's ResourceDashboard (TanStack Table under the hood). */
export const clientColumns: ColumnDef<Client>[] = [
  {
    accessorKey: "name",
    header: "Client",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  { accessorKey: "businessNumber", header: "BN" },
  {
    accessorKey: "corpType",
    header: "Type",
    cell: ({ row }) => row.original.corpType || "—",
  },
  {
    accessorKey: "jurisdiction",
    header: "Jurisdiction",
    cell: ({ row }) => (
      <Badge variant="secondary">{row.original.jurisdiction || "AB"}</Badge>
    ),
  },
  {
    accessorKey: "fiscalYearEndMonth",
    header: "FYE",
    cell: ({ row }) => monthLabel(row.original.fiscalYearEndMonth),
  },
  {
    id: "readiness",
    header: "Filing status",
    cell: ({ row }) => {
      const { ready, missing } = clientReadiness(row.original);
      return ready ? (
        <Badge
          variant="outline"
          className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
        >
          Ready to file
        </Badge>
      ) : (
        <span className="inline-flex items-center gap-2">
          <Badge variant="secondary">Incomplete</Badge>
          <span className="text-xs text-muted-foreground">missing {missing.join(", ")}</span>
        </span>
      );
    },
  },
];
