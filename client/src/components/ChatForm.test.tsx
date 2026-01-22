/* eslint-disable @typescript-eslint/ban-ts-comment */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect } from "vitest";
import ChatForm from "@/components/ChatForm";

describe("ChatForm", () => {
  const queryClient = new QueryClient();
  const mockSetMessage = vi.fn();

  it("sends message and updates state", async () => {
    const user = userEvent.setup();

    // @ts-ignore
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        messages: [{ id: ["AIMessage"], kwargs: { content: "Reply" } }],
      }),
    } as Response);

    window.localStorage.setItem("token", "fake-token");

    render(
      <QueryClientProvider client={queryClient}>
        <ChatForm setMessage={mockSetMessage} />
      </QueryClientProvider>,
    );

    const input = screen.getByRole("textbox");
    await user.type(input, "Hello Agent");
    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      // @ts-ignore
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/agent"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer fake-token",
          }),
          body: expect.stringContaining("Hello Agent"),
        }),
      );

      expect(mockSetMessage).toHaveBeenCalled();
    });
  });
});
