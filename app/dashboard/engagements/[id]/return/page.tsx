import { ReturnEditor } from "./components/return-editor";

export const metadata = { title: "T2 Return" };

export default async function ReturnEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ReturnEditor id={id} />;
}
