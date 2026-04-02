export type Screen = "title" | "portfolio";

export type PortfolioTab = "stats" | "skills" | "quests" | "items";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type SkillCategory = "frontend" | "mobile" | "tooling" | "leadership";

export type SkillLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type Skill = {
  name: string;
  level: SkillLevel;
  category: SkillCategory;
  description?: string;
};

export type QuestStatus = "current" | "completed";

export type QuestFilter = "all" | "current" | "completed";

export type Quest = {
  id: string;
  company: string;
  role: string;
  start: string;
  end?: string;
  location: string;
  status: QuestStatus;
  objectives: string[];
};
