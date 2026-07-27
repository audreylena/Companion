import {
  LayoutDashboard,
  MessagesSquare,
  HeartHandshake,
  BookOpenText,
  Languages,
  Users,
  ShieldCheck,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV: NavItem[] = [
  { label: "Overview", href: "/parent", icon: LayoutDashboard },
  { label: "Discussions", href: "/parent/discussions", icon: MessagesSquare },
  { label: "Parent Advice", href: "/parent/advice", icon: HeartHandshake },
  { label: "Scripture", href: "/parent/scripture", icon: BookOpenText },
  { label: "Languages", href: "/parent/languages", icon: Languages },
  { label: "Child Profiles", href: "/parent/profiles", icon: Users },
  { label: "Safety", href: "/parent/safety", icon: ShieldCheck },
  { label: "Settings", href: "/parent/settings", icon: Settings },
];
