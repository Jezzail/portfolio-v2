import type { Skill } from "@/types";

export const skills: Skill[] = [
  // Mobile & Frontend
  { name: "React Native", level: 9, category: "mobile_frontend" },
  { name: "React.js", level: 9, category: "mobile_frontend" },
  { name: "TypeScript", level: 9, category: "mobile_frontend" },
  { name: "Next.js", level: 8, category: "mobile_frontend" },

  // AI & Tooling
  { name: "GitHub Copilot", level: 8, category: "ai_tooling" },
  { name: "Claude / Anthropic API", level: 8, category: "ai_tooling" },
  { name: "AI-directed Development", level: 8, category: "ai_tooling" },

  // Shipping Product
  { name: "App Store Releases", level: 9, category: "product" },
  { name: "Performance Optimisation", level: 8, category: "product" },
  { name: "CI/CD & Testing", level: 7, category: "product" },

  // Leadership
  { name: "Cross-functional Alignment", level: 8, category: "leadership" },
  { name: "Stakeholder Communication", level: 8, category: "leadership" },
  { name: "Team Coordination", level: 8, category: "leadership" },
];
