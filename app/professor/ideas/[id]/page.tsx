import { ActionForm } from "@/components/action-form";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { requireCourseRole } from "@/lib/auth";
import { reviewIdea, startReview } from "@/lib/actions/ideas";

export default async function IdeaReviewPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await params;
  const query = await searchParams;
  const courseId = typeof query.course === "string" ? query.course : "";
  const error = typeof query.error === "string" ? query.error : undefined;
  const { supabase } = await requireCourseRole(courseId, ["professor", "admin", "assistant"]);
  const { data: idea } = await supabase.from("ideas").select("id, group_id, status, current_revision, groups!inner(group_number, course_id)").eq("id", id).maybeSingle();
  if (!idea || (idea as any).groups.course_id !== courseId) notFound();
  const [{ data: revision }, { data: members }, { data: reviews }] = await Promise.all([
    supabase.from("idea_revisions").select("id, title, quick_description, revision_number, created_at").eq("idea_id", id).eq("revision_number", idea.current_revision).single(),
    supabase.from("group_members").select("profiles!group_members_user_id_fkey(full_name)").eq("group_id", idea.group_id),
    supabase.from("idea_reviews").select("decision, feedback, created_at, profiles!idea_reviews_reviewer_id_fkey(full_name)").eq("idea_id", id).order("created_at", { ascending: false }),
  ]);
  const names = (members || []).map((m: any) => m.profiles?.full_name || "Student").join(", ");
  const canDecide = idea.status === "in_review" || idea.status === "submitted";

  return (
    <main className="min-h-screen p-5 sm:p-8"><div className="mx-auto max-w-5xl">
      <Link href={`/professor/ideas?course=${courseId}`} className="text-sm font-black text-[#1f7a52]">← Review queue</Link>
      <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="surface rounded-[32px] p-7">
          <div className="flex flex-wrap items-center justify-between gap-3"><div className="text-xs font-black uppercase tracking-[.15em] text-stone-500">Group #{(idea as any).groups.group_number} · Revision {revision?.revision_number}</div><StatusBadge status={idea.status as any}/></div>
          <h1 className="mt-5 text-4xl font-black tracking-[-.05em]">{revision?.title}</h1>
          <div className="mt-3 text-sm font-bold text-stone-500">{names}</div>
          <div className="mt-7 rounded-[24px] bg-[#f7f8f4] p-6"><div className="text-xs font-black uppercase tracking-[.15em] text-stone-500">Quick description</div><p className="mt-3 whitespace-pre-wrap text-base leading-7 text-stone-700">{revision?.quick_description}</p></div>
        </div>
        <aside className="space-y-5">
          {idea.status === "submitted" ? (
            <ActionForm action={startReview} className="rounded-[32px] bg-[#173f2c] p-6 text-white">
              <input type="hidden" name="course_id" value={courseId}/><input type="hidden" name="idea_id" value={id}/>
              <div className="text-xs font-black uppercase tracking-[.15em] text-emerald-200">Before deciding</div>
              <div className="mt-3 text-xl font-black">Start the review</div>
              <p className="mt-2 text-sm leading-6 text-emerald-50/75">This locks student editing for the current revision and marks it In review.</p>
              <button className="mt-5 w-full rounded-2xl bg-white px-3 py-3 text-sm font-black text-[#173f2c]">Start review</button>
            </ActionForm>
          ) : canDecide ? (
            <ActionForm action={reviewIdea} className="rounded-[32px] bg-[#173f2c] p-6 text-white">
              <input type="hidden" name="course_id" value={courseId}/><input type="hidden" name="idea_id" value={id}/>
              <div className="text-xs font-black uppercase tracking-[.15em] text-emerald-200">Decision</div>
              {error && <div className="mt-4 rounded-2xl bg-rose-100 px-3 py-2 text-xs font-bold text-rose-900">{error}</div>}
              <textarea name="feedback" rows={5} placeholder="Feedback for the team..." className="mt-5 w-full rounded-2xl border border-white/20 bg-white p-4 text-sm text-[#17211b] outline-none placeholder:text-stone-400"/>
              <div className="mt-3 grid grid-cols-2 gap-2"><button name="decision" value="request_changes" className="rounded-2xl border border-white/25 px-3 py-3 text-sm font-black text-white">Request changes</button><button name="decision" value="approve" className="rounded-2xl bg-white px-3 py-3 text-sm font-black text-[#173f2c]">Approve</button></div>
            </ActionForm>
          ) : (
            <div className="surface rounded-[32px] p-6"><div className="text-sm font-black">Review complete</div><p className="mt-2 text-sm leading-6 text-stone-500">This revision is currently {idea.status === "approved" ? "approved" : "waiting for the student team to submit changes"}.</p></div>
          )}
          <div className="surface rounded-[28px] p-5"><div className="text-sm font-black">Review history</div><div className="mt-4 space-y-3">{(reviews || []).map((r: any, i) => <div key={i} className="rounded-2xl bg-[#f7f8f4] p-3 text-xs"><div className="font-black">{r.decision === 'approve' ? 'Approved' : 'Changes requested'}</div><div className="mt-1 text-stone-500">{r.feedback || 'No feedback'} · {r.profiles?.full_name || 'Staff'}</div></div>)}</div></div>
        </aside>
      </section>
    </div></main>
  );
}
