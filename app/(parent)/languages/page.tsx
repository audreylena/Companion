"use client";

import { useMemo, useState } from "react";
import { Check, Globe, BadgeCheck } from "lucide-react";
import { useApp } from "@/components/AppShell";
import {
  PageHeader,
  Card,
  SectionHeading,
  SearchInput,
  Button,
  Toggle,
  cx,
} from "@/components/ui";
import { languages, type Language } from "@/lib/mock";

const byCode = (c: string) => languages.find((l) => l.code === c) ?? languages[0];

const preview: Record<string, { line: string; verse: string }> = {
  en: { line: "It's okay to feel scared. God is always with you.", verse: "Isaiah 41:10" },
  fr: { line: "Ce n'est pas grave d'avoir peur. Dieu est toujours avec toi.", verse: "Ésaïe 41:10" },
  es: { line: "Está bien tener miedo. Dios siempre está contigo.", verse: "Isaías 41:10" },
  pt: { line: "Tudo bem ter medo. Deus está sempre com você.", verse: "Isaías 41:10" },
  sw: { line: "Ni sawa kuogopa. Mungu yuko pamoja nawe daima.", verse: "Isaya 41:10" },
  ar: { line: "لا بأس أن تشعر بالخوف. الله معك دائماً.", verse: "إشعياء ٤١:١٠" },
};

/* small pill selector for secondary fields */
function LangPills({
  value,
  onChange,
}: {
  value: string;
  onChange: (c: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {languages.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => onChange(l.code)}
          aria-pressed={value === l.code}
          className={cx("chip", value === l.code && "chip-active")}
        >
          <span aria-hidden>{l.flag}</span> {l.name}
        </button>
      ))}
    </div>
  );
}

export default function LanguagesPage() {
  const { child } = useApp();
  const [spoken, setSpoken] = useState("en");
  const [dashboard, setDashboard] = useState("en");
  const [scripture, setScripture] = useState("en");
  const [dual, setDual] = useState(true);
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState(false);

  const filtered = useMemo(
    () =>
      languages.filter(
        (l) =>
          l.name.toLowerCase().includes(query.toLowerCase()) ||
          l.nativeName.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  const dirty = () => setSaved(false);
  const p = preview[spoken] ?? preview.en;

  return (
    <>
      <PageHeader
        title="Languages"
        subtitle={`Companion can meet ${child.name} in the language that feels most like home`}
      />

      <div className="grid lg:grid-cols-3 gap-5">
        {/* hero: spoken language, searchable */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <SectionHeading
              title={`How ${child.name} talks with ${child.companionName}`}
              hint="The spoken language for conversations"
            />
            <div className="mb-3">
              <SearchInput value={query} onChange={setQuery} placeholder="Search 2,000+ languages…" />
            </div>
            <ul className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {filtered.map((l: Language) => {
                const active = spoken === l.code;
                return (
                  <li key={l.code}>
                    <button
                      type="button"
                      onClick={() => {
                        setSpoken(l.code);
                        dirty();
                      }}
                      aria-pressed={active}
                      className={cx(
                        "w-full flex items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition-colors",
                        active ? "bg-[var(--primary-soft)]" : "hover:bg-[var(--surface-2)]"
                      )}
                      style={active ? { border: "1px solid transparent" } : { border: "1px solid var(--border)" }}
                    >
                      <span className="text-xl" aria-hidden>{l.flag}</span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-semibold" style={{ color: "var(--text)" }}>{l.name}</span>
                        <span className="block text-xs muted">{l.nativeName}</span>
                      </span>
                      {l.scriptureSupported && (
                        <span className="badge badge--calm">
                          <BadgeCheck size={12} /> Scripture
                        </span>
                      )}
                      {active && <Check size={18} style={{ color: "var(--ink-blue)" }} />}
                    </button>
                  </li>
                );
              })}
              {filtered.length === 0 && (
                <li className="text-sm muted px-2 py-4 text-center">No languages match &ldquo;{query}&rdquo;.</li>
              )}
            </ul>
          </Card>

          <div className="grid sm:grid-cols-2 gap-5">
            <Card>
              <SectionHeading title="Your dashboard" hint="The language for this parent space" />
              <LangPills value={dashboard} onChange={(c) => { setDashboard(c); dirty(); }} />
            </Card>
            <Card>
              <SectionHeading title="Scripture language" hint="Where verses are drawn from" />
              <LangPills value={scripture} onChange={(c) => { setScripture(c); dirty(); }} />
            </Card>
          </div>

          <Card>
            <Toggle
              checked={dual}
              onChange={(v) => { setDual(v); dirty(); }}
              label="Dual-language mode"
              description={`Let ${child.name} switch languages naturally during a conversation.`}
            />
          </Card>
        </div>

        {/* preview + save */}
        <div className="space-y-5">
          <Card>
            <SectionHeading title="Preview" hint={`${child.companionName} in ${byCode(spoken).name}`} />
            <div
              className="soft p-4"
              dir={spoken === "ar" ? "rtl" : "ltr"}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg" aria-hidden>🧸</span>
                <span className="text-xs font-semibold" style={{ color: "var(--text)" }}>{child.companionName}</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>{p.line}</p>
              <p className="text-xs font-semibold mt-2" style={{ color: "var(--ink-blue)" }}>{p.verse}</p>
            </div>
          </Card>

          <Card tint className="flex items-start gap-3 !py-4">
            <Globe size={18} className="shrink-0 mt-0.5" style={{ color: "var(--ink-blue)" }} />
            <p className="text-xs leading-relaxed" style={{ color: "var(--text)" }}>
              Companion can offer Scripture and faith-sensitive support in the selected language when
              supported by the connected YouVersion and Gloo APIs.
            </p>
          </Card>

          <div className="flex items-center gap-3">
            <Button variant="primary" icon={saved ? Check : undefined} onClick={() => setSaved(true)}>
              {saved ? "Saved" : "Save languages"}
            </Button>
            {saved && <span className="badge badge--calm"><Check size={13} /> Preferences updated</span>}
          </div>
        </div>
      </div>
    </>
  );
}
