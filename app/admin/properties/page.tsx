"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Building2,
  CheckCircle2,
  Filter,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ── Types ──────────────────────────────────────────────────────────────────────

type Property = {
  id: string;
  slug: string | null;
  titleEn: string | null;
  city: string | null;
  district: string | null;
  priceTHB: number | null;
  bedrooms: number | null;
  status: string | null;
  verifiedAt: string | null;
  approvedAt: string | null;
  createdAt: string | null;
};

type StatusFilter = "all" | "pending" | "available" | "rented" | "coming_soon" | "archived";

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all",         label: "All statuses"  },
  { value: "pending",     label: "Pending"       },
  { value: "available",   label: "Available"     },
  { value: "rented",      label: "Rented"        },
  { value: "coming_soon", label: "Coming Soon"   },
  { value: "archived",    label: "Archived"      },
];

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  pending:     { label: "Pending",     cls: "bg-amber-100 text-amber-700"   },
  available:   { label: "Available",   cls: "bg-emerald-100 text-emerald-700" },
  rented:      { label: "Rented",      cls: "bg-blue-100 text-blue-700"    },
  coming_soon: { label: "Coming Soon", cls: "bg-purple-100 text-purple-700" },
  archived:    { label: "Archived",    cls: "bg-gray-100 text-gray-500"    },
};

