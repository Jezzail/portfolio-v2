export type Screen = "title" | "portfolio";

export type PortfolioTab = "stats" | "skills" | "quests" | "items";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type AvatarEmotion =
  | "neutral"
  | "happy"
  | "thinking"
  | "sad"
  | "surprised"
  | "confused"
  | "confident"
  | "laughing"
  | "focused"
  | "embarrassed"
  | "explaining"
  | "chad"
  | "error";

export type SkillCategory = "mobile_frontend" | "product" | "leadership";

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

export type ItemRarity = "legendary" | "rare" | "uncommon" | "locked";

export type Item = {
  id: string;
  name: string;
  rarity: ItemRarity;
  description: string;
  tech: string[];
  link?: string;
  linkNote?: string;
  hasMagazineReader?: boolean;
};

export type MagazineIssue = {
  issue: number;
  pages: number;
  url: string;
  labelKey: string;
};
