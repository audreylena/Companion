"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Plus, Sparkles } from "lucide-react";
import { NAV } from "./nav";
import { children as allChildren, getChild, type Child } from "@/lib/mock";
import { cx } from "./ui";

/* ---------------- shared app state ---------------- */

interface AppState {
  child: Child;
  childId: string;
  setChildId: (id: string) => void;
  children: Child[];
  plushConnected: boolean;
  setPlushConnected: (v: boolean) => void;
}

const AppCtx = createContext<AppState | null>(null);

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used inside AppShell");
  return ctx;
}

/* ---------------- brand mark ---------------- */

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="inline-flex items-center justify-center rounded-2xl"
        style={{ width: 34, height: 34, background: "var(--primary)", color: "#1f3a5c" }}
      >
        <Sparkles size={18} />
      </span>
      <div className="leading-tight">
        <p className="text-[15px] font-bold" style={{ color: "var(--text)" }}>
          Companion
        </p>
        <p className="text-[11px] muted">Parent space</p>
      </div>
    </div>
  );
}

/* ---------------- child switcher ---------------- */

function ChildAvatar({ child, size = 30 }: { child: Child; size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-bold shrink-0"
      style={{ width: size, height: size, background: child.accent, color: "#33475b", fontSize: size * 0.42 }}
      aria-hidden
    >
      {child.name[0]}
    </span>
  );
}

function ChildSwitcher() {
  const { child, children, setChildId } = useApp();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2.5 w-full rounded-2xl px-2.5 py-2 transition-colors hover:bg-white"
        style={{ border: "1px solid var(--border)", background: "var(--card)" }}
      >
        <ChildAvatar child={child} />
        <span className="flex-1 text-left leading-tight min-w-0">
          <span className="block text-sm font-semibold truncate" style={{ color: "var(--text)" }}>
            {child.name}
          </span>
          <span className="block text-[11px] muted truncate">{child.ageRange}</span>
        </span>
        <ChevronDown size={16} className="muted" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden />
          <ul
            role="listbox"
            className="absolute z-40 left-0 right-0 mt-2 p-1.5 rounded-2xl bg-white"
            style={{ border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}
          >
            {children.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={c.id === child.id}
                  onClick={() => {
                    setChildId(c.id);
                    setOpen(false);
                  }}
                  className={cx(
                    "flex items-center gap-2.5 w-full rounded-xl px-2.5 py-2 text-left transition-colors",
                    c.id === child.id ? "bg-[var(--primary-soft)]" : "hover:bg-[var(--surface-2)]"
                  )}
                >
                  <ChildAvatar child={c} />
                  <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
                    {c.name}
                  </span>
                </button>
              </li>
            ))}
            <li>
              <Link
                href="/profiles"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 w-full rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-[var(--surface-2)] muted"
              >
                <span
                  className="inline-flex items-center justify-center rounded-full"
                  style={{ width: 30, height: 30, border: "1px dashed var(--border)" }}
                >
                  <Plus size={15} />
                </span>
                <span className="text-sm font-medium">Add a child</span>
              </Link>
            </li>
          </ul>
        </>
      )}
    </div>
  );
}

/* ---------------- plush status ---------------- */

function PlushStatus() {
  const { child, plushConnected } = useApp();
  return (
    <div
      className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5"
      style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
    >
      <span className="text-lg" aria-hidden>🧸</span>
      <div className="flex-1 leading-tight">
        <p className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>
          {child.companionName}
        </p>
        <p className="text-[11px] muted">
          {plushConnected ? "Connected" : "Disconnected"}
        </p>
      </div>
      <span
        className="rounded-full"
        style={{ width: 9, height: 9, background: plushConnected ? "#5FAE86" : "#C6A15B" }}
        aria-label={plushConnected ? "Companion connected" : "Companion disconnected"}
      />
    </div>
  );
}

/* ---------------- navigation ---------------- */

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cx("nav-item", active && "nav-item-active")}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/* ---------------- shell ---------------- */

export default function AppShell({ children }: { children: ReactNode }) {
  const [childId, setChildId] = useState(allChildren[0].id);
  const [plushConnected, setPlushConnected] = useState(true);
  const [drawer, setDrawer] = useState(false);

  const value = useMemo<AppState>(
    () => ({
      child: getChild(childId),
      childId,
      setChildId,
      children: allChildren,
      plushConnected,
      setPlushConnected,
    }),
    [childId, plushConnected]
  );

  return (
    <AppCtx.Provider value={value}>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col fixed top-0 left-0 z-40 w-64 h-screen p-4 gap-4"
        style={{ background: "var(--sidebar)", borderRight: "1px solid var(--border)" }}
      >
        <div className="px-2 pt-2">
          <Brand />
        </div>
        <div className="px-1">
          <ChildSwitcher />
        </div>
        <div className="flex-1 overflow-y-auto px-1">
          <NavList />
        </div>
        <div className="px-1">
          <PlushStatus />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div
        className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3"
        style={{ background: "var(--sidebar)", borderBottom: "1px solid var(--border)" }}
      >
        <Brand />
        <button
          type="button"
          onClick={() => setDrawer(true)}
          aria-label="Open menu"
          className="inline-flex items-center justify-center rounded-xl"
          style={{ width: 40, height: 40, background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <Menu size={20} style={{ color: "var(--text)" }} />
        </button>
      </div>

      {/* Mobile drawer */}
      {drawer && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0" style={{ background: "rgba(20,32,46,.35)" }} onClick={() => setDrawer(false)} />
          <div
            className="absolute top-0 left-0 h-full w-[82%] max-w-xs p-4 flex flex-col gap-4"
            style={{ background: "var(--sidebar)" }}
          >
            <div className="flex items-center justify-between px-1 pt-1">
              <Brand />
              <button
                type="button"
                onClick={() => setDrawer(false)}
                aria-label="Close menu"
                className="inline-flex items-center justify-center rounded-xl"
                style={{ width: 38, height: 38, background: "var(--card)", border: "1px solid var(--border)" }}
              >
                <X size={18} style={{ color: "var(--text)" }} />
              </button>
            </div>
            <ChildSwitcher />
            <div className="flex-1 overflow-y-auto">
              <NavList onNavigate={() => setDrawer(false)} />
            </div>
            <PlushStatus />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="md:ml-64 min-h-screen">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-7 md:py-9 pb-24 md:pb-14">
          {children}
        </div>
      </main>
    </AppCtx.Provider>
  );
}
