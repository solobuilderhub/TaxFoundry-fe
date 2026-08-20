import { EngagementDetail } from "./components/engagement-detail";

export const metadata = { title: "Engagement" };

export default async function EngagementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EngagementDetail id={id} />;
}
