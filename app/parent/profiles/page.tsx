"use client";

import { useState } from "react";
import { Plus, Check, BookOpen, Languages as LangIcon, Heart, Accessibility } from "lucide-react";
import { useApp } from "@/components/AppShell";
import { PageHeader, Card, SectionHeading, Button, Toggle, cx } from "@/components/ui";
import { themeEmoji, type Child } from "@/lib/mock";

function ProfileCard({
  c,
  active,
  onSelect,
}: {
  c: Child;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cx("card !p-5 text-left transition-all w-full")}
      style={active ? { boxShadow: "0 0 0 2px var(--primary), var(--shadow)" } : undefined}
    >
      <div className="flex items-center gap-3">
        <span
          className="inline-flex items-center justify-center rounded-full font-bold shrink-0"
          style={{ width: 48, height: 48, background: c.accent, color: "#33475b", fontSize: 20 }}
          aria-hidden
        >
          {c.name[0]}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-base font-bold" style={{ color: "var(--text)" }}>{c.name}</p>
            {active && <span className="badge badge--calm"><Check size={12} /> Active</span>}
          </div>
          <p className="text-xs muted">{c.ageRange} · Companion “{c.companionName}”</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {c.favoriteTopics.map((t) => (
          <span key={t} className="badge badge--neutral"><span aria-hidden>{themeEmoji[t]}</span> {t}</span>
        ))}
      </div>
    </button>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof BookOpen; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
      <span className="inline-flex items-center justify-center rounded-xl shrink-0"
        style={{ width: 34, height: 34, background: "var(--surface-2)", color: "var(--ink-blue)" }}>
        <Icon size={16} />
      </span>
      <span className="text-sm muted flex-1">{label}</span>
      <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{value}</span>
    </div>
  );
}

export default function ProfilesPage() {
  const { child, children, childId, setChildId } = useApp();
  const [notify, setNotify] = useState(child.notify);

  // keep local notify in sync when switching children
  const activeNotify = notify && childId === child.id ? notify : child.notify;

  return (
    <>
      <PageHeader title="Child profiles" subtitle="Create and switch between the children who use Companion" />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        {children.map((c) => (
          <ProfileCard
            key={c.id}
            c={c}
            active={c.id === childId}
            onSelect={() => { setChildId(c.id); setNotify(c.notify); }}
          />
        ))}
        <button
          type="button"
          className="card !p-5 flex flex-col items-center justify-center text-center gap-2 min-h-[140px]"
          style={{ borderStyle: "dashed" }}
        >
          <span className="inline-flex items-center justify-center rounded-full"
            style={{ width: 44, height: 44, background: "var(--primary-soft)", color: "var(--ink-blue)" }}>
            <Plus size={22} />
          </span>
          <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>Add a child</span>
          <span className="text-xs muted">Only the basics — nothing sensitive</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <SectionHeading title={`${child.name}'s preferences`} action={<Button variant="ghost">Edit</Button>} />
          <div>
            <InfoRow icon={LangIcon} label="Primary language" value={child.primaryLanguage} />
            {child.secondaryLanguage && <InfoRow icon={LangIcon} label="Secondary language" value={child.secondaryLanguage} />}
            <InfoRow icon={BookOpen} label="Scripture translation" value={child.translation} />
            <InfoRow icon={BookOpen} label="Reading level" value={child.readingLevel} />
            <InfoRow icon={Heart} label="Companion name" value={child.companionName} />
            <div className="flex items-center gap-3 py-3">
              <span className="inline-flex items-center justify-center rounded-xl shrink-0"
                style={{ width: 34, height: 34, background: "var(--surface-2)", color: "var(--ink-blue)" }}>
                <Accessibility size={16} />
              </span>
              <span className="text-sm muted flex-1">Accessibility</span>
              <span className="text-sm font-medium" style={{ color: "var(--text)" }}>Calm voice, slower pace</span>
            </div>
          </div>
        </Card>

        <Card>
          <SectionHeading title="When to let you know" hint="You choose what reaches you" />
          <Toggle
            checked={activeNotify.highRisk}
            onChange={(v) => setNotify({ ...activeNotify, highRisk: v })}
            label="Sensitive or high-care moments"
            description="Always recommended — you'll be notified right away."
          />
          <div style={{ borderTop: "1px solid var(--border)" }} />
          <Toggle
            checked={activeNotify.newTopics}
            onChange={(v) => setNotify({ ...activeNotify, newTopics: v })}
            label="New topics explored"
            description="A gentle heads-up when a fresh theme comes up."
          />
          <div style={{ borderTop: "1px solid var(--border)" }} />
          <Toggle
            checked={activeNotify.dailyReflections}
            onChange={(v) => setNotify({ ...activeNotify, dailyReflections: v })}
            label="Daily reflection summary"
            description="One calm summary at the end of the day."
          />
        </Card>
      </div>
    </>
  );
}
