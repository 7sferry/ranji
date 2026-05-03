export interface Person {
  id: string;
  name: string;
  nickname?: string;
  gender: "male" | "female" | "other";
  birthDate?: string;
  deathDate?: string;
  photo?: string;
  notes?: string;
}

export interface Relationship {
  id: string;
  type: "parent-child" | "spouse";
  fromPersonId: string;
  toPersonId: string;
}

export interface FamilyTree {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  persons: Person[];
  relationships: Relationship[];
}

export interface AppSettings {
  theme: "light" | "dark";
  lastOpenedTreeId?: string;
}

export interface AppData {
  version: 1;
  trees: FamilyTree[];
  settings: AppSettings;
}
