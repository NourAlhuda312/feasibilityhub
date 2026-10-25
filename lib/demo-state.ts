"use client";

import { useEffect, useState } from "react";
import type { IdeaStatus } from "@/lib/types";

export type DemoMember = { id: string; name: string; email: string };
export type DemoIdea = { id: string; title: string; description: string; status: IdeaStatus; revision: number; feedback?: string };
export type DemoGroup = { id: string; number: number; leaderId: string; members: DemoMember[]; idea?: DemoIdea };
export type DemoStaff = { id: string; name: string; email: string; role: "Professor" | "Admin" | "Assistant" };
export type DemoState = {
  course: { id: string; code: string; joinCode: string; title: string; semester: string };
  currentStudentId: string;
  groups: DemoGroup[];
  staff: DemoStaff[];
};

export const DEMO_STORAGE_KEY = "feasibilityhub-final-mvp-demo-v2";

export const defaultDemoState: DemoState = {
  course: { id: "demo-course", code: "BFS-301", joinCode: "BFS30-7KQ9M2", title: "Business Feasibility Study", semester: "Fall 2026" },
  currentStudentId: "student-cocompass",
  groups: [
    {
      id: "group-tafaddal", number: 1, leaderId: "zaid",
      members: [{ id: "zaid", name: "Zaid Khalil", email: "zaid@example.edu" }, { id: "mohammad", name: "Mohammad Hijjawi", email: "mohammad@example.edu" }],
      idea: { id: "idea-tafaddal", title: "Tafaddal", description: "A hybrid smart-card and QR payment experience for public transportation in Palestine.", status: "approved", revision: 1 },
    },
    {
      id: "group-masar", number: 3, leaderId: "osaid",
      members: [{ id: "osaid", name: "Osaid Basha", email: "osaid@example.edu" }, { id: "ali", name: "Ali Swalhi", email: "ali@example.edu" }],
      idea: { id: "idea-masar", title: "Masar", description: "Transportation routes, fares, destinations, and local services organized in one city-first platform.", status: "submitted", revision: 1 },
    },
    {
      id: "group-cocompass", number: 6, leaderId: "student-cocompass",
      members: [{ id: "student-cocompass", name: "Lina Ahmad", email: "lina@example.edu" }, { id: "omar", name: "Omar Nassar", email: "omar@example.edu" }],
      idea: { id: "idea-cocompass", title: "CoCompass", description: "Indoor and outdoor navigation for large spaces that works offline using only the user's device, starting with a university pilot.", status: "submitted", revision: 2 },
    },
    {
      id: "group-farhatna", number: 7, leaderId: "farah",
      members: [{ id: "farah", name: "Farah Saleh", email: "farah@example.edu" }, { id: "hana", name: "Hana Naser", email: "hana@example.edu" }],
      idea: { id: "idea-farhatna", title: "Farhatna", description: "A student venture concept being refined through the feasibility-study course workflow.", status: "changes_requested", revision: 1, feedback: "Narrow the first target customer and explain the initial revenue model." },
    },
  ],
  staff: [
    { id: "prof-1", name: "Dr. Ahmad", email: "professor@example.edu", role: "Professor" },
    { id: "admin-1", name: "Maya Admin", email: "admin@example.edu", role: "Admin" },
    { id: "assistant-1", name: "Sami Assistant", email: "assistant@example.edu", role: "Assistant" },
  ],
};

export function useDemoState() {
  const [state, setState] = useState<DemoState>(defaultDemoState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(DEMO_STORAGE_KEY);
      if (stored) setState(JSON.parse(stored));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  function reset() {
    setState(defaultDemoState);
    if (typeof window !== "undefined") window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(defaultDemoState));
  }

  return { state, setState, reset, hydrated };
}
