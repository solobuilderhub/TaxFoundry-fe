import { HeaderSection } from "@classytic/fluid/dashboard";
import { Building2 } from "lucide-react";
import { WorkspaceOverview } from "./components/workspace-overview";

export const metadata = { title: "Overview" };

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      <HeaderSection
        title="Welcome to TaxFoundry"
        description="Prepare, review, and file federal T2 and Alberta AT1 corporate returns. Start by adding a client, then open an engagement year to compute and file."
        icon={Building2}
      />
      <WorkspaceOverview />
    </div>
  );
}
