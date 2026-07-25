import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Companion",
  description: "Talk to your companion.",
};

export default function DeviceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="device-root">{children}</div>;
}
