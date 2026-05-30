// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ImageUploader from "@/components/admin/ImageUploader";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: true,
      json: async () => ({ url: "https://cdn/new-image.jpg" }),
    }))
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("ImageUploader", () => {
  it("renders the provided label", () => {
    render(<ImageUploader value={[]} onChange={() => {}} label="รูปภาพรถ" />);
    expect(screen.getByText("รูปภาพรถ")).toBeInTheDocument();
  });

  it("uploads a selected file and calls onChange with the returned URL", async () => {
    const onChange = vi.fn();
    const { container } = render(<ImageUploader value={[]} onChange={onChange} />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["binary"], "car.png", { type: "image/png" });
    await userEvent.upload(fileInput, file);

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(onChange).toHaveBeenCalledWith(["https://cdn/new-image.jpg"]);
    expect(fetch).toHaveBeenCalledWith("/api/upload", expect.objectContaining({ method: "POST" }));
  });

  it("appends in multiple mode (keeps existing values)", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <ImageUploader value={["https://cdn/existing.jpg"]} onChange={onChange} multiple />
    );
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(fileInput, new File(["x"], "b.png", { type: "image/png" }));

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(onChange).toHaveBeenCalledWith([
      "https://cdn/existing.jpg",
      "https://cdn/new-image.jpg",
    ]);
  });

  it("renders existing images and removes one via the remove button", async () => {
    const onChange = vi.fn();
    render(
      <ImageUploader
        value={["https://cdn/a.jpg", "https://cdn/b.jpg"]}
        onChange={onChange}
        multiple
      />
    );

    const removeButtons = screen.getAllByLabelText("ลบรูป");
    expect(removeButtons).toHaveLength(2);
    await userEvent.click(removeButtons[0]);
    expect(onChange).toHaveBeenCalledWith(["https://cdn/b.jpg"]);
  });

  it("shows an error toast when the upload API responds with an error", async () => {
    const { toast } = await import("sonner");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, json: async () => ({ error: "อัปโหลดไม่สำเร็จ" }) }))
    );
    const onChange = vi.fn();
    const { container } = render(<ImageUploader value={[]} onChange={onChange} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(fileInput, new File(["x"], "c.png", { type: "image/png" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(onChange).not.toHaveBeenCalled();
  });
});
