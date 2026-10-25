import { NextResponse } from "next/server";
import ExcelJS from "exceljs-community";
import { requireCourseRole } from "@/lib/auth";
import { getCourse, getProfessorRows } from "@/lib/queries";
import { statusLabel } from "@/lib/utils";

function csvCell(value: string | number) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: Request, context: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await context.params;
  await requireCourseRole(courseId, ["professor", "admin", "assistant"]);
  const [course, rows] = await Promise.all([getCourse(courseId), getProfessorRows(courseId)]);
  const url = new URL(request.url);
  const format = url.searchParams.get("format") === "csv" ? "csv" : "xlsx";
  const exportRows = rows.map((row) => ({
    "Group Number": row.groupNumber,
    "Group Members": row.groupMembers,
    "Name of the Idea": row.ideaName === "—" ? "" : row.ideaName,
    "Quick Description": row.status === "not_submitted" ? "" : row.quickDescription,
    "Status": statusLabel(row.status),
  }));
  const safeName = `${course.code}-${course.semesterName}`.replace(/[^a-zA-Z0-9_-]+/g, "-");

  if (format === "csv") {
    const headers = Object.keys(exportRows[0] || { "Group Number": "", "Group Members": "", "Name of the Idea": "", "Quick Description": "", "Status": "" });
    const body = [headers.map(csvCell).join(","), ...exportRows.map((row) => headers.map((h) => csvCell((row as any)[h])).join(","))].join("\r\n");
    return new NextResponse(`\uFEFF${body}`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${safeName}.csv"` } });
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "FeasibilityHub";
  const sheet = workbook.addWorksheet("Business Ideas", { views: [{ state: "frozen", ySplit: 1 }] });
  sheet.columns = [
    { header: "Group Number", key: "Group Number", width: 15 },
    { header: "Group Members", key: "Group Members", width: 35 },
    { header: "Name of the Idea", key: "Name of the Idea", width: 32 },
    { header: "Quick Description", key: "Quick Description", width: 70 },
    { header: "Status", key: "Status", width: 20 },
  ];
  exportRows.forEach((row) => sheet.addRow(row));
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).height = 24;
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) row.alignment = { vertical: "top", wrapText: true };
  });
  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(new Uint8Array(buffer as ArrayBuffer), { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename="${safeName}.xlsx"` } });
}
