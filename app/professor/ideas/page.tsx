import { ActionForm } from "@/components/action-form";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { requireCourseRole } from "@/lib/auth";
import { getCourse, getProfessorRows } from "@/lib/queries";
import { startReview } from "@/lib/actions/ideas";

export default async function IdeasPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const courseId = typeof params.course === "string" ? params.course : "";
  const error = typeof params.error === "string" ? params.error : undefined;
  await requireCourseRole(courseId, ["professor", "admin", "assistant"]);
  const [course, rows] = await Promise.all([getCourse(courseId), getProfessorRows(courseId)]);
  const reviewable = rows.filter((row) => row.ideaId && row.status !== "not_submitted");

  return (
    <main className="min-h-screen p-5 sm:p-8"><div className="mx-auto max-w-5xl">
      <Link href={`/professor/dashboard?course=${courseId}`} className="text-sm font-black text-[#1f7a52]">← Dashboard</Link>
      <div className="mt-6"><div className="text-xs font-black uppercase tracking-[.15em] text-stone-500">{course.code} · {course.semesterName}</div><h1 className="mt-2 text-4xl font-black tracking-[-.05em]">Idea review queue</h1><p className="mt-3 text-sm leading-6 text-stone-500">Clicking Start review changes the idea to In review and locks student editing. Requesting changes unlocks the next revision.</p></div>
      {error && <div className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">{error}</div>}
      <div className="mt-7 space-y-3">
        {reviewable.map((row) => (
          <div key={row.ideaId} className="surface grid gap-4 rounded-[26px] p-5 sm:grid-cols-[80px_1fr_auto_auto] sm:items-center">
            <div className="text-2xl font-black">#{row.groupNumber}</div>
            <div><div className="font-black">{row.ideaName}</div><div className="mt-1 text-xs text-stone-500">{row.groupMembers}</div></div>
            <StatusBadge status={row.status}/>
            <div className="sm:text-right">
              {row.status === "submitted" ? (
                <ActionForm action={startReview}><input type="hidden" name="course_id" value={courseId}/><input type="hidden" name="idea_id" value={row.ideaId}/><button className="primary-button rounded-xl px-4 py-2 text-xs font-black">Start review</button></ActionForm>
              ) : (
                <Link href={`/professor/ideas/${row.ideaId}?course=${courseId}`} className="inline-flex rounded-xl border border-emerald-950/10 bg-white px-4 py-2 text-xs font-black">Open</Link>
              )}
            </div>
          </div>
        ))}
        {!reviewable.length && <div className="surface rounded-[26px] p-6 text-sm text-stone-500">No submitted ideas yet.</div>}
      </div>
    </div></main>
  );
}
