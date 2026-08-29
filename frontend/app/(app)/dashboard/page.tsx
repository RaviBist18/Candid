import { createClient } from "@/lib/supabase-server";
import { apiFetchServer } from "@/lib/api-server";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email ??
    "there";

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [insightRes, allAnalyses, sampleRow] = await Promise.all([
    apiFetchServer("/dashboard/insight"),
    supabase
      .from("analyses")
      .select("id, job_title, created_at")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("analyses")
      .select("id")
      .eq("user_id", user!.id)
      .eq("is_sample", true)
      .maybeSingle(),
  ]);

  const analysesRows = allAnalyses.data ?? [];
  const mostRecentRow = analysesRows[0] ?? null;

  let mostRecentAtsScore: number | null = null;
  if (mostRecentRow) {
    const { data: reportRow } = await supabase
      .from("reports")
      .select("ats_score")
      .eq("analysis_id", mostRecentRow.id)
      .maybeSingle();
    mostRecentAtsScore = reportRow?.ats_score ?? null;
  }

  const data = {
    userName,
    aiInsight: insightRes?.insight ?? "Insight unavailable right now.",
    hasAnalyses: insightRes?.has_analyses ?? true,
    totalAnalyses: analysesRows.length,
    totalAnalysesThisMonth: analysesRows.filter(
      (a) => new Date(a.created_at) >= startOfMonth,
    ).length,
    mostRecent: mostRecentRow
      ? {
          id: mostRecentRow.id,
          role: mostRecentRow.job_title,
          created_at: mostRecentRow.created_at,
          ats_score: mostRecentAtsScore,
        }
      : null,
    sampleAnalysisId: sampleRow.data?.id ?? null,
  };

  return <DashboardClient data={data} />;
}
