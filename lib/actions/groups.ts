"use server";

import { randomBytes, createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidateWorkspace } from "@/lib/revalidate-workspace";
import { requireCourseRole, requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/utils";

const text = (fd: FormData, key: string) => String(fd.get(key) || "").trim();
const hash = (token: string) => createHash("sha256").update(token).digest("hex");

async function getLeaderGroup(courseId: string, userId: string) {
  const admin = createAdminClient();
  const { data } = await admin.from("groups").select("id, leader_id").eq("course_id", courseId).eq("leader_id", userId).maybeSingle();
  return data;
}

export async function createGroup(formData: FormData) {
  const courseId = text(formData, "course_id");
  const { user } = await requireCourseRole(courseId, ["student"]);
  const admin = createAdminClient();
  const { data: existing } = await admin.from("group_members").select("group_id").eq("course_id", courseId).eq("user_id", user.id).maybeSingle();
  if (existing) redirect(`/student/group?course=${courseId}&error=You%20already%20belong%20to%20a%20group.`);
  const created = await admin.from("groups").insert({ course_id: courseId, leader_id: user.id }).select("id, group_number").single();
  if (created.error) redirect(`/student/group?course=${courseId}&error=${encodeURIComponent(created.error.message)}`);
  const member = await admin.from("group_members").insert({ group_id: created.data.id, course_id: courseId, user_id: user.id });
  if (member.error) {
    await admin.from("groups").delete().eq("id", created.data.id);
    redirect(`/student/group?course=${courseId}&error=${encodeURIComponent(member.error.message)}`);
  }
  revalidateWorkspace();
  redirect(`/student/group?course=${courseId}&message=Group%20created.%20You%20are%20the%20leader%20for%20now.`);
}

export async function createGroupInvite(formData: FormData) {
  const courseId = text(formData, "course_id");
  const invitedEmail = text(formData, "invited_email").toLowerCase() || null;
  const { user } = await requireCourseRole(courseId, ["student"]);
  const admin = createAdminClient();
  const group = await getLeaderGroup(courseId, user.id);
  if (!group) redirect(`/student/group?course=${courseId}&error=Only%20the%20group%20leader%20can%20create%20an%20invite.`);
  const { count } = await admin.from("group_members").select("user_id", { count: "exact", head: true }).eq("group_id", group.id);
  if ((count || 0) >= 3) redirect(`/student/group?course=${courseId}&error=Your%20group%20already%20has%203%20members.`);
  const token = randomBytes(24).toString("base64url");
  const { error } = await admin.from("group_invites").insert({ group_id: group.id, token_hash: hash(token), created_by: user.id, invited_email: invitedEmail });
  if (error) redirect(`/student/group?course=${courseId}&error=${encodeURIComponent(error.message)}`);
  const invite = `${getSiteUrl()}/join/group/${token}`;
  redirect(`/student/group?course=${courseId}&invite=${encodeURIComponent(invite)}${invitedEmail ? `&inviteFor=${encodeURIComponent(invitedEmail)}` : ""}`);
}

export async function addGroupMemberByEmail(formData: FormData) {
  const courseId = text(formData, "course_id");
  const email = text(formData, "email").toLowerCase();
  const { user } = await requireCourseRole(courseId, ["student"]);
  const admin = createAdminClient();
  const group = await getLeaderGroup(courseId, user.id);
  if (!group) redirect(`/student/group?course=${courseId}&error=Only%20the%20group%20leader%20can%20add%20a%20member.`);
  const { count } = await admin.from("group_members").select("user_id", { count: "exact", head: true }).eq("group_id", group.id);
  if ((count || 0) >= 3) redirect(`/student/group?course=${courseId}&error=Your%20group%20already%20has%203%20members.`);

  const { data: profile } = await admin.from("profiles").select("id,email").eq("email", email).maybeSingle();
  if (!profile) redirect(`/student/group?course=${courseId}&error=${encodeURIComponent("No account exists with that email yet. Share an invite link instead.")}`);
  const { data: courseMember } = await admin.from("course_memberships").select("role").eq("course_id", courseId).eq("user_id", profile.id).maybeSingle();
  if (!courseMember || courseMember.role !== "student") redirect(`/student/group?course=${courseId}&error=${encodeURIComponent("That account must join this course as a student first.")}`);
  const { data: existing } = await admin.from("group_members").select("group_id").eq("course_id", courseId).eq("user_id", profile.id).maybeSingle();
  if (existing) redirect(`/student/group?course=${courseId}&error=${encodeURIComponent("That student already belongs to a group in this course.")}`);
  const { error } = await admin.from("group_members").insert({ group_id: group.id, course_id: courseId, user_id: profile.id });
  if (error) redirect(`/student/group?course=${courseId}&error=${encodeURIComponent(error.message)}`);
  revalidateWorkspace();
  redirect(`/student/group?course=${courseId}&message=Student%20added%20to%20the%20group.`);
}

export async function transferGroupLeadership(formData: FormData) {
  const courseId = text(formData, "course_id");
  const newLeaderId = text(formData, "new_leader_id");
  const { user } = await requireCourseRole(courseId, ["student"]);
  const admin = createAdminClient();
  const group = await getLeaderGroup(courseId, user.id);
  if (!group) redirect(`/student/group?course=${courseId}&error=Only%20the%20current%20leader%20can%20transfer%20leadership.`);
  if (newLeaderId === user.id) redirect(`/student/group?course=${courseId}`);
  const { data: member } = await admin.from("group_members").select("user_id").eq("group_id", group.id).eq("user_id", newLeaderId).maybeSingle();
  if (!member) redirect(`/student/group?course=${courseId}&error=The%20new%20leader%20must%20already%20be%20a%20member%20of%20this%20group.`);
  const { error } = await admin.from("groups").update({ leader_id: newLeaderId }).eq("id", group.id).eq("leader_id", user.id);
  if (error) redirect(`/student/group?course=${courseId}&error=${encodeURIComponent(error.message)}`);
  revalidateWorkspace();
  redirect(`/student/group?course=${courseId}&message=Leadership%20transferred.`);
}

export async function removeGroupMember(formData: FormData) {
  const courseId = text(formData, "course_id");
  const memberId = text(formData, "member_id");
  const { user } = await requireCourseRole(courseId, ["student"]);
  const admin = createAdminClient();
  const group = await getLeaderGroup(courseId, user.id);
  if (!group) redirect(`/student/group?course=${courseId}&error=Only%20the%20group%20leader%20can%20remove%20a%20member.`);
  if (memberId === user.id) redirect(`/student/group?course=${courseId}&error=Transfer%20leadership%20before%20leaving%20the%20group.`);
  const { error } = await admin.from("group_members").delete().eq("group_id", group.id).eq("user_id", memberId);
  if (error) redirect(`/student/group?course=${courseId}&error=${encodeURIComponent(error.message)}`);
  revalidateWorkspace();
  redirect(`/student/group?course=${courseId}&message=Member%20removed.`);
}

export async function joinGroup(token: string) {
  const { user } = await requireUser();
  const admin = createAdminClient();
  const { data: invite } = await admin.from("group_invites").select("*, groups!inner(id, course_id)").eq("token_hash", hash(token)).maybeSingle();
  if (!invite || invite.revoked_at || (invite.expires_at && new Date(invite.expires_at) < new Date())) redirect("/dashboard?error=This%20group%20invitation%20is%20invalid%20or%20expired.");
  if (invite.invited_email && String(user.email || "").toLowerCase() !== String(invite.invited_email).toLowerCase()) {
    redirect("/dashboard?error=This%20group%20invitation%20was%20created%20for%20a%20different%20email%20address.");
  }
  const courseId = (invite as any).groups.course_id as string;
  const { data: courseMembership } = await admin.from("course_memberships").select("role").eq("course_id", courseId).eq("user_id", user.id).maybeSingle();
  if (!courseMembership || courseMembership.role !== "student") redirect(`/dashboard?error=Join%20the%20course%20as%20a%20student%20before%20joining%20a%20group.`);
  const { count } = await admin.from("group_members").select("user_id", { count: "exact", head: true }).eq("group_id", invite.group_id);
  if ((count || 0) >= 3) redirect(`/student/dashboard?course=${courseId}&error=This%20group%20already%20has%203%20members.`);
  const { data: existing } = await admin.from("group_members").select("group_id").eq("course_id", courseId).eq("user_id", user.id).maybeSingle();
  if (existing && existing.group_id !== invite.group_id) redirect(`/student/dashboard?course=${courseId}&error=You%20already%20belong%20to%20another%20group.`);
  if (!existing) {
    const { error } = await admin.from("group_members").insert({ group_id: invite.group_id, course_id: courseId, user_id: user.id });
    if (error) redirect(`/student/dashboard?course=${courseId}&error=${encodeURIComponent(error.message)}`);
  }
  revalidateWorkspace();
  redirect(`/student/dashboard?course=${courseId}&message=Joined%20the%20group`);
}
