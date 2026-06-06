"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  ClipboardList,
  Eye,
  Mail,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

type AdminStats = {
  totalProperties: number;
  availableProperties: number;
  rentedProperties: number;
  pendingProperties: number;
  newInquiriesToday: number;
  pendingSubmissions: number;
  totalViewsThisMonth: number;
};

type RecentInquiry = {
  id: number;
  propertyTitle: string | null;
  name: string;
  contactType: string | null;
  preferredDate: string | null;
  status: string;
  createdAt: string | null;
};

type RecentSubmission = {
  id: number;
  ownerEmail: string | null;
  propertyTitle: string | null;
  status: string;
  submittedAt: string | null;
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="w-5 h-5 border-2 border-[#131F3C] border-t-transparent rounded-full animate-spin" />
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  href,
  loading,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  href?: string;
  loading?: boolean;
}) {
  const inner = (
    <div
      className={`bg-white rounded-xl border border-gray-100 p-5 transition-shadow ${href ? "hover:shadow-md cursor-pointer" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-[#131F3C] mt-1">
            {loading ? (
              <span className="inline-block w-12 h-8 bg-gray-100 animate-pulse rounded" />
            ) : (
              value
            )}
          </p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`p-3 rounded-xl shrink-0 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  new:        { label: "New",       cls: "bg-blue-100 text-blue-700" },
  contacted:  { label: "Contacted", cls: "bg-amber-100 text-amber-700" },
  booked:     { label: "Booked",    cls: "bg-emerald-100 text-emerald-700" },
  declined:   { label: "Declined",  cls: "bg-red-100 text-red-600" },
  pending:    { label: "Pending",   cls: "bg-amber-100 text-amber-700" },
  approved:   { label: "Approved",  cls: "bg-emerald-100 text-emerald-700" },
  rejected:   { label: "Rejected",  cls: "bg-red-100 text-red-600" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_BADGE[status] ?? { label: status, cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>
      {s.label}
    </span>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [inquiries, setInquiries] = useState<RecentInquiry[]>([]);
  const [submissions, setSubmissions] = useState<RecentSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.ok ? r.json() : null),
      fetch("/api/admin/inquiries?limit=5").then((r) => r.ok ? r.json() : []),
      fetch("/api/admin/submissions?limit=5").then((r) => r.ok ? r.json() : []),
    ])
      .then(([s, inq, sub]) => {
        if (s) setStats(s);
        setInquiries(Array.isArray(inq) ? inq : inq?.items ?? []);
        setSubmissions(Array.isArray(sub) ? sub : sub?.items ?? []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#131F3C]">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            DoubleN Realty — property management overview
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-[#131F3C] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1f2d52] disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Properties"
          value={stats?.totalProperties ?? 0}
          sub={`${stats?.availableProperties ?? 0} available · ${stats?.rentedProperties ?? 0} rented · ${stats?.pendingProperties ?? 0} pending`}
          icon={Building2}
          color="bg-emerald-50 text-emerald-600"
          href="/admin/properties"
          loading={loading}
        />
        <StatCard
          label="New Inquiries Today"
          value={stats?.newInquiriesToday ?? 0}
          sub="Inquiries received today"
          icon={Mail}
          color="bg-blue-50 text-blue-600"
          href="/admin/inquiries"
          loading={loading}
        />
        <StatCard
          label="Pending Submissions"
          value={stats?.pendingSubmissions ?? 0}
          sub="Listing submissions awaiting review"
          icon={ClipboardList}
          color="bg-amber-50 text-amber-600"
          href="/admin/submissions"
          loading={loading}
        />
        <StatCard
          label="Views This Month"
          value={stats?.totalViewsThisMonth ?? 0}
          sub="Property page views this month"
          icon={Eye}
          color="bg-purple-50 text-purple-600"
          href="/admin/analytics"
          loading={loading}
        />
      </div>

      {/* Recent tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inquiries */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#131F3C]">Recent Inquiries</h2>
            <Link
              href="/admin/inquiries"
              className="text-xs text-blue-600 hover:underline"
            >
              View all →
            </Link>
          </div>
          {loading ? (
            <div className="py-8 flex justify-center"><Spinner /></div>
          ) : inquiries.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No inquiries yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="text-left text-xs font-medium text-gray-400 pb-2">
                      Property
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 pb-2">
                      Inquirer
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 pb-2">
                      Via
                    </th>
                    <th className="text-right text-xs font-medium text-gray-400 pb-2">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {inquiries.slice(0, 5).map((inq) => (
                    <tr key={inq.id}>
                      <td className="py-2.5 pr-3">
                        <p className="font-medium text-[#131F3C] truncate max-w-[120px]">
                          {inq.propertyTitle ?? "—"}
                        </p>
                      </td>
                      <td className="py-2.5 pr-3">
                        <p className="text-gray-700 truncate max-w-[100px]">{inq.name}</p>
                      </td>
                      <td className="py-2.5 pr-3">
                        <span className="text-xs capitalize text-gray-500">
                          {inq.contactType ?? "—"}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <StatusBadge status={inq.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Submissions */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#131F3C]">Recent Submissions</h2>
            <Link
              href="/admin/submissions"
              className="text-xs text-blue-600 hover:underline"
            >
              View all →
            </Link>
          </div>
          {loading ? (
            <div className="py-8 flex justify-center"><Spinner /></div>
          ) : submissions.length === 0 ? (
            <div className="flex items-center gap-2 py-4 justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <p className="text-sm text-gray-400">No pending submissions</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="text-left text-xs font-medium text-gray-400 pb-2">
                      Email
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 pb-2">
                      Property
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 pb-2">
                      Date
                    </th>
                    <th className="text-right text-xs font-medium text-gray-400 pb-2">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {submissions.slice(0, 5).map((sub) => (
                    <tr key={sub.id}>
                      <td className="py-2.5 pr-3">
                        <p className="text-gray-700 truncate max-w-[120px]">
                          {sub.ownerEmail ?? "—"}
                        </p>
                      </td>
                      <td className="py-2.5 pr-3">
                        <p className="text-[#131F3C] truncate max-w-[100px]">
                          {sub.propertyTitle ?? "Untitled"}
                        </p>
                      </td>
                      <td className="py-2.5 pr-3 text-gray-500 text-xs whitespace-nowrap">
                        {sub.submittedAt
                          ? new Date(sub.submittedAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                            })
                          : "—"}
                      </td>
                      <td className="py-2.5 text-right">
                        <StatusBadge status={sub.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
