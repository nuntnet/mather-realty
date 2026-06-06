"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { X, ArrowRight, Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { Property } from "@/lib/notion-types";

interface CompareDrawerProps {
  properties: Property[];
  locale: string;
  open: boolean;
  onClose: () => void;
  onRemove: (id: string) => void;
}

const AMENITY_LABELS: Record<string, string> = {
  Pool: "Pool",
  Parking: "Parking",
  WiFi: "WiFi",
  EVCharger: "EV Charger",
  Furnished: "Furnished",
  PetFriendly: "Pet Friendly",
};

const ALL_AMENITIES = Object.keys(AMENITY_LABELS);

interface RowProps {
  label: string;
  values: React.ReactNode[];
  className?: string;
}

function Row({ label, values, className }: RowProps) {
  return (
    <div className={cn("grid gap-px", className)} style={{ gridTemplateColumns: `160px repeat(${values.length}, 1fr)` }}>
      <div className="bg-muted/60 px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center">
        {label}
      </div>
      {values.map((v, i) => (
        <div key={i} className="bg-card px-3 py-2.5 text-sm flex items-center justify-center text-center">
          {v}
        </div>
      ))}
    </div>
  );
}

function formatPrice(thb: number, locale: string): string {
  return `฿${thb.toLocaleString("en-US")}/mo`;
}

export default function CompareDrawer({
  properties,
  locale,
  open,
  onClose,
  onRemove,
}: CompareDrawerProps) {
  const t = useTranslations("compare");
  const tCommon = useTranslations("common");

  const count = properties.length;

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent className="max-h-[85vh] flex flex-col">
        <DrawerHeader className="flex-none border-b pb-3">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-base font-semibold">
              {t("title")} ({count}/3)
            </DrawerTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-auto">
          {count === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">
              Add up to 3 properties to compare.
            </p>
          ) : (
            <div className="min-w-[640px]">
              {/* Property headers */}
              <div
                className="grid gap-px sticky top-0 z-10"
                style={{ gridTemplateColumns: `160px repeat(${count}, 1fr)` }}
              >
                <div className="bg-muted/60" />
                {properties.map((prop) => {
                  const title = prop.title[locale] ?? prop.title["en"] ?? prop.id;
                  return (
                    <div
                      key={prop.id}
                      className="bg-card p-3 flex flex-col items-center gap-2 border-b"
                    >
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
                        {prop.coverImage && (
                          <Image
                            src={prop.coverImage}
                            alt={title}
                            fill
                            className="object-cover"
                            sizes="200px"
                          />
                        )}
                        <Badge
                          className="absolute top-1.5 left-1.5 text-[10px] px-1.5"
                          variant={prop.status === "available" ? "default" : "secondary"}
                        >
                          {prop.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-xs font-semibold text-center line-clamp-2 w-full">
                        {title}
                      </p>
                      <button
                        type="button"
                        onClick={() => onRemove(prop.id)}
                        className="text-[10px] text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                      >
                        <X className="h-3 w-3" />
                        {t("remove")}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Comparison rows */}
              <div className="divide-y">
                <Row
                  label="Price"
                  values={properties.map((p) => (
                    <span key={p.id} className="font-bold text-primary">
                      {formatPrice(p.priceTHB, locale)}
                    </span>
                  ))}
                />
                <Row
                  label="Bedrooms"
                  values={properties.map((p) => (
                    <span key={p.id}>🛏 {p.bedrooms}</span>
                  ))}
                />
                <Row
                  label="Bathrooms"
                  values={properties.map((p) => (
                    <span key={p.id}>🚿 {p.bathrooms}</span>
                  ))}
                />
                <Row
                  label="Size"
                  values={properties.map((p) => (
                    <span key={p.id}>
                      {p.sizeSqm ? `${p.sizeSqm} sqm` : <span className="text-muted-foreground">—</span>}
                    </span>
                  ))}
                />
                <Row
                  label="City"
                  values={properties.map((p) => (
                    <span key={p.id}>{p.city || <span className="text-muted-foreground">—</span>}</span>
                  ))}
                />
                <Row
                  label="Available From"
                  values={properties.map((p) => (
                    <span key={p.id} className="text-xs">
                      {p.availableFrom
                        ? new Date(p.availableFrom).toLocaleDateString()
                        : <span className="text-muted-foreground">—</span>}
                    </span>
                  ))}
                />
                {ALL_AMENITIES.map((amenity) => (
                  <Row
                    key={amenity}
                    label={AMENITY_LABELS[amenity]}
                    values={properties.map((p) =>
                      p.amenities?.includes(amenity) ? (
                        <Check key={p.id} className="h-4 w-4 text-emerald-500 mx-auto" />
                      ) : (
                        <Minus key={p.id} className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                      )
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {count > 1 && (
          <div className="flex-none border-t p-4 flex items-center justify-between gap-3">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground">
              {tCommon("close")}
            </Button>
            <Link
              href={`/properties/compare?ids=${properties.map((p) => p.id).join(",")}`}
              locale={locale as never}
            >
              <Button size="sm" className="gap-1.5">
                {t("compare_now")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
