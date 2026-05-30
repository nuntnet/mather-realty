import { describe, it, expect } from "vitest";
import {
  matchCarToGwmLine,
  legacyBrandQueryToPath,
  isBrandSlug,
  isGwmLineSlug,
  BRAND_BY_SLUG,
} from "@/lib/brandConfig";
import type { Car } from "@/lib/notion-types";

const gwmCar = (model: string): Car =>
  ({
    id: "1",
    brand: "GWM",
    model,
    name: model,
    year: 2024,
    type: "suv",
    condition: "new",
    priceMin: 0,
    priceMax: 0,
    engineSize: "",
    transmission: "auto",
    fuelType: "hybrid",
    description: "",
    specs: {},
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: false,
    slug: "test",
  }) as Car;

describe("brandConfig", () => {
  it("recognizes valid brand slugs", () => {
    expect(isBrandSlug("mazda")).toBe(true);
    expect(isBrandSlug("about")).toBe(false);
  });

  it("recognizes GWM line slugs", () => {
    expect(isGwmLineSlug("haval")).toBe(true);
    expect(isGwmLineSlug("HAVAL")).toBe(false);
  });

  it("maps legacy query brand values to hub paths", () => {
    expect(legacyBrandQueryToPath("Mazda")).toBe("/mazda");
    expect(legacyBrandQueryToPath("HAVAL")).toBe("/gwm/haval");
    expect(legacyBrandQueryToPath("haval")).toBe("/gwm/haval");
    expect(legacyBrandQueryToPath("Unknown")).toBeNull();
  });

  it("matches GWM cars by model prefix", () => {
    expect(matchCarToGwmLine(gwmCar("HAVAL H6 HEV"), "haval")).toBe(true);
    expect(matchCarToGwmLine(gwmCar("ORA Good Cat"), "ora")).toBe(true);
    expect(matchCarToGwmLine(gwmCar("TANK 300"), "tank")).toBe(true);
    expect(matchCarToGwmLine(gwmCar("HAVAL H6"), "ora")).toBe(false);
  });

  it("exposes hub paths for all six brands", () => {
    expect(Object.keys(BRAND_BY_SLUG)).toHaveLength(6);
    expect(BRAND_BY_SLUG.mazda.hubPath).toBe("/mazda");
    expect(BRAND_BY_SLUG.gwm.subLines).toHaveLength(3);
  });

  it("lists featured models with car detail slugs", () => {
    for (const brand of Object.values(BRAND_BY_SLUG)) {
      expect(brand.featuredModels?.length).toBeGreaterThanOrEqual(2);
      for (const model of brand.featuredModels ?? []) {
        expect(model.slug).toMatch(/^[\w-]+$/);
        expect(model.name.length).toBeGreaterThan(0);
      }
    }
  });
});
