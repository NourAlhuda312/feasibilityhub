import { redirect } from "next/navigation";
import { ProfessorDashboardView } from "@/components/professor-dashboard-view";
import { requireCourseRole } from "@/lib/auth";
import { getCourse, getMyCourses, getProfessorRows } from "@/lib/queries";

export default async function ProfessorDashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  let courseId = typeof params.course === "string" ? params.course : undefined;
  if (!courseId) {
    const courses = (await getMyCourses()).filter((c) => c.role !== "student");
    if (!courses.length) redirect("/dashboard");
    courseId = courses[0].id;
  }
  await requireCourseRole(courseId, ["professor", "admin", "assistant"]);
  const [course, rows] = await Promise.all([getCourse(courseId), getProfessorRows(courseId)]);
  return <ProfessorDashboardView courseId={course.id} courseCode={course.code} courseTitle={course.title} semester={course.semesterName} rows={rows} />;
}
