"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, Loader2, Save, CheckCircle2, RefreshCw, Languages } from "lucide-react";
import { toast } from "sonner";

type Props = { params: Promise<{ id: string }> };
type FaqItem = { q: string; a: string };
type Generated = {
  title_en?: string; title_th?: string;
  description_en?: string; description_th?: string;
  seoDescription?: string;
  faqItems?: FaqItem[];
  personaDescriptions?: Record<string, string>;
  [key: string]: unknown; // locale translations like title_zh_CN
};

const EXTRA_LOCALES = [
  { code: 'zh-CN', label: '🇨🇳 Chinese (Simplified)' },
  { code: 'zh-TW', label: '🇹🇼 Chinese (Traditional)' },
  { code: 'ja',    label: '🇯🇵 Japanese' },
  { code: 'ko',    label: '🇰🇷 Korean' },
  { code: 'ru',    label: '🇷🇺 Russian' },
  { code: 'de',    label: '🇩🇪 German' },
  { code: 'fr',    label: '🇫🇷 French' },
  { code: 'es',    label: '🇪🇸 Spanish' },
  { code: 'it',    label: '🇮🇹 Italian' },
  { code: 'nl',    label: '🇳🇱 Dutch' },
  { code: 'sv',    label: '🇸🇪 Swedish' },
  { code: 'ar',    label: '🇸🇦 Arabic' },
  { code: 'hi',    label: '🇮🇳 Hindi' },
];

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</p>
      {children}
    </div>
  );
}

