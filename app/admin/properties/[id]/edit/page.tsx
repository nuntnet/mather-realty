"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, Loader2, Plus, Save, Trash2, Sparkles } from "lucide-react";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import LocationPicker from "@/components/admin/LocationPicker";

// ── Constants ─────────────────────────────────────────────────────────────────

const LOCALES = [
  { code: "en",    label: "EN" },
  { code: "th",    label: "TH" },
  { code: "zh-CN", label: "ZH-CN" },
  { code: "zh-TW", label: "ZH-TW" },
  { code: "ja",    label: "JA" },
  { code: "ko",    label: "KO" },
  { code: "ru",    label: "RU" },
  { code: "de",    label: "DE" },
  { code: "fr",    label: "FR" },
  { code: "es",    label: "ES" },
  { code: "it",    label: "IT" },
  { code: "nl",    label: "NL" },
  { code: "sv",    label: "SV" },
  { code: "ar",    label: "AR" },
  { code: "hi",    label: "HI" },
];

const STATUS_OPTIONS = [
  { value: "pending",     label: "Pending"     },
  { value: "available",   label: "Available"   },
  { value: "rented",      label: "Rented"      },
  { value: "coming_soon", label: "Coming Soon" },
  { value: "archived",    label: "Archived"    },
];

// Must match Notion multi_select option names exactly (case-sensitive)
const AMENITIES = [
  "Pool", "Parking", "WiFi", "Gym", "Security", "EVCharger",
  "Furnished", "AirCon", "Elevator", "Balcony", "Garden", "PetFriendly",
];

const AMENITY_LABELS: Record<string, string> = {
  Pool: "Pool", Parking: "Parking", WiFi: "WiFi", Gym: "Gym",
  Security: "Security", EVCharger: "EV Charger", Furnished: "Furnished",
  AirCon: "Air Conditioning", Elevator: "Elevator", Balcony: "Balcony",
  Garden: "Garden", PetFriendly: "Pet Friendly",
};

const PERFECT_FOR_OPTIONS = [
  "family",
  "couple",
  "remote-worker",
  "teacher",
  "retiree",
  "expat-couple",
  "solo-expat",
  "student",
];

// ── Types ──────────────────────────────────────────────────────────────────────

type LocaleText = Record<string, string>;

type FaqItem = { q: string; a: string };

type PropertyForm = {
  titles: LocaleText;
  descriptions: LocaleText;
  address: string;
  city: string;
  district: string;
  lat: string;
  lng: string;
  priceTHB: string;
  bedrooms: string;
  bathrooms: string;
  sizeSqm: string;
  amenities: string[];
  status: string;
  virtualTourUrl: string;
  verified: boolean;
  // New fields
  availableFrom: string;
  minLeaseTerm: string;
  depositMonths: string;
  floors: string;
  parkingSpots: string;
  hasVirtualTour: boolean;
  contactLine: string;
  contactPhone: string;
  highlights: Record<string, string>;      // locale → newline-separated lines
  perfectFor: string[];
  tags: string;                             // comma-separated in UI
  faq: Record<string, FaqItem[]>;          // locale → FAQ items
  seoDescription: Record<string, string>;  // locale → SEO text
  personaDescriptions: string;             // JSON (EN only, not locale-split yet)
};

