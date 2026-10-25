"use client";

import { useRef, useState } from "react";

export function CopyButton({ value }: { value: string }) {
  const [state, setState] = useState("Copy invite");
  const busy = useRef(false);
  async function copy() {
    if (busy.current) return;
    busy.current = true;
    setState("Copied!");
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      setState("Copy failed. Select the link to copy manually.");
    } finally {
      busy.current = false;
    }
  }
  return <button type="button" onClick={copy} className="mt-3 rounded-xl border border-emerald-950/10 bg-white px-3 py-2 text-xs font-black"><span role="status">{state}</span></button>;
}
