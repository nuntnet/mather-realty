"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, ArrowLeft, Clock, CheckCircle2, XCircle } from "lucide-react";

interface Inquiry {
  id: number;
  name: string;
  contact: string;
  contactType: string;
  preferredDate: string | null;
  message: string | null;
  status: "new" | "contacted" | "booked" | "declined";
  createdAt: string | null;
}

const STATUS_CFG = {
  new:       { label: "New",       cls: "bg-blue-100 text-blue-700",   icon: Clock },
  contacted: { label: "Contacted", cls: "bg-amber-100 text-amber-700", icon: MessageSquare },
  booked:    { label: "Booked",    cls: "bg-green-100 text-green-700", icon: CheckCircle2 },
  declined:  { label: "Declined",  cls: "bg-red-100 text-red-600",     icon: XCircle },
};

export default function DashboardInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/landlord/inquiries")
      .then(r => r.ok ? r.json() : { inquiries: [] })
      .then(d => setInquiries(d.inquiries ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-[#1E6B69]" /> Inquiries
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Viewing requests from potential tenants</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#1E6B69] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : inquiries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No inquiries yet</p>
            <p className="text-sm text-gray-400 mt-1">When tenants contact you about your listings, they'll appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {inquiries.map(inq => {
              const cfg = STATUS_CFG[inq.status] ?? STATUS_CFG.new;
              const Icon = cfg.icon;
              return (
                <div key={inq.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{inq.name}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {inq.contactType}: {inq.contact}
                      </p>
                      {inq.preferredDate && (
                        <p className="text-xs text-gray-400 mt-1">
                          Preferred date: {new Date(inq.preferredDate).toLocaleDateString()}
                        </p>
                      )}
                      {inq.message && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{inq.message}</p>
                      )}
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${cfg.cls}`}>
                      <Icon className="w-3 h-3" /> {cfg.label}
                    </span>
                  </div>
                  {inq.createdAt && (
                    <p className="text-[11px] text-gray-400 mt-3">
                      {new Date(inq.createdAt).toLocaleString()}
                    </p>
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
