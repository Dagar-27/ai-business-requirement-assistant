import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Business Requirements Assistant",
  description: "Convert rough stakeholder notes into structured BRDs, User Stories, Acceptance Criteria, and Test Cases.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
