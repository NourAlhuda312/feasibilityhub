import { createClient } from "@/lib/supabase/server";
import type { CourseRole, GroupMember, IdeaTableRow, IdeaStatus } from "@/lib/types";

export async function getMyCourses() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("course_memberships")
    .select("role, course_id, courses!inner(id, code, title, semester_id, academic_semesters(name))")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((row: any) => ({
    id: row.courses.id as string,
    code: row.courses.code as string,
    title: row.courses.title as string,
    semesterName: row.courses.academic_semesters?.name || "Semester",
    role: row.role as CourseRole,
  }));
}

export async function getCourse(courseId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id, code, title, status, join_code, academic_semesters(name)")
    .eq("id", courseId)
    .single();
  if (error) throw error;
  return {
    id: data.id as string,
    code: data.code as string,
    title: data.title as string,
    status: data.status as string,
    joinCode: data.join_code as string,
    semesterName: (data as any).academic_semesters?.name || "Semester",
  };
}

export async function getProfessorRows(courseId: string): Promise<IdeaTableRow[]> {
  const supabase = await createClient();
  const { data: groups, error: groupError } = await supabase
    .from("groups")
    .select("id, group_number")
    .eq("course_id", courseId)
    .order("group_number");
  if (groupError) throw groupError;
  if (!groups?.length) return [];
  const groupIds = groups.map((g) => g.id);

  const [{ data: members, error: memberError }, { data: ideas, error: ideaError }] = await Promise.all([
    supabase.from("group_members").select("group_id, user_id, profiles!group_members_user_id_fkey(full_name)").in("group_id", groupIds),
    supabase.from("ideas").select("id, group_id, status, current_revision").in("group_id", groupIds),
  ]);
  if (memberError) throw memberError;
  if (ideaError) throw ideaError;

  const ideaIds = (ideas || []).map((i) => i.id);
  const { data: revisions, error: revisionError } = ideaIds.length
    ? await supabase.from("idea_revisions").select("idea_id, revision_number, title, quick_description").in("idea_id", ideaIds)
    : { data: [], error: null };
  if (revisionError) throw revisionError;

  return groups.map((group) => {
    const groupMembers = (members || []).filter((m: any) => m.group_id === group.id).map((m: any) => m.profiles?.full_name || "Student");
    const idea: any = (ideas || []).find((i: any) => i.group_id === group.id);
    const revision: any = idea ? (revisions || []).find((r: any) => r.idea_id === idea.id && r.revision_number === idea.current_revision) : undefined;
    return {
      ideaId: idea?.id,
      groupId: group.id,
      groupNumber: group.group_number,
      groupMembers: groupMembers.join(", ") || "No members",
      ideaName: revision?.title || "—",
      quickDescription: revision?.quick_description || "No idea submitted yet.",
      status: (idea?.status || "not_submitted") as IdeaStatus | "not_submitted",
    };
  });
}

export async function getStudentWorkspace(courseId: string, userId: string) {
  const supabase = await createClient();
  const { data: membership, error: membershipError } = await supabase
    .from("group_members")
    .select("group_id, groups!inner(id, group_number, leader_id, course_id)")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();
  if (membershipError) throw membershipError;
  if (!membership) return { group: null, members: [] as GroupMember[], idea: null, feedback: undefined };

  const group: any = (membership as any).groups;
  const [{ data: members, error: memberError }, { data: idea, error: ideaError }] = await Promise.all([
    supabase.from("group_members").select("user_id, profiles!group_members_user_id_fkey(full_name,email)").eq("group_id", group.id),
    supabase.from("ideas").select("id, status, current_revision").eq("group_id", group.id).maybeSingle(),
  ]);
  if (memberError) throw memberError;
  if (ideaError) throw ideaError;

  let revision: any = null;
  let feedback: string | undefined;
  if (idea) {
    const [{ data: currentRevision }, { data: review }] = await Promise.all([
      supabase.from("idea_revisions").select("title, quick_description").eq("idea_id", idea.id).eq("revision_number", idea.current_revision).maybeSingle(),
      supabase.from("idea_reviews").select("feedback").eq("idea_id", idea.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    ]);
    revision = currentRevision;
    feedback = review?.feedback || undefined;
  }

  const normalizedMembers: GroupMember[] = (members || [])
    .map((m: any) => ({
      userId: m.user_id as string,
      fullName: m.profiles?.full_name || "Student",
      email: m.profiles?.email || undefined,
      isLeader: m.user_id === group.leader_id,
    }))
    .sort((a, b) => Number(b.isLeader) - Number(a.isLeader));

  return {
    group,
    members: normalizedMembers,
    idea: idea ? { ...idea, title: revision?.title, quickDescription: revision?.quick_description } : null,
    feedback,
  };
}
