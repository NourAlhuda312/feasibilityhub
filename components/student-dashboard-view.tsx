import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import type { GroupMember, IdeaStatus } from "@/lib/types";

export function StudentDashboardView({
  courseId,
  courseCode,
  semester,
  groupNumber,
  members,
  ideaTitle,
  ideaDescription,
  status,
  feedback,
  preview = false,
}: {
  courseId: string;
  courseCode: string;
  semester: string;
  groupNumber?: number;
  members: GroupMember[];
  ideaTitle?: string;
  ideaDescription?: string;
  status: IdeaStatus | "not_submitted";
  feedback?: string;
  preview?: boolean;
}) {
  const dashboardHref = preview ? "/preview/student" : `/student/dashboard?course=${courseId}`;
  const groupHref = preview ? "/preview/student/group" : `/student/group?course=${courseId}`;
  const ideaHref = preview ? "/preview/student/idea" : `/student/idea?course=${courseId}`;
  const locked = status === "in_review" || status === "approved";

  const nextStep = !groupNumber
    ? { title: "Create or join your group", text: "Start the team first. One student creates it, then adds classmates or shares a private invite link.", href: groupHref, label: "Set up group" }
    : status === "not_submitted"
      ? { title: "Submit your business idea", text: "The group leader submits the idea name and quick description for the whole team.", href: ideaHref, label: "Submit idea" }
      : status === "submitted"
        ? { title: "Submitted — waiting for review", text: "The leader can still correct the submission until course staff starts reviewing it.", href: ideaHref, label: "View submission" }
        : status === "in_review"
          ? { title: "Your idea is being reviewed", text: "Editing is locked while the professor reviews this revision. Wait for approval or a request for changes.", href: ideaHref, label: "View locked submission" }
          : status === "changes_requested"
            ? { title: "Changes requested", text: "Read the feedback, revise the idea, and submit a new revision. Only the group leader can resubmit.", href: ideaHref, label: "Revise idea" }
            : { title: "Idea approved", text: "Your team is ready for the next feasibility stage when the professor opens it.", href: ideaHref, label: "View approved idea" };

  return (
    <AppShell
      courseCode={courseCode}
      semester={semester}
      userLabel={preview ? "Preview Student" : "Student"}
      roleLabel="Student workspace"
      homeHref={dashboardHref}
      nav={[
        { label: "My project", href: dashboardHref, active: true },
        { label: "My group", href: groupHref },
        { label: "Business idea", href: ideaHref },
      ]}
    >
      <div className="mx-auto max-w-6xl p-5 lg:p-8">
        {preview && <div className="mb-5 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"><strong>Interactive preview:</strong> demo actions are stored only in your browser.</div>}

        <section className="grid gap-5 lg:grid-cols-[1fr_330px]">
          <div className="rounded-[34px] bg-[#173f2c] p-6 text-white lg:p-8">
            <div className="text-xs font-bold uppercase tracking-[.17em] text-emerald-200">Your feasibility project</div>
            <h1 className="mt-4 text-3xl font-black tracking-[-.04em] sm:text-4xl">{nextStep.title}</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50/75">{nextStep.text}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={nextStep.href} className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#173f2c]">{nextStep.label}</Link>
              <Link href={groupHref} className="rounded-2xl border border-white/25 px-5 py-3 text-sm font-black text-white">Manage group</Link>
            </div>
          </div>
          <div className="rounded-[34px] border border-emerald-950/10 bg-white p-6">
            <div className="text-xs font-black uppercase tracking-[.14em] text-stone-500">Current status</div>
            <div className="mt-5"><StatusBadge status={status} /></div>
            <div className="mt-6 text-sm font-black">{ideaTitle || "No idea submitted yet"}</div>
            <p className="mt-2 text-xs leading-5 text-stone-500">{ideaDescription || "Create your group, then submit the business idea name and quick description."}</p>
            {locked && <div className="mt-5 rounded-2xl bg-[#f1f2e8] p-3 text-xs font-bold leading-5 text-stone-600">{status === "in_review" ? "Editing is locked while this revision is under review." : "This approved idea is locked."}</div>}
          </div>
        </section>

        <section className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="surface rounded-[30px] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-black uppercase tracking-[.14em] text-stone-500">Group</div>
                <div className="mt-2 text-2xl font-black">{groupNumber ? `Group #${groupNumber}` : "No group yet"}</div>
              </div>
              <div className="rounded-2xl bg-[#e7f4ff] px-3 py-2 text-xs font-black text-sky-800">{members.length}/3 members</div>
            </div>
            <div className="mt-5 space-y-2">
              {members.length ? members.map((member) => (
                <div key={member.userId} className="flex items-center justify-between rounded-2xl bg-[#f7f8f4] px-4 py-3 text-sm">
                  <span className="font-bold">{member.fullName}</span>
                  {member.isLeader && <span className="text-[10px] font-black uppercase tracking-[.12em] text-[#1f7a52]">Leader</span>}
                </div>
              )) : <div className="rounded-2xl bg-[#f7f8f4] px-4 py-4 text-sm text-stone-500">Create a group or join one using a classmate&apos;s invite.</div>}
            </div>
            <Link href={groupHref} className="mt-5 block rounded-2xl border border-emerald-950/10 bg-white px-4 py-3 text-center text-sm font-black">Open group settings</Link>
          </div>

          <div className="surface rounded-[30px] p-6">
            <div className="text-xs font-black uppercase tracking-[.14em] text-stone-500">Professor feedback</div>
            <div className="mt-3 text-xl font-black">{status === "changes_requested" ? "A revision is waiting for your team." : status === "approved" ? "Your idea is approved." : status === "in_review" ? "Review in progress." : "Feedback appears here."}</div>
            <p className="mt-3 text-sm leading-6 text-stone-600">{feedback || "Once course staff reviews your submission, feedback and the required next action will appear here."}</p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
