"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, Loader2, Save, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type Props = { params: Promise<{ id: string }> };

type FaqItem = { q: string; a: string };

type Generated = {
  title_en?: string;
  title_th?: string;
  description_en?: string;
  description_th?: string;
  seoDescription?: string;
  faqItems?: FaqItem[];
  personaDescriptions?: Record<string, string>;
};

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
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Generated>({});
  const [hasGenerated, setHasGenerated] = useState(false);

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

  const handleSave = async () => {
    if (!hasGenerated) return;
    setSaving(true);
    try {
      const res = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: id, action: "save", data: draft }),
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
