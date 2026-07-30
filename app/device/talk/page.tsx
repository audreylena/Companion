"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, RotateCcw, BookOpen, Heart } from "lucide-react";
import { useRecorder } from "@/components/device/useRecorder";

/**
 * The plushie stand-in. Hold to talk → transcript (/api/stt) → companion turn
 * (/api/interact). The reply is spoken with the browser's built-in speech
 * synthesis so the device literally talks, with no extra API. The durable
 * pieces are the two routes and lib/companion; this surface is disposable.
 */

interface Turn {
  category: "in_scope" | "wonder" | "danger";
  reply: string;
  verse: { ref: string; text: string } | null;
  handoff: { line: string; urgent: boolean } | null;
}

export default function TalkPage() {
  const { state, transcript, error, start, stop, reset } = useRecorder({ language: "en" });

  const [replyState, setReplyState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [turn, setTurn] = useState<Turn | null>(null);
  const [replyError, setReplyError] = useState("");
  const fetchedFor = useRef("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fallback voice: pick the warmest available browser voice, gentle + a touch
  // higher, for when no ElevenLabs key is configured.
  const browserSpeak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const warm =
        voices.find((v) => /samantha|karen|jenny|aria|google uk english female|female/i.test(v.name)) ??
        voices.find((v) => v.lang?.toLowerCase().startsWith("en"));
      if (warm) u.voice = warm;
      u.rate = 0.92; // gentle pace for a child
      u.pitch = 1.15; // a touch warmer
      window.speechSynthesis.speak(u);
    } catch {
      /* speech is a nicety; never let it break the flow */
    }
  }, []);

  const speak = useCallback(
    async (text: string) => {
      // Prefer the warm server voice (ElevenLabs); fall back to the browser.
      try {
        window.speechSynthesis?.cancel();
        audioRef.current?.pause();
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (res.ok && (res.headers.get("content-type") ?? "").startsWith("audio")) {
          const url = URL.createObjectURL(await res.blob());
          const audio = new Audio(url);
          audioRef.current = audio;
          audio.onended = () => URL.revokeObjectURL(url);
          await audio.play();
          return;
        }
      } catch {
        /* fall through to the browser voice */
      }
      browserSpeak(text);
    },
    [browserSpeak],
  );

  // Once we have a transcript, ask the brain for a reply.
  useEffect(() => {
    if (state !== "done" || !transcript) return;
    if (fetchedFor.current === transcript) return; // guard against re-runs
    fetchedFor.current = transcript;

    setReplyState("loading");
    setTurn(null);
    setReplyError("");

    (async () => {
      try {
        const res = await fetch("/api/interact", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            text: transcript,
            childId: "maya",
            child: { name: "Maya", companionName: "Pip", guardian: "your mom", language: "en" },
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "The companion is unavailable.");
        setTurn(data);
        setReplyState("ready");
        speak(data.reply);
      } catch (e) {
        setReplyError(e instanceof Error ? e.message : "Something went wrong.");
        setReplyState("error");
      }
    })();
  }, [state, transcript, speak]);

  const resetAll = useCallback(() => {
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    audioRef.current?.pause();
    fetchedFor.current = "";
    setTurn(null);
    setReplyState("idle");
    setReplyError("");
    reset();
  }, [reset]);

  const listening = state === "listening";
  const busy = state === "thinking" || replyState === "loading";

  const prompt =
    state === "listening" ? "I'm listening…"
    : busy ? "Thinking about what you said…"
    : replyState === "ready" ? "Here's what I want you to know:"
    : state === "error" || replyState === "error" ? "Something went wrong."
    : "Hold the button and tell me anything.";

  const showReset =
    replyState === "ready" || replyState === "error" || state === "error";

  return (
    <main className="flex flex-1 flex-col items-center justify-between px-6 py-10 text-center">
      <header className="pt-4">
        <p className="eyebrow">Companion</p>
      </header>

      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <p className="max-w-xs text-lg font-medium" style={{ color: "var(--text)" }} aria-live="polite">
          {prompt}
        </p>

        <div className="relative" style={{ width: 180, height: 180 }}>
          {listening && <span className="talk-ring" aria-hidden />}
          <button
            type="button"
            className={`talk-button flex h-full w-full flex-col items-center justify-center gap-2 ${
              listening ? "talk-button--listening" : ""
            } ${busy ? "talk-button--thinking" : ""}`}
            disabled={busy}
            onPointerDown={start}
            onPointerUp={stop}
            onPointerLeave={stop}
            onPointerCancel={stop}
          >
            <Mic size={40} strokeWidth={1.75} />
            <span className="text-sm font-semibold">
              {listening ? "Listening" : busy ? "One moment" : "Hold to talk"}
            </span>
          </button>
        </div>

        {/* what the child said */}
        {transcript && replyState !== "idle" && (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            You said: <span style={{ color: "var(--text)" }}>“{transcript}”</span>
          </p>
        )}

        {/* the companion's reply */}
        {replyState === "ready" && turn && (
          <div className="w-full space-y-3">
            <div className="card" style={{ padding: 20 }}>
              <p className="text-base leading-relaxed" style={{ color: "var(--text)" }}>
                {turn.reply}
              </p>
            </div>

            {turn.verse && (
              <div className="soft flex gap-3 p-4 text-left">
                <BookOpen size={18} className="shrink-0 mt-0.5" style={{ color: "var(--ink-blue)" }} />
                <div>
                  <p className="text-sm italic" style={{ color: "var(--text)" }}>“{turn.verse.text}”</p>
                  <p className="text-xs font-semibold mt-1" style={{ color: "var(--ink-blue)" }}>{turn.verse.ref}</p>
                </div>
              </div>
            )}

            {turn.handoff && (
              <div
                className="flex items-start gap-2 rounded-2xl px-4 py-3 text-left text-sm"
                style={
                  turn.handoff.urgent
                    ? { background: "var(--alert-bg)", color: "var(--alert-ink)" }
                    : { background: "var(--primary-soft)", color: "var(--ink-blue)" }
                }
              >
                <Heart size={16} className="shrink-0 mt-0.5" />
                <span>{turn.handoff.line}</span>
              </div>
            )}
          </div>
        )}

        {/* errors */}
        {(state === "error" || replyState === "error") && (
          <div
            className="w-full max-w-sm rounded-2xl px-5 py-4 text-sm"
            style={{ background: "var(--alert-bg)", color: "var(--alert-ink)" }}
            role="alert"
          >
            {replyError || error}
          </div>
        )}
      </div>

      <footer className="pb-4" style={{ minHeight: 44 }}>
        {showReset && (
          <button type="button" className="btn btn-soft" onClick={resetAll}>
            <RotateCcw size={16} />
            Talk again
          </button>
        )}
      </footer>
    </main>
  );
}
