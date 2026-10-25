"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useDemoState } from "@/lib/demo-state";

export default function PreviewStudentGroupPage() {
  const { state, setState, reset } = useDemoState();
  const [email, setEmail] = useState("");
  const [invite, setInvite] = useState("");
  const [notice, setNotice] = useState("");
  const group = useMemo(() => state.groups.find((g) => g.members.some((m) => m.id === state.currentStudentId)), [state]);
  const isLeader = group?.leaderId === state.currentStudentId;

  function addMember(e: FormEvent) {
    e.preventDefault();
    if (!group || !isLeader || group.members.length >= 3 || !email.trim()) return;
    const normalized = email.trim().toLowerCase();
    if (group.members.some((m) => m.email.toLowerCase() === normalized)) { setNotice("That student is already in the group."); return; }
    const name = normalized.split("@")[0].split(/[._-]/).filter(Boolean).map((p) => p[0]?.toUpperCase() + p.slice(1)).join(" ") || "New Student";
    setState((current) => ({ ...current, groups: current.groups.map((g) => g.id === group.id ? { ...g, members: [...g.members, { id: `demo-${Date.now()}`, name, email: normalized }] } : g) }));
    setEmail(""); setNotice(`${name} was added to the demo group.`);
  }

  function makeLeader(id: string) {
    if (!group || !isLeader) return;
    setState((current) => ({ ...current, groups: current.groups.map((g) => g.id === group.id ? { ...g, leaderId: id } : g) }));
    setNotice("Leadership transferred. In the real app, only the new leader can manage the team and submit revisions.");
  }

  function removeMember(id: string) {
    if (!group || !isLeader || id === group.leaderId) return;
    setState((current) => ({ ...current, groups: current.groups.map((g) => g.id === group.id ? { ...g, members: g.members.filter((m) => m.id !== id) } : g) }));
    setNotice("Member removed from the demo group.");
  }

  async function copyInvite() {
    if (!invite) return;
    try { await navigator.clipboard.writeText(invite); setNotice("Invite link copied."); } catch { setNotice("Copy was blocked by the browser. Select the link and copy it manually."); }
  }

  function generateInvite() {
    const value = `${window.location.origin}/preview/student/group?invite=DEMO-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    setInvite(value); setNotice("Demo invite generated. In the live system, the link is validated by Supabase and the 3-member limit.");
  }

  return <main className="min-h-screen p-5 sm:p-8"><div className="mx-auto max-w-5xl">
    <div className="flex items-center justify-between gap-4"><Link href="/preview/student" className="text-sm font-black text-[#1f7a52]">← Student dashboard</Link><button onClick={reset} className="rounded-xl border border-emerald-950/10 bg-white px-3 py-2 text-xs font-black">Reset demo</button></div>
    <div className="mt-6"><div className="text-xs font-black uppercase tracking-[.15em] text-stone-500">Interactive preview</div><h1 className="mt-2 text-4xl font-black tracking-[-.05em]">Group management</h1><p className="mt-3 text-sm leading-6 text-stone-500">Test adding members, sharing an invite, and transferring the leader before the database is connected.</p></div>
    {notice && <div className="mt-5 rounded-2xl bg-blue-50 p-4 text-sm font-bold text-blue-900">{notice}</div>}
    {group ? <>
      <section className="surface mt-7 rounded-[30px] p-6"><div className="flex items-start justify-between gap-4"><div><div className="text-xs font-black uppercase tracking-[.14em] text-stone-500">Group</div><div className="mt-2 text-3xl font-black">#{group.number}</div></div><div className="rounded-2xl bg-sky-50 px-3 py-2 text-xs font-black text-sky-900">{group.members.length}/3</div></div><div className="mt-6 space-y-3">{group.members.map((m) => <div key={m.id} className="flex flex-col gap-3 rounded-2xl bg-[#f7f8f4] p-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="font-black">{m.name}</div><div className="mt-1 text-xs text-stone-500">{m.email}</div></div><div className="flex flex-wrap gap-2">{group.leaderId === m.id && <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase text-emerald-900">Leader</span>}{isLeader && group.leaderId !== m.id && <><button onClick={() => makeLeader(m.id)} className="rounded-xl border border-emerald-950/10 bg-white px-3 py-2 text-xs font-black">Make leader</button><button onClick={() => removeMember(m.id)} className="rounded-xl danger-button border border-rose-200 bg-white px-3 py-2 text-xs font-black text-rose-700">Remove</button></>}</div></div>)}</div></section>
      {isLeader && group.members.length < 3 && <section className="mt-5 grid gap-5 lg:grid-cols-2"><form onSubmit={addMember} className="surface rounded-[30px] p-6"><div className="text-xl font-black">Add by email</div><p className="mt-2 text-sm text-stone-500">In production, the email must belong to a student already enrolled in the course.</p><input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" placeholder="classmate@example.edu" className="mt-5 w-full rounded-2xl border border-emerald-950/15 bg-white px-4 py-3 text-sm outline-none"/><button className="primary-button mt-3 w-full rounded-2xl px-4 py-3 text-sm font-black">Add classmate</button></form><div className="surface rounded-[30px] p-6"><div className="text-xl font-black">Share invite link</div><p className="mt-2 text-sm text-stone-500">Useful when your teammate should accept the group invitation themselves.</p>{invite && <div className="mt-4"><div className="break-all rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-900">{invite}</div><button onClick={copyInvite} className="mt-2 rounded-xl border border-emerald-950/10 bg-white px-3 py-2 text-xs font-black">Copy invite</button></div>}<button onClick={generateInvite} className="primary-button mt-5 w-full rounded-2xl px-4 py-3 text-sm font-black">Generate invite</button></div></section>}
      {!isLeader && <div className="surface mt-5 rounded-[30px] p-6 text-sm leading-6 text-stone-600">Leadership was transferred away from the preview student. Reset the demo to restore the original leader state.</div>}
    </> : <div className="surface mt-7 rounded-[30px] p-6">No demo group found.</div>}
  </div></main>;
}
