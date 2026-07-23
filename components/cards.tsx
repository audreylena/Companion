"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronDown,
  Clock,
  MessageCircleHeart,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import {
  type Conversation,
  type ScriptureRec,
  type AdviceItem,
  themeEmoji,
} from "@/lib/mock";
import {
  Card,
  ToneBadge,
  SafetyBadge,
  CategoryBadge,
  SavePill,
  Button,
  cx,
} from "./ui";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

/* ---------------- inline scripture ---------------- */

export function ScriptureInline({ ref, text }: { ref: string; text: string }) {
  return (
    <div className="soft p-4 flex gap-3">
      <BookOpen size={18} className="shrink-0 mt-0.5" style={{ color: "var(--ink-blue)" }} />
      <div>
        <p className="text-sm italic" style={{ color: "var(--text)" }}>
          &ldquo;{text}&rdquo;
        </p>
        <p className="text-xs font-semibold mt-1.5" style={{ color: "var(--ink-blue)" }}>
          {ref}
        </p>
      </div>
    </div>
  );
}

/* ---------------- big latest-conversation summary ---------------- */

export function ConversationSummaryCard({ c }: { c: Conversation }) {
  return (
    <Card className="!p-0 overflow-hidden">
      <div className="p-5 md:p-6" style={{ background: "var(--primary-soft)" }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden>{themeEmoji[c.theme]}</span>
            <div>
              <p className="eyebrow" style={{ color: "var(--ink-blue)" }}>Most recent reflection</p>
              <h3 className="text-lg font-bold mt-0.5" style={{ color: "var(--text)" }}>
                {c.topic}
              </h3>
            </div>
          </div>
          <span className="text-xs muted flex items-center gap-1 shrink-0">
            <Clock size={13} /> {c.time}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <ToneBadge tone={c.toneKey} />
          <SafetyBadge level={c.safety} />
          <CategoryBadge category={c.category} />
        </div>
      </div>

      <div className="p-5 md:p-6 space-y-4">
        <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
          {c.summary}
        </p>
        <ScriptureInline ref={c.scriptureRef} text={c.scriptureText} />
        <div className="soft p-4">
          <p className="eyebrow mb-1.5">A gentle way to follow up</p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
            {c.parentFollowUp}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link href="/advice"><Button variant="soft" icon={MessageCircleHeart}>See parent advice</Button></Link>
          <Link href="/discussions"><Button variant="ghost" icon={ArrowRight}>All discussions</Button></Link>
        </div>
      </div>
    </Card>
  );
}

/* ---------------- compact conversation (timeline) ---------------- */

export function ConversationCard({ c }: { c: Conversation }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="!p-0 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="inline-flex items-center justify-center rounded-2xl text-lg shrink-0"
              style={{ width: 42, height: 42, background: "var(--surface-2)" }}
              aria-hidden
            >
              {themeEmoji[c.theme]}
            </span>
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold truncate" style={{ color: "var(--text)" }}>
                {c.topic}
              </h3>
              <p className="text-xs muted mt-0.5">
                {fmtDate(c.date)} · {c.time} · {c.durationMin} min
              </p>
            </div>
          </div>
          <span className="badge badge--neutral shrink-0">{c.theme}</span>
        </div>

        <p className="text-sm leading-relaxed mt-3" style={{ color: "var(--text)" }}>
          {c.summary}
        </p>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <ToneBadge tone={c.toneKey} />
          <SafetyBadge level={c.safety} />
          {c.askedForAdvice && <span className="badge badge--neutral">Asked for advice</span>}
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium"
          style={{ color: "var(--ink-blue)" }}
        >
          {open ? "Hide details" : "View details"}
          <ChevronDown size={15} className={cx("transition-transform", open && "rotate-180")} />
        </button>
      </div>

      {open && (
        <div className="px-5 pb-5 space-y-3" style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
          <ScriptureInline ref={c.scriptureRef} text={c.scriptureText} />
          <div className="soft p-4">
            <p className="eyebrow mb-1.5">A gentle way to follow up</p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>{c.parentFollowUp}</p>
          </div>
          <p className="text-xs muted">{c.language} · {c.translation} · {c.safetyNote}</p>
        </div>
      )}
    </Card>
  );
}

/* ---------------- scripture card ---------------- */

