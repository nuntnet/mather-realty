"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// ── Types ──────────────────────────────────────────────────────────────────────

type Inquiry = {
  id: number;
  propertyId: string | null;
  propertyTitle: string | null;
  name: string;
  contact: string;
  contactType: "line" | "wechat" | "whatsapp" | "email" | "phone" | null;
  preferredDate: string | null;
  message: string | null;
  status: "new" | "contacted" | "booked" | "declined";
  createdAt: string | null;
};

type StatusFilter = "all" | "new" | "contacted" | "booked" | "declined";

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all",       label: "All"       },
  { value: "new",       label: "New"       },
  { value: "contacted", label: "Contacted" },
  { value: "booked",    label: "Booked"    },
  { value: "declined",  label: "Declined"  },
];

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  new:        { label: "New",       cls: "bg-blue-100 text-blue-700"       },
  contacted:  { label: "Contacted", cls: "bg-amber-100 text-amber-700"     },
  booked:     { label: "Booked",    cls: "bg-emerald-100 text-emerald-700" },
  declined:   { label: "Declined",  cls: "bg-red-100 text-red-600"         },
};

const CONTACT_TYPE_ICON: Record<string, string> = {
  line:      "LINE",
  wechat:    "WeChat",
  whatsapp:  "WhatsApp",
  email:     "Email",
  phone:     "Phone",
};

const PAGE_SIZE = 25;

