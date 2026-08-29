import { apiFetchServer } from "@/lib/api-server";
import AtsScoreClient from "./AtsScoreClient";

export default async function AtsScorePage({
  params,
}: {
  params: { id: string };
}) {
  const data = await apiFetchServer(
    `/reports/by-analysis/${params.id}/ats-score`,
  );

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl w-full py-16 text-center text-sm text-text-muted">
        Score not found.
      </div>
    );
  }

  return <AtsScoreClient data={data} />;
}
