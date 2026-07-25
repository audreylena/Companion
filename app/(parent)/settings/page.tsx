"use client";

import Link from "next/link";
import {
  Bell,
  Languages as LangIcon,
  Users,
  ShieldCheck,
  Lock,
  ChevronRight,
  LogOut,
  Plug,
  BadgeCheck,
} from "lucide-react";
import { useApp } from "@/components/AppShell";
import { PageHeader, Card, SectionHeading, Button } from "@/components/ui";

function LinkRow({
  href,
  icon: Icon,
  label,
  desc,
}: {
  href: string;
  icon: typeof Bell;
  label: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 py-3.5 transition-colors rounded-xl -mx-2 px-2 hover:bg-[var(--surface-2)]"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <span className="inline-flex items-center justify-center rounded-xl shrink-0"
        style={{ width: 36, height: 36, background: "var(--surface-2)", color: "var(--ink-blue)" }}>
        <Icon size={17} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium" style={{ color: "var(--text)" }}>{label}</span>
        <span className="block text-xs muted">{desc}</span>
      </span>
      <ChevronRight size={17} className="muted" />
    </Link>
  );
}

function ServiceRow({ name, detail, ok = true }: { name: string; detail: string; ok?: boolean }) {
  return (
    <div className="flex items-center gap-3 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
      <span className="rounded-full shrink-0" style={{ width: 9, height: 9, background: ok ? "#5FAE86" : "#C6A15B" }} />
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium" style={{ color: "var(--text)" }}>{name}</span>
        <span className="block text-xs muted">{detail}</span>
      </span>
      <span className={ok ? "badge badge--calm" : "badge badge--attention"}>
        <BadgeCheck size={12} /> {ok ? "Connected" : "Check"}
      </span>
    </div>
  );
}

export default function SettingsPage() {
  const { child, plushConnected, setPlushConnected } = useApp();

  return (
    <>
      <PageHeader title="Settings" subtitle="Your account, your companion, your connections" />

      <div className="grid lg:grid-cols-2 gap-5">
        {/* account */}
        <Card>
          <SectionHeading title="Account" />
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center rounded-full font-bold shrink-0"
              style={{ width: 48, height: 48, background: "var(--primary)", color: "#33475b", fontSize: 19 }}>A</span>
            <div>
              <p className="text-base font-semibold" style={{ color: "var(--text)" }}>Audrey</p>
              <p className="text-xs muted">asuaudrey06@gmail.com</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="ghost">Edit profile</Button>
            <Button variant="ghost">Family plan</Button>
          </div>
        </Card>

        {/* connected companion */}
        <Card>
          <SectionHeading title="Connected companion" />
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden>🧸</span>
            <div className="flex-1">
              <p className="text-base font-semibold" style={{ color: "var(--text)" }}>{child.companionName}</p>
              <p className="text-xs muted">
                {plushConnected ? "Connected · battery 82% · firmware 1.4" : "Not connected"}
              </p>
            </div>
            <span
              className="rounded-full"
              style={{ width: 10, height: 10, background: plushConnected ? "#5FAE86" : "#C6A15B" }}
              aria-label={plushConnected ? "Connected" : "Disconnected"}
            />
          </div>
          <div className="mt-4">
            <Button
              variant={plushConnected ? "ghost" : "primary"}
              icon={Plug}
              onClick={() => setPlushConnected(!plushConnected)}
            >
              {plushConnected ? "Disconnect companion" : "Reconnect companion"}
            </Button>
          </div>
        </Card>

        {/* services */}
        <Card>
          <SectionHeading title="Connected services" hint="Powering Scripture &amp; understanding" />
          <ServiceRow name="YouVersion Platform" detail="Scripture in 2,000+ languages" />
          <ServiceRow name="Gloo AI Studio" detail="Faith-tuned understanding & safety" />
          <div className="pt-1" />
        </Card>

        {/* quick links */}
        <Card>
          <SectionHeading title="Preferences" />
          <div>
            <LinkRow href="/languages" icon={LangIcon} label="Language" desc="Spoken, dashboard & Scripture" />
            <LinkRow href="/profiles" icon={Users} label="Child profiles" desc="Add or switch children" />
            <LinkRow href="/safety" icon={ShieldCheck} label="Safety controls" desc="Boundaries & alerts" />
            <LinkRow href="/safety" icon={Lock} label="Privacy" desc="What's kept, and for how long" />
            <LinkRow href="/profiles" icon={Bell} label="Notifications" desc="What reaches you, and when" />
          </div>
        </Card>

        {/* appearance + sign out */}
        <Card className="flex flex-col justify-between">
          <div>
            <SectionHeading title="Appearance" />
            <p className="text-sm muted">Companion uses a calm, soft-light theme designed to be easy on the eyes for the whole family.</p>
          </div>
          <div className="mt-5 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <button
              type="button"
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: "var(--alert-ink)" }}
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </Card>
      </div>
    </>
  );
}
