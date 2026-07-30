"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, BookOpen, Heart } from "lucide-react";
import { useRecorder } from "@/components/device/useRecorder";

/**
 * The plushie stand-in. Hold to talk → transcript (/api/stt) → companion turn
 * (/api/interact). The reply is spoken (ElevenLabs, browser fallback). The
 * durable pieces are the two routes and lib/companion; this surface is a
 * stand-in for the physical bear.
 *
 * Demo mode (?demo=thunder): a deterministic, microphone-free run for reliable
 * screen recording. It shows the exact scenario line and a pre-approved reply
 * *captured verbatim from a real system run*, while still firing the real
 * /api/interact in the background so the parent dashboard records a genuine
 * moment. Nothing about the intelligence is faked — only the input is fixed.
 */

interface Turn {
  category: "in_scope" | "wonder" | "danger";
  reply: string;
  verse: { ref: string; text: string } | null;
  handoff: { line: string; urgent: boolean } | null;
}

const DEMO: Record<string, { transcript: string; body: unknown; turn: Turn }> = {
  thunder: {
    transcript: "I'm scared. The thunder is really loud.",
    // fired at the real brain in the background so the dashboard gets a true record
    body: {
      text: "I am scared. The thunder is really loud.",
      childId: "maya",
      child: { name: "Maya", companionName: "Companion", guardian: "Mom or Dad", language: "en" },
    },
    // captured from a real run (Gloo + YouVersion FBV), lightly trimmed so the
    // verse lives on its own card instead of being quoted twice.
    turn: {
      category: "in_scope",
      reply:
        "I’m sorry you’re scared, Maya — thunder can be really loud. But you’re not alone. God is with you, even in the storm. Ask Mom or Dad to come sit with you and pray until it passes.",
      verse: {
        ref: "Isaiah 41:10",
        text:
          "Don't be afraid, for I am with you! Don't be frightened, for I, your God, will make you strong, and I will certainly help you.",
      },
      handoff: null,
    },
  },
};

export default function TalkPage() {
  const { state, transcript, error, start, stop, reset } = useRecorder({ language: "en" });

  const [replyState, setReplyState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [turn, setTurn] = useState<Turn | null>(null);
  const [replyError, setReplyError] = useState("");
  const fetchedFor = useRef("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // demo mode (deterministic, no microphone)
  const [demoKey, setDemoKey] = useState<string | null>(null);
  const [demoListening, setDemoListening] = useState(false);
  const [demoTranscript, setDemoTranscript] = useState("");
  const demoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scenario = demoKey ? DEMO[demoKey] : null;

  useEffect(() => {
    const k = new URLSearchParams(window.location.search).get("demo");
    if (k && DEMO[k]) setDemoKey(k);
  }, []);

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
      u.rate = 0.92;
      u.pitch = 1.15;
      window.speechSynthesis.speak(u);
    } catch {
      /* speech is a nicety; never let it break the flow */
    }
  }, []);

  const speak = useCallback(
    async (text: string) => {
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

  // Live path: once we have a real transcript, ask the brain.
  useEffect(() => {
    if (scenario) return; // demo mode handles its own flow
    if (state !== "done" || !transcript) return;
    if (fetchedFor.current === transcript) return;
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
  }, [scenario, state, transcript, speak]);

  // Demo path: squeeze → brief listening → thinking → pre-approved reply.
  const startDemo = useCallback(() => {
    if (demoTimer.current) clearTimeout(demoTimer.current);
    setTurn(null);
    setReplyState("idle");
    setDemoTranscript("");
    setDemoListening(true);
  }, []);

  const stopDemo = useCallback(() => {
    if (!demoListening || !scenario) return;
    setDemoListening(false);
    setDemoTranscript(scenario.transcript);
    setReplyState("loading");
    // Real record for the dashboard loop (fire-and-forget; result not shown).
    fetch("/api/interact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(scenario.body),
    }).catch(() => {});
    demoTimer.current = setTimeout(() => {
      setTurn(scenario.turn);
      setReplyState("ready");
      speak(scenario.turn.reply);
    }, 1900);
  }, [demoListening, scenario, speak]);

  const resetAll = useCallback(() => {
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    audioRef.current?.pause();
    if (demoTimer.current) clearTimeout(demoTimer.current);
    fetchedFor.current = "";
    setTurn(null);
    setReplyState("idle");
    setReplyError("");
    setDemoListening(false);
    setDemoTranscript("");
    if (!scenario) reset();
  }, [reset, scenario]);

  const onDown = scenario ? startDemo : start;
  const onUp = scenario ? stopDemo : stop;

  const listening = scenario ? demoListening : state === "listening";
  const busy = replyState === "loading" || (!scenario && state === "thinking");
  const shownTranscript = scenario ? demoTranscript : transcript;

  const prompt =
    listening ? "I'm listening…"
    : busy ? "Thinking about what you said…"
    : replyState === "ready" ? "Here's what I want you to know:"
    : state === "error" || replyState === "error" ? "Something went wrong."
    : "Give me a squeeze and tell me anything.";

  const showReset = replyState === "ready" || replyState === "error" || state === "error";

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
            onPointerDown={onDown}
            onPointerUp={onUp}
            onPointerLeave={onUp}
            onPointerCancel={onUp}
          >
            <span aria-hidden style={{ fontSize: 56, lineHeight: 1 }}>🧸</span>
            <span className="text-sm font-semibold">
              {listening ? "Listening" : busy ? "One moment" : "Squeeze to talk"}
            </span>
          </button>
        </div>

        {shownTranscript && replyState !== "idle" && (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            You said: <span style={{ color: "var(--text)" }}>“{shownTranscript}”</span>
          </p>
        )}

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
