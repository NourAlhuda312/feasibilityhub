import { ActionForm } from "@/components/action-form";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { joinGroup } from "@/lib/actions/groups";
import { createClient } from "@/lib/supabase/server";

export default async function JoinGroupPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const action = joinGroup.bind(null, token);
  const next = `/join/group/${token}`;

  return <main className="noise-grid min-h-screen p-5 sm:p-8"><div className="mx-auto max-w-xl"><Brand/><section className="surface mt-12 rounded-[34px] p-8"><div className="text-xs font-black uppercase tracking-[.15em] text-[#1f7a52]">Group invitation</div><h1 className="mt-3 text-3xl font-black tracking-[-.04em]">Join your classmates.</h1><p className="mt-3 text-sm leading-6 text-stone-600">You must already be enrolled in the course as a Student. A group can contain a maximum of three members and you can belong to only one group in that course.</p>{user ? <ActionForm action={action} className="mt-7"><button className="w-full rounded-2xl bg-[#173f2c] px-5 py-3 font-black text-white">Join group</button></ActionForm> : <Link href={`/login?next=${encodeURIComponent(next)}`} className="mt-7 block w-full rounded-2xl bg-[#173f2c] px-5 py-3 text-center font-black text-white">Sign in to continue</Link>}<Link href="/" className="mt-4 block text-center text-sm font-black text-[#1f7a52]">Back to home</Link></section></div></main>;
}
