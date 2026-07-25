import {
  LayoutDashboard,
  MessagesSquare,
  HeartHandshake,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/* Top-level navigation kept intentionally small.
   Scripture lives as a tab inside Discussions; Languages,
   Child Profiles, and Safety live as sections under Settings. */
export const NAV: NavItem[] = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Discussions", href: "/discussions", icon: MessagesSquare },
  { label: "Parent Advice", href: "/advice", icon: HeartHandshake },
  { label: "Settings", href: "/settings", icon: Settings },
];
