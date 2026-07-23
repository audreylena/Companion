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
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Discussions", href: "/discussions", icon: MessagesSquare },
  { label: "Parent Advice", href: "/advice", icon: HeartHandshake },
  { label: "Scripture", href: "/scripture", icon: BookOpenText },
  { label: "Languages", href: "/languages", icon: Languages },
  { label: "Child Profiles", href: "/profiles", icon: Users },
  { label: "Safety", href: "/safety", icon: ShieldCheck },
  { label: "Settings", href: "/settings", icon: Settings },
];
