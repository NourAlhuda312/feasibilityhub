import { ActionForm } from "@/components/action-form";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { requireUser, isPlatformAdminEmail } from "@/lib/auth";
import { getMyCourses } from "@/lib/queries";
import { createCourse, joinCourseByCode } from "@/lib/actions/courses";
import { roleLabel } from "@/lib/utils";
import { signOut } from "@/lib/actions/auth";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { user, supabase } = await requireUser();
  const courses = await getMyCourses();
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;
  const message = typeof params.message === "string" ? params.message : undefined;
  const { data: profile } = await supabase.from("profiles").select("can_create_courses").eq("id", user.id).maybeSingle();
  const canCreate = Boolean(profile?.can_create_courses) || isPlatformAdminEmail(user.email);

  return (
    <main className="min-h-screen p-5 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <Brand href="/dashboard" />
          <div className="flex items-center gap-3">
            <div className="text-right text-xs text-stone-500">Signed in as<br/><strong className="text-stone-800">{user.email}</strong></div>
            <ActionForm action={signOut}>
              <button className="rounded-2xl border border-emerald-950/10 bg-white px-4 py-2.5 text-xs font-black text-stone-700 transition hover:bg-stone-100">Log out</button>
            </ActionForm>
          </div>
        </div>

        <div className="mt-10">
          <div className="text-xs font-black uppercase tracking-[.16em] text-[#1f7a52]">Your workspace</div>
          <h1 className="mt-3 text-4xl font-black tracking-[-.05em]">Choose a course or join a new one.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">You do not choose Student or Professor at sign-in. Your role comes from each course, so one account can hold different responsibilities in different semesters.</p>
          {error && <div className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">{error}</div>}
          {message && <div className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900">{message}</div>}
          {canCreate && !process.env.SUPABASE_SECRET_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY && (
            <div className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">Server setup is almost complete: add SUPABASE_SECRET_KEY to .env.local before creating a course.</div>
          )}
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {courses.map((course) => {
            const staff = course.role !== "student";
            const href = staff ? `/professor/dashboard?course=${course.id}` : `/student/dashboard?course=${course.id}`;
            return (
              <Link key={course.id} href={href} className="surface group rounded-[30px] p-6 transition hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-2xl bg-[#173f2c] px-3 py-2 text-xs font-black text-white">{course.code}</div>
                  <div className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black text-stone-600">{roleLabel(course.role)}</div>
                </div>
                <div className="mt-6 text-2xl font-black tracking-[-.03em]">{course.title}</div>
                <div className="mt-2 text-sm text-stone-500">{course.semesterName}</div>
                <div className="mt-6 text-sm font-black text-[#1f7a52]">Open workspace →</div>
              </Link>
            );
          })}
          {!courses.length && <div className="surface rounded-[30px] p-7 text-sm leading-6 text-stone-600">You have not joined a course yet. Enter the course code from your professor below, or open a course invitation link.</div>}
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="surface rounded-[32px] p-7">
            <div className="text-xs font-black uppercase tracking-[.16em] text-[#1f7a52]">Students</div>
            <h2 className="mt-3 text-2xl font-black">Join by course code</h2>
            <p className="mt-2 text-sm leading-6 text-stone-500">Ask your professor for the course code. After joining, you can create or join one group inside that course.</p>
            <ActionForm action={joinCourseByCode} className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input required name="join_code" placeholder="e.g. BFS30-A1B2C3" className="focus-ring min-w-0 flex-1 rounded-2xl border border-emerald-950/15 bg-white px-4 py-3 text-sm font-bold uppercase outline-none" />
              <button className="primary-button rounded-2xl px-5 py-3 text-sm font-black">Join course</button>
            </ActionForm>
          </div>

          {canCreate ? (
            <div className="rounded-[32px] bg-[#173f2c] p-7 text-white">
              <div className="text-xs font-black uppercase tracking-[.16em] text-emerald-200">Faculty</div>
              <h2 className="mt-3 text-2xl font-black">Create a new course</h2>
              <p className="mt-2 text-sm leading-6 text-emerald-50/75">Create one workspace per academic semester. You become Professor for that course and receive a unique student join code.</p>
              <ActionForm action={createCourse} className="mt-6 grid gap-3 sm:grid-cols-2">
                <input required name="code" placeholder="Course code" className="rounded-2xl border border-white/20 bg-white px-4 py-3 text-sm font-bold text-[#17211b] outline-none" />
                <input required name="title" placeholder="Course title" className="rounded-2xl border border-white/20 bg-white px-4 py-3 text-sm font-bold text-[#17211b] outline-none" />
                <select name="term" className="rounded-2xl border border-white/20 bg-white px-4 py-3 text-sm font-bold text-[#17211b]"><option>Fall</option><option>Spring</option><option>Summer</option></select>
                <input required name="year" type="number" min="2020" max="2100" defaultValue="2026" className="rounded-2xl border border-white/20 bg-white px-4 py-3 text-sm font-bold text-[#17211b] outline-none"/>
                <button className="sm:col-span-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#173f2c]">Create course</button>
              </ActionForm>
            </div>
          ) : (
            <div className="surface rounded-[32px] p-7">
              <div className="text-xs font-black uppercase tracking-[.16em] text-stone-500">Faculty access</div>
              <h2 className="mt-3 text-2xl font-black">Course creation is permission-based.</h2>
              <p className="mt-2 text-sm leading-6 text-stone-500">Professor is not a self-selected sign-in mode. A platform administrator enables course creation for faculty accounts; once a professor creates a course, course-level roles are managed from that course.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
