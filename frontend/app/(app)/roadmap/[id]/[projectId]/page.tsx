import { createClient } from "@/lib/supabase-server";
import RoadmapDetailClient from "./RoadmapDetailClient";

export default async function RoadmapDetailPage({
  params,
}: {
  params: { id: string; projectId: string };
}) {
  const projectTitle = decodeURIComponent(params.projectId);
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: analysis } = await supabase
    .from("analyses")
    .select("id")
    .eq("id", params.id)
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!analysis) {
    return (
      <div className="mx-auto max-w-3xl w-full py-16 text-center text-sm text-text-muted">
        Roadmap not found.
      </div>
    );
  }

  const { data: report } = await supabase
    .from("reports")
    .select("id")
    .eq("analysis_id", params.id)
    .maybeSingle();

  if (!report) {
    return (
      <div className="mx-auto max-w-3xl w-full py-16 text-center text-sm text-text-muted">
        Roadmap not found.
      </div>
    );
  }

  const { data: items } = await supabase
    .from("roadmap_items")
    .select("*")
    .eq("report_id", report.id)
    .eq("project_title", projectTitle)
    .order("order_index");

  if (!items || items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl w-full py-16 text-center text-sm text-text-muted">
        Roadmap not found.
      </div>
    );
  }

  const data = {
    analysis_id: params.id,
    project_title: projectTitle,
    items,
  };

  return <RoadmapDetailClient analysisId={params.id} initialData={data} />;
}
