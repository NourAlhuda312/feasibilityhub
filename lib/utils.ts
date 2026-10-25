import type { CourseRole, IdeaStatus } from "@/lib/types";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function roleLabel(role: CourseRole) {
  return ({ professor: "Professor", admin: "Admin", assistant: "Assistant", student: "Student" } as const)[role];
}

export function statusLabel(status: IdeaStatus | "not_submitted") {
  return ({
    draft: "Draft",
    submitted: "Submitted",
    in_review: "In review",
    changes_requested: "Changes requested",
    approved: "Approved",
    not_submitted: "Not submitted",
  } as const)[status];
}

export function statusTone(status: IdeaStatus | "not_submitted") {
  return ({
    draft: "bg-stone-100 text-stone-700",
    submitted: "bg-blue-100 text-blue-800",
    in_review: "bg-violet-100 text-violet-800",
    changes_requested: "bg-amber-100 text-amber-900",
    approved: "bg-emerald-100 text-emerald-900",
    not_submitted: "bg-zinc-100 text-zinc-600",
  } as const)[status];
}

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}
