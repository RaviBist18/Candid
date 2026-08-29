import { apiFetchServer } from "@/lib/api-server";
import AnalysesClient from "./AnalysesClient";

export default async function AnalysesPage() {
  const [data, progress] = await Promise.all([
    apiFetchServer("/analyses"),
    apiFetchServer("/analyses/roadmap-progress"),
  ]);

  const rows = (data ?? []).map((a: any) => {
    const p = progress?.[a.id];
    return {
      id: a.id,
      job_title:
        a.job_description.length > 60
          ? a.job_description.slice(0, 60) + "..."
          : a.job_description,
      created_at: a.created_at,
      status: a.status,
      ats_score: a.ats_score ?? null,
      roadmap_done: p?.done ?? 0,
      roadmap_total: p?.total ?? 0,
      is_sample: a.is_sample ?? false,
    };
  });

  return <AnalysesClient initialRows={rows} />;
}
