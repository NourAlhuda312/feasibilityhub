import Link from "next/link";
import { Brand } from "@/components/brand";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";

const showcase = [
  {
    name: "Tafaddal",
    tag: "Smart mobility",
    text: "Hybrid smart-card and QR payments for Palestinian public transportation.",
  },
  {
    name: "Masar",
    tag: "Local mobility",
    text: "Public transportation routes, fares, destinations, and nearby services in one platform.",
  },
  {
    name: "CoCompass",
    tag: "Navigation",
    text: "Indoor and outdoor navigation for large spaces using only the user's device, designed to work offline and scale beyond the university pilot.",
  },
  {
    name: "Farhatna",
    tag: "Student venture",
    text: "A student business concept included in the course workspace; its feasibility profile can grow with each course stage.",
  },
];

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <main className="min-h-screen px-5 py-6 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between gap-4">
          <Brand href={user ? "/dashboard" : "/"} />
          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="primary-button rounded-2xl px-4 py-2.5 text-sm font-black">Open dashboard</Link>
              <form action={signOut}>
                <button className="rounded-2xl border border-emerald-950/10 bg-white px-4 py-2.5 text-sm font-black text-stone-700 transition hover:bg-stone-100">Log out</button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="rounded-2xl px-4 py-2.5 text-sm font-black text-stone-700 transition hover:bg-white">Sign in</Link>
              <Link href="/register" className="primary-button rounded-2xl px-4 py-2.5 text-sm font-black">Create account</Link>
            </div>
          )}
        </header>

        <section className="grid gap-10 py-14 lg:grid-cols-[1.02fr_.98fr] lg:items-center lg:py-20">
          <div>
            <div className="inline-flex rounded-full border border-emerald-950/10 bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[.16em] text-[#1f7a52]">Built for feasibility-study courses</div>
            <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-[-.065em] text-[#17211b] sm:text-6xl lg:text-7xl">One place for teams, ideas, reviews, and the semester.</h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-stone-600">Students join a course, create teams, submit one business idea, and follow professor feedback. Professors manage the full course without passing an Excel sheet around.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/preview/professor" className="primary-button rounded-2xl px-5 py-3.5 text-sm font-black shadow-sm">Preview professor dashboard</Link>
              <Link href="/preview/student" className="secondary-button rounded-2xl px-5 py-3.5 text-sm font-black">Preview student experience</Link>
            </div>
          </div>

          <div className="rounded-[38px] bg-[#173f2c] p-6 text-white shadow-xl shadow-emerald-950/10">
            <div className="rounded-[28px] bg-white p-5 text-[#17211b]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-black text-stone-500">Fall 2026</div>
                  <div className="mt-1 text-lg font-black">Business Feasibility Study</div>
                </div>
                <div className="rounded-full bg-[#edf2ec] px-3 py-1 text-xs font-black text-[#173f2c]">Course code BFS-301</div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-emerald-50 p-4"><div className="text-2xl font-black">7</div><div className="mt-1 text-[10px] font-bold text-stone-600">Approved</div></div>
                <div className="rounded-2xl bg-blue-50 p-4"><div className="text-2xl font-black">3</div><div className="mt-1 text-[10px] font-bold text-stone-600">Review queue</div></div>
                <div className="rounded-2xl bg-amber-50 p-4"><div className="text-2xl font-black">2</div><div className="mt-1 text-[10px] font-bold text-stone-600">Changes</div></div>
              </div>
              <div className="mt-5 space-y-2">
                {[['#01','Tafaddal','Approved'],['#03','Masar','In review'],['#06','CoCompass','Submitted']].map(([group,idea,status]) => (
                  <div key={group} className="grid grid-cols-[50px_1fr_auto] items-center gap-3 rounded-2xl bg-[#f7f8f4] px-4 py-3">
                    <div className="text-xs font-black text-stone-500">{group}</div>
                    <div className="text-sm font-black">{idea}</div>
                    <div className="text-[10px] font-bold text-stone-500">{status}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 rounded-[26px] border border-white/15 p-5">
              <div className="text-xs font-black uppercase tracking-[.15em] text-emerald-200">Simple by design</div>
              <div className="mt-2 text-xl font-black">Every screen shows the next action.</div>
              <p className="mt-2 text-xs leading-5 text-emerald-50/70">Students should never wonder where to submit. Professors should never hunt for the latest version.</p>
            </div>
          </div>
        </section>

        <section className="pb-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div><div className="text-xs font-black uppercase tracking-[.16em] text-[#1f7a52]">Course showcase</div><h2 className="mt-2 text-3xl font-black tracking-[-.04em]">Ideas can become structured projects.</h2></div>
            <p className="max-w-xl text-sm leading-6 text-stone-500">The homepage can highlight real course ideas while the private workspace handles members, revisions, reviews, and later feasibility chapters.</p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {showcase.map((idea) => (
              <article key={idea.name} className="surface rounded-[28px] p-6">
                <div className="text-[10px] font-black uppercase tracking-[.14em] text-[#1f7a52]">{idea.tag}</div>
                <h3 className="mt-3 text-2xl font-black tracking-[-.03em]">{idea.name}</h3>
                <p className="mt-3 text-sm leading-6 text-stone-600">{idea.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 py-10 md:grid-cols-3">
          {[
            ["Per-course roles", "The same account can be a Student in one course and Professor, Admin, or Assistant in another."],
            ["Semester separation", "Each course belongs to an academic semester, keeping future cohorts cleanly separated."],
            ["Excel stays available", "Export the original spreadsheet columns plus the current idea status whenever needed."],
          ].map(([title, text]) => (
            <div key={title} className="surface rounded-[28px] p-6"><div className="text-lg font-black">{title}</div><p className="mt-2 text-sm leading-6 text-stone-600">{text}</p></div>
          ))}
        </section>
      </div>
    </main>
  );
}
