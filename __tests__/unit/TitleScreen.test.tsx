/**
 * Unit test — TitleScreen
 *
 * Verifies the title screen renders its key UI elements:
 * the "PRESS START" prompt and the save slot info (level, role, etc.).
 * These are the first things a visitor sees, so we make sure they appear.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TitleScreen } from "@/components/TitleScreen";

describe("TitleScreen", () => {
  it("renders the PRESS START text", () => {
    render(<TitleScreen onStart={() => {}} />);
    expect(screen.getByText("PRESS START")).toBeInTheDocument();
  });

  it("renders the save slot with game name and level", () => {
    render(<TitleScreen onStart={() => {}} />);
    expect(screen.getByText("LV 37")).toBeInTheDocument();
    expect(screen.getAllByText("PABLO ABRIL").length).toBeGreaterThanOrEqual(1);
  });

  it("renders role and location in the save slot", () => {
    render(<TitleScreen onStart={() => {}} />);
    expect(screen.getByText("SR. FRONTEND ENGINEER")).toBeInTheDocument();
    expect(screen.getByText("SEOUL, KR")).toBeInTheDocument();
  });

  it("calls onStart when clicked", async () => {
    const onStart = vi.fn();
    render(<TitleScreen onStart={onStart} />);

    const button = screen.getByRole("button", { name: /press start/i });
    await button.click();
    expect(onStart).toHaveBeenCalledOnce();
  });
});
