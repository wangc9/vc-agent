/* eslint-disable @typescript-eslint/ban-ts-comment */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router";
import { vi, describe, it, expect } from "vitest";
import LoginForm from "@/components/LoginForm";

// Mock useNavigate
const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe("LoginForm", () => {
  it("renders correctly", () => {
    render(<LoginForm />, { wrapper: BrowserRouter });
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("validates invalid email", async () => {
    const user = userEvent.setup();
    render(<LoginForm />, { wrapper: BrowserRouter });

    await user.type(screen.getByLabelText(/email/i), "not-an-email");
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument(); // Assuming Zod schema message
    });
  });

  it("submits form, saves token, and redirects on success", async () => {
    const user = userEvent.setup();

    // @ts-ignore
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ status: "success", token: "fake-jwt-token" }),
    } as Response);

    render(<LoginForm />, { wrapper: BrowserRouter });

    await user.type(screen.getByLabelText(/email/i), "test@test.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      // @ts-ignore
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/login"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            email: "test@test.com",
            password: "password123",
          }),
        }),
      );

      expect(window.localStorage.getItem("token")).toContain("fake-jwt-token");

      expect(mockedNavigate).toHaveBeenCalledWith("/assess");
    });
  });
});
