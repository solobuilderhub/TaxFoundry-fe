import { ReturnJacket } from "./components/return-jacket";

export default async function JacketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReturnJacket id={id} />;
}
