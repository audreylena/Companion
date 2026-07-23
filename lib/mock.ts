/* ============================================================
   Companion — mock data layer
   Everything the dashboard renders lives here behind typed
   shapes. Swap these arrays for real API calls later; the UI
   never needs to change.
   ============================================================ */

export type ToneKey = "calm" | "attention" | "reflective" | "joyful";
export type SafetyLevel = "ok" | "attention" | "alert";
export type Category = "in_scope" | "wonder" | "danger";
export type ThemeCategory =
  | "Courage" | "Peace" | "Friendship" | "Gratitude"
  | "Wisdom" | "Hope" | "Identity" | "Forgiveness";

export interface Child {
  id: string;
  name: string;
  ageRange: string;
  companionName: string;
  primaryLanguage: string;
  secondaryLanguage?: string;
  translation: string;
  readingLevel: string;
  favoriteTopics: ThemeCategory[];
  accent: string;         // avatar color
  notify: { highRisk: boolean; newTopics: boolean; dailyReflections: boolean };
}

export interface Conversation {
  id: string;
  childId: string;
  date: string;           // ISO
  time: string;           // display
  durationMin: number;
  topic: string;
  category: Category;
  theme: ThemeCategory;
  summary: string;
  tone: string;           // descriptive
  toneKey: ToneKey;
  scriptureRef: string;
  scriptureText: string;
  translation: string;
  language: string;
  askedForAdvice: boolean;
  parentFollowUp: string;
  safety: SafetyLevel;
  safetyNote: string;
}

export interface AdviceItem {
  id: string;
  theme: ThemeCategory;
  topic: string;
  whatMayHelp: string;
  conversationStarter: string;
  actions: string[];
  scriptureRef: string;
  scriptureText: string;
}

export interface ScriptureRec {
  id: string;
  ref: string;
  preview: string;
  theme: ThemeCategory;
  language: string;
  translation: string;
  dateRecommended: string;
  why: string;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  scriptureSupported: boolean;
}

/* ---------------- children ---------------- */

export const children: Child[] = [
  {
    id: "maya",
    name: "Maya",
    ageRange: "7–9 years",
    companionName: "Pip",
    primaryLanguage: "English",
    secondaryLanguage: "French",
    translation: "NIrV",
    readingLevel: "Early reader",
    favoriteTopics: ["Courage", "Friendship", "Gratitude"],
    accent: "#A9CBEE",
    notify: { highRisk: true, newTopics: true, dailyReflections: true },
  },
  {
    id: "eli",
    name: "Eli",
    ageRange: "5–6 years",
    companionName: "Pip",
    primaryLanguage: "English",
    secondaryLanguage: "Spanish",
    translation: "ICB",
    readingLevel: "Listening only",
    favoriteTopics: ["Peace", "Hope"],
    accent: "#BFD8C4",
    notify: { highRisk: true, newTopics: false, dailyReflections: true },
  },
];

/* ---------------- conversations ---------------- */

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

