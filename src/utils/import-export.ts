import type { AppData, FamilyTree } from "../types";

export function exportTree(tree: FamilyTree): void {
  const json = JSON.stringify(tree, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `ranji-${tree.name.toLowerCase().replace(/\s+/g, "-")}-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAll(data: AppData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `ranji-backup-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function validateImport(data: unknown): { type: "tree"; tree: FamilyTree } | { type: "all"; data: AppData } | { type: "error"; message: string } {
  if (!data || typeof data !== "object") {
    return { type: "error", message: "Invalid JSON structure" };
  }

  // Check if it's a full AppData export
  if ("version" in data && (data as AppData).version === 1 && "trees" in data) {
    const appData = data as AppData;
    if (!Array.isArray(appData.trees)) {
      return { type: "error", message: "Invalid trees array" };
    }
    return { type: "all", data: appData };
  }

  // Check if it's a single tree
  if ("id" in data && "persons" in data && "relationships" in data) {
    const tree = data as FamilyTree;
    if (!tree.name || !Array.isArray(tree.persons) || !Array.isArray(tree.relationships)) {
      return { type: "error", message: "Invalid tree structure" };
    }
    return { type: "tree", tree };
  }

  return { type: "error", message: "Unrecognized format. Expected a Ranji tree or backup file." };
}
