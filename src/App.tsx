import React, { useState, useRef } from "react";
import { AppContext } from "./context";
import { useAppState } from "./hooks/useAppState";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./components/HomePage";
import { TreePage } from "./components/TreePage";
import { exportTree, exportAll, validateImport } from "./utils/import-export";

export default function App() {
  const { state, dispatch, toggleTheme } = useAppState();
  const [currentTreeId, setCurrentTreeId] = useState<string | undefined>(state.settings.lastOpenedTreeId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

  function handleOpenTree(id: string) {
    setCurrentTreeId(id);
    dispatch({ type: "SET_LAST_OPENED_TREE", treeId: id });
  }

  function handleGoHome() {
    setCurrentTreeId(undefined);
    dispatch({ type: "SET_LAST_OPENED_TREE", treeId: undefined });
  }

  function handleImport() {
    fileInputRef.current?.click();
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        const result = validateImport(parsed);
        if (result.type === "error") {
          setImportError(result.message);
          setTimeout(() => setImportError(null), 4000);
        } else if (result.type === "tree") {
          // Assign new ID to avoid conflicts
          const tree = { ...result.tree, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
          dispatch({ type: "IMPORT_TREE", tree });
          handleOpenTree(tree.id);
        } else {
          if (confirm("This will replace ALL your data. Are you sure?")) {
            dispatch({ type: "REPLACE_ALL", data: result.data });
            setCurrentTreeId(undefined);
          }
        }
      } catch {
        setImportError("Failed to parse JSON file");
        setTimeout(() => setImportError(null), 4000);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function handleExportCurrent() {
    const tree = state.trees.find((t) => t.id === currentTreeId);
    if (tree) exportTree(tree);
  }

  function handleExportAll() {
    exportAll(state);
  }

  return (
    <AppContext.Provider value={{ state, dispatch, toggleTheme }}>
      <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        <Navbar
          currentTreeId={currentTreeId}
          onGoHome={handleGoHome}
          onSelectTree={handleOpenTree}
          onImport={handleImport}
          onExportCurrent={handleExportCurrent}
          onExportAll={handleExportAll}
        />

        {currentTreeId ? (
          <TreePage treeId={currentTreeId} />
        ) : (
          <HomePage onOpenTree={handleOpenTree} />
        )}

        {/* Hidden file input for import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileSelected}
        />

        {/* Import error toast */}
        {importError && (
          <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white shadow-lg">
            {importError}
          </div>
        )}
      </div>
    </AppContext.Provider>
  );
}
