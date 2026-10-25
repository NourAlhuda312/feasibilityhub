"use server";

import { redirect } from "next/navigation";
import { requireCourseRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidateWorkspace } from "@/lib/revalidate-workspace";

const text = (fd: FormData, key: string) => String(fd.get(key) || "").trim();

export async function submitIdea(formData: FormData) {
  const courseId = text(formData, "course_id");
  const title = text(formData, "title");
  const quickDescription = text(formData, "quick_description");
  const { user } = await requireCourseRole(courseId, ["student"]);
  if (title.length < 2 || title.length > 160 || quickDescription.length < 20 || quickDescription.length > 3000) {
    redirect(`/student/idea?course=${courseId}&error=Idea%20name%20must%20be%202-160%20characters%20and%20description%2020-3000%20characters.`);
  }
  const admin = createAdminClient();
  const { data: group } = await admin.from("groups").select("id, leader_id").eq("course_id", courseId).eq("leader_id", user.id).maybeSingle();
  if (!group) redirect(`/student/idea?course=${courseId}&error=Only%20the%20group%20leader%20can%20submit%20the%20idea.`);
  const { data: existing } = await admin.from("ideas").select("id, status, current_revision").eq("group_id", group.id).maybeSingle();
  if (existing?.status === "in_review") redirect(`/student/idea?course=${courseId}&error=Your%20idea%20is%20currently%20being%20reviewed.%20Editing%20is%20locked%20until%20the%20professor%20requests%20changes.`);
  if (existing?.status === "approved") redirect(`/student/idea?course=${courseId}&error=The%20approved%20idea%20is%20locked.`);

  const revisionNumber = existing ? Number(existing.current_revision) + 1 : 1;
  let ideaId = existing?.id as string | undefined;
  let createdNew = false;
  if (!ideaId) {
    const created = await admin.from("ideas").insert({ group_id: group.id, status: "submitted", current_revision: revisionNumber }).select("id").single();
    if (created.error) redirect(`/student/idea?course=${courseId}&error=${encodeURIComponent(created.error.message)}`);
    ideaId = created.data.id;
    createdNew = true;
  }
  const revision = await admin.from("idea_revisions").insert({ idea_id: ideaId, revision_number: revisionNumber, title, quick_description: quickDescription, submitted_by: user.id });
  if (revision.error) {
    if (createdNew) await admin.from("ideas").delete().eq("id", ideaId);
    redirect(`/student/idea?course=${courseId}&error=${encodeURIComponent(revision.error.message)}`);
  }
  if (existing) {
    const { error } = await admin.from("ideas").update({ status: "submitted", current_revision: revisionNumber }).eq("id", ideaId).in("status", ["draft", "submitted", "changes_requested"]);
    if (error) redirect(`/student/idea?course=${courseId}&error=${encodeURIComponent(error.message)}`);
  }
  revalidateWorkspace();
  redirect(`/student/dashboard?course=${courseId}&message=Idea%20submitted%20for%20review`);
}

export async function startReview(formData: FormData) {
  const courseId = text(formData, "course_id");
  const ideaId = text(formData, "idea_id");
  await requireCourseRole(courseId, ["professor", "admin", "assistant"]);
  const admin = createAdminClient();
  const { data: idea } = await admin.from("ideas").select("id,status,groups!inner(course_id)").eq("id", ideaId).maybeSingle();
  if (!idea || (idea as any).groups.course_id !== courseId) redirect(`/professor/ideas?course=${courseId}&error=Idea%20not%20found.`);
  if (idea.status === "submitted") {
    const { error } = await admin.from("ideas").update({ status: "in_review" }).eq("id", ideaId).eq("status", "submitted");
    if (error) redirect(`/professor/ideas?course=${courseId}&error=${encodeURIComponent(error.message)}`);
  }
  revalidateWorkspace();
  redirect(`/professor/ideas/${ideaId}?course=${courseId}&message=Review%20started`);
}

export async function reviewIdea(formData: FormData) {
  const courseId = text(formData, "course_id");
  const ideaId = text(formData, "idea_id");
  const decision = text(formData, "decision");
  const feedback = text(formData, "feedback");
  const { user } = await requireCourseRole(courseId, ["professor", "admin", "assistant"]);
  if (!["approve", "request_changes"].includes(decision)) redirect(`/professor/dashboard?course=${courseId}&error=Invalid%20decision`);
  if (decision === "request_changes" && feedback.length < 3) redirect(`/professor/ideas/${ideaId}?course=${courseId}&error=Feedback%20is%20required%20when%20requesting%20changes.`);
  const admin = createAdminClient();
const { data: idea, error: ideaError } = await admin
  .from("ideas")
  .select("id, status, current_revision, groups!inner(course_id)")
  .eq("id", ideaId)
  .single();

if (ideaError || !idea) {
  redirect(
    `/professor/dashboard?course=${courseId}&error=Idea%20not%20found.`
  );
}
  if ((idea as any).groups.course_id !== courseId) redirect(`/professor/dashboard?course=${courseId}&error=Idea%20does%20not%20belong%20to%20this%20course.`);
  if (idea.status !== "in_review") redirect(`/professor/ideas/${ideaId}?course=${courseId}&error=Start%20the%20review%20before%20saving%20a%20decision.`);
  const { data: revision, error: revisionError } = await admin
  .from("idea_revisions")
  .select("id")
  .eq("idea_id", ideaId)
  .eq("revision_number", idea.current_revision)
  .single();

if (revisionError || !revision) {
  redirect(
    `/professor/ideas/${ideaId}?course=${courseId}&error=Revision%20not%20found.`
  );
}
  const status = decision === "approve" ? "approved" : "changes_requested";
  const updated = await admin.from("ideas").update({ status }).eq("id", ideaId);
  if (updated.error) redirect(`/professor/ideas/${ideaId}?course=${courseId}&error=${encodeURIComponent(updated.error.message)}`);
  const review = await admin.from("idea_reviews").insert({ idea_id: ideaId, revision_id: revision.id, reviewer_id: user.id, decision, feedback: feedback || null });
  if (review.error) redirect(`/professor/ideas/${ideaId}?course=${courseId}&error=${encodeURIComponent(review.error.message)}`);
  revalidateWorkspace();
  redirect(`/professor/dashboard?course=${courseId}&message=${decision === "approve" ? "Idea%20approved" : "Changes%20requested"}`);
}
