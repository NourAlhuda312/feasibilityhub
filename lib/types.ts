export type CourseRole = "professor" | "admin" | "assistant" | "student";
export type IdeaStatus = "draft" | "submitted" | "in_review" | "changes_requested" | "approved";

export type CourseSummary = {
  id: string;
  code: string;
  title: string;
  semesterName: string;
  role: CourseRole;
};

export type IdeaTableRow = {
  ideaId?: string;
  groupId?: string;
  groupNumber: number;
  groupMembers: string;
  ideaName: string;
  quickDescription: string;
  status: IdeaStatus | "not_submitted";
};

export type GroupMember = {
  userId: string;
  fullName: string;
  email?: string;
  isLeader: boolean;
};
