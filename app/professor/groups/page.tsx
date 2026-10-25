import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { requireCourseRole } from "@/lib/auth";
import { getCourse, getProfessorRows } from "@/lib/queries";

export default async function GroupsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const courseId = typeof params.course === "string" ? params.course : "";
  await requireCourseRole(courseId, ["professor", "admin", "assistant"]);
  const [course, rows] = await Promise.all([getCourse(courseId), getProfessorRows(courseId)]);
  return (
    <main className="min-h-screen p-5 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <Link href={`/professor/dashboard?course=${courseId}`} className="text-sm font-black text-[#1f7a52]">← Dashboard</Link>
        <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><div className="text-xs font-black uppercase tracking-[.15em] text-stone-500">{course.semesterName} · {course.code}</div><h1 className="mt-2 text-4xl font-black tracking-[-.05em]">Student groups</h1></div>
          <div className="rounded-full bg-white px-4 py-2 text-sm font-black shadow-sm">{rows.length} groups</div>
        </div>
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {rows.map((row) => (
            <article key={row.groupNumber} className="surface rounded-[28px] p-6">
              <div className="flex items-start justify-between gap-4"><div className="text-3xl font-black">#{row.groupNumber}</div><StatusBadge status={row.status}/></div>
              <div className="mt-5 text-sm font-black">{row.groupMembers}</div>
              <div className="mt-4 rounded-2xl bg-white/80 p-4"><div className="text-sm font-black">{row.ideaName}</div><p className="mt-1 text-xs leading-5 text-stone-500">{row.quickDescription}</p></div>
              {row.ideaId && <Link href={`/professor/ideas/${row.ideaId}?course=${courseId}`} className="mt-5 inline-block text-sm font-black text-[#1f7a52]">Open submission →</Link>}
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
