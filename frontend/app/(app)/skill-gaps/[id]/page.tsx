import { apiFetchServer } from "@/lib/api-server";
import SkillGapsDetailClient from "./SkillGapsDetailClient";

export default async function SkillGapsDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await apiFetchServer(`/skill-gaps/${params.id}`);

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl w-full py-16 text-center text-sm text-text-muted">
        Not found.
      </div>
    );
  }

  return <SkillGapsDetailClient initialData={data} />;
}
