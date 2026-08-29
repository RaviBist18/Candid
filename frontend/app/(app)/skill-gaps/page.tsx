import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { apiFetchServer } from "@/lib/api-server";
import SkillGapsListClient from "./SkillGapsListClient";

export default async function SkillGapsListPage() {
  const items = (await apiFetchServer("/skill-gaps")) ?? [];

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