const PAGE_SIZE = 20;

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AdminPropertiesPage() {
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [confirmAction, setConfirmAction] = useState<{
    type: "approve" | "reject" | "archive";
    property: Property;
  } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchProperties = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/properties")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setItems(Array.isArray(data) ? data : data?.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  // Client-side filter
  const filtered = items.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (p.titleEn ?? "").toLowerCase().includes(q) ||
      (p.city ?? "").toLowerCase().includes(q) ||
      (p.district ?? "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetPage = () => setPage(1);

  // ── Actions ──────────────────────────────────────────────────────────────────

  const patchProperty = async (id: string, patch: Record<string, unknown>) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/properties`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      if (!res.ok) throw new Error(String(res.status));
      return true;
    } catch {
      toast.error("Action failed, please try again.");
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const handleApprove = async (property: Property) => {
    const ok = await patchProperty(property.id, {
      status: "available",
      approvedAt: new Date().toISOString(),
      syncAlgolia: true,
    });
    if (ok) {
      toast.success(`"${property.titleEn ?? property.id}" approved and synced to Algolia.`);
      fetchProperties();
    }
    setConfirmAction(null);
  };

  const handleReject = async (property: Property) => {
    const ok = await patchProperty(property.id, { status: "archived" });
    if (ok) {
      toast.success(`"${property.titleEn ?? property.id}" rejected.`);
      fetchProperties();
    }
    setConfirmAction(null);
  };

  const handleArchive = async (property: Property) => {
    const ok = await patchProperty(property.id, { status: "archived" });
    if (ok) {
      toast.success(`"${property.titleEn ?? property.id}" archived.`);
      fetchProperties();
    }
    setConfirmAction(null);
  };

  const handleVerifyToggle = async (property: Property) => {
    const newVerified = property.verifiedAt ? null : new Date().toISOString();
    const ok = await patchProperty(property.id, { verifiedAt: newVerified });
    if (ok) {
      toast.success(newVerified ? "Property verified." : "Verification removed.");
      setItems((prev) =>
        prev.map((p) => (p.id === property.id ? { ...p, verifiedAt: newVerified } : p))
      );
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#131F3C]">Properties</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage all rental properties
          </p>
        </div>
        <Link
          href="/admin/properties/new"
          className="flex items-center gap-2 bg-[#131F3C] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#1a2a50] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Property
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or city..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage(); }}
            className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#131F3C]/20 w-64"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as StatusFilter); resetPage(); }}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#131F3C]/20"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {(search || statusFilter !== "all") && (
          <button
            onClick={() => { setSearch(""); setStatusFilter("all"); resetPage(); }}
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            <Filter className="w-3.5 h-3.5" /> Clear filters
          </button>
        )}
        <span className="ml-auto text-xs text-gray-400">
          {filtered.length} propert{filtered.length === 1 ? "y" : "ies"}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-6 h-6 border-2 border-[#131F3C] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-gray-400">
            <Building2 className="w-10 h-10" />
            <p className="text-sm">No properties found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase tracking-wider">
                    Title (EN)
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wider">
                    City
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wider">
                    Price / mo
                  </th>
                  <th className="text-center text-xs font-semibold text-gray-500 px-3 py-3 uppercase tracking-wider">
                    Beds
                  </th>
                  <th className="text-center text-xs font-semibold text-gray-500 px-3 py-3 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-center text-xs font-semibold text-gray-500 px-3 py-3 uppercase tracking-wider">
                    Verified
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wider">
                    Approved
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map((property) => {
                  const badge = STATUS_BADGE[property.status ?? ""] ?? {
                    label: property.status ?? "—",
                    cls: "bg-gray-100 text-gray-500",
                  };
                  const isBusy = busyId === property.id;
                  return (
                    <tr
                      key={property.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-[#131F3C] line-clamp-1">
                          {property.titleEn ?? <span className="text-gray-400 italic">Untitled</span>}
                        </p>
                        {property.district && (
                          <p className="text-xs text-gray-400 mt-0.5">{property.district}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-600">
                        {property.city ?? "—"}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-right text-gray-700 font-medium">
                        {property.priceTHB
                          ? `฿${property.priceTHB.toLocaleString()}`
                          : "—"}
                      </td>
                      <td className="px-3 py-3.5 text-center text-sm text-gray-600">
                        {property.bedrooms ?? "—"}
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <button
                          onClick={() => !isBusy && handleVerifyToggle(property)}
                          disabled={isBusy}
                          title={property.verifiedAt ? "Remove verification" : "Mark as verified"}
                          className="inline-flex items-center justify-center disabled:opacity-50"
                        >
                          <ShieldCheck
                            className={`w-4 h-4 ${
                              property.verifiedAt ? "text-emerald-500" : "text-gray-300"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-500">
                        {property.approvedAt
                          ? new Date(property.approvedAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "2-digit",
                            })
                          : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          {property.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  setConfirmAction({ type: "approve", property })
                                }
                                disabled={isBusy}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Approve"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  setConfirmAction({ type: "reject", property })
                                }
                                disabled={isBusy}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {/* 🤖 generate-personas button removed — AI content generation
                              is now built directly into the edit page (✨ buttons per field) */}
                          <Link
                            href={`/admin/properties/${property.id}/photos`}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Manage Photos"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </Link>
                          <Link
                            href={`/admin/properties/${property.id}/edit`}
                            className="p-1.5 text-gray-500 hover:text-[#131F3C] hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          {property.status !== "pending" && property.status !== "archived" && (
                            <button
                              onClick={() =>
                                setConfirmAction({ type: "archive", property })
                              }
                              disabled={isBusy}
                              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                              title="Archive"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-5 pb-4">
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Confirm dialogs */}
      <AlertDialog
        open={!!confirmAction}
        onOpenChange={(o) => !o && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === "approve"
                ? "Approve property?"
                : confirmAction?.type === "reject"
                ? "Reject property?"
                : "Archive property?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === "approve"
                ? `"${confirmAction.property.titleEn ?? "This property"}" will be marked as available and synced to Algolia search.`
                : confirmAction?.type === "reject"
                ? `"${confirmAction?.property.titleEn ?? "This property"}" will be archived. The submitter will not be notified automatically.`
                : `"${confirmAction?.property.titleEn ?? "This property"}" will be archived and removed from search.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!confirmAction) return;
                if (confirmAction.type === "approve") handleApprove(confirmAction.property);
                else if (confirmAction.type === "reject") handleReject(confirmAction.property);
                else handleArchive(confirmAction.property);
              }}
              className={
                confirmAction?.type === "approve"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {confirmAction?.type === "approve"
                ? "Approve"
                : confirmAction?.type === "reject"
                ? "Reject"
                : "Archive"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
