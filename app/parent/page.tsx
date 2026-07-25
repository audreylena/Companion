"use client";

import Link from "next/link";
import {
  MessagesSquare,
  Sparkles,
  BookOpen,
  ShieldCheck,
  HeartHandshake,
  Languages as LanguagesIcon,
  Lightbulb,
  CalendarDays,
} from "lucide-react";
import { useApp } from "@/components/AppShell";
import {
  Card,
  PageHeader,
  SectionHeading,
  Stat,
  Button,
  EmptyState,
  SafetyBadge,
  IconBubble,
} from "@/components/ui";
import {
  ConversationSummaryCard,
  WeeklyBars,
  ToneDistribution,
} from "@/components/cards";
import { weeklyStats, weeklyFrequency, themeEmoji, type ThemeCategory } from "@/lib/mock";

const greetPart = () => {
  const h = new Date().getHours();
  return h < 12 ? "morning" : h < 18 ? "afternoon" : "evening";
};
const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

export default function OverviewPage() {
  const { child } = useApp();
  const stats = weeklyStats(child.id);
  const freq = weeklyFrequency(child.id);
  const latest = stats.latest;

  const insights: { icon: typeof Lightbulb; text: string }[] = [];
  if (latest?.category === "wonder")
    insights.push({
      icon: Sparkles,
      text: `${child.companionName} recognized a big question and gently guided ${child.name} back to you — exactly as intended.`,
    });
  if (latest?.askedForAdvice)
    insights.push({
      icon: HeartHandshake,
      text: `${child.name} asked for a little guidance about "${latest.topic.toLowerCase()}." There's a way to follow up waiting for you.`,
    });
  if (stats.count > 0)
    insights.push({
      icon: Lightbulb,
      text: `This week's reflections leaned toward ${String(stats.topTheme).toLowerCase()}. A small, unhurried conversation could mean a lot.`,
    });
  if (stats.anyAlert)
    insights.push({
      icon: ShieldCheck,
      text: "One reflection may be worth a closer look — see Discussions for a summary.",
    });

  return (
    <>
      <PageHeader
        title={`Good ${greetPart()}, Audrey`}
        subtitle={`Here's a calm look at ${child.name}'s week`}
        right={
          <span
            className="hidden sm:inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-medium"
            style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            <CalendarDays size={15} /> {today}
          </span>
        }
      />

      {/* quick actions */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link href="/parent/advice"><Button variant="primary" icon={HeartHandshake}>Parent advice</Button></Link>
        <Link href="/parent/discussions"><Button variant="soft" icon={BookOpen}>Recent Scripture</Button></Link>
        <Link href="/parent/languages"><Button variant="ghost" icon={LanguagesIcon}>Languages</Button></Link>
      </div>

      {!latest ? (
        <EmptyState
          emoji="🌤️"
          title="No recent reflections yet"
          note={`When ${child.name} and ${child.companionName} talk, you'll find summaries and Scripture here.`}
          action={<Link href="/parent/safety"><Button variant="soft">Review companion settings</Button></Link>}
        />
      ) : (
        <div className="grid lg:grid-cols-3 gap-5">
          {/* main column */}
          <div className="lg:col-span-2 space-y-5">
            <ConversationSummaryCard c={latest} />

            <Card>
              <SectionHeading
                title="Faith moments this week"
                hint="A sense of rhythm — not a report card"
              />
              <WeeklyBars data={freq} />
            </Card>
          </div>

          {/* side column */}
          <div className="space-y-5">
            <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-4">
              <Stat icon={MessagesSquare} label="Reflections" value={stats.count} hint="this week" />
              <Stat
                icon={Sparkles}
                label="Theme"
                value={
                  <span className="inline-flex items-center gap-1.5 flex-wrap">
                    <span aria-hidden>{themeEmoji[stats.topTheme as ThemeCategory] ?? "🌟"}</span>
                    {stats.topTheme}
                  </span>
                }
              />
              <Stat icon={BookOpen} label="Recent verse" value={latest.scriptureRef} />
              <div className="card !p-5">
                <p className="eyebrow mb-2">Safety</p>
                <SafetyBadge level={stats.anyAlert ? "attention" : "ok"} />
              </div>
            </div>

            <Card>
              <SectionHeading title="What you may want to know" />
              <ul className="space-y-3">
                {insights.map((it, i) => {
                  const Icon = it.icon;
                  return (
                    <li key={i} className="flex gap-3">
                      <IconBubble icon={Icon} box={32} size={16} radius="rounded-xl" />
                      <p className="text-sm leading-relaxed text-[var(--text)]">{it.text}</p>
                    </li>
                  );
                })}
              </ul>
            </Card>

            <Card>
              <SectionHeading title="Conversation tone" hint="Gentle insight, not analysis" />
              <ToneDistribution counts={stats.toneCounts} />
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
