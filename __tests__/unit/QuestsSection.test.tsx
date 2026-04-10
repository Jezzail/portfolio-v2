/**
 * Unit test — QuestsSection
 *
 * Verifies that quest cards render with their company names and status badges.
 * Quests represent work experience — each entry must be visible to visitors.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QuestsSection } from "@/components/QuestsSection";
import { quests } from "@/data/quests";

describe("QuestsSection", () => {
  it("renders each quest company name", () => {
    render(<QuestsSection />);

    const uniqueCompanies = [...new Set(quests.map((q) => q.company))];
    for (const company of uniqueCompanies) {
      const matches = screen.getAllByText(company);
      expect(matches.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("renders the section title", () => {
    render(<QuestsSection />);
    expect(screen.getByText(/QUEST LOG/)).toBeInTheDocument();
  });

  it("renders status badges for each quest", () => {
    render(<QuestsSection />);

    // Should have ACTIVE and COMPLETE badges
    expect(screen.getAllByText("ACTIVE").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("COMPLETE").length).toBeGreaterThanOrEqual(1);
  });

  it("renders quest roles via i18n keys", () => {
    render(<QuestsSection />);

    // Roles are translated — check that the English translations appear
    expect(
      screen.getByText("Sr. Frontend Engineer — React Native"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Frontend Engineer & Engineering Team Lead"),
    ).toBeInTheDocument();
  });
});
