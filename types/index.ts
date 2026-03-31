export type Screen = "title" | "portfolio" | "chat";

export type PortfolioTab = "stats" | "skills" | "quests" | "items";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};
