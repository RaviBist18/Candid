import { createClient } from "@/lib/supabase-server";
import { apiFetchServer } from "@/lib/api-server";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const t0 = Date.now();
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log(`[TIMING] auth.getUser: ${Date.now() - t0}ms`);

  const userName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email ??
    "there";

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const t1 = Date.now();
  const [insightRes, allAnalyses, sampleRow] = await Promise.all([
    apiFetchServer("/dashboard/insight").then((r) => {
      console.log(
        `[TIMING] apiFetchServer /dashboard/insight: ${Date.now() - t1}ms`,
      );
      return r;
    }),
    supabase
      .from("analyses")
      .select("id, job_title, created_at")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .then((r) => {
        console.log(`[TIMING] supabase analyses select: ${Date.now() - t1}ms`);
        return r;
      }),
    supabase
      .from("analyses")
      .select("id")
      .eq("user_id", user!.id)
      .eq("is_sample", true)
      .maybeSingle()
      .then((r) => {
        console.log(`[TIMING] supabase sample select: ${Date.now() - t1}ms`);
        return r;
      }),
  ]);
  console.log(`[TIMING] Promise.all block total: ${Date.now() - t1}ms`);

  const analysesRows = allAnalyses.data ?? [];
  const mostRecentRow = analysesRows[0] ?? null;

  let mostRecentAtsScore: number | null = null;
  if (mostRecentRow) {
    const t2 = Date.now();
    const { data: reportRow } = await supabase
      .from("reports")
      .select("ats_score")
      .eq("analysis_id", mostRecentRow.id)
      .maybeSingle();
    console.log(`[TIMING] reportRow fetch: ${Date.now() - t2}ms`);
    mostRecentAtsScore = reportRow?.ats_score ?? null;
  }

  console.log(`[TIMING] TOTAL: ${Date.now() - t0}ms`);

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
