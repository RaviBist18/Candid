import { createClient } from "@/lib/supabase-server";
import RoadmapListClient from "./RoadmapListClient";

export default async function RoadmapPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: analyses } = await supabase
    .from("analyses")
    .select("id, job_description, created_at")
    .eq("user_id", user!.id)
    .eq("status", "completed");

  let results: any[] = [];

  if (analyses && analyses.length > 0) {
    const analysisIds = analyses.map((a) => a.id);

    const { data: reports } = await supabase
      .from("reports")
      .select("id, analysis_id")
      .in("analysis_id", analysisIds);

    const reportToAnalysis = new Map(
      (reports ?? []).map((r) => [r.id, r.analysis_id]),
    );
    const reportIds = Array.from(reportToAnalysis.keys());

    if (reportIds.length > 0) {
      const { data: items } = await supabase
        .from("roadmap_items")
        .select("report_id, project_title, is_checked")
        .in("report_id", reportIds);

      type AggEntry = { projects: Set<string>; done: number; total: number };
      const agg = new Map<string, AggEntry>();

      for (const item of items ?? []) {
        const analysisId = reportToAnalysis.get(item.report_id);
        if (!analysisId) continue;
        const entry = agg.get(analysisId) ?? {
          projects: new Set<string>(),
          done: 0,
          total: 0,
        };
        entry.projects.add(item.project_title);
        entry.total += 1;
        if (item.is_checked) entry.done += 1;
        agg.set(analysisId, entry);
      }

      results = analyses
        .filter((a) => agg.has(a.id))
        .map((a) => {
          const stats = agg.get(a.id)!;
          const jd = a.job_description || "";
          return {
            id: a.id,
            job_title: jd.length > 60 ? jd.slice(0, 60) + "..." : jd,
            project_count: stats.projects.size,
            done_items: stats.done,
            total_items: stats.total,
            updated_at: a.created_at,
          };
        })
        .sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
        );
    }
  }

  return <RoadmapListClient initialRoadmaps={results} />;
}
