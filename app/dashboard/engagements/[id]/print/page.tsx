import { ReturnPrint } from "./components/return-print";

export const metadata = { title: "Print return" };

export default async function ReturnPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ReturnPrint id={id} />;
}
