"use client";

import { Mic, RotateCcw } from "lucide-react";
import { useRecorder } from "@/components/device/useRecorder";

/**
 * The plushie stand-in. One button, held down while the child speaks.
 *
 * This surface is deliberately disposable — it exists so the capture pipeline
 * can be exercised before the hardware exists. The durable pieces are
 * POST /api/stt and lib/stt.
 */

const PROMPT: Record<string, string> = {
  idle: "Hold the button and tell me anything.",
  listening: "I'm listening…",
  thinking: "Thinking about what you said…",
  done: "Here's what I heard:",
  error: "Something went wrong.",
};

export default function TalkPage() {
  const { state, transcript, error, start, stop, reset } = useRecorder({
    language: "en",
  });

  const listening = state === "listening";
  const busy = state === "thinking";

  return (
    <main className="flex flex-1 flex-col items-center justify-between px-6 py-10 text-center">
      <header className="pt-4">
        <p className="eyebrow">Companion</p>
      </header>

      <div className="flex flex-col items-center gap-10">
        <p
          className="max-w-xs text-lg font-medium"
          style={{ color: "var(--text)" }}
          aria-live="polite"
        >
          {PROMPT[state]}
        </p>

        <div className="relative" style={{ width: 200, height: 200 }}>
          {listening && <span className="talk-ring" aria-hidden />}
          <button
            type="button"
            className={`talk-button flex h-full w-full flex-col items-center justify-center gap-2 ${
              listening ? "talk-button--listening" : ""
            } ${busy ? "talk-button--thinking" : ""}`}
            disabled={busy}
            onPointerDown={start}
            onPointerUp={stop}
            // Dragging off the button, or the browser stealing the pointer,
            // must not strand us in "listening".
            onPointerLeave={stop}
            onPointerCancel={stop}
          >
            <Mic size={44} strokeWidth={1.75} />
            <span className="text-sm font-semibold">
              {listening ? "Listening" : busy ? "One moment" : "Hold to talk"}
            </span>
          </button>
        </div>

        {state === "done" && (
          <div className="card max-w-sm" style={{ padding: 20 }}>
            <p className="text-base" style={{ color: "var(--text)" }}>
              {transcript ? `“${transcript}”` : "I didn't catch that."}
            </p>
          </div>
        )}

        {state === "error" && (
          <div
            className="max-w-sm rounded-2xl px-5 py-4 text-sm"
            style={{ background: "var(--alert-bg)", color: "var(--alert-ink)" }}
            role="alert"
          >
            {error}
          </div>
        )}
      </div>

      <footer className="pb-4" style={{ minHeight: 44 }}>
        {(state === "done" || state === "error") && (
          <button type="button" className="btn btn-soft" onClick={reset}>
            <RotateCcw size={16} />
            Try again
          </button>
        )}
      </footer>
    </main>
  );
}
