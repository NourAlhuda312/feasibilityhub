import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FeasibilityHub",
  description: "Business feasibility course workspace for professors and student teams.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
