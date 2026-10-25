import { ActionForm } from "@/components/action-form";
import Link from "next/link";
import { requireCourseRole } from "@/lib/auth";
import { createCourseInvite } from "@/lib/actions/courses";
import { getCourse } from "@/lib/queries";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = await searchParams;
  const courseId = typeof q.course === "string" ? q.course : "";
  const invite = typeof q.invite === "string" ? q.invite : undefined;
  const error = typeof q.error === "string" ? q.error : undefined;
  const { role } = await requireCourseRole(courseId, ["professor", "admin", "assistant"]);
  const course = await getCourse(courseId);
  const canManage = role === "professor" || role === "admin";

  return (
    <main className="min-h-screen p-5 sm:p-8"><div className="mx-auto max-w-4xl">
      <Link href={`/professor/dashboard?course=${courseId}`} className="text-sm font-black text-[#1f7a52]">← Dashboard</Link>
      <div className="mt-6"><div className="text-xs font-black uppercase tracking-[.15em] text-stone-500">Course settings</div><h1 className="mt-2 text-4xl font-black tracking-[-.05em]">{course.code} · {course.semesterName}</h1></div>
      {error && <div className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">{error}</div>}

      <section className="surface mt-7 rounded-[30px] p-6">
        <div className="text-xs font-black uppercase tracking-[.14em] text-[#1f7a52]">Student access</div>
        <div className="mt-2 text-xl font-black">Course join code</div>
        <p className="mt-2 text-sm leading-6 text-stone-500">Students sign in, enter this code from their dashboard, and join the course as Student.</p>
        <div className="mt-5 inline-flex rounded-2xl bg-[#173f2c] px-5 py-3 font-black tracking-[.12em] text-white">{course.joinCode}</div>
      </section>

      <section className="surface mt-5 rounded-[30px] p-6">
        <div className="text-xl font-black">Shareable course invitation</div>
        <p className="mt-2 text-sm leading-6 text-stone-500">Use a direct link when that is easier than typing the course code. Staff roles are assigned separately.</p>
        {invite && <div className="mt-5 break-all rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-900">{invite}</div>}
        {canManage && <ActionForm action={createCourseInvite} className="mt-5"><input type="hidden" name="course_id" value={courseId}/><button className="primary-button rounded-2xl px-5 py-3 text-sm font-black">Generate new invite link</button></ActionForm>}
      </section>

      <section className="mt-5 rounded-[30px] border border-emerald-950/10 bg-white p-6">
        <div className="text-xl font-black">Exports</div>
        <p className="mt-2 text-sm text-stone-500">Download Group Number, Group Members, Name of the Idea, Quick Description, and Status.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a href={`/api/export/${courseId}?format=xlsx`} className="primary-button rounded-2xl px-5 py-3 text-sm font-black">Excel (.xlsx)</a>
          <a href={`/api/export/${courseId}?format=csv`} className="rounded-2xl border border-emerald-950/15 bg-white px-5 py-3 text-sm font-black">CSV</a>
        </div>
      </section>
    </div></main>
  );
}
