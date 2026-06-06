"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import {
  Building2,
  MessageSquare,
  Plus,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ListingSummary {
  id: string;
  slug: string;
  titleEn: string;
  city: string;
  priceTHB: number;
  status: "available" | "rented" | "coming_soon" | "pending" | "archived";
  bedrooms: number;
  coverImage: string;
}

interface InquirySummary {
  id: number;
  propertyId: string;
  name: string;
  contactType: string;
  status: "new" | "contacted" | "booked" | "declined";
  createdAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusBadge(status: ListingSummary["status"]) {
  const map: Record<ListingSummary["status"], { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    available: { label: "Available", variant: "default" },
    rented: { label: "Rented", variant: "secondary" },
    coming_soon: { label: "Coming Soon", variant: "outline" },
    pending: { label: "Pending Review", variant: "outline" },
    archived: { label: "Archived", variant: "destructive" },
  };
  const { label, variant } = map[status] ?? { label: status, variant: "outline" };
  return <Badge variant={variant}>{label}</Badge>;
}

function inquiryStatusIcon(status: InquirySummary["status"]) {
  if (status === "new") return <AlertCircle className="h-4 w-4 text-amber-500" />;
  if (status === "contacted") return <Clock className="h-4 w-4 text-blue-500" />;
  if (status === "booked") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: session } = useSession();
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [inquiries, setInquiries] = useState<InquirySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userName = (session?.user as { name?: string } | undefined)?.name ?? "there";

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [listRes, inqRes] = await Promise.all([
          fetch("/api/landlord/properties"),
          fetch("/api/landlord/inquiries"),
        ]);

        if (listRes.ok) {
          const data = await listRes.json();
          setListings(data.properties ?? []);
        }
        if (inqRes.ok) {
          const data = await inqRes.json();
          setInquiries(data.inquiries ?? []);
        }
      } catch (err) {
        setError("Failed to load dashboard data. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const newInquiries = inquiries.filter((i) => i.status === "new").length;
  const availableCount = listings.filter((l) => l.status === "available").length;
  const pendingCount = listings.filter((l) => l.status === "pending").length;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {userName} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your rental listings and inquiries.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/listings/new">
            <Plus className="mr-2 h-4 w-4" />
            New Listing
          </Link>
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Listings
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "–" : listings.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {availableCount} available · {pendingCount} pending review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New Inquiries
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "–" : newInquiries}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {inquiries.length} total inquiries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Listings
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "–" : availableCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently listed for rent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* My Listings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>My Listings</CardTitle>
            <CardDescription>Properties you have submitted</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/listings" className="flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <Building2 className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No listings yet. Add your first property!
              </p>
              <Button asChild size="sm">
                <Link href="/dashboard/listings/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Listing
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {listings.slice(0, 5).map((listing) => (
                <div
                  key={listing.id}
                  className="flex items-center justify-between rounded-lg border px-4 py-3 gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{listing.titleEn}</p>
                    <p className="text-xs text-muted-foreground">
                      {listing.city} · {listing.bedrooms} bed ·{" "}
                      {new Intl.NumberFormat("en-US").format(listing.priceTHB)} THB/mo
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {statusBadge(listing.status)}
                    {listing.status === "available" && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link
                          href={`/en/properties/${listing.slug}`}
                          target="_blank"
                          aria-label="View listing"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Inquiries */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Inquiries</CardTitle>
            <CardDescription>Messages from potential tenants</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/inquiries" className="flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : inquiries.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No inquiries yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {inquiries.slice(0, 5).map((inquiry) => (
                <div
                  key={inquiry.id}
                  className="flex items-center gap-3 rounded-lg border px-4 py-3"
                >
                  {inquiryStatusIcon(inquiry.status)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{inquiry.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      via {inquiry.contactType} ·{" "}
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={inquiry.status === "new" ? "default" : "secondary"}
                    className="capitalize shrink-0"
                  >
                    {inquiry.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
