"use server";

import { randomBytes, createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireCourseRole, requireUser, isPlatformAdminEmail } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CourseRole } from "@/lib/types";
import { getSiteUrl } from "@/lib/utils";

const text = (fd: FormData, key: string) => String(fd.get(key) || "").trim();
const hash = (token: string) => createHash("sha256").update(token).digest("hex");

function generateJoinCode(courseCode: string) {
  const prefix = courseCode.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 5) || "COURSE";
  const suffix = randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}-${suffix}`;
}

async function canCreateCourses(userId: string, email?: string | null) {
  if (isPlatformAdminEmail(email)) return true;
  const admin = createAdminClient();
  const { data } = await admin.from("profiles").select("can_create_courses").eq("id", userId).maybeSingle();
  return Boolean(data?.can_create_courses);
}

export async function createCourse(formData: FormData) {
  const { user } = await requireUser();
  if (!(await canCreateCourses(user.id, user.email))) {
    redirect("/dashboard?error=Your%20account%20is%20not%20enabled%20to%20create%20courses.%20Ask%20the%20platform%20administrator%20to%20enable%20faculty%20course%20creation.");
  }
  const code = text(formData, "code").toUpperCase();
  const title = text(formData, "title");
  const term = text(formData, "term");
  const year = Number(text(formData, "year"));
  if (!code || !title || !["Fall", "Spring", "Summer"].includes(term) || !Number.isInteger(year)) redirect("/dashboard?error=Invalid%20course%20details");

  const admin = createAdminClient();
  const semesterName = `${term} ${year}`;
  let { data: semester } = await admin.from("academic_semesters").select("id").eq("name", semesterName).maybeSingle();
  if (!semester) {
    const inserted = await admin.from("academic_semesters").insert({ name: semesterName, term, year }).select("id").single();
    if (inserted.error) redirect(`/dashboard?error=${encodeURIComponent(inserted.error.message)}`);
    semester = inserted.data;
  }

  let courseId: string | undefined;
  let lastError = "Could not create course";
  for (let attempt = 0; attempt < 5 && !courseId; attempt += 1) {
    const joinCode = generateJoinCode(code);
    const courseResult = await admin
      .from("courses")
      .insert({ code, title, semester_id: semester.id, owner_id: user.id, join_code: joinCode })
      .select("id")
      .single();
    if (!courseResult.error) courseId = courseResult.data.id;
    else lastError = courseResult.error.message;
  }
  if (!courseId) redirect(`/dashboard?error=${encodeURIComponent(lastError)}`);

  const membership = await admin.from("course_memberships").insert({ course_id: courseId, user_id: user.id, role: "professor" });
  if (membership.error) {
    await admin.from("courses").delete().eq("id", courseId);
    redirect(`/dashboard?error=${encodeURIComponent(membership.error.message)}`);
  }
  redirect(`/professor/dashboard?course=${courseId}`);
}

export async function addCourseStaff(formData: FormData) {
  const courseId = text(formData, "course_id");
  const email = text(formData, "email").toLowerCase();
  const role = text(formData, "role") as CourseRole;
  await requireCourseRole(courseId, ["professor", "admin"]);
  if (!["professor", "admin", "assistant"].includes(role)) redirect(`/professor/team?course=${courseId}&error=Invalid%20staff%20role`);
  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("id").eq("email", email).maybeSingle();
  if (!profile) redirect(`/professor/team?course=${courseId}&error=${encodeURIComponent("That email must create a FeasibilityHub account first.")}`);
  const { data: groupedStudent } = await admin.from("group_members").select("group_id").eq("course_id", courseId).eq("user_id", profile.id).maybeSingle();
  if (groupedStudent) redirect(`/professor/team?course=${courseId}&error=${encodeURIComponent("This user is currently a student in a group. Remove or migrate that group membership before assigning a staff role.")}`);
  const { error } = await admin.from("course_memberships").upsert({ course_id: courseId, user_id: profile.id, role }, { onConflict: "course_id,user_id" });
  if (error) redirect(`/professor/team?course=${courseId}&error=${encodeURIComponent(error.message)}`);
  revalidatePath("/professor/team");
  redirect(`/professor/team?course=${courseId}&message=Staff%20member%20added`);
}

export async function createCourseInvite(formData: FormData) {
  const courseId = text(formData, "course_id");
  const { user } = await requireCourseRole(courseId, ["professor", "admin"]);
  const token = randomBytes(24).toString("base64url");
  const admin = createAdminClient();
  const { error } = await admin.from("course_invites").insert({ course_id: courseId, token_hash: hash(token), created_by: user.id });
  if (error) redirect(`/professor/settings?course=${courseId}&error=${encodeURIComponent(error.message)}`);
  const invite = `${getSiteUrl()}/join/course/${token}`;
  redirect(`/professor/settings?course=${courseId}&invite=${encodeURIComponent(invite)}`);
}

export async function joinCourse(token: string) {
  const { user } = await requireUser();
  const admin = createAdminClient();
  const { data: invite } = await admin.from("course_invites").select("*").eq("token_hash", hash(token)).maybeSingle();
  const invalid = !invite || invite.revoked_at || (invite.expires_at && new Date(invite.expires_at) < new Date()) || (invite.max_uses && invite.use_count >= invite.max_uses);
  if (invalid) redirect("/dashboard?error=This%20course%20invitation%20is%20invalid%20or%20expired.");
  const { data: existing } = await admin.from("course_memberships").select("role").eq("course_id", invite.course_id).eq("user_id", user.id).maybeSingle();
  if (!existing) await admin.from("course_memberships").insert({ course_id: invite.course_id, user_id: user.id, role: "student" });
  await admin.from("course_invites").update({ use_count: Number(invite.use_count || 0) + 1 }).eq("id", invite.id);
  if (existing && existing.role !== "student") redirect(`/professor/dashboard?course=${invite.course_id}`);
  redirect(`/student/dashboard?course=${invite.course_id}`);
}

export async function joinCourseByCode(formData: FormData) {
  const { user } = await requireUser();
  const joinCode = text(formData, "join_code").toUpperCase().replace(/\s+/g, "");
  if (!joinCode) redirect("/dashboard?error=Enter%20a%20course%20code.");
  const admin = createAdminClient();
  const { data: course } = await admin.from("courses").select("id,status").eq("join_code", joinCode).maybeSingle();
  if (!course || course.status !== "active") redirect("/dashboard?error=Course%20code%20not%20found%20or%20course%20is%20not%20active.");
  const { data: existing } = await admin.from("course_memberships").select("role").eq("course_id", course.id).eq("user_id", user.id).maybeSingle();
  if (!existing) {
    const { error } = await admin.from("course_memberships").insert({ course_id: course.id, user_id: user.id, role: "student" });
    if (error) redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }
  if (existing && existing.role !== "student") redirect(`/professor/dashboard?course=${course.id}`);
  redirect(`/student/dashboard?course=${course.id}`);
}
