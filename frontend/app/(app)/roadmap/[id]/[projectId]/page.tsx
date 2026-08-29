import { apiFetchServer } from "@/lib/api-server";
import RoadmapDetailClient from "./RoadmapDetailClient";

export default async function RoadmapDetailPage({
  params,
}: {
  params: { id: string; projectId: string };
}) {
  const projectTitle = decodeURIComponent(params.projectId);
  const data = await apiFetchServer(
    `/reports/by-analysis/${params.id}/roadmap-items?project_title=${encodeURIComponent(
      projectTitle,
    )}`,
  );

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl w-full py-16 text-center text-sm text-text-muted">
        Roadmap not found.
      </div>
    );
  }

  return <RoadmapDetailClient analysisId={params.id} initialData={data} />;
}
