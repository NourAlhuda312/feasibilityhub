import Link from "next/link";
import { Brand } from "@/components/brand";
import { signUp } from "@/lib/actions/auth";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;
  return (
    <main className="noise-grid min-h-screen p-5 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <Brand />
        <section className="mt-12 rounded-[38px] border border-emerald-950/10 bg-white p-7 shadow-2xl shadow-emerald-950/10 sm:p-10">
          <div className="text-xs font-black uppercase tracking-[.16em] text-[#1f7a52]">Student & staff accounts</div>
          <h1 className="mt-3 text-3xl font-black tracking-[-.04em]">Create your account</h1>
          <p className="mt-2 text-sm leading-6 text-stone-500">Your role is not chosen here. Roles are assigned per course, so the same account can be a student in one course and staff in another.</p>
          {error && <div className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">{error}</div>}
          <form action={signUp} className="mt-7 space-y-4">
            <label className="block text-sm font-bold">Full name<input required name="full_name" className="focus-ring mt-2 w-full rounded-2xl border border-emerald-950/15 bg-stone-50 px-4 py-3 outline-none" /></label>
            <label className="block text-sm font-bold">Email<input required type="email" name="email" className="focus-ring mt-2 w-full rounded-2xl border border-emerald-950/15 bg-stone-50 px-4 py-3 outline-none" /></label>
            <label className="block text-sm font-bold">Password<input required minLength={8} type="password" name="password" className="focus-ring mt-2 w-full rounded-2xl border border-emerald-950/15 bg-stone-50 px-4 py-3 outline-none" /></label>
            <button className="w-full rounded-2xl bg-[#173f2c] px-4 py-3 font-black text-white">Create account</button>
          </form>
          <p className="mt-6 text-sm text-stone-500">Already registered? <Link className="font-black text-[#1f7a52]" href="/login">Sign in</Link></p>
        </section>
      </div>
    </main>
  );
}
