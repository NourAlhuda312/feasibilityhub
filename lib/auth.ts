import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { CourseRole } from "@/lib/types";

export async function requireUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");
  return { supabase, user };
}

export async function requireCourseRole(courseId: string, allowed: CourseRole[]) {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("course_memberships")
    .select("role")
    .eq("course_id", courseId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || !data || !allowed.includes(data.role as CourseRole)) redirect("/dashboard?error=forbidden");
  return { supabase, user, role: data.role as CourseRole };
}

export function isPlatformAdminEmail(email?: string | null) {
  if (!email) return false;
  const allowed = (process.env.PLATFORM_ADMIN_EMAILS || "")
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase());
}
