import type { AppData } from "../types";

const STORAGE_KEY = "ranji_data";

export function getDefaultData(): AppData {
  return {
    version: 1,
    trees: [],
    settings: {
      theme: window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light",
    },
  };
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultData();
    const parsed = JSON.parse(raw);
    if (parsed.version === 1) return parsed as AppData;
    return getDefaultData();
  } catch {
    return getDefaultData();
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getStorageUsage(): number {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? new Blob([raw]).size : 0;
}
