import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Companion",
  description:
    "A faith companion for children — and a calm discipleship briefing for their parents.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