const STATUS_OPTIONS: Array<{ value: Inquiry["status"]; label: string }> = [
  { value: "new",       label: "New"       },
  { value: "contacted", label: "Contacted" },
  { value: "booked",    label: "Booked"    },
  { value: "declined",  label: "Declined"  },
];

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AdminInquiriesPage() {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<Inquiry["status"]>("contacted");
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchInquiries = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/inquiries")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setItems(Array.isArray(data) ? data : data?.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);

  const filtered = items.filter((i) =>
    statusFilter === "all" ? true : i.status === statusFilter
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const updateStatus = async (id: number, status: Inquiry["status"]) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error();
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status } : i))
      );
      if (selected?.id === id) setSelected((s) => s ? { ...s, status } : s);
      toast.success("Status updated.");
    } catch {
      toast.error("Update failed.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedRows.size === 0) return;
    setBulkLoading(true);
    try {
      await Promise.all(
        Array.from(selectedRows).map((id) =>
          fetch("/api/admin/inquiries", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status: bulkStatus }),
          })
        )
      );
      setItems((prev) =>
        prev.map((i) =>
          selectedRows.has(i.id) ? { ...i, status: bulkStatus } : i
        )
      );
      toast.success(`Updated ${selectedRows.size} inquiries to "${bulkStatus}".`);
      setSelectedRows(new Set());
    } catch {
      toast.error("Bulk update failed.");
    } finally {
      setBulkLoading(false);
    }
  };

  const toggleRow = (id: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedRows.size === paginated.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginated.map((i) => i.id)));
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#131F3C]">Inquiries</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage rental inquiries from prospective tenants
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-gray-100/60 rounded-xl p-1 w-fit">
        {STATUS_TABS.map((tab) => {
          const count = tab.value === "all"
            ? items.length
            : items.filter((i) => i.status === tab.value).length;
          return (
            <button
              key={tab.value}
              onClick={() => { setStatusFilter(tab.value); setPage(1); setSelectedRows(new Set()); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === tab.value
                  ? "bg-white text-[#131F3C] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 rounded-full ${
                  statusFilter === tab.value ? "bg-gray-100 text-gray-600" : "bg-gray-200 text-gray-500"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bulk actions */}
      {selectedRows.size > 0 && (
        <div className="flex items-center gap-3 bg-[#131F3C]/5 border border-[#131F3C]/10 rounded-xl px-4 py-3">
          <span className="text-sm font-medium text-[#131F3C]">
            {selectedRows.size} selected
          </span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value as Inquiry["status"])}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            onClick={handleBulkUpdate}
            disabled={bulkLoading}
            className="px-4 py-1.5 bg-[#131F3C] text-white text-sm font-medium rounded-lg hover:bg-[#1f2d52] disabled:opacity-60 transition-colors"
          >
            {bulkLoading ? "Updating..." : "Apply"}
          </button>
          <button
            onClick={() => setSelectedRows(new Set())}
            className="text-sm text-gray-500 hover:text-gray-700 ml-auto"
          >
            Deselect all
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-6 h-6 border-2 border-[#131F3C] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-gray-400">
            <Mail className="w-10 h-10" />
            <p className="text-sm">No inquiries</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === paginated.length && paginated.length > 0}
                      onChange={toggleAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wider">
                    Inquirer
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wider">
                    Via
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wider">
                    Preferred Date
                  </th>
                  <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wider">
                    Received
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wider">
                    Update
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map((inq) => {
                  const badge = STATUS_BADGE[inq.status] ?? { label: inq.status, cls: "bg-gray-100 text-gray-500" };
                  return (
                    <tr
                      key={inq.id}
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => setSelected(inq)}
                    >
                      <td
                        className="px-4 py-3.5"
                        onClick={(e) => { e.stopPropagation(); toggleRow(inq.id); }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedRows.has(inq.id)}
                          onChange={() => {}}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-medium text-[#131F3C] line-clamp-1">
                          {inq.propertyTitle ?? (
                            <span className="text-gray-400 italic">ID: {inq.propertyId ?? "—"}</span>
                          )}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-medium text-gray-800">{inq.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[120px]">{inq.contact}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                          {inq.contactType ? CONTACT_TYPE_ICON[inq.contactType] ?? inq.contactType : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-500">
                        {inq.preferredDate
                          ? new Date(inq.preferredDate).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                        {inq.createdAt
                          ? new Date(inq.createdAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "2-digit",
                            })
                          : "—"}
                      </td>
                      <td
                        className="px-4 py-3.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={inq.status}
                          disabled={updatingId === inq.id}
                          onChange={(e) =>
                            updateStatus(inq.id, e.target.value as Inquiry["status"])
                          }
                          className="border border-gray-200 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#131F3C]/20 disabled:opacity-50"
                        >
                          {STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
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

      {/* Detail drawer */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Inquiry #{selected?.id}</SheetTitle>
          </SheetHeader>

          {selected && (
            <div className="mt-6 space-y-5">
              {/* Property */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Property
                </p>
                <p className="text-sm font-medium text-[#131F3C]">
                  {selected.propertyTitle ?? selected.propertyId ?? "Unknown"}
                </p>
              </div>

              {/* Inquirer */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Name
                  </p>
                  <p className="text-sm text-gray-700">{selected.name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Contact via
                  </p>
                  <p className="text-sm text-gray-700 capitalize">
                    {selected.contactType
                      ? CONTACT_TYPE_ICON[selected.contactType] ?? selected.contactType
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Contact detail
                </p>
                <p className="text-sm font-medium text-[#131F3C]">{selected.contact}</p>
              </div>

              {/* Preferred date */}
              {selected.preferredDate && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Preferred viewing date
                  </p>
                  <p className="text-sm text-gray-700">
                    {new Date(selected.preferredDate).toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}

              {/* Message */}
              {selected.message && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Message
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-xl p-3">
                    {selected.message}
                  </p>
                </div>
              )}

              {/* Received */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Received at
                </p>
                <p className="text-sm text-gray-500">
                  {selected.createdAt
                    ? new Date(selected.createdAt).toLocaleString("en-GB")
                    : "—"}
                </p>
              </div>

              {/* Status update */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Update status
                </p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      disabled={updatingId === selected.id}
                      onClick={() => updateStatus(selected.id, o.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        selected.status === o.value
                          ? "bg-[#131F3C] text-white border-[#131F3C]"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                      } disabled:opacity-50`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
