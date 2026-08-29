import { apiFetchServer } from "@/lib/api-server";
import ReportClient from "./ReportClient";

export default async function ReportPage({
  params,
}: {
  params: { id: string };
}) {
  const r = await apiFetchServer(`/reports/by-analysis/${params.id}`);

  if (!r) {
    return (
      <div className="mx-auto max-w-3xl w-full py-16 text-center text-sm text-text-muted">
        Report not found.
      </div>
    );
  }

  const [items, messages] = await Promise.all([
    apiFetchServer(`/reports/${r.id}/roadmap`),
    apiFetchServer(`/reports/${r.id}/chat`),
  ]);

  return (
    <ReportClient
      initialReport={r}
      initialRoadmap={items ?? []}
      initialChatMessages={messages ?? []}
    />
  );
}
