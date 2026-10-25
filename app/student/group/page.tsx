import Link from "next/link";
import { requireCourseRole } from "@/lib/auth";
import { addGroupMemberByEmail, createGroup, createGroupInvite, removeGroupMember, transferGroupLeadership } from "@/lib/actions/groups";
import { getCourse, getStudentWorkspace } from "@/lib/queries";

export default async function StudentGroupPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = await searchParams;
  const courseId = typeof q.course === "string" ? q.course : "";
  const error = typeof q.error === "string" ? q.error : undefined;
  const message = typeof q.message === "string" ? q.message : undefined;
  const invite = typeof q.invite === "string" ? q.invite : undefined;
  const inviteFor = typeof q.inviteFor === "string" ? q.inviteFor : undefined;
  const { user } = await requireCourseRole(courseId, ["student"]);
  const [course, workspace] = await Promise.all([getCourse(courseId), getStudentWorkspace(courseId, user.id)]);
  const isLeader = workspace.group?.leader_id === user.id;

  return (
    <main className="min-h-screen p-5 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <Link href={`/student/dashboard?course=${courseId}`} className="text-sm font-black text-[#1f7a52]">← My project</Link>
        <div className="mt-6">
          <div className="text-xs font-black uppercase tracking-[.15em] text-stone-500">{course.code} · {course.semesterName}</div>
          <h1 className="mt-2 text-4xl font-black tracking-[-.05em]">Your group</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">One student creates the group. The leader can add enrolled classmates by email or generate a private link. Leadership can be transferred later.</p>
        </div>

        {error && <div className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">{error}</div>}
        {message && <div className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900">{message}</div>}

        {!workspace.group ? (
          <section className="mt-7 rounded-[34px] bg-[#173f2c] p-7 text-white">
            <div className="text-xs font-black uppercase tracking-[.15em] text-emerald-200">Step 1</div>
            <h2 className="mt-3 text-3xl font-black">Create your project group.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50/75">The creator becomes the first leader. After creation, you can add up to two classmates or share a private group invitation.</p>
            <form action={createGroup} className="mt-6">
              <input type="hidden" name="course_id" value={courseId}/>
              <button className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#173f2c]">Create my group</button>
            </form>
          </section>
        ) : (
          <>
            <section className="surface mt-7 rounded-[30px] p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-[.15em] text-stone-500">Group number</div>
                  <div className="mt-2 text-4xl font-black">#{workspace.group.group_number}</div>
                </div>
                <div className="rounded-2xl bg-[#e7f4ff] px-3 py-2 text-xs font-black text-sky-800">{workspace.members.length}/3 members</div>
              </div>

              <div className="mt-6 space-y-3">
                {workspace.members.map((member) => (
                  <div key={member.userId} className="flex flex-col gap-3 rounded-2xl bg-[#f7f8f4] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="font-black">{member.fullName}</div>
                      <div className="mt-1 text-xs text-stone-500">{member.email || "Student"}</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {member.isLeader && <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-[.12em] text-emerald-900">Leader</span>}
                      {isLeader && !member.isLeader && (
                        <>
                          <form action={transferGroupLeadership}>
                            <input type="hidden" name="course_id" value={courseId}/><input type="hidden" name="new_leader_id" value={member.userId}/>
                            <button className="rounded-xl border border-emerald-950/10 bg-white px-3 py-2 text-xs font-black">Make leader</button>
                          </form>
                          <form action={removeGroupMember}>
                            <input type="hidden" name="course_id" value={courseId}/><input type="hidden" name="member_id" value={member.userId}/>
                            <button className="rounded-xl danger-button border border-rose-200 bg-white px-3 py-2 text-xs font-black text-rose-700">Remove</button>
                          </form>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {!isLeader && <div className="mt-5 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-900">You are a group member. The current leader manages invitations and idea submissions. The leader can transfer leadership to you at any time.</div>}
            </section>

            {isLeader && workspace.members.length < 3 && (
              <section className="mt-5 grid gap-5 lg:grid-cols-2">
                <div className="surface rounded-[30px] p-6">
                  <div className="text-xs font-black uppercase tracking-[.14em] text-[#1f7a52]">Fast option</div>
                  <div className="mt-2 text-xl font-black">Add an enrolled classmate</div>
                  <p className="mt-2 text-sm leading-6 text-stone-500">If your classmate already created an account and joined this course, add their exact email directly.</p>
                  <form action={addGroupMemberByEmail} className="mt-5 space-y-3">
                    <input type="hidden" name="course_id" value={courseId}/>
                    <input required type="email" name="email" placeholder="classmate@example.edu" className="focus-ring w-full rounded-2xl border border-emerald-950/15 bg-white px-4 py-3 text-sm outline-none" />
                    <button className="primary-button w-full rounded-2xl px-5 py-3 text-sm font-black">Add classmate</button>
                  </form>
                </div>

                <div className="surface rounded-[30px] p-6">
                  <div className="text-xs font-black uppercase tracking-[.14em] text-[#1f7a52]">Share option</div>
                  <div className="mt-2 text-xl font-black">Create a private invite link</div>
                  <p className="mt-2 text-sm leading-6 text-stone-500">Generate a general link, or optionally bind it to one email. The student must be enrolled in the course before joining the group.</p>
                  {invite && <div className="mt-4 rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black text-emerald-900">{inviteFor ? `Invite for ${inviteFor}` : "Share this invite"}</div><div className="mt-2 break-all text-xs font-bold text-emerald-900">{invite}</div></div>}
                  <form action={createGroupInvite} className="mt-5 space-y-3">
                    <input type="hidden" name="course_id" value={courseId}/>
                    <input type="email" name="invited_email" placeholder="Optional: restrict to one email" className="focus-ring w-full rounded-2xl border border-emerald-950/15 bg-white px-4 py-3 text-sm outline-none" />
                    <button className="primary-button w-full rounded-2xl px-5 py-3 text-sm font-black">Generate invite link</button>
                  </form>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
