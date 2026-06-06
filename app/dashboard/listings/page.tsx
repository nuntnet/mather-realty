"use client";
import Link from "next/link";
import { Building2, Plus, ArrowLeft } from "lucide-react";

export default function DashboardListingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-[#1E6B69]" /> My Listings
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your rental properties</p>
          </div>
          <Link href="/dashboard/listings/new"
            className="ml-auto flex items-center gap-2 bg-[#1E6B69] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#18605E] transition-colors">
            <Plus className="w-4 h-4" /> Add Listing
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No listings yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-6">Submit your first property to get started</p>
          <Link href="/submit"
            className="inline-flex items-center gap-2 bg-[#1E6B69] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#18605E] transition-colors">
            <Plus className="w-4 h-4" /> List a Property
          </Link>
        </div>
      </div>
    </div>
  );
}
