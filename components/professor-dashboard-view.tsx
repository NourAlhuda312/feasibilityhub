import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { startReview } from "@/lib/actions/ideas";
import type { IdeaTableRow } from "@/lib/types";

export function ProfessorDashboardView({
  courseId,
  courseCode,
  courseTitle,
  semester,
  rows,
  preview = false,
}: {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  semester: string;
  rows: IdeaTableRow[];
  preview?: boolean;
}) {
  const approved = rows.filter((r) => r.status === "approved").length;
  const submitted = rows.filter((r) => r.status === "submitted").length;
  const inReview = rows.filter((r) => r.status === "in_review").length;
  const changes = rows.filter((r) => r.status === "changes_requested").length;
  const completion = rows.length ? Math.round((rows.filter((r) => r.status !== "not_submitted").length / rows.length) * 100) : 0;
  const dashboardHref = preview ? "/preview/professor" : `/professor/dashboard?course=${courseId}`;

  return (
    <AppShell
      courseCode={courseCode}
      semester={semester}
      userLabel={preview ? "Preview Professor" : "Professor"}
      roleLabel="Professor workspace"
      homeHref={dashboardHref}
      nav={[
        { label: "Overview", href: dashboardHref, active: true },
        { label: "Groups", href: preview ? "/preview/professor/groups" : `/professor/groups?course=${courseId}` },
        { label: "Idea reviews", href: preview ? "/preview/professor/ideas" : `/professor/ideas?course=${courseId}`, badge: String(submitted + inReview) },
        { label: "Course team", href: preview ? "/preview/professor/team" : `/professor/team?course=${courseId}` },
        { label: "Settings", href: preview ? "/preview/professor/settings" : `/professor/settings?course=${courseId}` },
      ]}
    >
      <div className="mx-auto max-w-[1500px] p-5 lg:p-8">
        {preview && (
          <div className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <span><strong>Interactive preview:</strong> use the review buttons to test the professor workflow before Supabase setup.</span>
            <Link href="/" className="font-black underline">Exit preview</Link>
          </div>
        )}

        <section className="rounded-[34px] bg-[#173f2c] p-6 text-white shadow-xl shadow-emerald-950/10 lg:p-8">
          <div className="grid gap-8 xl:grid-cols-[1fr_auto] xl:items-end">
            <div>
              <div className="inline-flex rounded-full border border-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[.16em] text-emerald-100">{semester}</div>
              <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-[-.04em] sm:text-4xl">Your course is moving.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/75">{courseTitle} · review ideas, spot groups that need attention, manage the course team, and export the semester whenever needed.</p>
            </div>
            <div className="grid min-w-[290px] grid-cols-2 gap-3">
              <a href={preview ? "/preview/professor/settings" : `/api/export/${courseId}?format=xlsx`} className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-black text-[#173f2c]">Export Excel</a>
              <a href={preview ? "/preview/professor/settings" : `/api/export/${courseId}?format=csv`} className="rounded-2xl border border-white/25 px-4 py-3 text-center text-sm font-black text-white">Export CSV</a>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            ["Groups", rows.length, "This semester", "bg-white"],
            ["Submitted", submitted, "Waiting to start", "bg-blue-50"],
            ["In review", inReview, "Locked for students", "bg-violet-50"],
            ["Changes", changes, "Returned to teams", "bg-amber-50"],
            ["Approved", approved, "Ready to continue", "bg-emerald-50"],
          ].map(([label, value, sub, tone]) => (
            <div key={String(label)} className={`rounded-[28px] border border-emerald-950/10 p-5 ${tone}`}>
              <div className="text-xs font-black uppercase tracking-[.14em] text-stone-500">{label}</div>
              <div className="mt-4 text-4xl font-black tracking-[-.05em]">{value}</div>
              <div className="mt-2 text-xs text-stone-500">{sub}</div>
            </div>
          ))}
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_340px]">
          <div className="surface overflow-hidden rounded-[30px]">
            <div className="flex flex-col gap-4 border-b border-emerald-950/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-lg font-black">Idea pipeline</div>
                <div className="mt-1 text-xs text-stone-500">The spreadsheet view, with a controlled review workflow.</div>
              </div>
              <div className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-bold text-stone-600">{completion}% submitted</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[940px] text-left text-sm">
                <thead className="bg-stone-50 text-[11px] uppercase tracking-[.12em] text-stone-500">
                  <tr><th className="px-5 py-3">Group</th><th className="px-5 py-3">Members</th><th className="px-5 py-3">Business idea</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-emerald-950/7">
                  {rows.map((row) => (
                    <tr key={row.groupNumber} className="bg-white transition hover:bg-[#fafbf8]">
                      <td className="px-5 py-4 font-black">#{row.groupNumber}</td>
                      <td className="px-5 py-4 text-stone-600">{row.groupMembers}</td>
                      <td className="max-w-[330px] px-5 py-4"><div className="font-black">{row.ideaName}</div><div className="mt-1 line-clamp-1 text-xs text-stone-500">{row.quickDescription}</div></td>
                      <td className="px-5 py-4"><StatusBadge status={row.status} /></td>
                      <td className="px-5 py-4 text-right">
                        {!row.ideaId ? <span className="text-xs font-bold text-stone-400">No submission</span> : preview ? (
                          <Link href={`/preview/professor/review/${row.ideaId}`} className="inline-flex rounded-xl bg-[#173f2c] px-3 py-2 text-xs font-black text-white">{row.status === "submitted" ? "Start review" : "Open"}</Link>
                        ) : row.status === "submitted" ? (
                          <form action={startReview} className="inline-block"><input type="hidden" name="course_id" value={courseId}/><input type="hidden" name="idea_id" value={row.ideaId}/><button className="rounded-xl bg-[#173f2c] px-3 py-2 text-xs font-black text-white">Start review</button></form>
                        ) : (
                          <Link href={`/professor/ideas/${row.ideaId}?course=${courseId}`} className="inline-flex rounded-xl border border-emerald-950/10 bg-white px-3 py-2 text-xs font-black text-[#173f2c]">Open</Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-[30px] border border-emerald-950/10 bg-[#edf2ec] p-6">
              <div className="text-xs font-black uppercase tracking-[.16em] text-[#43603c]">Today&apos;s focus</div>
              <div className="mt-4 text-2xl font-black tracking-[-.04em] text-[#173f2c]">Clear the review queue.</div>
              <p className="mt-2 text-sm leading-6 text-[#43603c]">Start the {submitted} waiting {submitted === 1 ? "review" : "reviews"}. Starting a review locks that revision for the student team.</p>
            </div>
            <div className="surface rounded-[30px] p-6">
              <div className="text-sm font-black">Course staff</div>
              <p className="mt-2 text-xs leading-5 text-stone-500">Professor and Admin can add co-professors, admins, or assistants. Roles apply only to this course.</p>
              <Link href={preview ? "/preview/professor/team" : `/professor/team?course=${courseId}`} className="mt-5 block rounded-2xl border border-emerald-950/10 bg-white px-4 py-3 text-center text-sm font-black">Manage team</Link>
            </div>
          </aside>
        </section>
      </div>
    </AppShell>
  );
}
