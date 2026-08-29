import { apiFetchServer } from "@/lib/api-server";
import RoadmapListClient from "./RoadmapListClient";

export default async function RoadmapPage() {
  const data = await apiFetchServer("/reports/roadmaps-summary");
  return <RoadmapListClient initialRoadmaps={data ?? []} />;
}
