import { NextResponse } from "next/server";
import ExcelJS from "exceljs-community";
import { statusLabel } from "@/lib/utils";

function csvCell(value: string | number) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const format = url.searchParams.get("format") === "csv" ? "csv" : "xlsx";
  const demo = [
    [1, "Zaid Khalil, Mohammad Hijjawi", "Tafaddal", "A hybrid smart-card and QR payment experience for public transportation in Palestine.", "approved"],
    [3, "Osaid Basha, Ali Swalhi", "Masar", "Transportation routes, fares, destinations, and local services organized in one city-first platform.", "submitted"],
    [6, "Lina Ahmad, Omar Nassar", "CoCompass", "Indoor and outdoor navigation for large spaces that works offline using only the user's device.", "submitted"],
    [7, "Farah Saleh, Hana Naser", "Farhatna", "A student venture concept being refined through the feasibility-study workflow.", "changes_requested"],
  ] as const;
  const rows = demo.map(([number, members, name, description, status]) => ({
    "Group Number": number,
    "Group Members": members,
    "Name of the Idea": name,
    "Quick Description": description,
    "Status": statusLabel(status),
  }));
  const safeName = "BFS-301-Fall-2026-demo";

  if (format === "csv") {
    const headers = ["Group Number", "Group Members", "Name of the Idea", "Quick Description", "Status"];
    const body = [headers.map(csvCell).join(","), ...rows.map((row) => headers.map((h) => csvCell((row as any)[h])).join(","))].join("\r\n");
    return new NextResponse(`\uFEFF${body}`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${safeName}.csv"` } });
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "FeasibilityHub";
  const sheet = workbook.addWorksheet("Business Ideas", { views: [{ state: "frozen", ySplit: 1 }] });
  sheet.columns = [
    { header: "Group Number", key: "Group Number", width: 15 },
    { header: "Group Members", key: "Group Members", width: 35 },
    { header: "Name of the Idea", key: "Name of the Idea", width: 30 },
    { header: "Quick Description", key: "Quick Description", width: 70 },
    { header: "Status", key: "Status", width: 20 },
  ];
  rows.forEach((row) => sheet.addRow(row));
  sheet.getRow(1).font = { bold: true };
  sheet.eachRow((row, rowNumber) => { if (rowNumber > 1) row.alignment = { vertical: "top", wrapText: true }; });
  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(new Uint8Array(buffer as ArrayBuffer), { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename="${safeName}.xlsx"` } });
}
