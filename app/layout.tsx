import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import { ToastNotice } from "@/components/toast-notice";

export const metadata: Metadata = {
  title: "FeasibilityHub",
  description: "Business feasibility course workspace for professors and student teams.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}<Suspense fallback={null}><ToastNotice /></Suspense></body>
    </html>
  );
}
