import type { Item, MagazineIssue } from "@/types";

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
    id: "missed-trigger",
    name: "magazine.name",
    rarity: "rare",
    description: "magazine.description",
    tech: ["InDesign", "Photoshop", "MTG"],
    hasMagazineReader: true,
  },
  {
    id: "locked",
    name: "itemNameLocked",
    rarity: "locked",
    description: "itemDescLocked",
    tech: [],
  },
];

export const magazineIssues: MagazineIssue[] = [
  {
    issue: 1,
    pages: 16,
    url: "https://bt2q38klkelqmgof.public.blob.vercel-storage.com/missed-trigger-1.pdf",
    labelKey: "issue1",
  },
  {
    issue: 2,
    pages: 24,
    url: "https://bt2q38klkelqmgof.public.blob.vercel-storage.com/missed-trigger-2.pdf",
    labelKey: "issue2",
  },
  {
    issue: 3,
    pages: 20,
    url: "https://bt2q38klkelqmgof.public.blob.vercel-storage.com/missed-trigger-3.pdf",
    labelKey: "issue3",
  },
  {
    issue: 4,
    pages: 34,
    url: "https://bt2q38klkelqmgof.public.blob.vercel-storage.com/missed-trigger-4.pdf",
    labelKey: "issue4",
  },
];
