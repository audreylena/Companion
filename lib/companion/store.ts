import type { CompanionTurn } from "./types";
import type { Conversation, SafetyLevel, ThemeCategory, ToneKey } from "@/lib/mock";

/**
 * In-memory log of real child interactions, so a conversation on /device/talk
 * surfaces in the parent dashboard. Backed by globalThis so it survives HMR in
 * dev and is shared across requests in one server process. This is the demo
 * stand-in for the Supabase table — swap listConversations/recordTurn for DB
 * calls and nothing else changes.
 */

const g = globalThis as unknown as { __companionLog?: Conversation[] };
const log: Conversation[] = (g.__companionLog ??= []);
const MAX = 200;

const feelingTheme: Record<string, ThemeCategory> = {
  fear: "Courage", worry: "Peace", sadness: "Hope", loneliness: "Identity",
  anger: "Forgiveness", gratitude: "Gratitude", sleep: "Peace",
  identity: "Identity", wonder: "Hope", other: "Peace",
};

const feelingTopic: Record<string, string> = {
  fear: "Feeling scared", worry: "Feeling worried", sadness: "Feeling sad",
  loneliness: "Feeling left out", anger: "Feeling upset", gratitude: "A grateful moment",
  sleep: "Trouble settling down", identity: "Feeling unsure about themselves",
  wonder: "A big question", other: "A moment to talk",
};

const toneDescription: Record<ToneKey, string> = {
  calm: "Calm and settled",
  attention: "Needed some gentle support",
  reflective: "Thoughtful and open",
  joyful: "Happy and warm",
};

function defaultFollowUp(feeling: string, name: string): string {
  const map: Record<string, string> = {
    fear: `Sitting with ${name} at bedtime, or a small nightlight, can help the dark feel safer.`,
    worry: `Ask ${name} which part feels hardest, and offer to face it together.`,
    sadness: `Let ${name} feel heard first — being understood matters more than being fixed.`,
    loneliness: `Reflecting back what you love about ${name} can gently reinforce that they belong.`,
    anger: `Help ${name} name the feeling before moving to problem-solving.`,
    gratitude: `Share your own "three good things" with ${name} at dinner.`,
    sleep: `A steady wind-down and a short goodnight prayer may settle a busy mind.`,
    identity: `Remind ${name} of specific things you notice and love about them.`,
    wonder: `There's no perfect answer needed — ${name} mostly wants to wonder about it with you.`,
    other: `A little unhurried time with ${name} could mean a lot.`,
  };
  return map[feeling] ?? map.other;
}

export interface RecordInput {
  childId: string;
  childName?: string;
  companionName?: string;
  language?: string;
  turn: CompanionTurn;
}

export function recordTurn(input: RecordInput): Conversation {
  const { turn } = input;
  const name = input.childName ?? "Your child";
  const companion = input.companionName ?? "Companion";
  const now = new Date();
  const safety: SafetyLevel = turn.category === "danger" ? "alert" : "ok";

  const summary =
    turn.category === "danger"
      ? `${companion} recognized something that needs your care and guided ${name} straight to you.`
      : turn.category === "wonder"
      ? `${name} asked a big question. ${companion} honored it, shared ${turn.verse?.ref ?? "Scripture"}, and gently pointed ${name} back to you.`
      : `A moment about feeling ${turn.feeling}. ${companion} offered comfort${turn.verse ? `, shared ${turn.verse.ref},` : ""} and pointed ${name} back to you.`;

  const convo: Conversation = {
    id: `live-${now.getTime()}`,
    childId: input.childId,
    date: now.toISOString(),
    time: now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    durationMin: 1,
    topic: feelingTopic[turn.feeling] ?? "A moment to talk",
    category: turn.category,
    theme: feelingTheme[turn.feeling] ?? "Peace",
    summary,
    tone: toneDescription[turn.tone],
    toneKey: turn.tone,
    scriptureRef: turn.verse?.ref ?? "—",
    scriptureText: turn.verse?.text ?? "",
    translation: turn.verse?.translation ?? "—",
    language: "English",
    askedForAdvice: turn.category === "in_scope",
    parentFollowUp: turn.handoff?.line ?? defaultFollowUp(turn.feeling, name),
    safety,
    safetyNote:
      turn.category === "danger"
        ? "Guided to you right away — please check in."
        : turn.category === "wonder"
        ? "Guided toward a parent conversation, by design."
        : "No urgent concern identified.",
  };

  log.unshift(convo);
  if (log.length > MAX) log.length = MAX;
  return convo;
}

export function listConversations(childId?: string): Conversation[] {
  return childId ? log.filter((c) => c.childId === childId) : [...log];
}
