import type { Car } from "@/lib/notion-types";
import { BRANDS } from "@/lib/brandConfig";

/** Notion Cars DB checkboxes: "Nav Featured", "Nav New" */
export type NavModelBadge = "featured" | "new";

export interface NavHighlightModel {
  name: string;
  slug: string;
  badge?: NavModelBadge;
}

export type NavModelsByBrand = Partial<Record<Car["brand"], NavHighlightModel[]>>;
export type NavCountsByBrand = Partial<Record<Car["brand"], number>>;

function sortCarsByYearThenName(a: Car, b: Car): number {
  if (b.year !== a.year) return b.year - a.year;
  return a.name.localeCompare(b.name, "th");
}

function displayName(car: Car): string {
  return car.model?.trim() || car.name;
}

/**
 * Pick up to `maxSlots` highlight models for one brand.
 * Priority: featured → new (when both flag types exist), then remaining flagged,
 * then newest active cars by year.
 */
export function pickNavModelsForBrand(
  cars: Car[],
  brand: Car["brand"],
  maxSlots = 2
): NavHighlightModel[] {
  const brandCars = cars.filter((c) => c.brand === brand && c.isActive && c.slug);
  const sorted = [...brandCars].sort(sortCarsByYearThenName);
  const featured = sorted.filter((c) => c.navFeatured);
  const navNew = sorted.filter((c) => c.navNew);

  const picked: NavHighlightModel[] = [];
  const used = new Set<string>();

  const add = (car: Car, badge?: NavModelBadge) => {
    if (picked.length >= maxSlots || used.has(car.id)) return;
    used.add(car.id);
    picked.push({ name: displayName(car), slug: car.slug, badge });
  };

  if (featured.length > 0 && navNew.length > 0) {
    add(featured[0], "featured");
    const newPick = navNew.find((c) => !used.has(c.id));
    if (newPick) add(newPick, "new");
  } else if (featured.length > 0) {
    for (const car of featured) {
      if (picked.length >= maxSlots) break;
      add(car, "featured");
    }
  } else if (navNew.length > 0) {
    for (const car of navNew) {
      if (picked.length >= maxSlots) break;
      add(car, "new");
    }
  }

  for (const car of sorted) {
    if (picked.length >= maxSlots) break;
    add(car);
  }

  return picked;
}

export function countActiveCarsByBrand(cars: Car[]): NavCountsByBrand {
  const counts: NavCountsByBrand = {};
  for (const car of cars) {
    if (!car.isActive) continue;
    counts[car.brand] = (counts[car.brand] ?? 0) + 1;
  }
  return counts;
}

export function buildNavModelsByBrand(cars: Car[]): NavModelsByBrand {
  const result: NavModelsByBrand = {};
  for (const { notionBrand } of BRANDS) {
    const models = pickNavModelsForBrand(cars, notionBrand);
    if (models.length > 0) result[notionBrand] = models;
  }
  return result;
}
