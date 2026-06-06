"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Building2,
  Clock,
  Eye,
  Mail,
  MapPin,
  RefreshCw,
  Search,
  TrendingUp,
  BarChart2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Types ──────────────────────────────────────────────────────────────────────

type AnalyticsData = {
  counts: Record<string, number>;
  topProperties: { propertyId: string | null; title: string | null; count: number }[];
  topCities: { city: string | null; count: number }[];
  daily: { date: string; event: string; count: number }[];
  recent: {
    id: number;
    event: string;
    path: string | null;
    propertyId: string | null;
    locale: string | null;
    countryCode: string | null;
    createdAt: number;
  }[];
};

// ── Constants ─────────────────────────────────────────────────────────────────

const EVENT_LABELS: Record<string, string> = {
  property_view:    "Property View",
  inquiry_sent:     "Inquiry Sent",
  search_performed: "Search",
  submission:       "Listing Submit",
};

const EVENT_ICONS: Record<string, typeof Building2> = {
  property_view:    Building2,
  inquiry_sent:     Mail,
  search_performed: Search,
  submission:       TrendingUp,
};

const EVENT_COLORS: Record<string, string> = {
  property_view:    "#131F3C",
  inquiry_sent:     "#3B82F6",
  search_performed: "#10B981",
  submission:       "#F59E0B",
};

const DAYS_OPTIONS = [7, 14, 30, 90];

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(unixSec: number) {
  const diff = Math.floor(Date.now() / 1000 - unixSec);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: typeof Building2;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: color + "18" }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-[#0F172A]">{value.toLocaleString()}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  const load = async (d: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?days=${d}`);
      setData(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(days); }, [days]);

  const chartData = (() => {
    if (!data) return [];
    const byDate: Record<string, Record<string, number>> = {};
    for (const row of data.daily) {
      if (!byDate[row.date]) byDate[row.date] = {};
      byDate[row.date][row.event] = (byDate[row.date][row.event] ?? 0) + Number(row.count);
    }
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, evts]) => ({ date: date.slice(5), ...evts }));
  })();

  const counts = data?.counts ?? {};

  return (
    <div className="max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Property platform usage and engagement metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {DAYS_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  days === d
                    ? "bg-white text-[#0F172A] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => load(days)}
            disabled={loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Vercel Analytics */}
      <div className="bg-gradient-to-r from-[#0F172A] to-[#1e293b] rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart2 className="w-5 h-5 text-white/60" />
          <div>
            <p className="text-white font-medium text-sm">Vercel Analytics</p>
            <p className="text-white/50 text-xs">
              Page views, unique visitors, Web Vitals, referrers
            </p>
          </div>
        </div>
        <a
          href="https://vercel.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          Open Dashboard →
        </a>
      </div>

      {/* Event count cards */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Business Events — last {days} days
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {(["property_view", "inquiry_sent", "search_performed", "submission"] as const).map(
            (ev) => (
              <StatCard
                key={ev}
                label={EVENT_LABELS[ev]}
                value={counts[ev] ?? 0}
                icon={EVENT_ICONS[ev]}
                color={EVENT_COLORS[ev]}
              />
            )
          )}
        </div>
      </div>

      {/* Daily chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-[#0F172A] mb-4">
            Daily Activity
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={8} barGap={2}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                formatter={(v: number, name: string) => [
                  v,
                  EVENT_LABELS[name] ?? name,
                ]}
              />
              {(["property_view", "inquiry_sent", "search_performed"] as const).map((ev) => (
                <Bar
                  key={ev}
                  dataKey={ev}
                  fill={EVENT_COLORS[ev]}
                  radius={[3, 3, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top properties */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-[#0F172A]">
              Most Viewed Properties
            </h2>
          </div>
          {(data?.topProperties.length ?? 0) === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No data yet</p>
          ) : (
            <div className="space-y-2">
              {data?.topProperties.slice(0, 8).map((row, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-5 text-xs text-gray-400 text-right shrink-0">
                    {i + 1}
                  </span>
                  <Building2 className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                  <span className="text-sm text-[#0F172A] flex-1 truncate">
                    {row.title ?? row.propertyId ?? "Unknown"}
                  </span>
                  <span className="text-sm font-semibold text-gray-700 shrink-0">
                    {Number(row.count).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top cities */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-[#0F172A]">
              Most Searched Cities
            </h2>
          </div>
          {(data?.topCities.length ?? 0) === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No data yet</p>
          ) : (
            <div className="space-y-3">
              {data?.topCities.map((row, i) => {
                const max = Number(data.topCities[0]?.count ?? 1);
                const pct = Math.round((Number(row.count) / max) * 100);
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#0F172A]">
                        {row.city ?? "Unknown"}
                      </span>
                      <span className="text-sm text-gray-500">
                        {Number(row.count).toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#131F3C] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent events */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-[#0F172A]">Recent Events</h2>
        </div>
        {(data?.recent.length ?? 0) === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No data yet</p>
        ) : (
          <div className="space-y-1">
            {data?.recent.map((row) => {
              const Icon = EVENT_ICONS[row.event] ?? Eye;
              return (
                <div
                  key={row.id}
                  className="flex items-center gap-3 py-1.5 text-sm"
                >
                  <Icon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span
                    className="font-medium text-[#0F172A] w-28 shrink-0"
                    style={{ color: EVENT_COLORS[row.event] ?? "#0F172A" }}
                  >
                    {EVENT_LABELS[row.event] ?? row.event}
                  </span>
                  <span className="text-gray-500 flex-1 truncate">
                    {row.path ?? row.propertyId ?? "—"}
                    {row.locale && (
                      <span className="ml-1.5 text-xs text-gray-300">
                        [{row.locale}]
                      </span>
                    )}
                  </span>
                  {row.countryCode && (
                    <span className="text-xs text-gray-300 shrink-0">
                      {row.countryCode}
                    </span>
                  )}
                  <span className="text-gray-400 text-xs shrink-0">
                    {timeAgo(row.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
