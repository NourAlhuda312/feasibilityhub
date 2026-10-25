"use client";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { useDemoState } from "@/lib/demo-state";

export function PreviewProfessorDashboard() {
  const { state, setState, reset } = useDemoState();
  const rows = state.groups.map((g) => ({ group: g, idea: g.idea }));
  const submitted = rows.filter((r) => r.idea?.status === "submitted").length;
  const inReview = rows.filter((r) => r.idea?.status === "in_review").length;
  const changes = rows.filter((r) => r.idea?.status === "changes_requested").length;
  const approved = rows.filter((r) => r.idea?.status === "approved").length;

  function startReview(ideaId: string) {
    setState((current) => ({ ...current, groups: current.groups.map((g) => g.idea?.id === ideaId ? { ...g, idea: { ...g.idea, status: "in_review" } } : g) }));
  }

  return (
    <AppShell
      courseCode={state.course.code}
      semester={state.course.semester}
      userLabel="Preview Professor"
      roleLabel="Professor workspace"
      homeHref="/preview/professor"
      nav={[
        { label: "Overview", href: "/preview/professor", active: true },
        { label: "Groups", href: "/preview/professor/groups" },
        { label: "Idea reviews", href: "/preview/professor/ideas", badge: String(submitted + inReview) },
        { label: "Course team", href: "/preview/professor/team" },
        { label: "Settings", href: "/preview/professor/settings" },
      ]}
    >
      <div className="mx-auto max-w-[1500px] p-5 lg:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"><span><strong>Interactive preview:</strong> start a review here, then open Student Preview to see editing lock.</span><button onClick={reset} className="rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-black">Reset demo</button></div>
        <section className="rounded-[34px] bg-[#173f2c] p-6 text-white shadow-xl shadow-emerald-950/10 lg:p-8"><div className="grid gap-8 xl:grid-cols-[1fr_auto] xl:items-end"><div><div className="inline-flex rounded-full border border-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[.16em] text-emerald-100">{state.course.semester}</div><h1 className="mt-5 text-4xl font-black tracking-[-.04em]">Professor dashboard</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/75">Review the semester, manage the course team, and keep each student revision in a controlled state.</p></div><div className="grid grid-cols-2 gap-3"><a href="/api/export-demo?format=xlsx" className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-black text-[#173f2c]">Export Excel</a><a href="/api/export-demo?format=csv" className="rounded-2xl border border-white/25 px-4 py-3 text-center text-sm font-black text-white">Export CSV</a></div></div></section>
        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{[["Groups",rows.length,"bg-white"],["Submitted",submitted,"bg-blue-50"],["In review",inReview,"bg-violet-50"],["Changes",changes,"bg-amber-50"],["Approved",approved,"bg-emerald-50"]].map(([label,value,tone]) => <div key={String(label)} className={`rounded-[28px] border border-emerald-950/10 p-5 ${tone}`}><div className="text-xs font-black uppercase tracking-[.14em] text-stone-500">{label}</div><div className="mt-4 text-4xl font-black">{value}</div></div>)}</section>
        <section className="surface mt-5 overflow-hidden rounded-[30px]"><div className="border-b border-emerald-950/10 px-5 py-5"><div className="text-lg font-black">Idea pipeline</div><div className="mt-1 text-xs text-stone-500">Start review = lock the team&apos;s current revision.</div></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-stone-50 text-[11px] uppercase tracking-[.12em] text-stone-500"><tr><th className="px-5 py-3">Group</th><th className="px-5 py-3">Members</th><th className="px-5 py-3">Idea</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Action</th></tr></thead><tbody className="divide-y divide-emerald-950/10">{rows.map(({group,idea}) => <tr key={group.id}><td className="px-5 py-4 font-black">#{group.number}</td><td className="px-5 py-4 text-stone-600">{group.members.map((m) => m.name).join(", ")}</td><td className="px-5 py-4"><div className="font-black">{idea?.title || "—"}</div><div className="mt-1 max-w-[340px] truncate text-xs text-stone-500">{idea?.description || "No idea submitted"}</div></td><td className="px-5 py-4"><StatusBadge status={idea?.status || "not_submitted"}/></td><td className="px-5 py-4 text-right">{!idea ? <span className="text-xs text-stone-400">No submission</span> : idea.status === "submitted" ? <button onClick={() => startReview(idea.id)} className="rounded-xl bg-[#173f2c] px-3 py-2 text-xs font-black text-white">Start review</button> : <Link href={`/preview/professor/review/${idea.id}`} className="inline-flex rounded-xl border border-emerald-950/10 bg-white px-3 py-2 text-xs font-black">Open</Link>}</td></tr>)}</tbody></table></div></section>
      </div>
    </AppShell>
  );
}
