/**
 * Unit test — StatsSection
 *
 * Verifies that the character stats screen renders contact links
 * (GitHub, LinkedIn, Email) and key bio elements. Contact links
 * are critical for a portfolio — broken links mean missed opportunities.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatsSection } from "@/components/StatsSection";

describe("StatsSection", () => {
  it("renders GitHub contact link", () => {
    render(<StatsSection />);
    const link = screen.getByRole("link", { name: /GitHub/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://github.com/Jezzail");
  });

  it("renders LinkedIn contact link", () => {
    render(<StatsSection />);
    const link = screen.getByRole("link", { name: /LinkedIn/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://linkedin.com/in/pabloabril/");
  });

  it("renders Email contact link", () => {
    render(<StatsSection />);
    const link = screen.getByRole("link", { name: /Email/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "mailto:pat43607@gmail.com");
  });

  it("renders the section title", () => {
    render(<StatsSection />);
    expect(screen.getByText(/CHARACTER STATS/)).toBeInTheDocument();
  });

  it("renders character name and class", () => {
    render(<StatsSection />);
    expect(screen.getByText("Pablo Abril")).toBeInTheDocument();
    expect(screen.getByText("Senior Frontend Engineer")).toBeInTheDocument();
  });
});
