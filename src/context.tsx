import { createContext, useContext, type Dispatch } from "react";
import type { AppData } from "./types";

type Action =
  | { type: "SET_THEME"; theme: "light" | "dark" }
  | { type: "SET_LAST_OPENED_TREE"; treeId: string | undefined }
  | { type: "ADD_TREE"; tree: import("./types").FamilyTree }
  | { type: "UPDATE_TREE"; treeId: string; updates: Partial<Pick<import("./types").FamilyTree, "name" | "description">> }
  | { type: "DELETE_TREE"; treeId: string }
  | { type: "ADD_PERSON"; treeId: string; person: import("./types").Person }
  | { type: "UPDATE_PERSON"; treeId: string; person: import("./types").Person }
  | { type: "DELETE_PERSON"; treeId: string; personId: string }
  | { type: "ADD_RELATIONSHIP"; treeId: string; relationship: import("./types").Relationship }
  | { type: "DELETE_RELATIONSHIP"; treeId: string; relationshipId: string }
  | { type: "IMPORT_TREE"; tree: import("./types").FamilyTree }
  | { type: "REPLACE_ALL"; data: AppData };

interface AppContextValue {
  state: AppData;
  dispatch: Dispatch<Action>;
  toggleTheme: () => void;
}

export const AppContext = createContext<AppContextValue>(null!);

export function useApp() {
  return useContext(AppContext);
}
