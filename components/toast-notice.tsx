"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function ToastNotice() {
  const params = useSearchParams();
  const pathname = usePathname();
  const [notice, setNotice] = useState<{ text: string; error: boolean } | null>(null);
  const seen = useRef("");
  const error = params.get("error");
  const message = params.get("message");
  useEffect(() => {
    const text = error || message;
    if (!text) { seen.current = ""; return; }
    const key = `${pathname}:${error || ""}:${message || ""}`;
    if (seen.current === key) return;
    seen.current = key;
    setNotice({ text, error: Boolean(error) });
    const url = new URL(window.location.href);
    url.searchParams.delete("message");
    url.searchParams.delete("error");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }, [error, message, pathname]);
  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(null), notice.error ? 10000 : 6000);
    return () => clearTimeout(timeout);
  }, [notice]);
  if (!notice) return null;
  return <div role={notice.error ? "alert" : "status"} className={`fixed right-4 top-4 z-50 flex max-w-sm items-start gap-4 rounded-2xl border p-4 shadow-lg ${notice.error ? "border-rose-200 bg-rose-50 text-rose-900" : "border-emerald-200 bg-white text-[#173f2c]"}`}>
    <span className="text-sm font-bold">{notice.text}</span>
    <button type="button" aria-label="Dismiss notification" onClick={() => setNotice(null)}>×</button>
  </div>;
}
