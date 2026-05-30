import { afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// React Testing Library cleanup — only meaningful in a DOM (jsdom) environment.
// Guarded so node-environment suites (lib/routes) don't blow up on import.
afterEach(async () => {
  if (typeof document !== "undefined") {
    const { cleanup } = await import("@testing-library/react");
    cleanup();
  }
});

// jsdom does not implement matchMedia / ResizeObserver / scrollIntoView that
// some Radix UI primitives touch on mount. Provide harmless stubs.
if (typeof window !== "undefined") {
  if (!window.matchMedia) {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  }

  if (!("ResizeObserver" in window)) {
    // @ts-expect-error - minimal stub
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }

  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = vi.fn();
  }
  // Radix Select uses these in jsdom
  const elProto = Element.prototype as Element & {
    hasPointerCapture?: (id: number) => boolean;
    releasePointerCapture?: (id: number) => void;
    setPointerCapture?: (id: number) => void;
  };
  elProto.hasPointerCapture ??= vi.fn();
  elProto.releasePointerCapture ??= vi.fn();
  elProto.setPointerCapture ??= vi.fn();
}
