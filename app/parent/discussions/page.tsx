"use client";

import { useMemo, useState } from "react";
import { Lock } from "lucide-react";
import { useApp } from "@/components/AppShell";
import { PageHeader, Chip, SegmentedControl, EmptyState, Callout } from "@/components/ui";
import { ConversationCard, ScriptureCard } from "@/components/cards";
import {
  conversationsFor,
  scriptureRecs,
  themeEmoji,
  type ThemeCategory,
  type ToneKey,
  toneLabel,
} from "@/lib/mock";
import { useLiveFeed } from "@/components/useLiveFeed";

type Mode = "reflections" | "scripture";
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
const SCRIPTURE_THEMES: ThemeCategory[] = [
  "Courage", "Peace", "Friendship", "Gratitude", "Wisdom", "Hope", "Identity", "Forgiveness",
];

export default function DiscussionsPage() {
  const { child } = useApp();
  const [mode, setMode] = useState<Mode>("reflections");
  const [range, setRange] = useState<Range>("week");
  const [theme, setTheme] = useState<ThemeCategory | null>(null);
  const [tone, setTone] = useState<ToneKey | null>(null);
  const [scriptureTheme, setScriptureTheme] = useState<ThemeCategory | null>(null);

  const live = useLiveFeed(child.id);
  const all = conversationsFor(child.id, live);
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

  const verses = useMemo(
    () => (scriptureTheme ? scriptureRecs.filter((s) => s.theme === scriptureTheme) : scriptureRecs),
    [scriptureTheme]
  );

  return (
    <>
      <PageHeader
        title="Discussions"
        subtitle={`A calm look at the themes ${child.name} has explored`}
        right={
          mode === "reflections" ? (
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
          ) : undefined
        }
      />

      {/* view switch: reflections vs. the Scripture Companion has shared */}
      <div className="mb-5">
        <SegmentedControl
          value={mode}
          onChange={setMode}
          options={[
            { value: "reflections", label: "Reflections" },
            { value: "scripture", label: "Scripture" },
          ]}
        />
      </div>

      {mode === "reflections" ? (
        <>
          {/* privacy notice */}
          <Callout icon={Lock} className="mb-5">
            Companion focuses on <strong>conversation themes</strong> and safety-relevant summaries,
            not a word-for-word record. {child.name}&rsquo;s private words stay private.
          </Callout>

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
      ) : (
        <>
          <p className="text-sm muted mb-4">
            Verses {child.companionName} has shared with {child.name}, by theme.
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            <Chip active={!scriptureTheme} onClick={() => setScriptureTheme(null)}>All</Chip>
            {SCRIPTURE_THEMES.map((c) => (
              <Chip
                key={c}
                active={scriptureTheme === c}
                onClick={() => setScriptureTheme(scriptureTheme === c ? null : c)}
              >
                <span aria-hidden>{themeEmoji[c]}</span> {c}
              </Chip>
            ))}
          </div>

          {verses.length === 0 ? (
            <EmptyState
              emoji="📖"
              title="No verses in this theme yet"
              note="Choose another theme to see what's been shared."
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {verses.map((s) => (
                <ScriptureCard key={s.id} s={s} />
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
