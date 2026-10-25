import Link from "next/link";
import { Brand } from "@/components/brand";
import { signIn } from "@/lib/actions/auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;
  const message = typeof params.message === "string" ? params.message : undefined;
  const next = typeof params.next === "string" ? params.next : "/dashboard";
  return (
    <main className="noise-grid min-h-screen p-5 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <Brand />
        <div className="mt-12 grid overflow-hidden rounded-[38px] border border-emerald-950/10 bg-white shadow-2xl shadow-emerald-950/10 lg:grid-cols-[.9fr_1.1fr]">
          <section className="bg-[#173f2c] p-8 text-white sm:p-12">
            <div className="text-xs font-black uppercase tracking-[.16em] text-emerald-200">Welcome back</div>
            <h1 className="mt-5 text-4xl font-black tracking-[-.05em]">The course spreadsheet grew up.</h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-emerald-50/70">Students manage one project workspace. Professors review the whole semester from a single dashboard.</p>
          </section>
          <section className="p-8 sm:p-12">
            <h2 className="text-2xl font-black">Sign in</h2>
            <p className="mt-2 text-sm text-stone-500">Use the email connected to your course.</p>
            {error && <div className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">{error}</div>}
            {message && <div className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">{message}</div>}
            <form action={signIn} className="mt-7 space-y-4">
              <input type="hidden" name="next" value={next} />
              <label className="block text-sm font-bold">Email<input required type="email" name="email" className="focus-ring mt-2 w-full rounded-2xl border border-emerald-950/15 bg-stone-50 px-4 py-3 outline-none" placeholder="you@example.edu" /></label>
              <label className="block text-sm font-bold">Password<input required type="password" name="password" className="focus-ring mt-2 w-full rounded-2xl border border-emerald-950/15 bg-stone-50 px-4 py-3 outline-none" placeholder="••••••••" /></label>
              <button className="w-full rounded-2xl bg-[#173f2c] px-4 py-3 font-black text-white">Sign in</button>
            </form>
            <p className="mt-6 text-sm text-stone-500">New here? <Link className="font-black text-[#1f7a52]" href="/register">Create an account</Link></p>
          </section>
        </div>
      </div>
    </main>
  );
}
