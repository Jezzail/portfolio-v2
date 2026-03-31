export type Screen = "title" | "portfolio";

export type PortfolioTab = "stats" | "skills" | "quests" | "items";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};
