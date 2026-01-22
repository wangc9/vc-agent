import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AssessmentCard from "@/components/AssessmentCard";
import { type Assessment } from "@/Assessment";

describe("AssessmentCard", () => {
  const mockData: Assessment = {
    startup_name: "Super AI",
    industry: "Deep Tech",
    analysis: "**Great** potential but needs *work*.",
  };

  it("renders startup details and parses markdown", () => {
    render(<AssessmentCard assessment={mockData} />);

    expect(screen.getByText("Super AI")).toBeInTheDocument();
    expect(screen.getByText("Deep Tech")).toBeInTheDocument();

    expect(screen.getByText("Great")).toBeInTheDocument();

    expect(screen.getByText(/potential but needs/)).toBeInTheDocument();
  });
});