export const conversations: Conversation[] = [
  {
    id: "c1",
    childId: "maya",
    date: daysAgo(0),
    time: "8:12 PM",
    durationMin: 6,
    topic: "Feeling nervous about school",
    category: "in_scope",
    theme: "Courage",
    summary:
      "Maya shared that she feels worried about giving a presentation in class tomorrow. Pip guided her through a short breathing exercise and shared a Scripture about courage and peace.",
    tone: "Nervous, but receptive to reassurance",
    toneKey: "attention",
    scriptureRef: "Isaiah 41:10",
    scriptureText:
      "So do not fear, for I am with you; do not be dismayed, for I am your God.",
    translation: "NIrV",
    language: "English",
    askedForAdvice: true,
    parentFollowUp:
      "Ask Maya which part of the presentation feels most uncomfortable, and offer to practice with her once.",
    safety: "ok",
    safetyNote: "No urgent concern identified.",
  },
  {
    id: "c2",
    childId: "maya",
    date: daysAgo(1),
    time: "7:40 PM",
    durationMin: 5,
    topic: "A disagreement with a friend",
    category: "in_scope",
    theme: "Forgiveness",
    summary:
      "Maya talked about feeling hurt after a friend left her out at recess. Pip listened, named the feeling gently, and shared a verse about patience and forgiving one another.",
    tone: "Hurt, then thoughtful",
    toneKey: "reflective",
    scriptureRef: "Colossians 3:13",
    scriptureText:
      "Put up with one another. Forgive one another if you are holding something against someone.",
    translation: "NIrV",
    language: "English",
    askedForAdvice: true,
    parentFollowUp:
      "Let Maya tell the story in her own words without fixing it right away, then wonder together what kindness could look like tomorrow.",
    safety: "ok",
    safetyNote: "No urgent concern identified.",
  },
  {
    id: "c3",
    childId: "maya",
    date: daysAgo(2),
    time: "8:02 PM",
    durationMin: 4,
    topic: "Thankful for family",
    category: "in_scope",
    theme: "Gratitude",
    summary:
      "A warm, happy conversation. Maya listed things she was thankful for and prayed a short thank-you prayer with Pip.",
    tone: "Joyful and settled",
    toneKey: "joyful",
    scriptureRef: "1 Thessalonians 5:18",
    scriptureText: "Give thanks no matter what happens.",
    translation: "NIrV",
    language: "English",
    askedForAdvice: false,
    parentFollowUp:
      "Maya lights up around gratitude — a shared 'three good things' at dinner could become a lovely rhythm.",
    safety: "ok",
    safetyNote: "No urgent concern identified.",
  },
  {
    id: "c4",
    childId: "maya",
    date: daysAgo(3),
    time: "9:05 PM",
    durationMin: 7,
    topic: "Trouble falling asleep",
    category: "in_scope",
    theme: "Peace",
    summary:
      "Maya said her mind felt busy at bedtime. Pip offered a slow breathing rhythm and a verse about resting safely, and encouraged her to say goodnight to you.",
    tone: "Restless, then calmer",
    toneKey: "attention",
    scriptureRef: "Psalm 4:8",
    scriptureText: "In peace I will lie down and sleep.",
    translation: "NIrV",
    language: "English",
    askedForAdvice: true,
    parentFollowUp:
      "A predictable wind-down and a short goodnight prayer together may help settle a busy mind.",
    safety: "ok",
    safetyNote: "No urgent concern identified.",
  },
  {
    id: "c5",
    childId: "maya",
    date: daysAgo(4),
    time: "7:22 PM",
    durationMin: 5,
    topic: "Feeling left out",
    category: "in_scope",
    theme: "Identity",
    summary:
      "Maya wondered if she was 'enough.' Pip reminded her, gently and simply, that she is deeply loved and wonderfully made, and pointed her toward talking with you.",
    tone: "Tender and searching",
    toneKey: "reflective",
    scriptureRef: "Psalm 139:14",
    scriptureText: "I am fearfully and wonderfully made.",
    translation: "NIrV",
    language: "English",
    askedForAdvice: false,
    parentFollowUp:
      "Reflecting back specific things you love and notice about Maya can gently reinforce that she belongs.",
    safety: "ok",
    safetyNote: "No urgent concern identified.",
  },
  {
    id: "c6",
    childId: "maya",
    date: daysAgo(5),
    time: "8:18 PM",
    durationMin: 4,
    topic: "A big question about faith",
    category: "wonder",
    theme: "Hope",
    summary:
      "Maya asked why we can't see God. Pip recognized this as a big, important question, shared a simple verse, and warmly encouraged Maya to explore it together with you.",
    tone: "Curious and open",
    toneKey: "reflective",
    scriptureRef: "John 3:16",
    scriptureText: "For God so loved the world...",
    translation: "NIrV",
    language: "English",
    askedForAdvice: false,
    parentFollowUp:
      "Pip intentionally handed this one back to you. There's no perfect answer needed — Maya mostly wants to wonder about it with someone she trusts.",
    safety: "ok",
    safetyNote: "Guided toward a parent conversation, by design.",
  },
  {
    id: "c7",
    childId: "eli",
    date: daysAgo(0),
    time: "7:30 PM",
    durationMin: 3,
    topic: "Scared of the dark",
    category: "in_scope",
    theme: "Peace",
    summary:
      "Eli felt scared at bedtime. Pip offered comfort, a gentle verse about trusting God, and encouraged Eli to call for you for a goodnight hug.",
    tone: "Scared, then comforted",
    toneKey: "attention",
    scriptureRef: "Psalm 56:3",
    scriptureText: "When I am afraid, I put my trust in you.",
    translation: "ICB",
    language: "English",
    askedForAdvice: true,
    parentFollowUp:
      "A small nightlight and a consistent goodnight routine can make the dark feel safer for Eli.",
    safety: "ok",
    safetyNote: "No urgent concern identified.",
  },
];

/* ---------------- parent advice ---------------- */

export const adviceItems: AdviceItem[] = [
  {
    id: "a1",
    theme: "Courage",
    topic: "Nervous about an upcoming presentation",
    whatMayHelp:
      "Maya may benefit from reassurance that effort matters more than perfection. Naming the specific worry often shrinks it.",
    conversationStarter: "What part of tomorrow feels the hardest right now?",
    actions: [
      "Offer to practice the presentation together once, low-pressure",
      "Remind her of a time she felt nervous and it turned out okay",
    ],
    scriptureRef: "Philippians 4:6–7",
    scriptureText:
      "Do not worry about anything. Instead, tell God what you need, and thank him.",
  },
  {
    id: "a2",
    theme: "Forgiveness",
    topic: "Feeling hurt by a friend",
    whatMayHelp:
      "Being heard usually matters more than being fixed. Letting Maya feel understood first makes room for kindness later.",
    conversationStarter: "Do you want me to help solve it, or just listen for now?",
    actions: [
      "Reflect her feeling back before offering ideas",
      "Wonder together what a small act of kindness could look like",
    ],
    scriptureRef: "Colossians 3:13",
    scriptureText: "Forgive one another, just as the Lord forgave you.",
  },
  {
    id: "a3",
    theme: "Peace",
    topic: "A busy mind at bedtime",
    whatMayHelp:
      "A predictable wind-down signals safety to a child's nervous system. Shorter, calmer, and consistent tends to beat longer.",
    conversationStarter: "What's one good thing from today we can thank God for?",
    actions: [
      "Keep a steady goodnight routine",
      "Try a slow breathing rhythm together for a minute",
    ],
    scriptureRef: "Psalm 4:8",
    scriptureText: "In peace I will lie down and sleep.",
  },
];

