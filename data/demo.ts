import type { IdeaTableRow } from "@/lib/types";

export const demoCourse = {
  id: "demo-course",
  code: "BFS-301",
  title: "Business Feasibility Study",
  semesterName: "Fall 2026",
};

export const demoRows: IdeaTableRow[] = [
  {
    groupNumber: 1,
    groupMembers: "Zaid Khalil, Mohammad Hijjawi",
    ideaName: "Tafaddal",
    quickDescription: "A hybrid smart-card and QR payment experience for public transportation.",
    status: "approved",
  },
  {
    groupNumber: 2,
    groupMembers: "Rajaa Ibrahim",
    ideaName: "—",
    quickDescription: "No idea submitted yet.",
    status: "not_submitted",
  },
  {
    groupNumber: 3,
    groupMembers: "Osaid Basha, Ali Swalhi",
    ideaName: "Masar",
    quickDescription: "Transportation routes and local services organized in one city-first platform.",
    status: "submitted",
  },
  {
    groupNumber: 4,
    groupMembers: "Ahmad Khalil, Omar Safarini",
    ideaName: "Smart Air Quality Monitoring System",
    quickDescription: "Real-time environmental monitoring with alerts for unsafe air conditions.",
    status: "changes_requested",
  },
  {
    groupNumber: 8,
    groupMembers: "Besan Ahmad, Rahaf Abo Sefen",
    ideaName: "GlamShare",
    quickDescription: "A local marketplace that organizes occasion-dress rentals and reuse.",
    status: "approved",
  },
];

export const demoTeam = [
  { name: "Dr. Ahmad", email: "professor@example.edu", role: "Professor" },
  { name: "Maya Admin", email: "admin@example.edu", role: "Admin" },
  { name: "Sami Assistant", email: "assistant@example.edu", role: "Assistant" },
];
