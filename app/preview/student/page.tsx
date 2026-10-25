"use client";

import { StudentDashboardView } from "@/components/student-dashboard-view";
import { useDemoState } from "@/lib/demo-state";

export default function StudentPreviewPage() {
  const { state } = useDemoState();
  const group = state.groups.find((g) => g.members.some((m) => m.id === state.currentStudentId));
  const members = (group?.members || []).map((m) => ({ userId: m.id, fullName: m.name, email: m.email, isLeader: group?.leaderId === m.id }));
  return (
    <StudentDashboardView
      courseId={state.course.id}
      courseCode={state.course.code}
      semester={state.course.semester}
      groupNumber={group?.number}
      members={members}
      ideaTitle={group?.idea?.title}
      ideaDescription={group?.idea?.description}
      status={group?.idea?.status || "not_submitted"}
      feedback={group?.idea?.feedback}
      preview
    />
  );
}
