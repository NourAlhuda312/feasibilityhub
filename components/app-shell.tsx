import { ActionForm } from "@/components/action-form";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/actions/auth";

export type ShellNavItem = { label: string; href: string; active?: boolean; badge?: string };

export function AppShell({
  children,
  nav,
  courseCode,
  semester,
  userLabel,
  roleLabel,
  homeHref = "/dashboard",
}: {
  children: React.ReactNode;
  nav: ShellNavItem[];
  courseCode: string;
  semester: string;
  userLabel: string;
  roleLabel: string;
  homeHref?: string;
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[270px_1fr]">
      <aside className="hidden border-r border-emerald-950/10 bg-[#eef0e8] px-5 py-6 lg:flex lg:flex-col">
        <Brand href={homeHref} />
        <div className="mt-7 rounded-3xl border border-emerald-950/10 bg-white p-4">
          <div className="text-[10px] font-black uppercase tracking-[.18em] text-stone-500">Current course</div>
          <div className="mt-2 text-sm font-black">{courseCode}</div>
          <div className="mt-1 text-xs text-stone-500">{semester}</div>
        </div>
        <nav className="mt-7 space-y-1.5">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition",
                item.active ? "bg-[#173f2c] text-white shadow-sm" : "text-stone-600 hover:bg-white hover:text-stone-900"
              )}
            >
              <span>{item.label}</span>
              {item.badge && <span className={cn("rounded-full px-2 py-0.5 text-[10px]", item.active ? "bg-white text-[#173f2c]" : "bg-[#e1e8e2] text-[#173f2c]")}>{item.badge}</span>}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-3xl border border-emerald-950/10 bg-white p-4">
          <div className="text-xs font-black text-[#173f2c]">{userLabel}</div>
          <div className="mt-1 text-[11px] font-bold text-stone-500">{roleLabel}</div>
          <ActionForm action={signOut} className="mt-3">
            <button className="w-full rounded-2xl border border-emerald-950/10 bg-[#f6f7f2] px-3 py-2 text-xs font-black text-stone-700 transition hover:bg-stone-100">Log out</button>
          </ActionForm>
        </div>
      </aside>
      <main className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-emerald-950/10 bg-[#f6f7f2] px-5 py-4 lg:px-8">
          <Brand compact href={homeHref} />
          <div className="flex items-center gap-2 lg:hidden">
            <div className="text-right">
              <div className="text-xs font-black">{courseCode}</div>
              <div className="text-[10px] text-stone-500">{roleLabel}</div>
            </div>
            <ActionForm action={signOut}>
              <button aria-label="Log out" title="Log out" className="rounded-xl border border-emerald-950/10 bg-white px-3 py-2 text-[11px] font-black text-stone-700">Log out</button>
            </ActionForm>
          </div>
          <div className="hidden items-center gap-3 lg:flex">
            <div className="text-right">
              <div className="text-xs font-black">{userLabel}</div>
              <div className="text-[10px] text-stone-500">{roleLabel}</div>
            </div>
            <ActionForm action={signOut}>
              <button aria-label="Log out" title="Log out" className="rounded-xl border border-emerald-950/10 bg-white px-3 py-2 text-xs font-black text-stone-700 transition hover:bg-stone-100">Log out</button>
            </ActionForm>
          </div>
        </header>
        {children}
        <div className="h-24 lg:hidden" />
        <nav className="fixed bottom-3 left-3 right-3 z-30 flex gap-1 overflow-x-auto rounded-[22px] border border-emerald-950/10 bg-white p-2 shadow-xl lg:hidden">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className={cn("min-w-max flex-1 rounded-2xl px-3 py-2.5 text-center text-[11px] font-black", item.active ? "bg-[#173f2c] text-white" : "text-stone-600")}>
              {item.label}
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
}
