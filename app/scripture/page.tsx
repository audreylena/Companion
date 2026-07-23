"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/AppShell";
import { PageHeader, Chip, EmptyState } from "@/components/ui";
import { ScriptureCard } from "@/components/cards";
import { scriptureRecs, themeEmoji, type ThemeCategory } from "@/lib/mock";

const CATEGORIES: ThemeCategory[] = [
  "Courage", "Peace", "Friendship", "Gratitude", "Wisdom", "Hope", "Identity", "Forgiveness",
];

export default function ScripturePage() {
  const { child } = useApp();
  const [cat, setCat] = useState<ThemeCategory | null>(null);
  const list = useMemo(
    () => (cat ? scriptureRecs.filter((s) => s.theme === cat) : scriptureRecs),
    [cat]
  );

  return (
    <>
      <PageHeader
        title="Scripture"
        subtitle={`Verses ${child.companionName} has gently shared with ${child.name}`}
      />

      <div className="flex flex-wrap gap-2 mb-6">
        <Chip active={!cat} onClick={() => setCat(null)}>All</Chip>
        {CATEGORIES.map((c) => (
          <Chip key={c} active={cat === c} onClick={() => setCat(cat === c ? null : c)}>
            <span aria-hidden>{themeEmoji[c]}</span> {c}
          </Chip>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState emoji="📖" title="No verses in this theme yet" note="Choose another theme to see what's been shared." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map((s) => (
            <ScriptureCard key={s.id} s={s} />
          ))}
        </div>
      )}
    </>
  );
}
