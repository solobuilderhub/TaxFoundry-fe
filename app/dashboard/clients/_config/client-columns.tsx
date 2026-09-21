import type { FluidColumnDef } from "@classytic/fluid/client/table";
import type { Client } from "@/api/clients";
import { Badge } from "@/components/ui/badge";

const MONTHS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];

const monthLabel = (m: number | undefined) =>
	typeof m === "number" && m >= 1 && m <= 12 ? MONTHS[m - 1] : "—";

/**
 * File-readiness of a client — the identifying data a return can't be filed
 * without. Mirrors the engine's review rules (a missing/invalid BN raises the
 * red `BN_MISSING` flag at compute time); surfacing it here lets a preparer see
 * which clients need data BEFORE starting a return.
 */
export function clientReadiness(c: Client): {
	ready: boolean;
	missing: string[];
} {
	const missing: string[] = [];
	// A valid 9-digit BN is the hard filing blocker (engine's red BN_MISSING).
	if (!/^\d{9}/.test(c.businessNumber ?? "")) missing.push("BN");
	// Corp type drives the CCPC/SBD math — a return without it computes wrong.
	if (!c.corpType) missing.push("type");
	return { ready: missing.length === 0, missing };
}

/** ColumnDef[] for fluid's ResourceDashboard (TanStack Table under the hood). */
export const clientColumns: FluidColumnDef<Client>[] = [
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
		// Was "Filing status" / "Ready to file" — a claim this column cannot back
		// up. `clientReadiness` checks the CLIENT record only (a valid BN, a corp
		// type): it has no idea whether an engagement even exists, let alone
		// whether a return has been computed, reviewed, signed off and T183-
		// authorized. "Ready to file" on a client with no return at all told a
		// preparer the wrong thing about the one status that should gate
		// transmission (TF_DEV_BUG_LIST_2026-09-18.md, BUG-110). Relabelled to
		// say exactly what is checked — identifying data, not filing readiness —
		// rather than widen the check to cover a claim this list has no data for.
		header: "Client data",
		cell: ({ row }) => {
			const { ready, missing } = clientReadiness(row.original);
			return ready ? (
				<Badge
					variant="outline"
					className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
				>
					Data complete
				</Badge>
			) : (
				<span className="inline-flex items-center gap-2">
					<Badge variant="secondary">Incomplete</Badge>
					<span className="text-xs text-muted-foreground">
						missing {missing.join(", ")}
					</span>
				</span>
			);
		},
	},
];
