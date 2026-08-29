import { createClient } from "@/lib/supabase-server";
import ReportClient from "./ReportClient";

export default async function ReportPage({
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
    .select("id")
    .eq("id", params.id)
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!analysis) {
    return (
      <div className="mx-auto max-w-3xl w-full py-16 text-center text-sm text-text-muted">
        Report not found.
      </div>
    );
  }

  const { data: r } = await supabase
    .from("reports")
    .select("*")
    .eq("analysis_id", params.id)
    .maybeSingle();

  if (!r) {
    return (
      <div className="mx-auto max-w-3xl w-full py-16 text-center text-sm text-text-muted">
        Report not found.
      </div>
    );
  }

  const [{ data: items }, { data: messages }] = await Promise.all([
    supabase
      .from("roadmap_items")
      .select("*")
      .eq("report_id", r.id)
      .order("order_index"),
    supabase
      .from("chat_messages")
      .select("*")
      .eq("report_id", r.id)
      .order("created_at"),
  ]);

  return (
    <ReportClient
      initialReport={r}
      initialRoadmap={items ?? []}
      initialChatMessages={messages ?? []}
    />
  );
}
