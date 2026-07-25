"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hold-to-talk recorder for the device surface.
 *
 * Every browser-specific API lives here so the page stays declarative. The
 * awkward parts are all iOS: Safari records MP4 rather than WebM, refuses
 * getUserMedia outside a secure context, and leaves the orange mic indicator
 * lit until every track is explicitly stopped.
 */

export type RecorderState =
  | "idle"
  | "listening"
  | "thinking"
  | "done"
  | "error";

/** Safari first — it supports neither WebM nor Opus. */
const MIME_CANDIDATES = [
  "audio/mp4",
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
];

const EXT_BY_MIME: Record<string, string> = {
  "audio/mp4": "mp4",
  "audio/webm": "webm",
  "audio/ogg": "ogg",
};

const MAX_MS = 30_000;

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type));
}

function extensionFor(mime: string): string {
  return EXT_BY_MIME[mime.split(";")[0].trim().toLowerCase()] ?? "webm";
}

interface UseRecorderOptions {
  /** BCP-47 hint passed through to the transcription provider. */
  language?: string;
}

export function useRecorder({ language }: UseRecorderOptions = {}) {
  const [state, setState] = useState<RecorderState>("idle");
  const [transcript, setTranscript] = useState<string>("");
  const [error, setError] = useState<string>("");

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Guards against a pointerup that lands before getUserMedia resolves.
  const cancelledRef = useRef(false);

  const releaseMic = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // A navigation mid-recording must not strand an open microphone.
  useEffect(() => releaseMic, [releaseMic]);

  const upload = useCallback(
    async (blob: Blob, mime: string) => {
      if (blob.size === 0) {
        setState("idle");
        return;
      }

      setState("thinking");
      try {
        const form = new FormData();
        // Explicit filename: the server needs a real extension to infer the
        // container, and Safari would otherwise name this "blob".
        form.append("audio", blob, `clip.${extensionFor(mime)}`);
        if (language) form.append("language", language);

        const res = await fetch("/api/stt", { method: "POST", body: form });
        const data = await res.json();

        if (!res.ok) throw new Error(data?.error ?? "Transcription failed.");

        setTranscript(data.text ?? "");
        setState("done");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
        setState("error");
      }
    },
    [language],
  );

  const start = useCallback(async () => {
    if (state === "listening" || state === "thinking") return;

    cancelledRef.current = false;
    setError("");
    setTranscript("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        "This browser can't reach the microphone. Open the page over https.",
      );
      setState("error");
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Microphone access was blocked. Allow it and try again.");
      setState("error");
      return;
    }

    // The child let go while the permission prompt was still up.
    if (cancelledRef.current) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }

    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(
      stream,
      mimeType ? { mimeType } : undefined,
    );
    // Safari can report an empty mimeType until recording starts.
    const effectiveMime = recorder.mimeType || mimeType || "audio/webm";

    chunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: effectiveMime });
      chunksRef.current = [];
      releaseMic();
      void upload(blob, effectiveMime);
    };

    streamRef.current = stream;
    recorderRef.current = recorder;
    recorder.start();
    setState("listening");

    // Bound upload size and cost if a thumb stays down.
    timeoutRef.current = setTimeout(() => {
      if (recorderRef.current?.state === "recording") {
        recorderRef.current.stop();
      }
    }, MAX_MS);
  }, [releaseMic, state, upload]);

  const stop = useCallback(() => {
    cancelledRef.current = true;
    const recorder = recorderRef.current;
    if (recorder?.state === "recording") {
      recorder.stop(); // onstop handles release + upload
    }
  }, []);

  const reset = useCallback(() => {
    setTranscript("");
    setError("");
    setState("idle");
  }, []);

  return { state, transcript, error, start, stop, reset };
}
