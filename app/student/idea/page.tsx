import Link from "next/link";
import { requireCourseRole } from "@/lib/auth";
import { submitIdea } from "@/lib/actions/ideas";
import { getCourse, getStudentWorkspace } from "@/lib/queries";
import { StatusBadge } from "@/components/status-badge";

export default async function StudentIdeaPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = await searchParams;
  const courseId = typeof q.course === "string" ? q.course : "";
  const error = typeof q.error === "string" ? q.error : undefined;
  const { user } = await requireCourseRole(courseId, ["student"]);
  const [course, workspace] = await Promise.all([getCourse(courseId), getStudentWorkspace(courseId, user.id)]);
  const isLeader = workspace.group?.leader_id === user.id;
  const status = workspace.idea?.status || "not_submitted";
  const editable = Boolean(isLeader && workspace.group && !["in_review", "approved"].includes(status));

  return (
    <main className="min-h-screen p-5 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <Link href={`/student/dashboard?course=${courseId}`} className="text-sm font-black text-[#1f7a52]">← My project</Link>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-black uppercase tracking-[.15em] text-stone-500">{course.code} · {course.semesterName}</div>
            <h1 className="mt-2 text-4xl font-black tracking-[-.05em]">Business idea</h1>
          </div>
          <StatusBadge status={status}/>
        </div>

        {error && <div className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">{error}</div>}

        {!workspace.group && (
          <div className="surface mt-7 rounded-[30px] p-6 text-sm text-stone-600">Create or join a group before submitting an idea. <Link className="font-black text-[#1f7a52]" href={`/student/group?course=${courseId}`}>Go to group setup →</Link></div>
        )}

        {workspace.group && !isLeader && (
          <div className="surface mt-7 rounded-[30px] p-6 text-sm leading-6 text-stone-600">Only the current group leader can submit or revise the idea. Leadership can be transferred from the group page. You can still view the current submission and feedback here.</div>
        )}

        {workspace.group && status === "in_review" && (
          <div className="mt-7 rounded-[30px] border border-violet-200 bg-violet-50 p-6">
            <div className="text-sm font-black text-violet-900">Idea under review</div>
            <p className="mt-2 text-sm leading-6 text-violet-800">Course staff started reviewing this revision, so editing is temporarily locked. It will unlock only if changes are requested.</p>
          </div>
        )}

        {workspace.group && status === "approved" && (
          <div className="mt-7 rounded-[30px] bg-emerald-100 p-6 text-sm font-bold text-emerald-900">This idea is approved. Editing is locked.</div>
        )}

        {workspace.idea && !editable && (
          <section className="surface mt-5 rounded-[32px] p-7">
            <div className="text-xs font-black uppercase tracking-[.14em] text-stone-500">Current submission</div>
            <h2 className="mt-3 text-2xl font-black">{workspace.idea.title}</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-stone-600">{workspace.idea.quickDescription}</p>
            {workspace.feedback && <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900"><strong>Latest feedback:</strong> {workspace.feedback}</div>}
          </section>
        )}

        {editable && (
          <form action={submitIdea} className="surface mt-7 rounded-[32px] p-7">
            <input type="hidden" name="course_id" value={courseId}/>
            {status === "changes_requested" && workspace.feedback && <div className="mb-6 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900"><strong>Professor feedback:</strong> {workspace.feedback}</div>}
            <label className="block text-sm font-black">Name of the idea
              <input required name="title" defaultValue={workspace.idea?.title || ""} placeholder="e.g. CoCompass" className="focus-ring mt-2 w-full rounded-2xl border border-emerald-950/15 bg-white px-4 py-3 outline-none"/>
            </label>
            <label className="mt-5 block text-sm font-black">Quick description
              <textarea required minLength={20} rows={7} name="quick_description" defaultValue={workspace.idea?.quickDescription || ""} placeholder="Briefly describe the business idea, the problem it solves, and who it serves..." className="focus-ring mt-2 w-full resize-y rounded-2xl border border-emerald-950/15 bg-white p-4 leading-6 outline-none"/>
            </label>
            <div className="mt-5 rounded-2xl bg-[#f1f2e8] p-4 text-xs leading-5 text-stone-600">Each submission creates a new revision. Once a professor starts reviewing, this form locks until they request changes.</div>
            <button className="primary-button mt-5 rounded-2xl px-6 py-3 text-sm font-black">{status === "changes_requested" ? "Submit revised idea" : "Submit for review"}</button>
          </form>
        )}
      </div>
    </main>
  );
}
