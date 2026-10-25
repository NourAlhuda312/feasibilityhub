"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/status-badge";
import { useDemoState } from "@/lib/demo-state";

export default function PreviewReviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { state, setState, reset } = useDemoState();
  const [feedback, setFeedback] = useState("");
  const [validation, setValidation] = useState("");
  const group = useMemo(() => state.groups.find((g) => g.idea?.id === params.id), [state, params.id]);
  const idea = group?.idea;
const groupId = group?.id;
  if (!group || !idea) return <main className="p-8"><Link href="/preview/professor" className="font-black text-[#1f7a52]">← Professor dashboard</Link><div className="mt-6">Demo idea not found.</div></main>;

  function startReview() {
    setValidation("");
    setState((current) => ({ ...current, groups: current.groups.map((g) => g.id === groupId && g.idea ? { ...g, idea: { ...g.idea, status: "in_review" } } : g) }));
  }
  function decide(decision: "approved" | "changes_requested") {
    if (decision === "changes_requested" && feedback.trim().length < 3) { setValidation("Add feedback before requesting changes."); return; }
    setValidation("");
    setState((current) => ({ ...current, groups: current.groups.map((g) => g.id === groupId && g.idea ? { ...g, idea: { ...g.idea, status: decision, feedback: decision === "changes_requested" ? feedback.trim() : feedback.trim() || undefined } } : g) }));
    router.push("/preview/professor");
  }

  return <main className="min-h-screen p-5 sm:p-8"><div className="mx-auto max-w-5xl">
    <div className="flex items-center justify-between gap-4"><Link href="/preview/professor" className="text-sm font-black text-[#1f7a52]">← Professor dashboard</Link><button onClick={reset} className="rounded-xl border border-emerald-950/10 bg-white px-3 py-2 text-xs font-black">Reset demo</button></div>
    <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
      <div className="surface rounded-[32px] p-7"><div className="flex items-center justify-between gap-4"><div className="text-xs font-black uppercase tracking-[.15em] text-stone-500">Group #{group.number} · Revision {idea.revision}</div><StatusBadge status={idea.status}/></div><h1 className="mt-5 text-4xl font-black tracking-[-.05em]">{idea.title}</h1><div className="mt-3 text-sm font-bold text-stone-500">{group.members.map((m) => m.name).join(", ")}</div><div className="mt-7 rounded-[24px] bg-[#f7f8f4] p-6"><div className="text-xs font-black uppercase tracking-[.15em] text-stone-500">Quick description</div><p className="mt-3 text-base leading-7 text-stone-700">{idea.description}</p></div></div>
      <aside>
        {idea.status === "submitted" ? <div className="rounded-[32px] bg-[#173f2c] p-6 text-white"><div className="text-xs font-black uppercase tracking-[.15em] text-emerald-200">Review workflow</div><h2 className="mt-3 text-xl font-black">Start reviewing this revision</h2><p className="mt-2 text-sm leading-6 text-emerald-50/75">The student&apos;s edit form will immediately lock and show In review.</p><button onClick={startReview} className="mt-5 w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#173f2c]">Start review</button></div> : idea.status === "in_review" ? <div className="rounded-[32px] bg-[#173f2c] p-6 text-white"><div className="text-xs font-black uppercase tracking-[.15em] text-emerald-200">Decision</div>{validation && <div className="mt-4 rounded-2xl bg-rose-100 px-3 py-2 text-xs font-bold text-rose-900">{validation}</div>}<textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={5} placeholder="Feedback for the team..." className="mt-5 w-full rounded-2xl bg-white p-4 text-sm text-[#17211b] outline-none"/><div className="mt-3 grid grid-cols-2 gap-2"><button onClick={() => decide("changes_requested")} className="rounded-2xl border border-white/25 px-3 py-3 text-sm font-black text-white">Request changes</button><button onClick={() => decide("approved")} className="rounded-2xl bg-white px-3 py-3 text-sm font-black text-[#173f2c]">Approve</button></div></div> : <div className="surface rounded-[32px] p-6"><div className="text-sm font-black">Current outcome</div><p className="mt-2 text-sm leading-6 text-stone-500">{idea.status === "approved" ? "This demo idea is approved." : "Changes were requested. Open Student Preview to edit and resubmit."}</p>{idea.feedback && <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">{idea.feedback}</div>}</div>}
      </aside>
    </section>
  </div></main>;
}
