/**
 * Unit test — SkillsSection
 *
 * Verifies that every skill from data/skills.ts renders with its name
 * and a visible XP bar. Skills are the core of the RPG-themed portfolio,
 * so each one must appear with its level indicator.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SkillsSection } from "@/components/SkillsSection";
import { skills } from "@/data/skills";

describe("SkillsSection", () => {
  it("renders each skill by name", () => {
    render(<SkillsSection />);

    for (const skill of skills) {
      expect(screen.getByText(skill.name)).toBeInTheDocument();
    }
  });

  it("renders an XP bar for each skill", () => {
    const { container } = render(<SkillsSection />);

    // Each skill row has a bar container (border-2 border-border with an inner fill div)
    const barContainers = container.querySelectorAll(
      ".border-2.border-border.overflow-hidden",
    );
    expect(barContainers.length).toBe(skills.length);
  });

  it("renders the level number for each skill", () => {
    render(<SkillsSection />);

    // Multiple skills can share the same level, so use getAllByText
    const uniqueLevels = [...new Set(skills.map((s) => s.level))];
    for (const level of uniqueLevels) {
      const count = skills.filter((s) => s.level === level).length;
      const matches = screen.getAllByText(`LVL ${level}`);
      expect(matches.length).toBe(count);
    }
  });

  it("renders the section title", () => {
    render(<SkillsSection />);
    expect(screen.getByText(/SKILLS & ABILITIES/)).toBeInTheDocument();
  });
});
