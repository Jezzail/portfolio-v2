import type { Quest } from "@/types";

export const quests: Quest[] = [
  {
    id: "globaleur-rn",
    company: "Globaleur",
    role: "questRoleSrFrontend",
    start: "2024.12",
    location: "Seoul, KR",
    status: "current",
    objectives: ["questObjTaba", "questObjSoleFe", "questObj80Tasks"],
  },
  {
    id: "globaleur-lead",
    company: "Globaleur",
    role: "questRoleLeadFe",
    start: "2022.09",
    end: "2024.12",
    location: "Seoul, KR",
    status: "completed",
    objectives: ["questObjLed8", "questObjSprints", "questObjMentoring"],
  },
  {
    id: "knapp",
    company: "KNAPP AG",
    role: "questRoleSystems",
    start: "2017.10",
    end: "2021.04",
    location: "Madrid, ES / Global",
    status: "completed",
    objectives: [
      "questObjWarehouse",
      "questObjDeployed",
      "questObjStakeholder",
    ],
  },
  {
    id: "cosentino",
    company: "Cosentino",
    role: "questRoleWebDev",
    start: "2013.12",
    end: "2017.06",
    location: "Almería, ES",
    status: "completed",
    objectives: ["questObjInternalApps", "questObjIntranet"],
  },
];
