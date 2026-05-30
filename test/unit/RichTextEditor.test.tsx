// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Editor } from "@tiptap/react";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

/** Minimal TipTap editor stub — real ProseMirror is flaky in jsdom. */
function createMockEditor(markdown = "") {
  let content = markdown;
  const chain = {
    focus: vi.fn().mockReturnThis(),
    toggleBold: vi.fn().mockReturnThis(),
    toggleItalic: vi.fn().mockReturnThis(),
    toggleHeading: vi.fn().mockReturnThis(),
    toggleBulletList: vi.fn().mockReturnThis(),
    toggleOrderedList: vi.fn().mockReturnThis(),
    extendMarkRange: vi.fn().mockReturnThis(),
    unsetLink: vi.fn().mockReturnThis(),
    setLink: vi.fn().mockReturnThis(),
    setImage: vi.fn().mockReturnThis(),
    run: vi.fn(),
  };

  const editor = {
    isActive: vi.fn(() => false),
    chain: vi.fn(() => chain),
    getAttributes: vi.fn(() => ({})),
    commands: { setContent: vi.fn((v: string) => { content = v; }) },
    storage: {
      markdown: {
        getMarkdown: () => content,
      },
    },
  } as unknown as Editor;

  return { editor, chain, setMarkdown: (v: string) => { content = v; } };
}

let capturedOnUpdate: ((args: { editor: Editor }) => void) | undefined;
let mockEditorBundle = createMockEditor();

vi.mock("@tiptap/react", () => ({
  useEditor: vi.fn((opts: { onUpdate?: (args: { editor: Editor }) => void; content?: string }) => {
    capturedOnUpdate = opts.onUpdate;
    mockEditorBundle = createMockEditor(opts.content ?? "");
    return mockEditorBundle.editor;
  }),
  EditorContent: () => <div data-testid="editor-content" />,
}));

// Stub extensions — RichTextEditor imports them but our mock bypasses real init
vi.mock("@tiptap/starter-kit", () => ({ default: { configure: vi.fn(() => ({})) } }));
vi.mock("@tiptap/extension-link", () => ({ default: { configure: vi.fn(() => ({})) } }));
vi.mock("@tiptap/extension-image", () => ({ default: { configure: vi.fn(() => ({})) } }));
vi.mock("tiptap-markdown", () => ({ Markdown: { configure: vi.fn(() => ({})) } }));

import RichTextEditor from "@/components/admin/RichTextEditor";

beforeEach(() => {
  capturedOnUpdate = undefined;
  mockEditorBundle = createMockEditor("");
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: true,
      json: async () => ({ url: "https://cdn.example/uploaded.jpg" }),
    }))
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("RichTextEditor", () => {
  it("renders the formatting toolbar buttons", () => {
    render(<RichTextEditor value="" onChange={() => {}} />);
    expect(screen.getByTitle("ตัวหนา")).toBeInTheDocument();
    expect(screen.getByTitle("ตัวเอียง")).toBeInTheDocument();
    expect(screen.getByTitle("หัวข้อใหญ่")).toBeInTheDocument();
    expect(screen.getByTitle("รายการ")).toBeInTheDocument();
    expect(screen.getByTitle("ลิงก์")).toBeInTheDocument();
    expect(screen.getByTitle("แทรกรูปภาพ")).toBeInTheDocument();
    expect(screen.getByTestId("editor-content")).toBeInTheDocument();
  });

  it("calls onChange with markdown when the editor updates", async () => {
    const onChange = vi.fn();
    render(<RichTextEditor value="" onChange={onChange} />);

    mockEditorBundle.setMarkdown("# Hello");
    capturedOnUpdate?.({ editor: mockEditorBundle.editor });

    await waitFor(() => expect(onChange).toHaveBeenCalledWith("# Hello"));
  });

  it("initializes with the provided markdown value", async () => {
    const { useEditor } = await import("@tiptap/react");
    render(<RichTextEditor value="## Intro" onChange={() => {}} />);
    expect(useEditor).toHaveBeenCalledWith(
      expect.objectContaining({ content: "## Intro" })
    );
  });

  it("invokes bold toggle when the bold button is clicked", async () => {
    render(<RichTextEditor value="" onChange={() => {}} />);
    await userEvent.click(screen.getByTitle("ตัวหนา"));
    expect(mockEditorBundle.editor.chain).toHaveBeenCalled();
    expect(mockEditorBundle.chain.toggleBold).toHaveBeenCalled();
  });
});
