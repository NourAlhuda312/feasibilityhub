import { redirect } from "next/navigation";
import { StudentDashboardView } from "@/components/student-dashboard-view";
import { requireCourseRole } from "@/lib/auth";
import { getCourse, getMyCourses, getStudentWorkspace } from "@/lib/queries";

export default async function StudentDashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  let courseId = typeof params.course === "string" ? params.course : undefined;
  if (!courseId) {
    const courses = (await getMyCourses()).filter((c) => c.role === "student");
    if (!courses.length) redirect("/dashboard");
    courseId = courses[0].id;
  }
  const { user } = await requireCourseRole(courseId, ["student"]);
  const [course, workspace] = await Promise.all([getCourse(courseId), getStudentWorkspace(courseId, user.id)]);
  return (
    <StudentDashboardView
      courseId={course.id}
      courseCode={course.code}
      semester={course.semesterName}
      groupNumber={workspace.group?.group_number}
      members={workspace.members}
      ideaTitle={workspace.idea?.title}
      ideaDescription={workspace.idea?.quickDescription}
      status={workspace.idea?.status || "not_submitted"}
      feedback={workspace.feedback}
    />
  );
}
