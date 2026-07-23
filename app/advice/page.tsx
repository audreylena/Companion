"use client";

import { Info } from "lucide-react";
import { useApp } from "@/components/AppShell";
import { PageHeader, Card } from "@/components/ui";
import { AdviceCard } from "@/components/cards";
import { adviceItems } from "@/lib/mock";

export default function AdvicePage() {
  const { child } = useApp();
  return (
    <>
      <PageHeader
        title="Parent advice"
        subtitle={`Warm, practical ways to walk alongside ${child.name} — drawn from recent themes`}
      />

      <Card tint className="!py-4 mb-6 flex items-start gap-3">
        <Info size={18} className="shrink-0 mt-0.5" style={{ color: "var(--ink-blue)" }} />
        <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
          These are gentle, supportive suggestions — never a substitute for your own judgment, or for
          a pastor, counselor, teacher, or medical professional when one is needed.
        </p>
      </Card>

      <div className="grid md:grid-cols-2 gap-5">
        {adviceItems.map((a) => (
          <AdviceCard key={a.id} a={a} />
        ))}
      </div>
    </>
  );
}
