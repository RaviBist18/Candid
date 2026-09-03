import { createClient } from "@/lib/supabase-server";
import AtsScoreClient from "./AtsScoreClient";

export default async function AtsScorePage({
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
    .select("id, job_title, job_description, created_at")
    .eq("id", params.id)
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!analysis) {
    return (
      <div className="mx-auto max-w-3xl w-full py-16 text-center text-sm text-text-muted">
        Score not found.
      </div>
    );
  }

  const { data: report } = await supabase
    .from("reports")
    .select("ats_score, ats_breakdown")
    .eq("analysis_id", params.id)
    .maybeSingle();

  if (!report || !report.ats_breakdown) {
    return (
      <div className="mx-auto max-w-3xl w-full py-16 text-center text-sm text-text-muted">
        Score not found.
      </div>
    );
  }

  const data = {
    ...report.ats_breakdown,
    analysis_id: params.id,
    job_title: analysis.job_title,
    created_at: analysis.created_at,
  };

  return <AtsScoreClient data={data} />;
}
