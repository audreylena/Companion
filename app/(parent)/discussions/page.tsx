"use client";

import { useMemo, useState } from "react";
import { Lock } from "lucide-react";
import { useApp } from "@/components/AppShell";
import { PageHeader, Chip, SegmentedControl, EmptyState, Card } from "@/components/ui";
import { ConversationCard } from "@/components/cards";
import {
  conversationsFor,
  themeEmoji,
  type ThemeCategory,
  type ToneKey,
  toneLabel,
} from "@/lib/mock";

type Range = "today" | "week" | "month" | "all";
const withinRange = (iso: string, r: Range) => {
  const t = +new Date(iso);
  const now = Date.now();
  if (r === "today") return new Date(iso).toDateString() === new Date().toDateString();
  if (r === "week") return t > now - 7 * 864e5;
  if (r === "month") return t > now - 31 * 864e5;
  return true;
};

const THEMES: ThemeCategory[] = [
  "Courage", "Peace", "Friendship", "Gratitude", "Identity", "Forgiveness", "Hope",
];
const TONES: ToneKey[] = ["calm", "joyful", "reflective", "attention"];

export default function DiscussionsPage() {
  const { child } = useApp();
  const [range, setRange] = useState<Range>("week");
  const [theme, setTheme] = useState<ThemeCategory | null>(null);
  const [tone, setTone] = useState<ToneKey | null>(null);

  const all = conversationsFor(child.id);
  const list = useMemo(
    () =>
      all.filter(
        (c) =>
          withinRange(c.date, range) &&
          (!theme || c.theme === theme) &&
          (!tone || c.toneKey === tone)
      ),
    [all, range, theme, tone]
  );

  return (
    <>
      <PageHeader
        title="Discussions"
        subtitle={`Gentle summaries of the themes ${child.name} has explored`}
        right={
          <SegmentedControl
            value={range}
            onChange={setRange}
            options={[
              { value: "today", label: "Today" },
              { value: "week", label: "Week" },
              { value: "month", label: "Month" },
              { value: "all", label: "All" },
            ]}
          />
        }
      />

      {/* privacy notice */}
      <Card tint className="!py-4 mb-5 flex items-start gap-3">
        <Lock size={18} className="shrink-0 mt-0.5" style={{ color: "var(--ink-blue)" }} />
        <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
          Companion focuses on <strong>conversation themes</strong> and safety-relevant summaries,
          not a word-for-word record. {child.name}&rsquo;s private words stay private.
        </p>
      </Card>

      {/* filters */}
      <div className="space-y-3 mb-6">
        <div className="flex flex-wrap gap-2">
          <Chip active={!theme} onClick={() => setTheme(null)}>All themes</Chip>
          {THEMES.map((t) => (
            <Chip key={t} active={theme === t} onClick={() => setTheme(theme === t ? null : t)}>
              <span aria-hidden>{themeEmoji[t]}</span> {t}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip active={!tone} onClick={() => setTone(null)}>Any tone</Chip>
          {TONES.map((t) => (
            <Chip key={t} active={tone === t} onClick={() => setTone(tone === t ? null : t)}>
              {toneLabel[t]}
            </Chip>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState
          emoji="🍃"
          title="Nothing in this view"
          note="Try a wider time range or clearing the filters to see more reflections."
        />
      ) : (
        <div className="space-y-4">
          {list.map((c) => (
            <ConversationCard key={c.id} c={c} />
          ))}
        </div>
      )}
    </>
  );
}
