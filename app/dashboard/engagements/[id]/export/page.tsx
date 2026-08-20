import { EngagementExport } from "./components/engagement-export";

export const metadata = { title: "Export" };

export default async function EngagementExportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EngagementExport id={id} />;
}
