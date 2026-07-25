import type { Metadata } from "next";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Companion — Parent Space",
  description:
    "A calm, multilingual parent companion for a Scripture-integrated plushie experience.",
};

export default function ParentLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AppShell>{children}</AppShell>;
}
