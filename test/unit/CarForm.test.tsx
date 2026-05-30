// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CarForm from "@/components/admin/CarForm";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

/** Find a form control by its visible (non-associated) label text. */
function controlByLabel(labelText: string): HTMLElement {
  const label = screen.getByText(labelText);
  const control = label.parentElement!.querySelector("input, textarea, select");
  if (!control) throw new Error(`No control found for label "${labelText}"`);
  return control as HTMLElement;
}

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok: true, json: async () => ({ id: "car-x" }) }))
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("CarForm", () => {
  it("renders the create-mode title and submit button when no car is passed", () => {
    render(<CarForm open onOpenChange={() => {}} car={null} onSaved={() => {}} />);
    expect(screen.getByText("เพิ่มรถยนต์")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "เพิ่มรถ" })).toBeInTheDocument();
  });

  it("blocks submit and toasts when name/model are empty", async () => {
    const { toast } = await import("sonner");
    const onSaved = vi.fn();
    render(<CarForm open onOpenChange={() => {}} car={null} onSaved={onSaved} />);

    await userEvent.click(screen.getByRole("button", { name: "เพิ่มรถ" }));

    expect(toast.error).toHaveBeenCalledWith("กรุณากรอกชื่อรถและรุ่น");
    expect(fetch).not.toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
  });

  it("POSTs a new car, auto-generates slug from model, and calls callbacks", async () => {
    const onSaved = vi.fn();
    const onOpenChange = vi.fn();
    render(<CarForm open onOpenChange={onOpenChange} car={null} onSaved={onSaved} />);

    await userEvent.type(controlByLabel("ชื่อรถ *"), "Mazda CX-5");
    await userEvent.type(controlByLabel("รุ่น (Model) *"), "CX-5");

    await userEvent.click(screen.getByRole("button", { name: "เพิ่มรถ" }));

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    const [url, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("/api/admin/cars");
    expect(init.method).toBe("POST");
    const payload = JSON.parse(init.body);
    expect(payload.name).toBe("Mazda CX-5");
    expect(payload.model).toBe("CX-5");
    // slug auto-generated from model (lowercased, spaces -> dashes)
    expect(payload.slug).toBe("cx-5");

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("PATCHes when editing an existing car (sends id + data)", async () => {
    const existing = {
      id: "car-9",
      name: "Ford Ranger",
      brand: "Ford" as const,
      model: "Ranger",
      year: 2022,
      type: "pickup" as const,
      condition: "used" as const,
      priceMin: 800000,
      priceMax: 900000,
      engineSize: "2.0L",
      transmission: "auto" as const,
      fuelType: "diesel" as const,
      description: "",
      specs: {},
      imageUrls: [],
      videoUrl: null,
      isActive: true,
      isFeatured: false,
      navFeatured: false,
      navNew: false,
      slug: "ford-ranger",
    };
    render(<CarForm open onOpenChange={() => {}} car={existing} onSaved={() => {}} />);

    expect(screen.getByText("แก้ไขรถยนต์")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "บันทึก" }));

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    const [url, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("/api/admin/cars");
    expect(init.method).toBe("PATCH");
    const payload = JSON.parse(init.body);
    expect(payload.id).toBe("car-9");
    expect(payload.data.model).toBe("Ranger");
  });
});
