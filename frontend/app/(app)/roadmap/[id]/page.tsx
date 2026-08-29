import { apiFetchServer } from "@/lib/api-server";
import RoadmapProjectPickerClient from "./RoadmapProjectPickerClient";

export default async function RoadmapProjectPickerPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await apiFetchServer(
    `/reports/by-analysis/${params.id}/roadmap-projects`,
  );

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl w-full py-16 text-center text-sm text-text-muted">
        Roadmap not found.
      </div>
    );
  }

  return <RoadmapProjectPickerClient data={data} />;
}
