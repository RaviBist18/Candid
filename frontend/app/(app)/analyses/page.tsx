import { createClient } from "@/lib/supabase-server";
import AnalysesClient from "./AnalysesClient";

export default async function AnalysesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: analysesRows } = await supabase
    .from("analyses")
    .select("id, job_title, job_description, created_at, status, is_sample")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const analyses = analysesRows ?? [];
  const analysisIds = analyses.map((a) => a.id);

  const [{ data: reportRows }, { data: roadmapRows }] = await Promise.all([
    analysisIds.length
      ? supabase
          .from("reports")
          .select("id, analysis_id, ats_score")
          .in("analysis_id", analysisIds)
      : Promise.resolve({ data: [] }),
    analysisIds.length
      ? supabase
          .from("roadmap_items")
          .select("report_id, is_checked, reports!inner(analysis_id)")
          .in("reports.analysis_id", analysisIds)
      : Promise.resolve({ data: [] }),
  ]);

  const atsByAnalysis = new Map(
    (reportRows ?? []).map((r) => [r.analysis_id, r.ats_score]),
  );
  const reportIdToAnalysis = new Map(
    (reportRows ?? []).map((r) => [r.id, r.analysis_id]),
  );

  const progress = new Map<string, { done: number; total: number }>();
  for (const item of roadmapRows ?? []) {
    const analysisId = (item as any).reports?.analysis_id;
    if (!analysisId) continue;
    const entry = progress.get(analysisId) ?? { done: 0, total: 0 };
    entry.total += 1;
    if (item.is_checked) entry.done += 1;
    progress.set(analysisId, entry);
  }

  const rows = analyses.map((a) => {
    const p = progress.get(a.id);
    return {
      id: a.id,
      job_title: a.job_title,
      created_at: a.created_at,
      status: a.status,
      ats_score: atsByAnalysis.get(a.id) ?? null,
      roadmap_done: p?.done ?? 0,
      roadmap_total: p?.total ?? 0,
      is_sample: a.is_sample ?? false,
    };
  });

  return <AnalysesClient initialRows={rows} />;
}
