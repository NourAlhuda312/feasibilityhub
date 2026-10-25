"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function WorkspaceRealtime() {
  const router = useRouter();
  const [, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let dirty = false;
    let disposed = false;
    let connected = false;
    const refresh = () => {
      dirty = true;
      if (timer || document.visibilityState !== "visible") return;
      timer = setTimeout(() => {
        timer = undefined;
        if (disposed || document.visibilityState !== "visible") return;
        if (document.querySelector('form [aria-busy="true"]')) {
          refresh();
          return;
        }
        dirty = false;
        startTransition(() => router.refresh());
      }, 400);
    };
    const channel = supabase.channel(`workspace:${crypto.randomUUID()}`);
    for (const table of ["ideas", "idea_reviews", "idea_revisions", "group_members", "groups"]) {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, refresh);
    }
    channel.subscribe((status) => {
      connected = status === "SUBSCRIBED";
      if (status === "SUBSCRIBED") refresh();
    });
    const resume = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const flush = () => { if (dirty) refresh(); };
    window.addEventListener("online", resume);
    window.addEventListener("focus", resume);
    document.addEventListener("visibilitychange", resume);
    const interval = setInterval(flush, 2000);
    const fallback = setInterval(() => { if (!connected) refresh(); }, 30000);
    return () => {
      disposed = true;
      clearTimeout(timer);
      clearInterval(interval);
      clearInterval(fallback);
      window.removeEventListener("online", resume);
      window.removeEventListener("focus", resume);
      document.removeEventListener("visibilitychange", resume);
      void supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
