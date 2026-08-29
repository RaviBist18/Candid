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

  const [insightRes, statsRes, sampleRes] = await Promise.all([
    apiFetchServer("/dashboard/insight"),
    apiFetchServer("/dashboard/stats"),
    apiFetchServer("/analyses/sample"),
  ]);

  const data = {
    userName,
    aiInsight: insightRes?.insight ?? "Insight unavailable right now.",
    hasAnalyses: insightRes?.has_analyses ?? true,
    totalAnalyses: statsRes?.total_analyses ?? 0,
    totalAnalysesThisMonth: statsRes?.total_analyses_this_month ?? 0,
    mostRecent: statsRes?.most_recent ?? null,
    sampleAnalysisId: sampleRes?.id ?? null,
  };

  return <DashboardClient data={data} />;
}