export function ScriptureCard({ s }: { s: ScriptureRec }) {
  const [saved, setSaved] = useState(false);
  return (
    <Card className="!p-5 flex flex-col h-full">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span aria-hidden>{themeEmoji[s.theme]}</span>
          <span className="badge badge--reflective">{s.theme}</span>
        </div>
        <button
          type="button"
          onClick={() => setSaved((v) => !v)}
          aria-pressed={saved}
          aria-label={saved ? "Saved" : "Save this Scripture"}
        >
          <SavePill saved={saved} />
        </button>
      </div>

      <p className="text-base font-bold mt-3" style={{ color: "var(--ink-blue)" }}>{s.ref}</p>
      <p className="text-sm italic mt-1" style={{ color: "var(--text)" }}>&ldquo;{s.preview}&rdquo;</p>

      <div className="soft p-3 mt-3">
        <p className="text-xs" style={{ color: "var(--text)" }}>
          <span className="font-semibold">This was shared because </span>{s.why.toLowerCase()}
        </p>
      </div>

      <p className="text-[11px] muted mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
        {s.language} · {s.translation} · {fmtDate(s.dateRecommended)}
      </p>
    </Card>
  );
}

/* ---------------- advice card ---------------- */

export function AdviceCard({ a }: { a: AdviceItem }) {
  const [helpful, setHelpful] = useState(false);
  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-2">
        <span aria-hidden className="text-lg">{themeEmoji[a.theme]}</span>
        <span className="badge badge--neutral">{a.theme}</span>
      </div>

      <div>
        <p className="eyebrow">Topic</p>
        <h3 className="text-base font-semibold mt-0.5" style={{ color: "var(--text)" }}>{a.topic}</h3>
      </div>

      <div>
        <p className="eyebrow mb-1">What may help</p>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>{a.whatMayHelp}</p>
      </div>

      <div className="soft p-4">
        <p className="eyebrow mb-1">A conversation starter</p>
        <p className="text-sm italic" style={{ color: "var(--text)" }}>&ldquo;{a.conversationStarter}&rdquo;</p>
      </div>

      <div>
        <p className="eyebrow mb-1.5">You might consider</p>
        <ul className="space-y-1.5">
          {a.actions.map((act) => (
            <li key={act} className="flex gap-2 text-sm" style={{ color: "var(--text)" }}>
              <Sparkles size={15} className="shrink-0 mt-0.5" style={{ color: "var(--ink-blue)" }} />
              {act}
            </li>
          ))}
        </ul>
      </div>

      <ScriptureInline ref={a.scriptureRef} text={a.scriptureText} />

      <div className="flex items-center justify-between gap-3 pt-1">
        <p className="text-[11px] muted max-w-[62%]">
          Supportive guidance — not medical or professional diagnosis.
        </p>
        <button type="button" onClick={() => setHelpful((v) => !v)} aria-pressed={helpful}>
          <SavePill saved={helpful} />
        </button>
      </div>
    </Card>
  );
}

/* ---------------- gentle weekly chart ---------------- */

export function WeeklyBars({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end justify-between gap-2 h-28 px-1">
      {data.map((d) => (
        <div key={d.label} className="flex flex-col items-center gap-2 flex-1">
          <div className="w-full flex items-end justify-center" style={{ height: 80 }}>
            <div
              className="w-full rounded-t-lg rounded-b-sm transition-all"
              style={{
                height: `${(d.value / max) * 100}%`,
                minHeight: 6,
                background: d.value ? "var(--primary)" : "#E4ECF4",
              }}
              title={`${d.value} reflection${d.value === 1 ? "" : "s"}`}
            />
          </div>
          <span className="text-[11px] muted">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- gentle tone distribution ---------------- */

const toneColor: Record<string, string> = {
  calm: "var(--calm-bg)",
  attention: "var(--attention-bg)",
  reflective: "var(--reflective-bg)",
  joyful: "var(--joyful-bg)",
};
const toneName: Record<string, string> = {
  calm: "Calm", attention: "Tender", reflective: "Reflective", joyful: "Joyful",
};

export function ToneDistribution({ counts }: { counts: Record<string, number> }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  const entries = Object.entries(counts).filter(([, v]) => v > 0);
  return (
    <div>
      <div className="flex h-3 rounded-full overflow-hidden" style={{ background: "#EAF0F7" }}>
        {entries.map(([k, v]) => (
          <div key={k} style={{ width: `${(v / total) * 100}%`, background: toneColor[k] }} title={`${toneName[k]}: ${v}`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
        {entries.map(([k, v]) => (
          <span key={k} className="flex items-center gap-1.5 text-xs muted">
            <span className="rounded-full" style={{ width: 9, height: 9, background: toneColor[k] }} />
            {toneName[k]} · {v}
          </span>
        ))}
      </div>
    </div>
  );
}
