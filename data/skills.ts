import type { Skill } from "@/types";

export const skills: Skill[] = [
  // Frontend
  { name: "React.js", level: 9, category: "frontend" },
  { name: "TypeScript", level: 9, category: "frontend" },
  { name: "JavaScript", level: 9, category: "frontend" },
  { name: "Next.js", level: 8, category: "frontend" },
  { name: "Tailwind CSS", level: 8, category: "frontend" },
  { name: "Redux", level: 7, category: "frontend" },

  // Mobile
  { name: "React Native", level: 10, category: "mobile" },
  { name: "Performance Optimisation", level: 8, category: "mobile" },

  // Tooling
  { name: "Figma", level: 7, category: "tooling" },
  { name: "Node.js", level: 6, category: "tooling" },
  { name: "Firebase", level: 6, category: "tooling" },

  // Leadership
  { name: "Team Leadership", level: 8, category: "leadership" },
  { name: "Stakeholder Management", level: 7, category: "leadership" },
  { name: "Technical Project Management", level: 7, category: "leadership" },
];
