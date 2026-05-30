// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BlogForm from "@/components/admin/BlogForm";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

// Replace the TipTap-based editor (ProseMirror is flaky under jsdom) with a
// simple controlled textarea exposing the same value/onChange contract.
vi.mock("@/components/admin/RichTextEditor", () => ({
  default: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea
      aria-label="content-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

function controlByLabel(labelText: string): HTMLElement {
  const label = screen.getByText(labelText);
  const control = label.parentElement!.querySelector("input, textarea, select");
  if (!control) throw new Error(`No control found for label "${labelText}"`);
  return control as HTMLElement;
}

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok: true, json: async () => ({ id: "post-x", slug: "hello-world" }) }))
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("BlogForm", () => {
  it("renders create-mode title", () => {
    render(<BlogForm open onOpenChange={() => {}} postId={null} onSaved={() => {}} />);
    expect(screen.getByText("เขียนบทความใหม่")).toBeInTheDocument();
  });

  it("auto-generates the slug from the title until the slug is manually edited", async () => {
    render(<BlogForm open onOpenChange={() => {}} postId={null} onSaved={() => {}} />);

    await userEvent.type(controlByLabel("ชื่อบทความ *"), "Hello World");

    const slugInput = controlByLabel("Slug (URL)") as HTMLInputElement;
    expect(slugInput.value).toBe("hello-world");
  });

  it("stops auto-generating the slug once the user edits it directly", async () => {
    render(<BlogForm open onOpenChange={() => {}} postId={null} onSaved={() => {}} />);

    const slugInput = controlByLabel("Slug (URL)") as HTMLInputElement;
    await userEvent.type(slugInput, "custom-slug");
    await userEvent.type(controlByLabel("ชื่อบทความ *"), "New Title");

    expect(slugInput.value).toBe("custom-slug");
  });

  it("blocks submit and toasts when the title is empty", async () => {
    const { toast } = await import("sonner");
    render(<BlogForm open onOpenChange={() => {}} postId={null} onSaved={() => {}} />);

    await userEvent.click(screen.getByRole("button", { name: "สร้างบทความ" }));

    expect(toast.error).toHaveBeenCalledWith("กรุณากรอกชื่อบทความ");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("POSTs meta + markdown when creating a post", async () => {
    const onSaved = vi.fn();
    render(<BlogForm open onOpenChange={() => {}} postId={null} onSaved={onSaved} />);

    await userEvent.type(controlByLabel("ชื่อบทความ *"), "Hello World");
    await userEvent.type(screen.getByLabelText("content-editor"), "# Body");

    await userEvent.click(screen.getByRole("button", { name: "สร้างบทความ" }));

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    const [url, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("/api/admin/blog");
    expect(init.method).toBe("POST");
    const payload = JSON.parse(init.body);
    expect(payload.meta.title).toBe("Hello World");
    expect(payload.meta.slug).toBe("hello-world");
    expect(payload.markdown).toContain("# Body");
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
  });
});
