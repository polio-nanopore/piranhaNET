import { vi } from "vitest";
import '@testing-library/jest-dom/vitest';

// required for svelte5 + jsdom as jsdom does not support matchMedia
const mockMatchMedia = vi.fn();
mockMatchMedia.mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn()
}));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  enumerable: true,
  value: mockMatchMedia
});
// add more mocks here if you need them
