"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { StatusBadge } from "@/components/status-badge";
import { useDemoState } from "@/lib/demo-state";

export default function PreviewStudentIdeaPage() {
  const { state, setState, reset } = useDemoState();
  const group = useMemo(() => state.groups.find((g) => g.members.some((m) => m.id === state.currentStudentId)), [state]);
  const isLeader = group?.leaderId === state.currentStudentId;
  const [title, setTitle] = useState(group?.idea?.title || "CoCompass");
  const [description, setDescription] = useState(group?.idea?.description || "");
  const status = group?.idea?.status || "not_submitted";
  const editable = Boolean(group && isLeader && !["in_review", "approved"].includes(status));

  useEffect(() => {
    if (group?.idea) {
      setTitle(group.idea.title);
      setDescription(group.idea.description);
    }
  }, [group?.idea?.title, group?.idea?.description, group?.idea?.revision]);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!group || !editable) return;
    setState((current) => ({ ...current, groups: current.groups.map((g) => g.id === group.id ? { ...g, idea: { id: g.idea?.id || "idea-cocompass", title, description, status: "submitted", revision: (g.idea?.revision || 0) + 1 } } : g) }));
  }

  return <main className="min-h-screen p-5 sm:p-8"><div className="mx-auto max-w-4xl">
    <div className="flex items-center justify-between gap-4"><Link href="/preview/student" className="text-sm font-black text-[#1f7a52]">← Student dashboard</Link><button onClick={reset} className="rounded-xl border border-emerald-950/10 bg-white px-3 py-2 text-xs font-black">Reset demo</button></div>
    <div className="mt-6 flex items-end justify-between gap-4"><div><div className="text-xs font-black uppercase tracking-[.15em] text-stone-500">Interactive preview</div><h1 className="mt-2 text-4xl font-black tracking-[-.05em]">Business idea</h1></div><StatusBadge status={status}/></div>
    {status === "in_review" && <div className="mt-6 rounded-[28px] border border-violet-200 bg-violet-50 p-6 text-sm leading-6 text-violet-900"><strong>Editing locked.</strong> Open the Professor Preview and request changes to unlock this form.</div>}
    {status === "approved" && <div className="mt-6 rounded-[28px] bg-emerald-100 p-6 text-sm font-bold text-emerald-900">Approved ideas are locked.</div>}
    {status === "changes_requested" && group?.idea?.feedback && <div className="mt-6 rounded-[28px] bg-amber-50 p-6 text-sm leading-6 text-amber-900"><strong>Professor feedback:</strong> {group.idea.feedback}</div>}
    {!isLeader && <div className="mt-6 rounded-[28px] bg-blue-50 p-6 text-sm text-blue-900">Only the current leader can submit revisions. Reset the group demo if leadership was transferred.</div>}
    {editable ? <form onSubmit={submit} className="surface mt-6 rounded-[32px] p-7"><label className="block text-sm font-black">Name of the idea<input value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-2 w-full rounded-2xl border border-emerald-950/15 bg-white px-4 py-3 outline-none"/></label><label className="mt-5 block text-sm font-black">Quick description<textarea value={description} onChange={(e) => setDescription(e.target.value)} required minLength={20} rows={7} className="mt-2 w-full rounded-2xl border border-emerald-950/15 bg-white p-4 outline-none"/></label><button className="primary-button mt-5 rounded-2xl px-6 py-3 text-sm font-black">{status === "changes_requested" ? "Submit revised idea" : "Submit for review"}</button></form> : group?.idea && <section className="surface mt-6 rounded-[32px] p-7"><div className="text-xs font-black uppercase tracking-[.14em] text-stone-500">Current revision {group.idea.revision}</div><h2 className="mt-3 text-2xl font-black">{group.idea.title}</h2><p className="mt-4 text-sm leading-7 text-stone-600">{group.idea.description}</p></section>}
  </div></main>;
}
