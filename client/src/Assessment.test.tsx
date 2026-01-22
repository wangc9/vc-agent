/* eslint-disable @typescript-eslint/ban-ts-comment */
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import Assessment from "@/Assessment";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("Assessment Page", () => {
  beforeEach(() => {
    window.localStorage.setItem("token", "fake-token");
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    // @ts-ignore
    global.fetch = vi.fn(() => new Promise(() => {}));

    render(<Assessment />, { wrapper: createWrapper() });
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders assessments list and handles Load More", async () => {
    // @ts-ignore
    global.fetch = vi
      .fn()
      // First Call (Initial Render): Resolves immediately
      .mockResolvedValueOnce({
        json: async () => ({
          assessments: [
            { startup_name: "Startup One", industry: "SaaS", analysis: "Good" },
            {
              startup_name: "Startup Two",
              industry: "Fintech",
              analysis: "Okay",
            },
          ],
          nextCursor: 9,
        }),
      } as Response)
      // Second Call (Load More): delays resolution by 100ms, forcing the UI to stay in "Loading more..." state long enough for the test to see it
      .mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  json: async () => ({
                    assessments: [
                      {
                        startup_name: "Startup Three",
                        industry: "AI",
                        analysis: "Wow",
                      },
                    ],
                    nextCursor: 18,
                  }),
                } as Response),
              100,
            ),
          ),
      );

    render(<Assessment />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Startup One")).toBeInTheDocument();
    });

    const loadMoreButton = screen.getByRole("button", { name: /load more/i });
    expect(loadMoreButton).toBeEnabled();

    fireEvent.click(loadMoreButton);

    await waitFor(() => {
      expect(screen.getByText("Loading more...")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("Startup Three")).toBeInTheDocument();
    });
  });
});
