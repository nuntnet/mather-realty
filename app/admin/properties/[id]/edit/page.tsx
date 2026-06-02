"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, Loader2, Save } from "lucide-react";
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

// ── Types ──────────────────────────────────────────────────────────────────────

type LocaleText = Record<string, string>;

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
  gallery: string[];
  virtualTourUrl: string;
  verified: boolean;
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
    gallery: [],
    virtualTourUrl: "",
    verified: false,
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

  // Load existing property
  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    fetch(`/api/admin/properties/${propertyId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) { toast.error("Property not found"); router.push("/admin/properties"); return; }
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
          gallery: data.gallery ?? [],
          virtualTourUrl: data.virtualTourUrl ?? "",
          verified: !!data.verifiedAt,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titles["en"]?.trim()) {
      toast.error("English title is required");
      return;
    }
    setSaving(true);
    try {
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
        gallery: form.gallery,
        virtualTourUrl: form.virtualTourUrl || null,
        verified: form.verified,
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

        {/* ── Gallery ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <SectionTitle>Gallery</SectionTitle>
          <ImageUploader
            value={form.gallery}
            onChange={(urls) => setForm((f) => ({ ...f, gallery: urls }))}
            multiple
            label="Property photos (first image = cover)"
          />
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
