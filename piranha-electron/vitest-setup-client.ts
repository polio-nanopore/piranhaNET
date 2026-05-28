import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import "@testing-library/svelte/vitest";

// required for svelte5 + jsdom as jsdom does not support matchMedia
const mockMatchMedia = vi.fn();
mockMatchMedia.mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  enumerable: true,
  value: mockMatchMedia,
});

// Polyfill for Pointer Events missing in jsdom/happy-dom
if (typeof window !== 'undefined') {
  window.HTMLElement.prototype.hasPointerCapture = vi.fn().mockReturnValue(false);
  window.HTMLElement.prototype.setPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
}

// add more mocks here if you need them
