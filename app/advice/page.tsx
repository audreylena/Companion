"use client";

import { Info } from "lucide-react";
import { useApp } from "@/components/AppShell";
import { PageHeader, Callout } from "@/components/ui";
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

      <Callout icon={Info} className="mb-6">
        Supportive suggestions — never a substitute for your own judgment, or for
        a pastor, counselor, teacher, or medical professional when one is needed.
      </Callout>

      <div className="grid md:grid-cols-2 gap-5">
        {adviceItems.map((a) => (
          <AdviceCard key={a.id} a={a} />
        ))}
      </div>
    </>
  );
}
