"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { ClipboardList, CheckCircle2, XCircle } from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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

type SubmissionData = {
  titleEn?: string;
  address?: string;
  city?: string;
  district?: string;
  priceTHB?: number;
  bedrooms?: number;
  bathrooms?: number;
  sizeSqm?: number;
  amenities?: string[];
  description?: string;
  [key: string]: unknown;
};

type Submission = {
  id: number;
  ownerEmail: string | null;
  ownerPhone: string | null;
  dataJson: string | null;
  imagesJson: string | null;
  status: "pending" | "approved" | "rejected";
  submittedAt: string | null;
  reviewedAt: string | null;
};

type StatusFilter = "all" | "pending" | "approved" | "rejected";

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all",      label: "All"      },
  { value: "pending",  label: "Pending"  },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  pending:  { label: "Pending",  cls: "bg-amber-100 text-amber-700"       },
  approved: { label: "Approved", cls: "bg-emerald-100 text-emerald-700"   },
  rejected: { label: "Rejected", cls: "bg-red-100 text-red-600"           },
};

const PAGE_SIZE = 20;

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseData(json: string | null): SubmissionData {
  if (!json) return {};
  try { return JSON.parse(json); } catch { return {}; }
}

function parseImages(json: string | null): string[] {
  if (!json) return [];
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v : [];
  } catch { return []; }
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AdminSubmissionsPage() {
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "approve" | "reject";
    submission: Submission;
  } | null>(null);
  const [actioning, setActioning] = useState(false);

  const fetchSubmissions = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/submissions")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setItems(Array.isArray(data) ? data : data?.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  const filtered = items.filter((s) =>
    statusFilter === "all" ? true : s.status === statusFilter
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleApprove = async (submission: Submission) => {
    setActioning(true);
    try {
      const res = await fetch("/api/admin/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: submission.id, action: "approve" }),
      });
      if (!res.ok) throw new Error();
      toast.success("Submission approved — Notion page created.");
      fetchSubmissions();
      if (selected?.id === submission.id) setSelected(null);
    } catch {
      toast.error("Approval failed. Please try again.");
    } finally {
      setActioning(false);
      setConfirmAction(null);
    }
  };

  const handleReject = async (submission: Submission) => {
    setActioning(true);
    try {
      const res = await fetch("/api/admin/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: submission.id, action: "reject" }),
      });
      if (!res.ok) throw new Error();
      toast.success("Submission rejected.");
      setItems((prev) =>
        prev.map((s) =>
          s.id === submission.id
            ? { ...s, status: "rejected", reviewedAt: new Date().toISOString() }
            : s
        )
      );
      if (selected?.id === submission.id)
        setSelected((s) => s ? { ...s, status: "rejected" } : s);
    } catch {
      toast.error("Rejection failed. Please try again.");
    } finally {
      setActioning(false);
      setConfirmAction(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#131F3C]">Submissions</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Review listing submissions from landlords
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-gray-100/60 rounded-xl p-1 w-fit">
        {STATUS_TABS.map((tab) => {
          const count = tab.value === "all"
            ? items.length
            : items.filter((s) => s.status === tab.value).length;
          return (
            <button
              key={tab.value}
              onClick={() => { setStatusFilter(tab.value); setPage(1); }}
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

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-6 h-6 border-2 border-[#131F3C] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-gray-400">
            <ClipboardList className="w-10 h-10" />
            <p className="text-sm">No submissions</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase tracking-wider">
                    Submitter
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wider">
                    Property Title
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map((sub) => {
                  const data = parseData(sub.dataJson);
                  const badge = STATUS_BADGE[sub.status] ?? { label: sub.status, cls: "bg-gray-100 text-gray-500" };
                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => setSelected(sub)}
                    >
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-[#131F3C]">
                          {sub.ownerEmail ?? "—"}
                        </p>
                        {sub.ownerPhone && (
                          <p className="text-xs text-gray-400 mt-0.5">{sub.ownerPhone}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm text-gray-700 line-clamp-1">
                          {data.titleEn ?? (
                            <span className="text-gray-400 italic">Untitled</span>
                          )}
                        </p>
                        {data.city && (
                          <p className="text-xs text-gray-400 mt-0.5">{data.city}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                        {sub.submittedAt
                          ? new Date(sub.submittedAt).toLocaleDateString("en-GB", {
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
                      <td
                        className="px-5 py-3.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelected(sub)}
                            className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
                          >
                            Review
                          </button>
                          {sub.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  setConfirmAction({ type: "approve", submission: sub })
                                }
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Approve"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  setConfirmAction({ type: "reject", submission: sub })
                                }
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
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

      {/* Review drawer */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Submission #{selected?.id}</SheetTitle>
          </SheetHeader>

          {selected && (() => {
            const data = parseData(selected.dataJson);
            const images = parseImages(selected.imagesJson);
            const badge = STATUS_BADGE[selected.status] ?? { label: selected.status, cls: "bg-gray-100 text-gray-500" };

            return (
              <div className="mt-6 space-y-6">
                {/* Status */}
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badge.cls}`}>
                    {badge.label}
                  </span>
                  <span className="text-xs text-gray-400">
                    Submitted {selected.submittedAt
                      ? new Date(selected.submittedAt).toLocaleString("en-GB")
                      : "—"}
                  </span>
                </div>

                {/* Owner */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Owner
                  </p>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-1.5">
                    {selected.ownerEmail && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Email: </span>
                        <a href={`mailto:${selected.ownerEmail}`} className="text-blue-600 hover:underline">
                          {selected.ownerEmail}
                        </a>
                      </p>
                    )}
                    {selected.ownerPhone && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Phone: </span>
                        {selected.ownerPhone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Property details */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Property Details
                  </p>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                    {data.titleEn && (
                      <p><span className="font-medium text-gray-600">Title: </span>{data.titleEn}</p>
                    )}
                    {data.address && (
                      <p><span className="font-medium text-gray-600">Address: </span>{data.address}</p>
                    )}
                    {(data.city || data.district) && (
                      <p>
                        <span className="font-medium text-gray-600">Location: </span>
                        {[data.district, data.city].filter(Boolean).join(", ")}
                      </p>
                    )}
                    {data.priceTHB != null && (
                      <p>
                        <span className="font-medium text-gray-600">Price: </span>
                        ฿{Number(data.priceTHB).toLocaleString()} / month
                      </p>
                    )}
                    <div className="flex flex-wrap gap-4">
                      {data.bedrooms != null && (
                        <p><span className="font-medium text-gray-600">Beds: </span>{data.bedrooms}</p>
                      )}
                      {data.bathrooms != null && (
                        <p><span className="font-medium text-gray-600">Baths: </span>{data.bathrooms}</p>
                      )}
                      {data.sizeSqm != null && (
                        <p><span className="font-medium text-gray-600">Size: </span>{data.sizeSqm} sqm</p>
                      )}
                    </div>
                    {data.description && (
                      <p className="text-gray-600 text-xs leading-relaxed whitespace-pre-wrap pt-1 border-t border-gray-100 mt-1">
                        {data.description}
                      </p>
                    )}
                    {Array.isArray(data.amenities) && data.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {data.amenities.map((a) => (
                          <span key={String(a)} className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded-full text-gray-600 capitalize">
                            {String(a).replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Images */}
                {images.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Images ({images.length})
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {images.map((url, i) => (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          key={i}
                          src={url}
                          alt={`Submission image ${i + 1}`}
                          className="w-full aspect-square object-cover rounded-lg border border-gray-100"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {selected.status === "pending" && (
                  <div className="flex gap-3 pt-2 border-t border-gray-100">
                    <button
                      onClick={() =>
                        setConfirmAction({ type: "approve", submission: selected })
                      }
                      disabled={actioning}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-60 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        setConfirmAction({ type: "reject", submission: selected })
                      }
                      disabled={actioning}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 disabled:opacity-60 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </SheetContent>
      </Sheet>

      {/* Confirm dialog */}
      <AlertDialog
        open={!!confirmAction}
        onOpenChange={(o) => !o && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === "approve"
                ? "Approve submission?"
                : "Reject submission?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === "approve"
                ? "A new Notion page will be created for this property and it will be queued for publishing."
                : "The submission will be marked as rejected. The landlord will not be notified automatically."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!confirmAction) return;
                if (confirmAction.type === "approve")
                  handleApprove(confirmAction.submission);
                else handleReject(confirmAction.submission);
              }}
              disabled={actioning}
              className={
                confirmAction?.type === "approve"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {actioning
                ? "Processing..."
                : confirmAction?.type === "approve"
                ? "Approve"
                : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
