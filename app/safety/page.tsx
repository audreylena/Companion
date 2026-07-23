"use client";

import { useState } from "react";
import { ShieldCheck, Download, Trash2, Moon, Clock } from "lucide-react";
import { useApp } from "@/components/AppShell";
import {
  PageHeader,
  Card,
  SectionHeading,
  SegmentedControl,
  Toggle,
  Chip,
  Button,
} from "@/components/ui";

type Level = "younger" | "balanced" | "older";
const DURATIONS = [5, 10, 15, 20];
const NOTIFY_TOPICS = ["Big faith questions", "Friendship struggles", "Worry or sadness", "Sleep & bedtime"];

export default function SafetyPage() {
  const { child } = useApp();
  const [level, setLevel] = useState<Level>("younger");
  const [scriptureOnly, setScriptureOnly] = useState(false);
  const [reflection, setReflection] = useState(true);
  const [advice, setAdvice] = useState(true);
  const [crisis, setCrisis] = useState(true);
  const [topics, setTopics] = useState<string[]>(["Big faith questions", "Worry or sadness"]);
  const [duration, setDuration] = useState(10);
  const [quietFrom, setQuietFrom] = useState("20:30");
  const [quietTo, setQuietTo] = useState("07:00");
  const [deleteArmed, setDeleteArmed] = useState(false);

  const toggleTopic = (t: string) =>
    setTopics((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  return (
    <>
      <PageHeader title="Safety" subtitle={`How Companion cares for ${child.name} — set by you`} />

      {/* status */}
      <div className="card !p-5 mb-5 flex items-center gap-4" style={{ background: "var(--calm-bg)" }}>
        <span className="inline-flex items-center justify-center rounded-2xl shrink-0"
          style={{ width: 46, height: 46, background: "#fff", color: "var(--calm-ink)" }}>
          <ShieldCheck size={22} />
        </span>
        <div>
          <p className="text-base font-bold" style={{ color: "var(--calm-ink)" }}>Safety settings active</p>
          <p className="text-sm" style={{ color: "#40614f" }}>
            Companion is watching over gentle boundaries and knows when to bring a moment to you.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* response & tone */}
        <Card>
          <SectionHeading title="Response &amp; tone" />
          <div className="mb-4">
            <p className="text-sm font-medium mb-2" style={{ color: "var(--text)" }}>Age-appropriate level</p>
            <SegmentedControl
              value={level}
              onChange={setLevel}
              options={[
                { value: "younger", label: "Younger" },
                { value: "balanced", label: "Balanced" },
                { value: "older", label: "Older" },
              ]}
            />
          </div>
          <div style={{ borderTop: "1px solid var(--border)" }}>
            <Toggle checked={scriptureOnly} onChange={setScriptureOnly}
              label="Scripture-only mode" description="Keep responses centered on Scripture and prayer." />
            <div style={{ borderTop: "1px solid var(--border)" }} />
            <Toggle checked={reflection} onChange={setReflection}
              label="Reflection & breathing exercises" description="Allow short calming moments during a conversation." />
            <div style={{ borderTop: "1px solid var(--border)" }} />
            <Toggle checked={advice} onChange={setAdvice}
              label="Generate parent advice" description="Offer gentle follow-up suggestions in your dashboard." />
          </div>
        </Card>

        {/* notifications & alerts */}
        <Card>
          <SectionHeading title="When to reach you" />
          <Toggle checked={crisis} onChange={setCrisis}
            label="Sensitive or high-care moments" description="Strongly recommended — brings urgent moments to you right away." />
          <div className="pt-3" style={{ borderTop: "1px solid var(--border)" }}>
            <p className="text-sm font-medium mb-2.5" style={{ color: "var(--text)" }}>Also let me know about</p>
            <div className="flex flex-wrap gap-2">
              {NOTIFY_TOPICS.map((t) => (
                <Chip key={t} active={topics.includes(t)} onClick={() => toggleTopic(t)}>{t}</Chip>
              ))}
            </div>
          </div>
        </Card>

        {/* rhythms & limits */}
        <Card>
          <SectionHeading title="Rhythms &amp; limits" />
          <div className="mb-4">
            <p className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: "var(--text)" }}>
              <Clock size={15} /> Longest conversation
            </p>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <Chip key={d} active={duration === d} onClick={() => setDuration(d)}>{d} min</Chip>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <p className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: "var(--text)" }}>
              <Moon size={15} /> Daily quiet hours
            </p>
            <div className="flex items-center gap-2">
              <label className="sr-only" htmlFor="qf">Quiet hours start</label>
              <input id="qf" type="time" className="field" value={quietFrom} onChange={(e) => setQuietFrom(e.target.value)} />
              <span className="muted text-sm">to</span>
              <label className="sr-only" htmlFor="qt">Quiet hours end</label>
              <input id="qt" type="time" className="field" value={quietTo} onChange={(e) => setQuietTo(e.target.value)} />
            </div>
          </div>
        </Card>

        {/* data & privacy */}
        <Card>
          <SectionHeading title="Data &amp; privacy" hint="You're always in control of what's kept" />
          <div className="space-y-3">
            <Button variant="soft" icon={Download} className="w-full">Export parent summaries</Button>
            <Button
              variant={deleteArmed ? "primary" : "ghost"}
              icon={Trash2}
              className="w-full"
              onClick={() => {
                if (deleteArmed) setDeleteArmed(false);
                else setDeleteArmed(true);
              }}
            >
              {deleteArmed ? "Tap again to confirm delete" : "Delete conversation summaries"}
            </Button>
            <p className="text-xs muted">
              Summaries focus on themes and safety. Deleting removes them from your dashboard.
            </p>
          </div>
        </Card>
      </div>

      {/* reassurance */}
      <Card tint className="mt-5 !py-4">
        <p className="text-sm text-center leading-relaxed" style={{ color: "var(--text)" }}>
          Companion is designed to <strong>support — never replace</strong> — parents, pastors,
          counselors, teachers, or qualified professionals.
        </p>
      </Card>
    </>
  );
}
