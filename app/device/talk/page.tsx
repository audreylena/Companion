"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, BookOpen, Heart } from "lucide-react";
import { useRecorder } from "@/components/device/useRecorder";

/**
 * The plushie stand-in. Hold to talk → transcript (/api/stt) → companion turn
 * (/api/interact). The reply is spoken (ElevenLabs, browser fallback).
 *
 * Two microphone-free modes for demos and testing (no OpenAI key needed):
 *   ?demo=thunder   — deterministic: a fixed line + a reply captured verbatim
 *                     from a real run (for reliable screen recording).
 *   ?say=<text>     — type anything: squeeze → the LIVE brain answers your exact
 *                     words (real Gloo + YouVersion). e.g. ?say=I had a nightmare
 * In both, the intelligence is real; only the input is fixed.
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
    body: {
      text: "I am scared. The thunder is really loud.",
      childId: "maya",
      child: { name: "Maya", companionName: "Companion", guardian: "Mom or Dad", language: "en" },
    },
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

// What the plush says ALOUD: the reply plus the verse read gently — so a
// screen-free child actually hears the Scripture, not just sees it on a card.
function spokenFor(t: Turn): string {
  return t.verse ? `${t.reply} The Bible says, ${t.verse.text}` : t.reply;
}

export default function TalkPage() {
  const { state, transcript, error, start, stop, reset } = useRecorder({ language: "en" });

  const [replyState, setReplyState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [turn, setTurn] = useState<Turn | null>(null);
  const [replyError, setReplyError] = useState("");
  const fetchedFor = useRef("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const silentUrlRef = useRef<string | null>(null);

  // A persistent, pre-unlocked audio element. Playing a silent clip during the
  // squeeze "blesses" it so Safari/iOS still let us play the TTS reply that
  // arrives a few seconds later (after an await), instead of blocking it.
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.preload = "auto";
    const bytes = new Uint8Array(844);
    const dv = new DataView(bytes.buffer);
    const w = (o: number, s: string) => {
      for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i));
    };
    w(0, "RIFF"); dv.setUint32(4, 836, true); w(8, "WAVE"); w(12, "fmt ");
    dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
    dv.setUint32(24, 8000, true); dv.setUint32(28, 8000, true);
    dv.setUint16(32, 1, true); dv.setUint16(34, 8, true);
    w(36, "data"); dv.setUint32(40, 800, true);
    for (let i = 44; i < 844; i++) bytes[i] = 128;
    silentUrlRef.current = URL.createObjectURL(new Blob([bytes], { type: "audio/wav" }));
    return () => {
      if (silentUrlRef.current) URL.revokeObjectURL(silentUrlRef.current);
    };
  }, []);

  const primeAudio = useCallback(() => {
    const a = audioRef.current;
    if (!a || !silentUrlRef.current) return;
    try {
      a.src = silentUrlRef.current;
      void a.play().catch(() => {});
    } catch {
      /* ignore */
    }
  }, []);

  // scripted (microphone-free) modes
  const [demoKey, setDemoKey] = useState<string | null>(null);
  const [sayText, setSayText] = useState<string | null>(null);
  const [scriptedListening, setScriptedListening] = useState(false);
  const [scriptedTranscript, setScriptedTranscript] = useState("");
  const demoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scenario = demoKey ? DEMO[demoKey] : null;
  const scripted = Boolean(scenario) || Boolean(sayText);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const k = params.get("demo");
    if (k && DEMO[k]) setDemoKey(k);
    const s = params.get("say");
    if (s && s.trim()) setSayText(s.trim());
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
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (res.ok && (res.headers.get("content-type") ?? "").startsWith("audio")) {
          const url = URL.createObjectURL(await res.blob());
          const a = audioRef.current ?? new Audio();
          audioRef.current = a;
          a.pause();
          a.src = url; // reuse the element unlocked during the squeeze
          a.onended = () => URL.revokeObjectURL(url);
          await a.play();
          return;
        }
      } catch (e) {
        console.warn("[speak] server voice failed; using browser voice", e);
      }
      browserSpeak(text);
    },
    [browserSpeak],
  );

  // The live brain call — shared by the mic path and ?say= mode.
  const runBrain = useCallback(
    async (text: string) => {
      setReplyState("loading");
      setTurn(null);
      setReplyError("");
      try {
        const res = await fetch("/api/interact", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            text,
            childId: "maya",
            child: { name: "Maya", companionName: "Pip", guardian: "your mom", language: "en" },
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "The companion is unavailable.");
        setTurn(data);
        setReplyState("ready");
        speak(spokenFor(data));
      } catch (e) {
        setReplyError(e instanceof Error ? e.message : "Something went wrong.");
        setReplyState("error");
      }
    },
    [speak],
  );

  // Live mic path: once we have a real transcript, ask the brain.
  useEffect(() => {
    if (scripted) return; // demo / say modes handle their own flow
    if (state !== "done" || !transcript) return;
    if (fetchedFor.current === transcript) return;
    fetchedFor.current = transcript;
    runBrain(transcript);
  }, [scripted, state, transcript, runBrain]);

  // Scripted path: squeeze → brief listening → response.
  const startScripted = useCallback(() => {
    if (demoTimer.current) clearTimeout(demoTimer.current);
    setTurn(null);
    setReplyState("idle");
    setScriptedTranscript("");
    setScriptedListening(true);
  }, []);

  const stopScripted = useCallback(() => {
    if (!scriptedListening) return;
    setScriptedListening(false);

    if (scenario) {
      // deterministic: pre-approved reply + a real background record for the dashboard
      setScriptedTranscript(scenario.transcript);
      setReplyState("loading");
      fetch("/api/interact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(scenario.body),
      }).catch(() => {});
      demoTimer.current = setTimeout(() => {
        setTurn(scenario.turn);
        setReplyState("ready");
        speak(spokenFor(scenario.turn));
      }, 1900);
    } else if (sayText) {
      // live: the real brain answers the typed words
      setScriptedTranscript(sayText);
      runBrain(sayText);
    }
  }, [scriptedListening, scenario, sayText, speak, runBrain]);

  const resetAll = useCallback(() => {
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    audioRef.current?.pause();
    if (demoTimer.current) clearTimeout(demoTimer.current);
    fetchedFor.current = "";
    setTurn(null);
    setReplyState("idle");
    setReplyError("");
    setScriptedListening(false);
    setScriptedTranscript("");
    if (!scripted) reset();
  }, [reset, scripted]);

  const rawDown = scripted ? startScripted : start;
  const onDown = () => {
    primeAudio(); // unlock audio within the user gesture so the reply can play
    rawDown();
  };
  const onUp = scripted ? stopScripted : stop;

  const listening = scripted ? scriptedListening : state === "listening";
  const busy = replyState === "loading" || (!scripted && state === "thinking");
  const shownTranscript = scripted ? scriptedTranscript : transcript;

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
