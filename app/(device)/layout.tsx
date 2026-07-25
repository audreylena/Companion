import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Companion",
  description: "Squeeze and talk to your companion.",
};

// The device surface stands in for plushie hardware, so it is treated as a
// kiosk: no zoom, no bounce, and content allowed under the notch.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#F4F7FB",
};

export default function DeviceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="device-root">{children}</div>;
}
