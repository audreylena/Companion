import { getSttProvider, SttError } from "@/lib/stt";

/**
 * POST /api/stt — audio in, text out.
 *
 * The one contract shared by every listening device. Today a desktop browser
 * posts WebM from app/(device)/talk; tomorrow a Raspberry Pi posts a WAV:
 *
 *   curl -X POST -F "audio=@clip.wav" -F "language=en" http://…/api/stt
 *
 * Audio is never written to disk. It lives in memory for the duration of this
 * request and only the transcript survives.
 */

const MAX_BYTES = 10 * 1024 * 1024; // ~20x any plausible child utterance

// OpenAI infers the container from the filename extension, but MediaRecorder
// hands us a blob with no extension. Re-derive it from the MIME type. The
// table stays broad so any future device can post whatever it records.
const EXT_BY_MIME: Record<string, string> = {
  "audio/mp4": "mp4",
  "audio/m4a": "m4a",
  "audio/x-m4a": "m4a",
  "audio/mpeg": "mp3",
  "audio/mpga": "mp3",
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/wave": "wav",
  "audio/flac": "flac",
};

function fail(error: string, status: number) {
  return Response.json({ error }, { status });
}

function normalizeFilename(audio: File): File {
  // Strip codec parameters: "audio/webm;codecs=opus" → "audio/webm"
  const mime = audio.type.split(";")[0].trim().toLowerCase();
  const ext = EXT_BY_MIME[mime];
  const hasUsableName = /\.[a-z0-9]{2,5}$/i.test(audio.name);

  if (hasUsableName || !ext) return audio;
  return new File([audio], `clip.${ext}`, { type: mime });
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("Expected multipart/form-data with an 'audio' field.", 400);
  }

  const audio = form.get("audio");
  if (!(audio instanceof File)) {
    return fail("Missing 'audio' file field.", 400);
  }

  // Validate before spending money on a provider call.
  if (audio.size === 0) {
    return fail("Audio file is empty.", 400);
  }
  if (audio.size > MAX_BYTES) {
    return fail(`Audio file exceeds ${MAX_BYTES / 1024 / 1024}MB.`, 413);
  }
  if (audio.type && !audio.type.startsWith("audio/")) {
    return fail(`Unsupported content type: ${audio.type}`, 415);
  }

  const languageField = form.get("language");
  const language =
    typeof languageField === "string" && languageField.trim()
      ? languageField.trim()
      : undefined;

  try {
    const provider = getSttProvider();
    const transcript = await provider.transcribe(normalizeFilename(audio), {
      language,
    });
    return Response.json(transcript);
  } catch (err) {
    // Log the real cause server-side; hand the client something safe.
    console.error("[stt] transcription failed:", err);
    if (err instanceof SttError) {
      return fail("Transcription service is unavailable.", 502);
    }
    return fail("Unexpected error while transcribing.", 500);
  }
}