/* ---------------- scripture recommendations ---------------- */

export const scriptureRecs: ScriptureRec[] = [
  {
    id: "s1", ref: "Isaiah 41:10", preview: "Do not fear, for I am with you.",
    theme: "Courage", language: "English", translation: "NIrV",
    dateRecommended: daysAgo(0),
    why: "Shared while Maya felt nervous about a presentation.",
  },
  {
    id: "s2", ref: "Colossians 3:13", preview: "Forgive one another.",
    theme: "Forgiveness", language: "English", translation: "NIrV",
    dateRecommended: daysAgo(1),
    why: "Shared after a disagreement with a friend.",
  },
  {
    id: "s3", ref: "1 Thessalonians 5:18", preview: "Give thanks no matter what happens.",
    theme: "Gratitude", language: "English", translation: "NIrV",
    dateRecommended: daysAgo(2),
    why: "Shared during a joyful conversation about family.",
  },
  {
    id: "s4", ref: "Psalm 4:8", preview: "In peace I will lie down and sleep.",
    theme: "Peace", language: "English", translation: "NIrV",
    dateRecommended: daysAgo(3),
    why: "Shared to help settle a busy mind at bedtime.",
  },
  {
    id: "s5", ref: "Psalm 139:14", preview: "I am fearfully and wonderfully made.",
    theme: "Identity", language: "English", translation: "NIrV",
    dateRecommended: daysAgo(4),
    why: "Shared when Maya wondered if she was 'enough.'",
  },
  {
    id: "s6", ref: "Proverbs 3:5", preview: "Trust in the Lord with all your heart.",
    theme: "Wisdom", language: "English", translation: "NIrV",
    dateRecommended: daysAgo(6),
    why: "A gentle reminder saved from an earlier conversation.",
  },
];

/* ---------------- languages ---------------- */

export const languages: Language[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸", scriptureSupported: true },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", scriptureSupported: true },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", scriptureSupported: true },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷", scriptureSupported: true },
  { code: "sw", name: "Swahili", nativeName: "Kiswahili", flag: "🇰🇪", scriptureSupported: true },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", scriptureSupported: true },
];

/* ---------------- helpers (API-swap boundary) ---------------- */

export const getChild = (id: string) => children.find((c) => c.id === id) ?? children[0];

export const conversationsFor = (childId: string) =>
  conversations
    .filter((c) => c.childId === childId)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));

export const latestConversation = (childId: string) => conversationsFor(childId)[0];

export function weeklyStats(childId: string) {
  const list = conversationsFor(childId);
  const week = list.filter((c) => +new Date(c.date) > Date.now() - 7 * 864e5);
  const themeCounts = new Map<ThemeCategory, number>();
  week.forEach((c) => themeCounts.set(c.theme, (themeCounts.get(c.theme) ?? 0) + 1));
  const topTheme: ThemeCategory | "—" =
    [...themeCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  const toneCounts = { calm: 0, attention: 0, reflective: 0, joyful: 0 } as Record<ToneKey, number>;
  week.forEach((c) => (toneCounts[c.toneKey] += 1));
  return {
    count: week.length,
    topTheme,
    toneCounts,
    latest: list[0],
    anyAlert: week.some((c) => c.safety !== "ok"),
  };
}

// simple per-weekday frequency for the gentle weekly chart
export function weeklyFrequency(childId: string) {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const counts = new Array(7).fill(0);
  conversationsFor(childId)
    .filter((c) => +new Date(c.date) > Date.now() - 7 * 864e5)
    .forEach((c) => {
      const d = new Date(c.date).getDay(); // 0=Sun
      counts[(d + 6) % 7] += 1;
    });
  return labels.map((label, i) => ({ label, value: counts[i] }));
}

export const toneLabel: Record<ToneKey, string> = {
  calm: "Calm",
  attention: "Needs gentle support",
  reflective: "Reflective",
  joyful: "Joyful",
};

export const toneBadgeClass: Record<ToneKey, string> = {
  calm: "badge--calm",
  attention: "badge--attention",
  reflective: "badge--reflective",
  joyful: "badge--joyful",
};

export const themeEmoji: Record<ThemeCategory, string> = {
  Courage: "🦁", Peace: "🕊️", Friendship: "🤝", Gratitude: "🌻",
  Wisdom: "🌟", Hope: "🌅", Identity: "💛", Forgiveness: "🌿",
};
