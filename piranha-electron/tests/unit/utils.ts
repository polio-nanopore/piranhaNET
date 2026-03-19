import { vi } from "vitest";

export const mockWindowAPI = (): void => {
  (window as any).api = {
    onInitialized: vi.fn(),
    onChunk: vi.fn(),
    onEnd: vi.fn(),
    onError: vi.fn(),
    versions: {
      electron: "1.1.1",
      chrome: "2.2.2",
      node: "3.3.3"
    }
  };
};
