"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft, CheckCircle2, XCircle, Calendar, MapPin,
  Bed, Bath, Maximize2, Layers, Car, Clock, Key, Banknote,
  Phone, Mail, MessageCircle, Users, Sparkles, Link2,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ── Types ──────────────────────────────────────────────────────────────────────

type SubmissionData = {
  propertyType?: string;
  address?: string;
  city?: string;
  district?: string;
  price?: string | number;
  priceTHB?: number;
  size?: string | number;
  sizeSqm?: number;
  bedrooms?: string | number;
  bathrooms?: string | number;
  floors?: string | number;
  parkingSpots?: string | number;
  availableFrom?: string;
  minLeaseTerm?: string | number;
  depositMonths?: string | number;
  amenities?: string[];
  perfectFor?: string[];
  highlights?: string;
  description_en?: string;
  description?: string;
  virtualTourUrl?: string;
  ownerName?: string;
  ownerLine?: string;
  ownerWhatsapp?: string;
  titleEn?: string;
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseData(json: string | null): SubmissionData {
  if (!json) return {};
  try { return JSON.parse(json); } catch { return {}; }
}

function parseImages(json: string | null): string[] {
  if (!json) return [];
  try { const v = JSON.parse(json); return Array.isArray(v) ? v : []; } catch { return []; }
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  pending:  { label: "Pending",  cls: "bg-amber-100 text-amber-700 border-amber-200"     },
  approved: { label: "Approved", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  rejected: { label: "Rejected", cls: "bg-red-100 text-red-600 border-red-200"           },
};

// ── Stat chip ─────────────────────────────────────────────────────────────────

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-4 py-3">
      <Icon className="w-4 h-4 text-gray-400 shrink-0" />
      <div>
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-gray-800 leading-tight">{value}</p>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function SubmissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [sub, setSub] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [confirm, setConfirm] = useState<"approve" | "reject" | null>(null);

  useEffect(() => {
    fetch(`/api/admin/submissions/${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => setSub(d))
      .catch(() => setSub(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAction = async (action: "approve" | "reject") => {
    if (!sub) return;
    setActioning(true);
    try {
      const res = await fetch("/api/admin/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sub.id, action }),
      });
      if (!res.ok) throw new Error();
      toast.success(action === "approve"
        ? "Submission approved — Notion page created."
        : "Submission rejected.");
      setSub((s) => s ? { ...s, status: action === "approve" ? "approved" : "rejected" } : s);
    } catch {
      toast.error(`${action === "approve" ? "Approval" : "Rejection"} failed. Please try again.`);
    } finally {
      setActioning(false);
      setConfirm(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#131F3C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!sub) {
    return (
      <div className="text-center py-24 text-gray-400">
        <p className="text-lg font-medium">Submission not found</p>
        <Link href="/admin/submissions" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
          Back to submissions
        </Link>
      </div>
    );
  }

  const data = parseData(sub.dataJson);
  const images = parseImages(sub.imagesJson);
  const badge = STATUS_BADGE[sub.status] ?? STATUS_BADGE.pending;
  const price = data.price ?? data.priceTHB;
  const size = data.size ?? data.sizeSqm;
  const title = data.titleEn ?? data.propertyType ?? data.address ?? `Submission #${sub.id}`;
  const location = [data.district, data.city].filter(Boolean).join(", ");

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Link href="/admin/submissions"
          className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 text-gray-400 hover:text-gray-700 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-[#131F3C] truncate">{title}</h1>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badge.cls}`}>
              {badge.label}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">
            Submission #{sub.id} · Submitted {sub.submittedAt
              ? new Date(sub.submittedAt).toLocaleString("en-GB")
              : "—"}
          </p>
        </div>

        {sub.status === "pending" && (
          <div className="flex gap-2 shrink-0">
            <button onClick={() => setConfirm("reject")} disabled={actioning}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 disabled:opacity-60 transition-colors">
              <XCircle className="w-4 h-4" /> Reject
            </button>
            <button onClick={() => setConfirm("approve")} disabled={actioning}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 transition-colors">
              <CheckCircle2 className="w-4 h-4" /> Approve
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Left column (2/3) ────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Property specs */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Property Details</h2>

            {/* Type + Location */}
            <div className="space-y-2">
              {data.propertyType && (
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg w-fit">
                  {data.propertyType}
                </p>
              )}
              {data.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-700">{data.address}{location ? `, ${location}` : ""}</p>
                </div>
              )}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {price != null && price !== "" && (
                <Stat icon={Banknote} label="Monthly Rent" value={`฿${Number(price).toLocaleString()}`} />
              )}
              <Stat icon={Maximize2} label="Size" value={size ? `${size} sqm` : null} />
              <Stat icon={Bed} label="Bedrooms" value={data.bedrooms} />
              <Stat icon={Bath} label="Bathrooms" value={data.bathrooms} />
              <Stat icon={Layers} label="Floor" value={data.floors} />
              <Stat icon={Car} label="Parking" value={data.parkingSpots} />
            </div>

            {/* Lease terms */}
            {(data.availableFrom || data.minLeaseTerm || data.depositMonths) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 border-t border-gray-50">
                <Stat icon={Calendar} label="Available From" value={data.availableFrom} />
                <Stat icon={Clock} label="Min. Lease"
                  value={data.minLeaseTerm ? `${data.minLeaseTerm} month${Number(data.minLeaseTerm) !== 1 ? "s" : ""}` : null} />
                <Stat icon={Key} label="Deposit"
                  value={data.depositMonths ? `${data.depositMonths} month${Number(data.depositMonths) !== 1 ? "s" : ""}` : null} />
              </div>
            )}

            {/* Perfect for */}
            {Array.isArray(data.perfectFor) && data.perfectFor.length > 0 && (
              <div className="pt-1 border-t border-gray-50">
                <div className="flex items-center gap-1.5 mb-2">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Perfect For</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {data.perfectFor.map((v) => (
                    <span key={v} className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full font-medium capitalize">
                      {String(v).replace(/-/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {Array.isArray(data.amenities) && data.amenities.length > 0 && (
              <div className="pt-1 border-t border-gray-50">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Amenities</p>
                <div className="flex flex-wrap gap-1.5">
                  {data.amenities.map((a) => (
                    <span key={String(a)} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                      {String(a)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Highlights */}
          {data.highlights && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Key Highlights</h2>
              </div>
              <ul className="space-y-2">
                {String(data.highlights).split("\n").filter(Boolean).map((line, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Description */}
          {(data.description_en || data.description) && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Description</h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {String(data.description_en ?? data.description)}
              </p>
            </div>
          )}

          {/* Images */}
          {images.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Photos ({images.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {images.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer"
                    className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 block hover:opacity-90 transition-opacity">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right column (1/3) ───────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Owner contact */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Owner</h2>
            <div className="space-y-3">
              {data.ownerName && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Name</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{data.ownerName}</p>
                </div>
              )}
              {sub.ownerEmail && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Email</p>
                  <a href={`mailto:${sub.ownerEmail}`}
                    className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline mt-0.5">
                    <Mail className="w-3.5 h-3.5" />{sub.ownerEmail}
                  </a>
                </div>
              )}
              {sub.ownerPhone && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Phone</p>
                  <a href={`tel:${sub.ownerPhone}`}
                    className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-gray-900 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />{sub.ownerPhone}
                  </a>
                </div>
              )}
              {data.ownerLine && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">LINE</p>
                  <p className="flex items-center gap-1.5 text-sm text-gray-700 mt-0.5">
                    <MessageCircle className="w-3.5 h-3.5 text-green-500" />{data.ownerLine}
                  </p>
                </div>
              )}
              {data.ownerWhatsapp && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">WhatsApp</p>
                  <a href={`https://wa.me/${String(data.ownerWhatsapp).replace(/[^0-9]/g, "")}`}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-gray-900 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-green-500" />{data.ownerWhatsapp}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Virtual tour */}
          {data.virtualTourUrl && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Virtual Tour</h2>
              <a href={String(data.virtualTourUrl)} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:underline break-all">
                <Link2 className="w-4 h-4 shrink-0" />
                {String(data.virtualTourUrl)}
              </a>
            </div>
          )}

          {/* Action panel (sticky for pending) */}
          {sub.status === "pending" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Review</h2>
              <button onClick={() => setConfirm("approve")} disabled={actioning}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-60 transition-colors">
                <CheckCircle2 className="w-4 h-4" /> Approve Listing
              </button>
              <button onClick={() => setConfirm("reject")} disabled={actioning}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-200 bg-red-50 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-100 disabled:opacity-60 transition-colors">
                <XCircle className="w-4 h-4" /> Reject
              </button>
            </div>
          )}

          {/* Reviewed at */}
          {sub.reviewedAt && (
            <div className="bg-gray-50 rounded-2xl px-5 py-4">
              <p className="text-xs text-gray-400">
                Reviewed {new Date(sub.reviewedAt).toLocaleString("en-GB")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Confirm dialog */}
      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm === "approve" ? "Approve this submission?" : "Reject this submission?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm === "approve"
                ? "A new Notion page will be created for this property and queued for publishing."
                : "The submission will be marked as rejected."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirm && handleAction(confirm)}
              disabled={actioning}
              className={confirm === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}
            >
              {actioning ? "Processing..." : confirm === "approve" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
