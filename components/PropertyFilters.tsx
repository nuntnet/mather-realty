"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PropertyFilters as PropertyFiltersType } from "@/lib/notion-types";

const AMENITY_OPTIONS = [
  { value: "Pool", label: "Pool" },
  { value: "Parking", label: "Parking" },
  { value: "WiFi", label: "WiFi" },
  { value: "EVCharger", label: "EV Charger" },
  { value: "Furnished", label: "Furnished" },
  { value: "PetFriendly", label: "Pet Friendly" },
] as const;

const BEDROOM_OPTIONS = [1, 2, 3, 4, 5] as const;
const BATHROOM_OPTIONS = [1, 2, 3, 4] as const;

const MAX_PRICE = 200_000;

interface PropertyFiltersProps {
  filters: PropertyFiltersType;
  onChange: (filters: PropertyFiltersType) => void;
  cities: string[];
}

export default function PropertyFilters({
  filters,
  onChange,
  cities,
}: PropertyFiltersProps) {
  const t = useTranslations("search");
  const [mobileOpen, setMobileOpen] = useState(false);

  const update = (patch: Partial<PropertyFiltersType>) => {
    onChange({ ...filters, ...patch });
  };

  const clearAll = () => {
    onChange({});
  };

  const hasActiveFilters = Object.keys(filters).some((k) => {
    const v = filters[k as keyof PropertyFiltersType];
    if (Array.isArray(v)) return v.length > 0;
    return v !== undefined && v !== "" && v !== false;
  });

  const priceRange: [number, number] = [
    filters.minPrice ?? 0,
    filters.maxPrice ?? MAX_PRICE,
  ];

  const availableFromDate = filters.availableFrom
    ? new Date(filters.availableFrom)
    : undefined;

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* City */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">{t("city")}</Label>
        <Select
          value={filters.city ?? ""}
          onValueChange={(v) => update({ city: v === "all" ? undefined : v || undefined })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={`— ${t("city")} —`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">— All Cities —</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price range */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">{t("price_range")}</Label>
        <Slider
          min={0}
          max={MAX_PRICE}
          step={1000}
          value={priceRange}
          onValueChange={([min, max]) =>
            update({
              minPrice: min > 0 ? min : undefined,
              maxPrice: max < MAX_PRICE ? max : undefined,
            })
          }
          className="w-full"
        />
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min ฿"
            value={filters.minPrice ?? ""}
            onChange={(e) =>
              update({ minPrice: e.target.value ? Number(e.target.value) : undefined })
            }
            className="h-8 text-sm"
          />
          <span className="text-muted-foreground shrink-0">–</span>
          <Input
            type="number"
            placeholder="Max ฿"
            value={filters.maxPrice ?? ""}
            onChange={(e) =>
              update({ maxPrice: e.target.value ? Number(e.target.value) : undefined })
            }
            className="h-8 text-sm"
          />
        </div>
      </div>

      {/* Bedrooms */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">{t("bedrooms")}</Label>
        <div className="flex flex-wrap gap-2">
          {BEDROOM_OPTIONS.map((n) => (
            <Button
              key={n}
              type="button"
              size="sm"
              variant={filters.bedrooms === n ? "default" : "outline"}
              onClick={() =>
                update({ bedrooms: filters.bedrooms === n ? undefined : n })
              }
              className="min-w-[2.5rem]"
            >
              {n === 5 ? "5+" : n}
            </Button>
          ))}
        </div>
      </div>

      {/* Bathrooms */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">{t("bathrooms")}</Label>
        <div className="flex flex-wrap gap-2">
          {BATHROOM_OPTIONS.map((n) => (
            <Button
              key={n}
              type="button"
              size="sm"
              variant={filters.bathrooms === n ? "default" : "outline"}
              onClick={() =>
                update({ bathrooms: filters.bathrooms === n ? undefined : n })
              }
              className="min-w-[2.5rem]"
            >
              {n === 4 ? "4+" : n}
            </Button>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">{t("amenities")}</Label>
        <div className="grid grid-cols-2 gap-2">
          {AMENITY_OPTIONS.map(({ value, label }) => {
            const checked = filters.amenities?.includes(value) ?? false;
            return (
              <div key={value} className="flex items-center gap-2">
                <Checkbox
                  id={`amenity-${value}`}
                  checked={checked}
                  onCheckedChange={(v) => {
                    const current = filters.amenities ?? [];
                    const next = v
                      ? [...current, value]
                      : current.filter((a) => a !== value);
                    update({ amenities: next.length ? next : undefined });
                  }}
                />
                <Label
                  htmlFor={`amenity-${value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {label}
                </Label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Available Now */}
      <div className="flex items-center justify-between">
        <Label htmlFor="available-now" className="text-sm font-semibold cursor-pointer">
          {t("available_now")}
        </Label>
        <Switch
          id="available-now"
          checked={filters.availableNow ?? false}
          onCheckedChange={(v) => update({ availableNow: v || undefined })}
        />
      </div>

      {/* Available From */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">{t("available_from")}</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal h-9",
                !availableFromDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {availableFromDate
                ? format(availableFromDate, "PP")
                : t("available_from")}
              {availableFromDate && (
                <span
                  className="ml-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    update({ availableFrom: undefined });
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={availableFromDate}
              onSelect={(d) =>
                update({
                  availableFrom: d ? format(d, "yyyy-MM-dd") : undefined,
                })
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Clear All */}
      {hasActiveFilters && (
        <Button
          type="button"
          variant="ghost"
          className="w-full text-muted-foreground hover:text-destructive"
          onClick={clearAll}
        >
          <X className="h-4 w-4 mr-1.5" />
          {t("clear_filters")}
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop: always visible sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-4 rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-base flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              {t("filters")}
            </h2>
            {hasActiveFilters && (
              <button
                onClick={clearAll}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                {t("clear_filters")}
              </button>
            )}
          </div>
          <FiltersContent />
        </div>
      </aside>

      {/* Mobile: collapsible */}
      <div className="lg:hidden w-full">
        <Collapsible open={mobileOpen} onOpenChange={setMobileOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between"
              type="button"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                {t("filters")}
                {hasActiveFilters && (
                  <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    •
                  </span>
                )}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  mobileOpen && "rotate-180"
                )}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 rounded-xl border bg-card p-4 shadow-sm">
              <FiltersContent />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </>
  );
}
