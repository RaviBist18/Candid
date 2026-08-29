import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase-server";
import SkillGapsListClient from "./SkillGapsListClient";

export default async function SkillGapsListPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: analyses } = await supabase
    .from("analyses")
    .select("id, job_title")
    .eq("user_id", user!.id)
    .eq("status", "completed");

  let items: any[] = [];

  if (analyses && analyses.length > 0) {
    const analysisIds = analyses.map((a) => a.id);
    const titleByAnalysis = new Map(analyses.map((a) => [a.id, a.job_title]));

    const { data: reports } = await supabase
      .from("reports")
      .select("analysis_id, skill_gaps, created_at")
      .in("analysis_id", analysisIds);

    items = (reports ?? [])
      .filter((r) => (r.skill_gaps ?? []).length > 0)
      .map((r) => {
        const gaps = r.skill_gaps ?? [];
        const criticalCount = gaps.filter(
          (g: any) => g.severity === "critical",
        ).length;
        return {
          id: r.analysis_id,
          job_title: titleByAnalysis.get(r.analysis_id) ?? "Untitled",
          critical_count: criticalCount,
          total_count: gaps.length,
          updated_at: r.created_at,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      <div>
        <span className="text-label-sm uppercase text-primary">
          Skill Gap Analysis
        </span>
        <h1 className="mt-1.5 text-headline-lg text-text">Your Skill Gaps</h1>
        <p className="mt-1.5 text-sm text-text-muted">
          Pick an analysis to see the critical technical areas for that role.
        </p>
      </div>

      <SkillGapsListClient initialItems={items} />
    </div>
  );
}
