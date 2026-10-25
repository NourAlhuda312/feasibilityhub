import Link from "next/link";

export function Brand({ compact = false, href = "/" }: { compact?: boolean; href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-3 font-black tracking-tight" aria-label="FeasibilityHub">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#173f2c] text-white shadow-sm">
        FH
      </span>
      {!compact && (
        <span>
          <span className="block text-[17px] leading-none">FeasibilityHub</span>
          <span className="mt-1 block text-[10px] font-bold uppercase tracking-[.18em] text-stone-500">Course workspace</span>
        </span>
      )}
    </Link>
  );
}
