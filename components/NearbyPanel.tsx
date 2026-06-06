"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface NearbyPlace {
  id: string;
  name: string;
  category: NearbyCategory;
  distanceKm: number;
}

export type NearbyCategory =
  | "airport"
  | "hospital"
  | "mall"
  | "school"
  | "transit"
  | "restaurant"
  | "convenience"
  | "beach";

const CATEGORY_EMOJI: Record<NearbyCategory, string> = {
  airport: "✈️",
  hospital: "🏥",
  mall: "🛒",
  school: "🏫",
  transit: "🚇",
  restaurant: "🍜",
  convenience: "🏪",
  beach: "🏖️",
};

interface NearbyPanelProps {
  propertyId: string;
  lat: number;
  lng: number;
  className?: string;
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export default function NearbyPanel({
  propertyId,
  lat,
  lng,
  className,
}: NearbyPanelProps) {
  const t = useTranslations("nearby");
  const tCommon = useTranslations("common");
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    fetch(`/api/nearby/${propertyId}?lat=${lat}&lng=${lng}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch nearby places");
        return res.json() as Promise<{ places: NearbyPlace[] }>;
      })
      .then((data) => {
        if (!cancelled) {
          setPlaces(data.places ?? []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [propertyId, lat, lng]);

  const categoryLabel = (cat: NearbyCategory): string => {
    try {
      return t(cat);
    } catch {
      return cat;
    }
  };

  return (
    <div className={cn("rounded-xl border bg-card p-4 shadow-sm", className)}>
      <h3 className="font-semibold text-base mb-4">{t("airport") ? "Nearby" : "Nearby"}</h3>

      {loading && (
        <ul className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-3 w-12 shrink-0" />
            </li>
          ))}
        </ul>
      )}

      {!loading && error && (
        <p className="text-sm text-muted-foreground text-center py-4">
          {tCommon("error")}
        </p>
      )}

      {!loading && !error && places.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No nearby places found.
        </p>
      )}

      {!loading && !error && places.length > 0 && (
        <ul className="space-y-2">
          {places.map((place) => (
            <li
              key={place.id}
              className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <span
                className="h-8 w-8 flex items-center justify-center rounded-full bg-muted text-base shrink-0"
                aria-hidden="true"
              >
                {CATEGORY_EMOJI[place.category] ?? "📍"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{place.name}</p>
                <p className="text-xs text-muted-foreground">
                  {categoryLabel(place.category)}
                </p>
              </div>
              <span className="text-xs font-semibold text-muted-foreground shrink-0">
                {formatDistance(place.distanceKm)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
