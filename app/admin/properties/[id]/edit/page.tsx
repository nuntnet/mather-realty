"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, Loader2, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import ImageUploader from "@/components/admin/ImageUploader";
import { Switch } from "@/components/ui/switch";

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

const AMENITIES = [
  "wifi",
  "air_conditioning",
  "parking",
  "swimming_pool",
  "gym",
  "laundry",
  "kitchen",
  "balcony",
  "elevator",
  "security_24h",
  "pet_friendly",
  "furnished",
  "private_garden",
  "rooftop_access",
  "concierge",
];

const AMENITY_LABELS: Record<string, string> = {
  wifi: "WiFi",
  air_conditioning: "Air Conditioning",
  parking: "Parking",
  swimming_pool: "Swimming Pool",
  gym: "Gym",
  laundry: "Laundry",
  kitchen: "Kitchen",
  balcony: "Balcony",
  elevator: "Elevator",
  security_24h: "24h Security",
  pet_friendly: "Pet Friendly",
  furnished: "Furnished",
  private_garden: "Private Garden",
  rooftop_access: "Rooftop Access",
  concierge: "Concierge",
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
  coverImage: string;
  gallery: string[];
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
  highlights: string;       // newline-separated in UI, joined with " • " for Notion
  perfectFor: string[];
  tags: string;             // comma-separated in UI
  faq: FaqItem[];
  seoDescription: string;
  exteriorPhotos: string[];
  interiorPhotos: string[];
  communityPhotos: string[];
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
    coverImage: "",
    gallery: [],
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
    highlights: "",
    perfectFor: [],
    tags: "",
    faq: [],
    seoDescription: "",
    exteriorPhotos: [],
    interiorPhotos: [],
    communityPhotos: [],
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

  // Load existing property
  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    fetch(`/api/admin/properties/${propertyId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) { toast.error("Property not found"); router.push("/admin/properties"); return; }

        // Parse highlights: may be a string joined with " • ", or an array
        let highlightsStr = "";
        if (Array.isArray(data.highlights)) {
          highlightsStr = data.highlights.join("\n");
        } else if (typeof data.highlights === "string" && data.highlights) {
          highlightsStr = data.highlights.split(" • ").join("\n");
        }

        // Parse faq: stored as JSON string or array — always result in FaqItem[]
        let faqArr: FaqItem[] = [];
        const tryParseFaq = (v: unknown): FaqItem[] => {
          if (Array.isArray(v)) return v as FaqItem[];
          if (typeof v === "string" && v) {
            try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; }
          }
          return [];
        };
        faqArr = tryParseFaq(data.faqJson) || tryParseFaq(data.faq);

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
          coverImage: data.coverImage ?? "",
          gallery: data.gallery ?? [],
          virtualTourUrl: data.virtualTourUrl ?? "",
          verified: !!data.verifiedAt,
          // New fields
          availableFrom: data.availableFrom ?? "",
          minLeaseTerm: data.minLeaseTerm != null ? String(data.minLeaseTerm) : "",
          depositMonths: data.depositMonths != null ? String(data.depositMonths) : "",
          floors: data.floors != null ? String(data.floors) : "",
          parkingSpots: data.parkingSpots != null ? String(data.parkingSpots) : "",
          hasVirtualTour: !!data.hasVirtualTour,
          contactLine: data.contactLine ?? "",
          contactPhone: data.contactPhone ?? "",
          highlights: highlightsStr,
          perfectFor: data.perfectFor ?? [],
          tags: Array.isArray(data.tags) ? data.tags.join(", ") : (data.tags ?? ""),
          faq: faqArr,
          seoDescription: data.seoDescription ?? "",
          exteriorPhotos: Array.isArray(data.exteriorPhotos)
            ? data.exteriorPhotos
            : (typeof data.exteriorPhotos === "string"
                ? data.exteriorPhotos.split(",").map((u: string) => u.trim()).filter(Boolean)
                : []),
          interiorPhotos: Array.isArray(data.interiorPhotos)
            ? data.interiorPhotos
            : (typeof data.interiorPhotos === "string"
                ? data.interiorPhotos.split(",").map((u: string) => u.trim()).filter(Boolean)
                : []),
          communityPhotos: Array.isArray(data.communityPhotos)
            ? data.communityPhotos
            : (typeof data.communityPhotos === "string"
                ? data.communityPhotos.split(",").map((u: string) => u.trim()).filter(Boolean)
                : []),
        });
      })
      .finally(() => setLoading(false));
  }, [isNew, propertyId, router]);

  const setLocaleField = (field: "titles" | "descriptions", value: string) => {
    setForm((f) => ({ ...f, [field]: { ...f[field], [activeLocale]: value } }));
  };

  const toggleAmenity = (a: string) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter((x) => x !== a)
        : [...f.amenities, a],
    }));
  };

  const togglePerfectFor = (opt: string) => {
    setForm((f) => ({
      ...f,
      perfectFor: f.perfectFor.includes(opt)
        ? f.perfectFor.filter((x) => x !== opt)
        : [...f.perfectFor, opt],
    }));
  };

  const addFaqItem = () => {
    setForm((f) => ({ ...f, faq: [...f.faq, { q: "", a: "" }] }));
  };

  const removeFaqItem = (idx: number) => {
    setForm((f) => ({ ...f, faq: f.faq.filter((_, i) => i !== idx) }));
  };

  const updateFaqItem = (idx: number, field: "q" | "a", value: string) => {
    setForm((f) => ({
      ...f,
      faq: f.faq.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
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
      setForm((f) => ({
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
    setForm((f) => ({
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
      // Parse highlights: each non-empty line becomes a bullet
      const highlightsArray = form.highlights
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

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
        coverImage: form.coverImage || null,
        gallery: form.gallery,
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
        highlights: highlightsArray,
        perfectFor: form.perfectFor,
        tags: tagsArray,
        faqJson: form.faq.length > 0 ? JSON.stringify(form.faq) : "",
        seoDescription: form.seoDescription || "",
        // Join arrays → comma-separated strings for Notion rich_text
        exteriorPhotos: form.exteriorPhotos.join(","),
        interiorPhotos: form.interiorPhotos.join(","),
        communityPhotos: form.communityPhotos.join(","),
      };

      const url = isNew ? "/api/admin/properties" : `/api/admin/properties/${propertyId}`;
      const method = isNew ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(String(res.status));
      toast.success(isNew ? "Property created." : "Property saved.");
      router.push("/admin/properties");
    } catch {
      toast.error("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

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
        <Link
          href="/admin/properties"
          className="p-2 text-gray-500 hover:text-[#131F3C] hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
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

          {/* Locale tabs */}
          <div className="flex flex-wrap gap-1 border-b border-gray-100 pb-3">
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

          <Field label={`Title (${activeLocale.toUpperCase()})`} required={activeLocale === "en"}>
            <input
              type="text"
              value={form.titles[activeLocale] ?? ""}
              onChange={(e) => setLocaleField("titles", e.target.value)}
              className={INPUT_CLS}
              placeholder={`Property title in ${activeLocale}`}
            />
          </Field>

          <Field label={`Description (${activeLocale.toUpperCase()})`}>
            <textarea
              rows={4}
              value={form.descriptions[activeLocale] ?? ""}
              onChange={(e) => setLocaleField("descriptions", e.target.value)}
              className={TEXTAREA_CLS}
              placeholder={`Property description in ${activeLocale}`}
            />
          </Field>
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

          <div className="grid grid-cols-2 gap-4">
            <Field label="Latitude">
              <input
                type="number"
                step="any"
                value={form.lat}
                onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
                className={INPUT_CLS}
                placeholder="13.756331"
              />
            </Field>
            <Field label="Longitude">
              <input
                type="number"
                step="any"
                value={form.lng}
                onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
                className={INPUT_CLS}
                placeholder="100.501765"
              />
            </Field>
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
          <SectionTitle>Highlights</SectionTitle>
          <p className="text-xs text-gray-400">
            One highlight per line. These are displayed as bullet points on the property page.
          </p>
          <Field label="Highlights">
            <textarea
              rows={5}
              value={form.highlights}
              onChange={(e) => setForm((f) => ({ ...f, highlights: e.target.value }))}
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
            <SectionTitle>FAQ</SectionTitle>
            <button
              type="button"
              onClick={addFaqItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#131F3C] text-white text-xs font-medium hover:bg-[#1f2d52] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Q&amp;A
            </button>
          </div>

          {form.faq.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              No FAQ items yet. Click &ldquo;Add Q&amp;A&rdquo; to add one.
            </p>
          )}

          <div className="space-y-4">
            {form.faq.map((item, idx) => (
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

          {form.faq.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-500">JSON Preview (read-only)</p>
              <textarea
                rows={4}
                readOnly
                value={JSON.stringify(form.faq, null, 2)}
                className={`${TEXTAREA_CLS} font-mono text-xs text-gray-500 bg-gray-50`}
              />
            </div>
          )}
        </div>

        {/* ── SEO ──────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <SectionTitle>SEO</SectionTitle>

          <Field label="SEO Description">
            <textarea
              rows={4}
              maxLength={500}
              value={form.seoDescription}
              onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))}
              className={TEXTAREA_CLS}
              placeholder="Short description for search engines (max 500 characters)"
            />
            <p className="text-xs text-gray-400 text-right mt-1">
              {form.seoDescription.length} / 500
            </p>
          </Field>
        </div>

        {/* ── Cover Image ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <SectionTitle>Cover Image</SectionTitle>
          <p className="text-xs text-gray-400">
            Shown as the hero image on the property listing. Stored as the Notion page cover.
          </p>
          <ImageUploader
            value={form.coverImage ? [form.coverImage] : []}
            onChange={(urls) => setForm((f) => ({ ...f, coverImage: urls[0] ?? "" }))}
            multiple={false}
            label="Upload cover photo"
          />
        </div>

        {/* ── Gallery ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <SectionTitle>Gallery Photos</SectionTitle>
          <p className="text-xs text-gray-400">
            Additional photos shown in the gallery carousel on the property page.
          </p>
          <ImageUploader
            value={form.gallery}
            onChange={(urls) => setForm((f) => ({ ...f, gallery: urls }))}
            multiple
            label="Upload gallery photos"
          />
        </div>

        {/* ── Gallery Categories ────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
          <div>
            <SectionTitle>Gallery Categories</SectionTitle>
            <p className="text-xs text-gray-400 mt-1.5">
              Categorise photos so users can browse by Exterior / Interior / Community tabs on the property page.
              Photos added here also appear in the main swipeable hero carousel.
            </p>
          </div>

          <Field label="🏠 Exterior — façade, garden, entrance, parking">
            <ImageUploader
              value={form.exteriorPhotos}
              onChange={(urls) => setForm((f) => ({ ...f, exteriorPhotos: urls }))}
              multiple
              label="Upload exterior photos"
            />
          </Field>

          <Field label="🛋️ Interior — living room, bedroom, kitchen, bathroom">
            <ImageUploader
              value={form.interiorPhotos}
              onChange={(urls) => setForm((f) => ({ ...f, interiorPhotos: urls }))}
              multiple
              label="Upload interior photos"
            />
          </Field>

          <Field label="🏘️ Community — pool, gym, lobby, rooftop, neighbourhood">
            <ImageUploader
              value={form.communityPhotos}
              onChange={(urls) => setForm((f) => ({ ...f, communityPhotos: urls }))}
              multiple
              label="Upload community photos"
            />
          </Field>
        </div>

        {/* ── Submit ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Link
            href="/admin/properties"
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
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
    </div>
  );
}
