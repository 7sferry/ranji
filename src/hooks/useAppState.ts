import { useReducer, useCallback, useEffect } from "react";
import type { AppData, FamilyTree, Person, Relationship } from "../types";
import { loadData, saveData } from "../utils/storage";

type Action =
  | { type: "SET_THEME"; theme: "light" | "dark" }
  | { type: "SET_LAST_OPENED_TREE"; treeId: string | undefined }
  | { type: "ADD_TREE"; tree: FamilyTree }
  | { type: "UPDATE_TREE"; treeId: string; updates: Partial<Pick<FamilyTree, "name" | "description">> }
  | { type: "DELETE_TREE"; treeId: string }
  | { type: "ADD_PERSON"; treeId: string; person: Person }
  | { type: "UPDATE_PERSON"; treeId: string; person: Person }
  | { type: "DELETE_PERSON"; treeId: string; personId: string }
  | { type: "ADD_RELATIONSHIP"; treeId: string; relationship: Relationship }
  | { type: "DELETE_RELATIONSHIP"; treeId: string; relationshipId: string }
  | { type: "IMPORT_TREE"; tree: FamilyTree }
  | { type: "REPLACE_ALL"; data: AppData };

function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case "SET_THEME":
      return { ...state, settings: { ...state.settings, theme: action.theme } };
    case "SET_LAST_OPENED_TREE":
      return { ...state, settings: { ...state.settings, lastOpenedTreeId: action.treeId } };
    case "ADD_TREE":
      return { ...state, trees: [...state.trees, action.tree] };
    case "UPDATE_TREE":
      return {
        ...state,
        trees: state.trees.map((t) =>
          t.id === action.treeId
            ? { ...t, ...action.updates, updatedAt: new Date().toISOString() }
            : t
        ),
      };
    case "DELETE_TREE":
      return {
        ...state,
        trees: state.trees.filter((t) => t.id !== action.treeId),
        settings: state.settings.lastOpenedTreeId === action.treeId
          ? { ...state.settings, lastOpenedTreeId: undefined }
          : state.settings,
      };
    case "ADD_PERSON":
      return {
        ...state,
        trees: state.trees.map((t) =>
          t.id === action.treeId
            ? { ...t, persons: [...t.persons, action.person], updatedAt: new Date().toISOString() }
            : t
        ),
      };
    case "UPDATE_PERSON":
      return {
        ...state,
        trees: state.trees.map((t) =>
          t.id === action.treeId
            ? { ...t, persons: t.persons.map((p) => p.id === action.person.id ? action.person : p), updatedAt: new Date().toISOString() }
            : t
        ),
      };
    case "DELETE_PERSON":
      return {
        ...state,
        trees: state.trees.map((t) =>
          t.id === action.treeId
            ? {
                ...t,
                persons: t.persons.filter((p) => p.id !== action.personId),
                relationships: t.relationships.filter(
                  (r) => r.fromPersonId !== action.personId && r.toPersonId !== action.personId
                ),
                updatedAt: new Date().toISOString(),
              }
            : t
        ),
      };
    case "ADD_RELATIONSHIP":
      return {
        ...state,
        trees: state.trees.map((t) =>
          t.id === action.treeId
            ? { ...t, relationships: [...t.relationships, action.relationship], updatedAt: new Date().toISOString() }
            : t
        ),
      };
    case "DELETE_RELATIONSHIP":
      return {
        ...state,
        trees: state.trees.map((t) =>
          t.id === action.treeId
            ? { ...t, relationships: t.relationships.filter((r) => r.id !== action.relationshipId), updatedAt: new Date().toISOString() }
            : t
        ),
      };
    case "IMPORT_TREE":
      return { ...state, trees: [...state.trees, action.tree] };
    case "REPLACE_ALL":
      return action.data;
    default:
      return state;
  }
}

export function useAppState() {
  const [state, dispatch] = useReducer(reducer, null, loadData);

  useEffect(() => {
    saveData(state);
  }, [state]);

  useEffect(() => {
    if (state.settings.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [state.settings.theme]);

  const toggleTheme = useCallback(() => {
    dispatch({ type: "SET_THEME", theme: state.settings.theme === "dark" ? "light" : "dark" });
  }, [state.settings.theme]);

  return { state, dispatch, toggleTheme };
}
