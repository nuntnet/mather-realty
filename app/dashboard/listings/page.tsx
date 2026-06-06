"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Building2, Plus, ArrowLeft, Edit, Eye } from "lucide-react";

interface Listing {
  id: string;
  slug: string | null;
  titleEn: string | null;
  city: string | null;
  district: string | null;
  priceTHB: number | null;
  bedrooms: number | null;
  status: string | null;
}

const STATUS_BADGE: Record<string, { cls: string; label: string }> = {
  available:   { cls: "bg-emerald-100 text-emerald-700", label: "Available" },
  rented:      { cls: "bg-blue-100 text-blue-700",     label: "Rented" },
  coming_soon: { cls: "bg-purple-100 text-purple-700", label: "Coming Soon" },
  pending:     { cls: "bg-amber-100 text-amber-700",   label: "Pending" },
  archived:    { cls: "bg-gray-100 text-gray-500",     label: "Archived" },
};

export default function DashboardListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Try landlord API first (Turso hot-cache)
        const r = await fetch("/api/landlord/properties");
        const d = r.ok ? await r.json() : {};
        const fromTurso = d.listings ?? d.properties ?? [];

        if (fromTurso.length > 0) {
          setListings(fromTurso);
          return;
        }

        // Turso empty — try admin properties API (reads from Notion directly)
        const r2 = await fetch("/api/admin/properties");
        const d2 = r2.ok ? await r2.json() : {};
        const fromNotion = d2.items ?? d2.data ?? [];
        setListings(fromNotion);
      } catch {
        // silently show empty state
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8faf8] pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard"
            className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 text-gray-400 hover:text-gray-700 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-[#EEF9F9] flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#1E6B69]" />
              </span>
              My Listings
            </h1>
            <p className="text-sm text-gray-500 mt-0.5 ml-12">Manage your rental properties on DoubleN Realty</p>
          </div>
          <Link href="/submit"
            className="flex items-center gap-2 bg-[#1E6B69] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#18605E] transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add Listing
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-7 h-7 border-2 border-[#1E6B69] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#EEF9F9] flex items-center justify-center mx-auto mb-5">
              <Building2 className="w-8 h-8 text-[#1E6B69]" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No listings yet</h2>
            <p className="text-sm text-gray-500 mb-8 max-w-xs mx-auto">
              Submit your first property and we'll review it within 24 hours.
            </p>
            <Link href="/submit"
              className="inline-flex items-center gap-2 bg-[#1E6B69] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#18605E] transition-colors">
              <Plus className="w-4 h-4" /> List a Property
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map(l => {
              const badge = STATUS_BADGE[l.status ?? ''] ?? STATUS_BADGE.pending;
              return (
                <div key={l.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#EEF9F9] flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6 text-[#1E6B69]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{l.titleEn ?? 'Untitled'}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {[l.district, l.city].filter(Boolean).join(', ')}
                      {l.priceTHB ? ` · ฿${l.priceTHB.toLocaleString()}/mo` : ''}
                      {l.bedrooms ? ` · ${l.bedrooms} bed` : ''}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 ${badge.cls}`}>
                    {badge.label}
                  </span>
                  {l.slug && (
                    <Link href={`/properties/${l.slug}`} target="_blank"
                      className="p-2 rounded-lg text-gray-400 hover:text-[#1E6B69] hover:bg-[#EEF9F9] transition-colors shrink-0">
                      <Eye className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
