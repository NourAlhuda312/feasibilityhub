import { ActionForm } from "@/components/action-form";
import Link from "next/link";
import { requireCourseRole } from "@/lib/auth";
import { addCourseStaff } from "@/lib/actions/courses";
import { getCourse } from "@/lib/queries";

export default async function TeamPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = await searchParams;
  const courseId = typeof q.course === "string" ? q.course : "";
  const error = typeof q.error === "string" ? q.error : undefined;
  const message = typeof q.message === "string" ? q.message : undefined;
  const { supabase, role } = await requireCourseRole(courseId, ["professor", "admin", "assistant"]);
  const course = await getCourse(courseId);
  const { data } = await supabase.from("course_memberships").select("role, user_id, profiles!course_memberships_user_id_fkey(full_name,email)").eq("course_id", courseId).in("role", ["professor", "admin", "assistant"]);
  const canManage = role === "professor" || role === "admin";

  return <main className="min-h-screen p-5 sm:p-8"><div className="mx-auto max-w-5xl">
    <Link href={`/professor/dashboard?course=${courseId}`} className="text-sm font-black text-[#1f7a52]">← Dashboard</Link>
    <div className="mt-6"><div className="text-xs font-black uppercase tracking-[.15em] text-stone-500">{course.code} · {course.semesterName}</div><h1 className="mt-2 text-4xl font-black tracking-[-.05em]">Course team</h1><p className="mt-2 text-sm text-stone-500">Roles apply only to this course. A user can be Student elsewhere and Professor, Admin, or Assistant here.</p></div>
    {error && <div className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">{error}</div>}{message && <div className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900">{message}</div>}
    <section className="mt-7 grid gap-4 md:grid-cols-2">{(data || []).map((m: any) => <div key={m.user_id} className="surface rounded-[26px] p-5"><div className="flex items-start justify-between gap-3"><div><div className="font-black">{m.profiles?.full_name || 'Staff'}</div><div className="mt-1 text-xs text-stone-500">{m.profiles?.email}</div></div><span className="rounded-full bg-[#edf2ec] px-3 py-1 text-xs font-black capitalize text-[#173f2c]">{m.role}</span></div></div>)}</section>
    {canManage && <ActionForm action={addCourseStaff} className="mt-7 rounded-[30px] bg-[#173f2c] p-6 text-white"><input type="hidden" name="course_id" value={courseId}/><div className="text-xl font-black">Add course staff</div><p className="mt-1 text-xs text-emerald-50/75">The person creates an account first. Then add their email and choose the course-specific role.</p><div className="mt-5 grid gap-3 md:grid-cols-[1fr_180px_auto]"><input required type="email" name="email" placeholder="staff@example.edu" className="rounded-2xl border border-white/20 bg-white px-4 py-3 text-sm text-[#17211b] outline-none"/><select name="role" className="rounded-2xl border border-white/20 bg-white px-4 py-3 text-sm font-bold text-[#17211b]"><option value="assistant">Assistant</option><option value="admin">Admin</option><option value="professor">Professor</option></select><button className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#173f2c]">Add</button></div></ActionForm>}
  </div></main>;
}
