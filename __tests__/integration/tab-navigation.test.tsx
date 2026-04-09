/**
 * Integration test — Tab navigation in PortfolioScreen
 *
 * Verifies that clicking each tab in the portfolio renders the correct
 * section content. This ensures the tab state, TabNav, and section
 * components are wired together correctly.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PortfolioScreen } from "@/components/PortfolioScreen";

describe("PortfolioScreen tab navigation", () => {
  it("renders STATS section by default", () => {
    render(<PortfolioScreen onOpenChat={() => {}} />);
    expect(screen.getByText(/CHARACTER STATS/)).toBeInTheDocument();
  });

  it("switches to SKILLS section when SKILLS tab is clicked", async () => {
    const user = userEvent.setup();
    render(<PortfolioScreen onOpenChat={() => {}} />);

    await user.click(screen.getByText("SKILLS"));
    expect(screen.getByText(/SKILLS & ABILITIES/)).toBeInTheDocument();
  });

  it("switches to QUESTS section when QUESTS tab is clicked", async () => {
    const user = userEvent.setup();
    render(<PortfolioScreen onOpenChat={() => {}} />);

    await user.click(screen.getByText("QUESTS"));
    expect(screen.getByText(/QUEST LOG/)).toBeInTheDocument();
  });

  it("switches to ITEMS section when ITEMS tab is clicked", async () => {
    const user = userEvent.setup();
    render(<PortfolioScreen onOpenChat={() => {}} />);

    await user.click(screen.getByText("ITEMS"));
    expect(screen.getByText(/INVENTORY/)).toBeInTheDocument();
  });

  it("calls onOpenChat when ASK PABLO tab is clicked", async () => {
    const user = userEvent.setup();
    const onOpenChat = vi.fn();
    render(<PortfolioScreen onOpenChat={onOpenChat} />);

    await user.click(screen.getByText(/ASK PABLO/));
    expect(onOpenChat).toHaveBeenCalledOnce();
  });
});
