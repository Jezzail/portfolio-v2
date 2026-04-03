import type { Item } from "@/types";

export const items: Item[] = [
  {
    id: "taba",
    name: "itemNameTaba",
    rarity: "legendary",
    description: "itemDescTaba",
    tech: ["React Native", "TypeScript", "Redux", "Firebase"],
    link: "https://www.tabataxi.app/",
    linkNote: "itemLinkNoteTaba",
  },
  {
    id: "portfolio",
    name: "itemNamePortfolio",
    rarity: "rare",
    description: "itemDescPortfolio",
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    link: "https://github.com/Jezzail/portfolio",
  },
  {
    id: "globaleur",
    name: "itemNameGlobaleur",
    rarity: "uncommon",
    description: "itemDescGlobaleur",
    tech: ["React.js", "TypeScript", "Node.js"],
    link: "https://www.globaleur.com/",
    linkNote: "itemLinkNoteGlobaleur",
  },
  {
    id: "locked",
    name: "itemNameLocked",
    rarity: "locked",
    description: "itemDescLocked",
    tech: [],
  },
];
