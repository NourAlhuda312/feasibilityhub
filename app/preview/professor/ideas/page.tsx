"use client";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { useDemoState } from "@/lib/demo-state";
export default function PreviewIdeasPage(){ const {state}=useDemoState(); return <main className="min-h-screen p-5 sm:p-8"><div className="mx-auto max-w-5xl"><Link href="/preview/professor" className="text-sm font-black text-[#1f7a52]">← Dashboard</Link><h1 className="mt-6 text-4xl font-black tracking-[-.05em]">Idea review queue</h1><div className="mt-7 space-y-3">{state.groups.filter(g=>g.idea).map(g=><Link key={g.id} href={`/preview/professor/review/${g.idea!.id}`} className="surface grid gap-4 rounded-[26px] p-5 sm:grid-cols-[80px_1fr_auto] sm:items-center"><div className="text-2xl font-black">#{g.number}</div><div><div className="font-black">{g.idea!.title}</div><div className="mt-1 text-xs text-stone-500">{g.members.map(m=>m.name).join(', ')}</div></div><StatusBadge status={g.idea!.status}/></Link>)}</div></div></main> }
