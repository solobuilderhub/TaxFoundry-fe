import { EngagementReview } from "./components/engagement-review";

export const metadata = { title: "Review" };

export default async function EngagementReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EngagementReview id={id} />;
}
