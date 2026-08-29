import { createClient } from "@/lib/supabase-server";
import RoadmapProjectPickerClient from "./RoadmapProjectPickerClient";

export default async function RoadmapProjectPickerPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: analysis } = await supabase
    .from("analyses")
    .select("id, job_description")
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
    .select("project_title, is_checked")
    .eq("report_id", report.id);

  const projects = new Map<string, { total: number; done: number }>();
  for (const item of items ?? []) {
    const entry = projects.get(item.project_title) ?? { total: 0, done: 0 };
    entry.total += 1;
    if (item.is_checked) entry.done += 1;
    projects.set(item.project_title, entry);
  }

  const jd = analysis.job_description || "";
  const jobTitle = jd.length > 60 ? jd.slice(0, 60) + "..." : jd;

  const data = {
    analysis_id: params.id,
    job_title: jobTitle,
    projects: Array.from(projects.entries()).map(([title, s]) => ({
      project_title: title,
      done_items: s.done,
      total_items: s.total,
    })),
  };

  return <RoadmapProjectPickerClient data={data} />;
}
