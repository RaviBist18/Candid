import { createClient } from "@/lib/supabase-server";
import SkillGapsDetailClient from "./SkillGapsDetailClient";

export default async function SkillGapsDetailPage({
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
    .select("id, job_title")
    .eq("id", params.id)
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!analysis) {
    return (
      <div className="mx-auto max-w-3xl w-full py-16 text-center text-sm text-text-muted">
        Not found.
      </div>
    );
  }

  const { data: report } = await supabase
    .from("reports")
    .select("skill_gaps")
    .eq("analysis_id", params.id)
    .maybeSingle();

  if (!report) {
    return (
      <div className="mx-auto max-w-3xl w-full py-16 text-center text-sm text-text-muted">
        Not found.
      </div>
    );
  }

  const data = {
    analysis_id: params.id,
    job_title: analysis.job_title,
    skill_gaps: report.skill_gaps ?? [],
  };

  return <SkillGapsDetailClient initialData={data} />;
}
