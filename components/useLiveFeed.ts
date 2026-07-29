"use client";

import { useEffect, useState } from "react";
import type { Conversation } from "@/lib/mock";

/**
 * Live faith moments for a child, polled from /api/parent/feed. Returns the
 * real conversations recorded on /device/talk so the dashboard updates itself
 * a few seconds after a child talks — no refresh needed.
 */
export function useLiveFeed(childId: string): Conversation[] {
  const [live, setLive] = useState<Conversation[]>([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await fetch(
          `/api/parent/feed?childId=${encodeURIComponent(childId)}`,
          { cache: "no-store" },
        );
        if (!res.ok) return;
        const data = await res.json();
        if (active) setLive(data.conversations ?? []);
      } catch {
        /* transient — keep the last good value */
      }
    };

    load();
    const id = setInterval(load, 5000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [childId]);

  return live;
}
