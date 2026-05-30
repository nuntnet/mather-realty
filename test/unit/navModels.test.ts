import { describe, it, expect } from "vitest";
import {
  pickNavModelsForBrand,
  buildNavModelsByBrand,
  countActiveCarsByBrand,
} from "@/lib/navModels";
import type { Car } from "@/lib/notion-types";

function car(
  partial: Partial<Car> & Pick<Car, "id" | "brand" | "slug" | "name" | "year">
): Car {
  return {
    model: partial.name,
    type: "suv",
    condition: "new",
    priceMin: 0,
    priceMax: 0,
    engineSize: "",
    transmission: "auto",
    fuelType: "petrol",
    description: "",
    specs: {},
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: false,
    navFeatured: false,
    navNew: false,
    ...partial,
  };
}

describe("pickNavModelsForBrand", () => {
  const mazdaCars: Car[] = [
    car({
      id: "1",
      brand: "Mazda",
      name: "CX-5",
      slug: "mazda-cx-5-2025",
      year: 2025,
      navFeatured: true,
    }),
    car({
      id: "2",
      brand: "Mazda",
      name: "Mazda6e",
      slug: "mazda-mazda6e-2026",
      year: 2026,
      navNew: true,
    }),
    car({
      id: "3",
      brand: "Mazda",
      name: "CX-3",
      slug: "mazda-cx-3-2025",
      year: 2025,
    }),
  ];

  it("places featured first and new second when both flags exist", () => {
    const models = pickNavModelsForBrand(mazdaCars, "Mazda");
    expect(models).toHaveLength(2);
    expect(models[0]).toMatchObject({
      slug: "mazda-cx-5-2025",
      badge: "featured",
    });
    expect(models[1]).toMatchObject({
      slug: "mazda-mazda6e-2026",
      badge: "new",
    });
  });

  it("fills with newest unflagged cars when fewer than two flagged", () => {
    const models = pickNavModelsForBrand(
      [
        car({
          id: "a",
          brand: "Ford",
          name: "Ranger",
          slug: "ford-ranger",
          year: 2026,
          navFeatured: true,
        }),
        car({
          id: "b",
          brand: "Ford",
          name: "Everest",
          slug: "ford-everest",
          year: 2025,
        }),
        car({
          id: "c",
          brand: "Ford",
          name: "Raptor",
          slug: "ford-raptor",
          year: 2024,
        }),
      ],
      "Ford"
    );
    expect(models).toHaveLength(2);
    expect(models[0].badge).toBe("featured");
    expect(models[1].slug).toBe("ford-everest");
    expect(models[1].badge).toBeUndefined();
  });

  it("uses only new badges when no featured flags", () => {
    const models = pickNavModelsForBrand(
      [
        car({
          id: "1",
          brand: "Kia",
          name: "EV5",
          slug: "kia-ev5",
          year: 2026,
          navNew: true,
        }),
        car({
          id: "2",
          brand: "Kia",
          name: "Carnival",
          slug: "kia-carnival",
          year: 2025,
          navNew: true,
        }),
      ],
      "Kia"
    );
    expect(models.every((m) => m.badge === "new")).toBe(true);
  });

  it("ignores inactive cars", () => {
    const models = pickNavModelsForBrand(
      [
        car({
          id: "1",
          brand: "Deepal",
          name: "S07",
          slug: "deepal-s07",
          year: 2025,
          navFeatured: true,
          isActive: false,
        }),
      ],
      "Deepal"
    );
    expect(models).toHaveLength(0);
  });
});

describe("buildNavModelsByBrand", () => {
  it("builds entries for all configured brands with active cars", () => {
    const cars: Car[] = [
      car({
        id: "1",
        brand: "Mazda",
        name: "CX-5",
        slug: "mazda-cx-5",
        year: 2025,
        navFeatured: true,
      }),
      car({
        id: "2",
        brand: "GWM",
        name: "H6",
        slug: "gwm-h6",
        year: 2025,
        navNew: true,
      }),
    ];
    const byBrand = buildNavModelsByBrand(cars);
    expect(byBrand.Mazda?.length).toBeGreaterThan(0);
    expect(byBrand.GWM?.length).toBeGreaterThan(0);
  });
});

describe("countActiveCarsByBrand", () => {
  it("counts only active cars per brand", () => {
    const counts = countActiveCarsByBrand([
      car({ id: "1", brand: "Mazda", name: "A", slug: "a", year: 2025 }),
      car({
        id: "2",
        brand: "Mazda",
        name: "B",
        slug: "b",
        year: 2024,
        isActive: false,
      }),
      car({ id: "3", brand: "Ford", name: "C", slug: "c", year: 2025 }),
    ]);
    expect(counts.Mazda).toBe(1);
    expect(counts.Ford).toBe(1);
  });
});
