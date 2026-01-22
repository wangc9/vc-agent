import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorage.clear();
});

Object.defineProperty(window, "scrollTo", { value: vi.fn(), writable: true });

const IntersectionObserverMock = function () {
  return {
    observe: vi.fn(),
    disconnect: vi.fn(),
    unobserve: vi.fn(),
  };
};
vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