function emptyForm(): PropertyForm {
  return {
    titles: {},
    descriptions: {},
    address: "",
    city: "",
    district: "",
    lat: "",
    lng: "",
    priceTHB: "",
    bedrooms: "",
    bathrooms: "",
    sizeSqm: "",
    amenities: [],
    status: "pending",
    virtualTourUrl: "",
    verified: false,
    availableFrom: "",
    minLeaseTerm: "",
    depositMonths: "",
    floors: "",
    parkingSpots: "",
    hasVirtualTour: false,
    contactLine: "",
    contactPhone: "",
    highlights: {},
    perfectFor: [],
    tags: "",
    faq: {},
    seoDescription: {},
    personaDescriptions: "",
  };
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2">
      {children}
    </h2>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const INPUT_CLS =
  "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#131F3C]/20 bg-white";
const TEXTAREA_CLS =
  "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#131F3C]/20 bg-white resize-none";

/** Convert "remote-worker" → "Remote Worker" */
function labelify(s: string) {
  return s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function PropertyEditPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;
  const isNew = propertyId === "new";

  const [form, setForm] = useState<PropertyForm>(emptyForm());
  const [activeLocale, setActiveLocale] = useState("en");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [leaveTarget, setLeaveTarget] = useState<string | null>(null);

  // Load existing property
  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    fetch(`/api/admin/properties/${propertyId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) { toast.error("Property not found"); router.push("/admin/properties"); return; }

        // Parse highlights per-locale: Record<string, string[]> → Record<string, string>
        const parseHL = (arr: unknown): string => {
          if (Array.isArray(arr)) return (arr as string[]).join("\n");
          if (typeof arr === "string") return (arr as string).split(" • ").join("\n");
          return "";
        };
        const highlightsByLocale: Record<string, string> = {};
        if (typeof data.highlights === "object" && data.highlights !== null) {
          for (const [loc, arr] of Object.entries(data.highlights as Record<string, unknown>)) {
            const s = parseHL(arr);
            if (s) highlightsByLocale[loc] = s;
          }
        }

        // Parse FAQ per-locale: Record<string, FaqItem[]>
        const tryParseFaq = (v: unknown): FaqItem[] => {
          if (Array.isArray(v)) return v as FaqItem[];
          if (typeof v === "string" && v) {
            try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; }
          }
          return [];
        };
        const faqByLocale: Record<string, FaqItem[]> = {};
        if (typeof data.faqJson === "object" && data.faqJson !== null && !Array.isArray(data.faqJson)) {
          for (const [loc, v] of Object.entries(data.faqJson as Record<string, unknown>)) {
            const arr = tryParseFaq(v);
            if (arr.length) faqByLocale[loc] = arr;
          }
        } else {
          const enFaq = tryParseFaq(data.faqJson) || tryParseFaq(data.faq);
          if (enFaq.length) faqByLocale["en"] = enFaq;
        }

        // Parse SEO per-locale: Record<string, string>
        const seoByLocale: Record<string, string> = {};
        if (typeof data.seoDescription === "object" && data.seoDescription !== null) {
          for (const [loc, v] of Object.entries(data.seoDescription as Record<string, string>)) {
            if (v) seoByLocale[loc] = v;
          }
        } else if (typeof data.seoDescription === "string" && data.seoDescription) {
          seoByLocale["en"] = data.seoDescription;
        }

        setForm({
          titles: data.titles ?? {},
          descriptions: data.descriptions ?? {},
          address: data.address ?? "",
          city: data.city ?? "",
          district: data.district ?? "",
          lat: data.lat != null ? String(data.lat) : "",
          lng: data.lng != null ? String(data.lng) : "",
          priceTHB: data.priceTHB != null ? String(data.priceTHB) : "",
          bedrooms: data.bedrooms != null ? String(data.bedrooms) : "",
          bathrooms: data.bathrooms != null ? String(data.bathrooms) : "",
          sizeSqm: data.sizeSqm != null ? String(data.sizeSqm) : "",
          amenities: data.amenities ?? [],
          status: data.status ?? "pending",
          virtualTourUrl: data.virtualTourUrl ?? "",
          verified: !!data.verifiedAt,
          availableFrom: data.availableFrom ?? "",
          minLeaseTerm: data.minLeaseTerm != null ? String(data.minLeaseTerm) : "",
          depositMonths: data.depositMonths != null ? String(data.depositMonths) : "",
          floors: data.floors != null ? String(data.floors) : "",
          parkingSpots: data.parkingSpots != null ? String(data.parkingSpots) : "",
          hasVirtualTour: !!data.hasVirtualTour,
          contactLine: data.contactLine ?? "",
          contactPhone: data.contactPhone ?? "",
          highlights: highlightsByLocale,
          perfectFor: data.perfectFor ?? [],
          tags: Array.isArray(data.tags) ? data.tags.join(", ") : (data.tags ?? ""),
          faq: faqByLocale,
          seoDescription: seoByLocale,
          personaDescriptions: data.personaDescriptions
            ? (typeof data.personaDescriptions === "string"
                ? data.personaDescriptions
                : JSON.stringify(data.personaDescriptions, null, 2))
            : "",
        });
      })
      .finally(() => setLoading(false));
  }, [isNew, propertyId, router]);

  // ── Unsaved-changes guard ────────────────────────────────────────────────────
  // Browser refresh / tab close
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // Mark form dirty on any change (after initial load)
  const dirtySetForm: typeof setForm = (updater) => {
    if (!loading) setIsDirty(true);
    setForm(updater as Parameters<typeof setForm>[0]);
  };

  // Navigate away safely — shows confirm dialog if dirty
  function navigateSafely(href: string) {
    if (isDirty) { setLeaveTarget(href); return; }
    router.push(href);
  }

  const setLocaleField = (field: "titles" | "descriptions", value: string) => {
    dirtySetForm((f) => ({ ...f, [field]: { ...f[field], [activeLocale]: value } }));
  };

  const toggleAmenity = (a: string) => {
    dirtySetForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter((x) => x !== a)
        : [...f.amenities, a],
    }));
  };

  const togglePerfectFor = (opt: string) => {
    dirtySetForm((f) => ({
      ...f,
      perfectFor: f.perfectFor.includes(opt)
        ? f.perfectFor.filter((x) => x !== opt)
        : [...f.perfectFor, opt],
    }));
  };

  // FAQ helpers — locale-aware (operate on activeLocale)
  const activeFaq = (): FaqItem[] => form.faq[activeLocale] ?? [];

  const addFaqItem = () => {
    dirtySetForm((f) => ({
      ...f, faq: { ...f.faq, [activeLocale]: [...(f.faq[activeLocale] ?? []), { q: "", a: "" }] },
    }));
  };

  const removeFaqItem = (idx: number) => {
    dirtySetForm((f) => ({
      ...f, faq: { ...f.faq, [activeLocale]: (f.faq[activeLocale] ?? []).filter((_, i) => i !== idx) },
    }));
  };

  const updateFaqItem = (idx: number, field: "q" | "a", value: string) => {
    dirtySetForm((f) => ({
      ...f, faq: { ...f.faq, [activeLocale]: (f.faq[activeLocale] ?? []).map((item, i) => i === idx ? { ...item, [field]: value } : item) },
    }));
  };

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const tag = tagInput.trim();
    if (!tag) return;
    const existing = form.tags
      ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];
    if (!existing.includes(tag)) {
      dirtySetForm((f) => ({
        ...f,
        tags: [...existing, tag].join(", "),
      }));
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    const existing = form.tags
      ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];
    dirtySetForm((f) => ({
      ...f,
      tags: existing.filter((t) => t !== tag).join(", "),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titles["en"]?.trim()) {
      toast.error("English title is required");
      return;
    }
    setSaving(true);
    try {
      // Convert highlights per-locale: { en: "line1\nline2", ko: "..." } → { en: ["line1","line2"], ko: [...] }
      const highlightsObj = Object.fromEntries(
        Object.entries(form.highlights)
          .map(([loc, txt]) => [loc, txt.split("\n").map(l => l.trim()).filter(Boolean)])
          .filter(([, arr]) => (arr as string[]).length > 0)
      );

      // Parse tags
      const tagsArray = form.tags
        ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      // Parse exterior/interior/community photos
      const toUrlArray = (s: string) =>
        s ? s.split(",").map((u) => u.trim()).filter(Boolean) : [];

      const body = {
        titles: form.titles,
        descriptions: form.descriptions,
        address: form.address,
        city: form.city,
        district: form.district,
        lat: form.lat ? parseFloat(form.lat) : null,
        lng: form.lng ? parseFloat(form.lng) : null,
        priceTHB: form.priceTHB ? parseInt(form.priceTHB, 10) : null,
        bedrooms: form.bedrooms ? parseInt(form.bedrooms, 10) : null,
        bathrooms: form.bathrooms ? parseInt(form.bathrooms, 10) : null,
        sizeSqm: form.sizeSqm ? parseFloat(form.sizeSqm) : null,
        amenities: form.amenities,
        status: form.status,
        virtualTourUrl: form.virtualTourUrl || null,
        verified: form.verified,
        // New fields
        availableFrom: form.availableFrom || null,
        minLeaseTerm: form.minLeaseTerm ? parseInt(form.minLeaseTerm, 10) : null,
        depositMonths: form.depositMonths ? parseInt(form.depositMonths, 10) : null,
        floors: form.floors ? parseInt(form.floors, 10) : null,
        parkingSpots: form.parkingSpots ? parseInt(form.parkingSpots, 10) : null,
        hasVirtualTour: form.hasVirtualTour,
        contactLine: form.contactLine || null,
        contactPhone: form.contactPhone || null,
        highlights: highlightsObj,
        perfectFor: form.perfectFor,
        tags: tagsArray,
        // faqJson: per-locale Record<string, FaqItem[]>
        faqJson: Object.keys(form.faq).length > 0 ? form.faq : {},
        // seoDescription: per-locale Record<string, string>
        seoDescription: form.seoDescription,
        personaDescriptions: form.personaDescriptions || "",
      };

      const url = isNew ? "/api/admin/properties" : `/api/admin/properties/${propertyId}`;
      const method = isNew ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(String(res.status));
      setIsDirty(false);
      toast.success(isNew ? "Property created." : "Property saved.");
      router.push("/admin/properties");
    } catch {
      toast.error("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── AI helpers ───────────────────────────────────────────────────────────────

  async function aiPost(body: Record<string, unknown>) {
    const res = await fetch("/api/ai/generate-content", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.status === 401) {
      toast.error("Session expired — please refresh the page and log in again.");
      throw new Error("Unauthorized");
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`);
    return data;
  }

  async function generateField(field: string, locale = activeLocale) {
    setAiLoading((p) => ({ ...p, [field]: true }));
    try {
      const data = await aiPost({ propertyId, action: "generate-field", field, locale });
      const val = data.value;

      // For title_en / description_en: always update EN form state
      if (field === "title_en")       { setIsDirty(true); setForm((f) => ({ ...f, titles: { ...f.titles, en: val } })); }
      if (field === "description_en") { setIsDirty(true); setForm((f) => ({ ...f, descriptions: { ...f.descriptions, en: val } })); }

      // For locale-specific fields: always update form state for the target locale
      // (form is now per-locale, so this is safe regardless of which locale)
      const isLocaleField = ["seo", "highlights", "faq", "personas"].includes(field);
      if (isLocaleField) {
        setIsDirty(true);
        if (field === "seo")       setForm((f) => ({ ...f, seoDescription: { ...f.seoDescription, [locale]: typeof val === "string" ? val : "" } }));
        if (field === "highlights") setForm((f) => ({ ...f, highlights: { ...f.highlights, [locale]: typeof val === "string" ? val : (Array.isArray(val) ? (val as string[]).join("\n") : "") } }));
        if (field === "faq")       setForm((f) => ({ ...f, faq: { ...f.faq, [locale]: Array.isArray(val) ? val : [] } }));
        if (field === "personas")  setForm((f) => ({ ...f, personaDescriptions: typeof val === "string" ? val : JSON.stringify(val, null, 2) }));
      }

      toast.success(`Generated!`);
    } catch (e) {
      if ((e as Error).message !== "Unauthorized")
        toast.error(e instanceof Error ? e.message : "AI generation failed");
    } finally {
      setAiLoading((p) => ({ ...p, [field]: false }));
    }
  }

  async function translateLocale(locale: string) {
    const key = `translate-${locale}`;
    setAiLoading((p) => ({ ...p, [key]: true }));
    try {
      const titleEn = form.titles["en"] || "";
      const descEn  = form.descriptions["en"] || "";
      if (!titleEn && !descEn) { toast.error("Fill in the English title/description first"); return; }
      const data = await aiPost({ action: "translate", titleEn, descriptionEn: descEn, locales: [locale] });
      const t = data.translations?.[locale];
      if (t?.title)       setForm((f) => ({ ...f, titles:       { ...f.titles,       [locale]: t.title } }));
      if (t?.description) setForm((f) => ({ ...f, descriptions: { ...f.descriptions, [locale]: t.description } }));
      toast.success(`Translated to ${locale}!`);
    } catch (e) {
      if ((e as Error).message !== "Unauthorized")
        toast.error(e instanceof Error ? e.message : "Translation failed");
    } finally {
      setAiLoading((p) => ({ ...p, [key]: false }));
    }
  }

  // Translate ALL fields (title, description, highlights, SEO, FAQ) for a single target locale
  async function translateAllFields(targetLocale: string) {
    if (!form.titles["en"]?.trim()) {
      toast.error("Fill in the English title first");
      return;
    }
    const key = `translate-all-fields-${targetLocale}`;
    setAiLoading((p) => ({ ...p, [key]: true }));
    try {
      const highlightsEn = (form.highlights["en"] ?? "").split("\n").filter(Boolean).join("\n");
      const faqEn = (form.faq["en"] ?? []).length > 0 ? form.faq["en"] : undefined;
      const data = await aiPost({
        propertyId,
        action: "translate-all",
        targetLocale,
        titleEn: form.titles["en"],
        descriptionEn: form.descriptions["en"] || "",
        highlightsEn: highlightsEn || undefined,
        seoEn: form.seoDescription["en"] || undefined,
        faqEn,
      });
      if (!data.success) throw new Error(data.error ?? "Translation failed");

      const r = data.results as {
        titleDesc?: Record<string, { title: string; description: string }>;
        highlights?: Record<string, string>;
        seo?: Record<string, string>;
        faq?: Record<string, Array<{ q: string; a: string }>>;
      };

      // Update form state for the target locale (all per-locale fields)
      setForm((f) => {
        const newTitles = { ...f.titles };
        const newDescs  = { ...f.descriptions };
        const newHL     = { ...f.highlights };
        const newFaq    = { ...f.faq };
        const newSeo    = { ...f.seoDescription };
        const td = r.titleDesc?.[targetLocale];
        if (td?.title)       newTitles[targetLocale] = td.title;
        if (td?.description) newDescs[targetLocale]  = td.description;
        if (r.highlights?.[targetLocale]) newHL[targetLocale] = String(r.highlights[targetLocale]).split(" • ").join("\n");
        if (r.faq?.[targetLocale]?.length) newFaq[targetLocale] = r.faq[targetLocale];
        if (r.seo?.[targetLocale]) newSeo[targetLocale] = r.seo[targetLocale];
        return { ...f, titles: newTitles, descriptions: newDescs, highlights: newHL, faq: newFaq, seoDescription: newSeo };
      });

      const fields = ["title & description",
        r.highlights?.[targetLocale] ? "highlights" : "",
        r.seo?.[targetLocale] ? "SEO" : "",
        r.faq?.[targetLocale] ? "FAQ" : "",
      ].filter(Boolean).join(", ");

      toast.success(`✅ Translated ${fields} to ${targetLocale.toUpperCase()} and saved to Notion!`);
    } catch (e) {
      if ((e as Error).message !== "Unauthorized")
        toast.error(e instanceof Error ? e.message : "Translation failed");
    } finally {
      setAiLoading((p) => ({ ...p, [key]: false }));
    }
  }

  // Small ✨ button component
  // locale: override which locale to generate in (default: activeLocale)
  function AiBtn({ fieldKey, label = "✨", locale }: { fieldKey: string; label?: string; locale?: string }) {
    const effectiveLocale = locale ?? (fieldKey.startsWith("translate-") ? fieldKey.replace("translate-", "") : activeLocale);
    const busy = !!aiLoading[fieldKey];
    const localeTag = effectiveLocale !== "en" ? ` [${effectiveLocale.toUpperCase()}]` : "";
    return (
      <button
        type="button"
        disabled={busy}
        onClick={() => fieldKey.startsWith("translate-")
          ? translateLocale(fieldKey.replace("translate-", ""))
          : generateField(fieldKey, effectiveLocale)}
        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 disabled:opacity-50 transition-colors shrink-0"
        title={busy ? "Generating…" : `${label}${localeTag}`}
      >
        {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
        {busy ? "…" : `${label}${localeTag}`}
      </button>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const tagList = form.tags
    ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigateSafely("/admin/properties")}
          className="p-2 text-gray-500 hover:text-[#131F3C] hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#131F3C]">
            {isNew ? "Add Property" : "Edit Property"}
          </h1>
          {!isNew && (
            <p className="text-sm text-gray-400 mt-0.5">ID: {propertyId}</p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ── Locale tabs ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <SectionTitle>Title &amp; Description</SectionTitle>

          {/* Locale tabs + per-locale translate button */}
          <div className="flex flex-wrap items-center gap-1 border-b border-gray-100 pb-3">
            <div className="flex flex-wrap gap-1 flex-1">
            {LOCALES.map((loc) => (
              <button
                key={loc.code}
                type="button"
                onClick={() => setActiveLocale(loc.code)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeLocale === loc.code
                    ? "bg-[#131F3C] text-white"
                    : "text-gray-500 hover:bg-gray-100"
                } ${form.titles[loc.code] ? "ring-1 ring-emerald-400/60" : ""}`}
              >
                {loc.label}
                {form.titles[loc.code] && (
                  <span className="ml-1 w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                )}
              </button>
            ))}
            </div>

            {/* Translate all fields for the active locale (hidden on EN) */}
            {activeLocale !== "en" && (() => {
              const key = `translate-all-fields-${activeLocale}`;
              const busy = !!aiLoading[key];
              return (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => translateAllFields(activeLocale)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50 transition-colors shrink-0"
                  title={`Translate title, description, highlights, SEO, FAQ to ${activeLocale.toUpperCase()} in one click`}
                >
                  {busy
                    ? <><Loader2 className="w-3 h-3 animate-spin" /> Translating…</>
                    : <><span>🌐</span> Translate all fields [{activeLocale.toUpperCase()}]</>}
                </button>
              );
            })()}
          </div>

          <Field label={`Title (${activeLocale.toUpperCase()})`} required={activeLocale === "en"}>
            <div className="flex gap-2 items-start">
              <input
                type="text"
                value={form.titles[activeLocale] ?? ""}
                onChange={(e) => setLocaleField("titles", e.target.value)}
                className={INPUT_CLS}
                placeholder={`Property title in ${activeLocale}`}
              />
              {activeLocale === "en"
                ? <AiBtn fieldKey="title_en" label="Generate" />
                : <AiBtn fieldKey={`translate-${activeLocale}`} label="Translate" />}
            </div>
          </Field>

          <Field label={`Description (${activeLocale.toUpperCase()})`}>
            <div className="flex gap-2 items-start">
              <textarea
                rows={4}
                value={form.descriptions[activeLocale] ?? ""}
                onChange={(e) => setLocaleField("descriptions", e.target.value)}
                className={TEXTAREA_CLS}
                placeholder={`Property description in ${activeLocale}`}
              />
              {activeLocale === "en"
                ? <AiBtn fieldKey="description_en" label="Generate" />
                : <AiBtn fieldKey={`translate-${activeLocale}`} label="Translate" />}
            </div>
          </Field>

          {activeLocale !== "en" && (
            <div className="flex justify-end">
              <AiBtn fieldKey={`translate-${activeLocale}`} label={`Translate both from EN`} />
            </div>
          )}
        </div>

        {/* ── Location ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <SectionTitle>Location</SectionTitle>

          <Field label="Address">
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              className={INPUT_CLS}
              placeholder="Full street address"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="City" required>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className={INPUT_CLS}
                placeholder="e.g. Bangkok"
              />
            </Field>
            <Field label="District">
              <input
                type="text"
                value={form.district}
                onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                className={INPUT_CLS}
                placeholder="e.g. Sukhumvit"
              />
            </Field>
          </div>

          {/* Map location picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Map Location <span className="text-gray-400 text-xs font-normal">(click map to pin)</span>
            </label>
            <LocationPicker
              lat={form.lat}
              lng={form.lng}
              onLatChange={(v) => setForm((f) => ({ ...f, lat: v }))}
              onLngChange={(v) => setForm((f) => ({ ...f, lng: v }))}
            />
          </div>
        </div>

        {/* ── Availability & Rental Terms ───────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <SectionTitle>Availability &amp; Rental Terms</SectionTitle>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Available From">
              <input
                type="date"
                value={form.availableFrom}
                onChange={(e) => setForm((f) => ({ ...f, availableFrom: e.target.value }))}
                className={INPUT_CLS}
              />
            </Field>
            <Field label="Min Lease Term (months)">
              <input
                type="number"
                min={0}
                value={form.minLeaseTerm}
                onChange={(e) => setForm((f) => ({ ...f, minLeaseTerm: e.target.value }))}
                className={INPUT_CLS}
                placeholder="12"
              />
            </Field>
            <Field label="Deposit (months of rent)">
              <input
                type="number"
                min={0}
                value={form.depositMonths}
                onChange={(e) => setForm((f) => ({ ...f, depositMonths: e.target.value }))}
                className={INPUT_CLS}
                placeholder="2"
              />
            </Field>
          </div>
        </div>

        {/* ── Details ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <SectionTitle>Property Details</SectionTitle>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label="Price (THB/mo)" required>
              <input
                type="number"
                min={0}
                value={form.priceTHB}
                onChange={(e) => setForm((f) => ({ ...f, priceTHB: e.target.value }))}
                className={INPUT_CLS}
                placeholder="25000"
              />
            </Field>
            <Field label="Bedrooms">
              <input
                type="number"
                min={0}
                value={form.bedrooms}
                onChange={(e) => setForm((f) => ({ ...f, bedrooms: e.target.value }))}
                className={INPUT_CLS}
                placeholder="2"
              />
            </Field>
            <Field label="Bathrooms">
              <input
                type="number"
                min={0}
                value={form.bathrooms}
                onChange={(e) => setForm((f) => ({ ...f, bathrooms: e.target.value }))}
                className={INPUT_CLS}
                placeholder="1"
              />
            </Field>
            <Field label="Size (sqm)">
              <input
                type="number"
                min={0}
                step="any"
                value={form.sizeSqm}
                onChange={(e) => setForm((f) => ({ ...f, sizeSqm: e.target.value }))}
                className={INPUT_CLS}
                placeholder="65"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className={INPUT_CLS}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Virtual Tour URL">
              <input
                type="url"
                value={form.virtualTourUrl}
                onChange={(e) => setForm((f) => ({ ...f, virtualTourUrl: e.target.value }))}
                className={INPUT_CLS}
                placeholder="https://my.matterport.com/..."
              />
            </Field>
          </div>

          {/* Verified toggle */}
          <div className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 bg-gray-50/50">
            <div>
              <p className="text-sm font-medium text-[#131F3C]">Verified property</p>
              <p className="text-xs text-gray-400">
                Display a verified badge to tenants on the listing page
              </p>
            </div>
            <Switch
              checked={form.verified}
              onCheckedChange={(v) => setForm((f) => ({ ...f, verified: v }))}
            />
          </div>
        </div>

        {/* ── Additional Details ────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <SectionTitle>Additional Details</SectionTitle>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Floors">
              <input
                type="number"
                min={0}
                value={form.floors}
                onChange={(e) => setForm((f) => ({ ...f, floors: e.target.value }))}
                className={INPUT_CLS}
                placeholder="1"
              />
            </Field>
            <Field label="Parking Spots">
              <input
                type="number"
                min={0}
                value={form.parkingSpots}
                onChange={(e) => setForm((f) => ({ ...f, parkingSpots: e.target.value }))}
                className={INPUT_CLS}
                placeholder="0"
              />
            </Field>
          </div>

          {/* Has Virtual Tour toggle */}
          <div className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 bg-gray-50/50">
            <div>
              <p className="text-sm font-medium text-[#131F3C]">Has Virtual Tour</p>
              <p className="text-xs text-gray-400">
                Mark this property as having a virtual tour available
              </p>
            </div>
            <Switch
              checked={form.hasVirtualTour}
              onCheckedChange={(v) => setForm((f) => ({ ...f, hasVirtualTour: v }))}
            />
          </div>
        </div>

        {/* ── Amenities ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <SectionTitle>Amenities</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {AMENITIES.map((a) => (
              <label
                key={a}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-all text-sm ${
                  form.amenities.includes(a)
                    ? "border-[#131F3C] bg-[#131F3C]/5 text-[#131F3C] font-medium"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={form.amenities.includes(a)}
                  onChange={() => toggleAmenity(a)}
                />
                <span
                  className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                    form.amenities.includes(a)
                      ? "bg-[#131F3C] text-white"
                      : "border border-gray-300"
                  }`}
                >
                  {form.amenities.includes(a) && (
                    <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 fill-current">
                      <path d="M1 4l3 3L9 1" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                {AMENITY_LABELS[a] ?? a}
              </label>
            ))}
          </div>
        </div>

        {/* ── Contact ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <SectionTitle>Contact</SectionTitle>

          <div className="grid grid-cols-2 gap-4">
            <Field label="LINE ID">
              <input
                type="text"
                value={form.contactLine}
                onChange={(e) => setForm((f) => ({ ...f, contactLine: e.target.value }))}
                className={INPUT_CLS}
                placeholder="@lineid"
              />
            </Field>
            <Field label="Phone / WhatsApp">
              <input
                type="text"
                value={form.contactPhone}
                onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
                className={INPUT_CLS}
                placeholder="0812345678"
              />
            </Field>
          </div>
        </div>

        {/* ── Highlights ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <SectionTitle>Highlights <span className="text-[#1E6B69] font-bold text-xs ml-1">[{activeLocale.toUpperCase()}]</span></SectionTitle>
            </div>
            <AiBtn fieldKey="highlights" label="Generate" />
          </div>
          <p className="text-xs text-gray-400">
            One highlight per line. Content is per-language — switch locale tab to edit each language.
          </p>
          <Field label={`Highlights (${activeLocale.toUpperCase()})`}>
            <textarea
              rows={5}
              value={form.highlights[activeLocale] ?? ""}
              onChange={(e) => dirtySetForm((f) => ({ ...f, highlights: { ...f.highlights, [activeLocale]: e.target.value } }))}
              className={TEXTAREA_CLS}
              placeholder={"Great location\nFurnished\nPet friendly"}
            />
          </Field>
        </div>

        {/* ── Perfect For ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <SectionTitle>Perfect For</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PERFECT_FOR_OPTIONS.map((opt) => (
              <label
                key={opt}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-all text-sm ${
                  form.perfectFor.includes(opt)
                    ? "border-[#131F3C] bg-[#131F3C]/5 text-[#131F3C] font-medium"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={form.perfectFor.includes(opt)}
                  onChange={() => togglePerfectFor(opt)}
                />
                <span
                  className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                    form.perfectFor.includes(opt)
                      ? "bg-[#131F3C] text-white"
                      : "border border-gray-300"
                  }`}
                >
                  {form.perfectFor.includes(opt) && (
                    <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 fill-current">
                      <path d="M1 4l3 3L9 1" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                {labelify(opt)}
              </label>
            ))}
          </div>
        </div>

        {/* ── Tags ─────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <SectionTitle>Tags</SectionTitle>
          <p className="text-xs text-gray-400">
            Type a tag and press Enter to add. Click a tag to remove it.
          </p>

          {/* Chips */}
          {tagList.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tagList.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#131F3C]/8 text-[#131F3C] text-xs font-medium hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  {tag}
                  <span className="text-current opacity-60">&times;</span>
                </button>
              ))}
            </div>
          )}

          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={addTag}
            className={INPUT_CLS}
            placeholder="Type a tag and press Enter…"
          />
        </div>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <SectionTitle>FAQ <span className="text-[#1E6B69] font-bold text-xs ml-1">[{activeLocale.toUpperCase()}]</span></SectionTitle>
            <div className="flex gap-2">
              <AiBtn fieldKey="faq" label="Generate FAQs" />
              <button
                type="button"
                onClick={addFaqItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#131F3C] text-white text-xs font-medium hover:bg-[#1f2d52] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Q&amp;A
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400">Editing FAQ for <strong>{activeLocale.toUpperCase()}</strong> — switch locale tab to edit other languages.</p>

          {activeFaq().length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              No FAQ items for {activeLocale.toUpperCase()} yet. Click &ldquo;Generate FAQs&rdquo; or &ldquo;Add Q&amp;A&rdquo;.
            </p>
          )}

          <div className="space-y-4">
            {activeFaq().map((item, idx) => (
              <div key={idx} className="rounded-xl border border-gray-100 p-4 space-y-3 bg-gray-50/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Q&amp;A #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFaqItem(idx)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <Field label="Question">
                  <input
                    type="text"
                    value={item.q}
                    onChange={(e) => updateFaqItem(idx, "q", e.target.value)}
                    className={INPUT_CLS}
                    placeholder="e.g. Is the property pet-friendly?"
                  />
                </Field>
                <Field label="Answer">
                  <textarea
                    rows={3}
                    value={item.a}
                    onChange={(e) => updateFaqItem(idx, "a", e.target.value)}
                    className={TEXTAREA_CLS}
                    placeholder="e.g. Yes, small pets are welcome with a refundable deposit."
                  />
                </Field>
              </div>
            ))}
          </div>
        </div>

        {/* ── SEO ──────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <SectionTitle>SEO <span className="text-[#1E6B69] font-bold text-xs ml-1">[{activeLocale.toUpperCase()}]</span></SectionTitle>
            <AiBtn fieldKey="seo" label="Generate" />
          </div>
          <p className="text-xs text-gray-400">SEO description is per-language — switch locale tab to edit each language.</p>

          <Field label={`SEO Description (${activeLocale.toUpperCase()})`}>
            <textarea
              rows={4}
              maxLength={500}
              value={form.seoDescription[activeLocale] ?? ""}
              onChange={(e) => dirtySetForm((f) => ({ ...f, seoDescription: { ...f.seoDescription, [activeLocale]: e.target.value } }))}
              className={TEXTAREA_CLS}
              placeholder="Short description for search engines (max 500 characters)"
            />
            <p className="text-xs text-gray-400 text-right mt-1">
              {(form.seoDescription[activeLocale] ?? "").length} / 500
            </p>
          </Field>
        </div>

        {/* ── Persona Descriptions ─────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <SectionTitle>Persona Descriptions</SectionTitle>
              <p className="text-xs text-gray-400 mt-1">
                JSON object with keys: family, expat-couple, remote-worker, teacher, retiree
              </p>
            </div>
            <AiBtn fieldKey="personas" label="Generate" />
          </div>
          <Field label="Persona Descriptions (JSON)">
            <textarea
              rows={8}
              value={form.personaDescriptions}
              onChange={(e) => setForm((f) => ({ ...f, personaDescriptions: e.target.value }))}
              className={`${TEXTAREA_CLS} font-mono text-xs`}
              placeholder={'{\n  "family": "...",\n  "expat-couple": "...",\n  "remote-worker": "...",\n  "teacher": "..."\n}'}
            />
          </Field>
        </div>

        {/* ── Photos — managed separately ──────────────────────────────── */}
        {!isNew && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <SectionTitle>Photos</SectionTitle>
                <p className="text-xs text-gray-400 mt-1">
                  Manage cover image, gallery order, and category tabs (Exterior / Interior / Community)
                  in the dedicated Photo Manager.
                </p>
              </div>
              <Link
                href={`/admin/properties/${propertyId}/photos`}
                className="flex items-center gap-2 bg-[#1E6B69] hover:bg-[#18605E] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shrink-0 ml-4"
              >
                🖼 Manage Photos →
              </Link>
            </div>
          </div>
        )}

        {/* ── Submit ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <button
            type="button"
            onClick={() => navigateSafely("/admin/properties")}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#131F3C] text-white text-sm font-medium hover:bg-[#1f2d52] disabled:opacity-60 transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving..." : "Save Property"}
          </button>
        </div>
      </form>

      {/* ── Unsaved changes confirm dialog ──────────────────────────────── */}
      {leaveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setLeaveTarget(null)}
          />
          {/* Dialog */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <span className="text-amber-600 text-lg">⚠</span>
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Unsaved changes</h2>
                <p className="text-sm text-gray-500 mt-1">
                  You have unsaved changes. If you leave now, all edits will be lost.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setLeaveTarget(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Keep editing
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDirty(false);
                  router.push(leaveTarget);
                  setLeaveTarget(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Leave without saving
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