function EditArea({
  value,
  onChange,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-y focus:outline-none focus:ring-2 focus:ring-[#1E6B69]/20 bg-white font-sans"
    />
  );
}

export default function AIAssistantPage({ params }: Props) {
  const { id } = use(params);
  const [generating, setGenerating] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Generated>({});
  const [hasGenerated, setHasGenerated] = useState(false);
  const [selectedLocales, setSelectedLocales] = useState<string[]>([]);
  const [translations, setTranslations] = useState<Record<string, { title: string; description: string }>>({});

  const updateDraft = (key: keyof Generated, value: unknown) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setSaved(false);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: id, action: "generate" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? `Error ${res.status}`);
      setDraft(data.generated ?? {});
      setHasGenerated(true);
      toast.success("Content generated! Review and edit before saving.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setGenerating(false);
    }
  };

  const handleTranslate = async () => {
    if (!selectedLocales.length) return;
    setTranslating(true);
    try {
      const res = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "translate",
          titleEn: draft.title_en,
          descriptionEn: draft.description_en,
          locales: selectedLocales,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? `Error ${res.status}`);
      setTranslations((prev) => ({ ...prev, ...data.translations }));
      setSaved(false);
      toast.success(`Translated to ${selectedLocales.length} language${selectedLocales.length > 1 ? "s" : ""}!`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Translation failed");
    } finally {
      setTranslating(false);
    }
  };

  const handleSave = async () => {
    if (!hasGenerated) return;
    setSaving(true);
    try {
      const res = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: id, action: "save",
          data: {
            ...draft,
            // Merge translations: title_zh_CN, description_zh_CN, etc.
            ...Object.fromEntries(
              Object.entries(translations).flatMap(([loc, t]) => {
                const key = loc.replace('-', '_');
                return [[`title_${key}`, t.title], [`description_${key}`, t.description]];
              })
            ),
          },
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error ?? `Error ${res.status}`);
      }
      setSaved(true);
      toast.success("Saved to Notion!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/admin/properties/${id}/edit`}
          className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#1d211c] flex items-center gap-2">
            <Bot className="w-6 h-6 text-[#F4581A]" />
            AI Content Assistant
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Generate titles, descriptions, SEO, FAQ, and persona content — then review and save.
          </p>
        </div>
      </div>

      {/* Generate button */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800">
            {hasGenerated ? "Re-generate all content" : "Generate all content with AI"}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Uses property details (address, amenities, highlights) to write EN+TH titles,
            descriptions, SEO text, FAQ, and persona blurbs.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 bg-[#F4581A] hover:bg-[#D84C14] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors disabled:opacity-60 shrink-0"
        >
          {generating ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Generating…</>
          ) : hasGenerated ? (
            <><RefreshCw className="w-4 h-4" />Re-generate</>
          ) : (
            <><Bot className="w-4 h-4" />Generate</>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Generated content — editable */}
      {hasGenerated && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-6">
          <p className="text-xs text-gray-400">
            ✏️ All fields are editable — tweak the generated content before saving.
          </p>

          {/* Titles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Section label="Title (English)">
              <EditArea rows={2} value={draft.title_en ?? ""} onChange={(v) => updateDraft("title_en", v)} />
            </Section>
            <Section label="Title (Thai)">
              <EditArea rows={2} value={draft.title_th ?? ""} onChange={(v) => updateDraft("title_th", v)} />
            </Section>
          </div>

          {/* Descriptions */}
          <Section label="Description (English)">
            <EditArea rows={6} value={draft.description_en ?? ""} onChange={(v) => updateDraft("description_en", v)} />
          </Section>
          <Section label="Description (Thai)">
            <EditArea rows={6} value={draft.description_th ?? ""} onChange={(v) => updateDraft("description_th", v)} />
          </Section>

          {/* SEO */}
          <Section label="SEO Description (150 chars)">
            <div className="relative">
              <EditArea rows={2} value={draft.seoDescription ?? ""} onChange={(v) => updateDraft("seoDescription", v)} />
              <span className="absolute bottom-2.5 right-3 text-[10px] text-gray-400">
                {(draft.seoDescription ?? "").length}/150
              </span>
            </div>
          </Section>

          {/* FAQ */}
          {draft.faqItems && draft.faqItems.length > 0 && (
            <Section label={`FAQ (${draft.faqItems.length} items)`}>
              <div className="space-y-3">
                {draft.faqItems.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-3 space-y-2">
                    <input
                      value={item.q}
                      onChange={(e) => {
                        const items = [...(draft.faqItems ?? [])];
                        items[idx] = { ...items[idx], q: e.target.value };
                        updateDraft("faqItems", items);
                      }}
                      className="w-full text-sm font-medium border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1E6B69]/20 bg-white"
                      placeholder="Question"
                    />
                    <textarea
                      value={item.a}
                      rows={2}
                      onChange={(e) => {
                        const items = [...(draft.faqItems ?? [])];
                        items[idx] = { ...items[idx], a: e.target.value };
                        updateDraft("faqItems", items);
                      }}
                      className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-[#1E6B69]/20 bg-white"
                      placeholder="Answer"
                    />
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Personas */}
          {draft.personaDescriptions && (
            <Section label="Persona Descriptions">
              <div className="space-y-3">
                {Object.entries(draft.personaDescriptions).map(([persona, desc]) => (
                  <div key={persona}>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{persona}</p>
                    <EditArea rows={2} value={desc} onChange={(v) => {
                      updateDraft("personaDescriptions", { ...draft.personaDescriptions, [persona]: v });
                    }} />
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ── Translation section ── */}
          <div className="border-t border-gray-100 pt-5 space-y-4">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-[#1E6B69]" />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Translate to other languages</p>
            </div>
            <p className="text-xs text-gray-400">Select languages, then click Translate. Reviews EN title + description and renders natural translations.</p>

            {/* Language checkboxes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {EXTRA_LOCALES.map(({ code, label }) => (
                <label key={code} className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer text-xs transition-all ${
                  selectedLocales.includes(code)
                    ? "border-[#1E6B69] bg-[#EEF9F9] text-[#1E6B69] font-medium"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}>
                  <input type="checkbox" className="sr-only"
                    checked={selectedLocales.includes(code)}
                    onChange={() => setSelectedLocales(prev =>
                      prev.includes(code) ? prev.filter(l => l !== code) : [...prev, code]
                    )} />
                  <span>{label}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={() => setSelectedLocales(EXTRA_LOCALES.map(l => l.code))}
                className="text-xs px-3 py-1.5 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50">
                Select all
              </button>
              <button onClick={() => setSelectedLocales([])}
                className="text-xs px-3 py-1.5 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50">
                Clear
              </button>
              <button onClick={handleTranslate} disabled={!selectedLocales.length || translating || !draft.title_en}
                className="flex items-center gap-1.5 text-xs px-4 py-1.5 bg-[#1E6B69] text-white rounded-lg hover:bg-[#18605E] disabled:opacity-50 transition-colors ml-auto">
                {translating ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Translating…</> : <><Languages className="w-3.5 h-3.5" />Translate {selectedLocales.length > 0 ? `(${selectedLocales.length})` : ""}</>}
              </button>
            </div>

            {/* Translation results */}
            {Object.entries(translations).length > 0 && (
              <div className="space-y-4">
                {Object.entries(translations).map(([loc, t]) => {
                  const locInfo = EXTRA_LOCALES.find(l => l.code === loc);
                  return (
                    <div key={loc} className="bg-gray-50 rounded-xl p-4 space-y-2">
                      <p className="text-xs font-semibold text-gray-600">{locInfo?.label ?? loc}</p>
                      <input value={t.title}
                        onChange={e => setTranslations(prev => ({ ...prev, [loc]: { ...prev[loc], title: e.target.value } }))}
                        className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#1E6B69]/20"
                        placeholder="Title" />
                      <textarea value={t.description} rows={4}
                        onChange={e => setTranslations(prev => ({ ...prev, [loc]: { ...prev[loc], description: e.target.value } }))}
                        className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white resize-y focus:outline-none focus:ring-1 focus:ring-[#1E6B69]/20"
                        placeholder="Description" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Save */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Saving will overwrite the corresponding Notion fields for this property.
            </p>
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                saved
                  ? "bg-green-600 text-white"
                  : "bg-[#1E6B69] hover:bg-[#18605E] text-white disabled:opacity-60"
              }`}
            >
              {saved ? (
                <><CheckCircle2 className="w-4 h-4" />Saved!</>
              ) : saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
              ) : (
                <><Save className="w-4 h-4" />Save to Notion</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
