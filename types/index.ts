export type Screen = "title" | "portfolio";

export type PortfolioTab = "stats" | "skills" | "quests" | "items";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type SkillCategory = "frontend" | "mobile" | "tooling" | "leadership";

export type Skill = {
  name: string;
  level: number;
  category: SkillCategory;
  description?: string;
};
