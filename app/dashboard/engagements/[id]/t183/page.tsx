import { T183Print } from "./components/t183-print";

export const metadata = { title: "T183" };

export default async function T183Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <T183Print id={id} />;
}
