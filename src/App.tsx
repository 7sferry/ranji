import React, {useRef, useState} from "react";
import {Helmet, HelmetProvider} from "react-helmet-async";
import {AppContext} from "./context";
import {useAppState} from "./hooks/useAppState";
import {Navbar} from "./components/Navbar";
import {HomePage} from "./components/HomePage";
import {TreePage} from "./components/TreePage";
import {exportAll, exportTree, validateImport} from "./utils/import-export";
import {generateId} from "./utils/id";

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
          const tree = { ...result.tree, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
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

  const currentTree = currentTreeId ? state.trees.find((t) => t.id === currentTreeId) : undefined;
  const pageTitle = currentTree
      ? `${currentTree.name} – Family Tree | Ranji`
      : "Ranji – Free Family Tree Builder | Visualize Your Genealogy Online";
  const pageDescription = currentTree
      ? `Explore the “${currentTree.name}” family tree with ${currentTree.persons.length} member${currentTree.persons.length === 1 ? "" : "s"} — built with Ranji, the free browser-based genealogy tool.`
      : "Build, visualize, and share beautiful family trees online for free. Ranji is a private, browser-based genealogy tool — add relatives, map relationships, export your tree as JSON. No sign-up, no tracking.";
  const canonicalUrl = "https://treefam.netlify.app/";

  return (
    <HelmetProvider>
    <AppContext.Provider value={{ state, dispatch, toggleTheme }}>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription}/>
        <link rel="canonical" href={canonicalUrl}/>
        <meta property="og:title" content={pageTitle}/>
        <meta property="og:description" content={pageDescription}/>
        <meta property="og:url" content={canonicalUrl}/>
        <meta name="twitter:title" content={pageTitle}/>
        <meta name="twitter:description" content={pageDescription}/>
      </Helmet>
      <div
          className="flex min-h-screen flex-col bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        <Navbar
          currentTreeId={currentTreeId}
          onGoHome={handleGoHome}
          onSelectTree={handleOpenTree}
          onImport={handleImport}
          onExportCurrent={handleExportCurrent}
          onExportAll={handleExportAll}
        />

        <main className="flex-1">
          {currentTreeId ? (
              <TreePage treeId={currentTreeId}/>
          ) : (
              <HomePage onOpenTree={handleOpenTree}/>
          )}
        </main>

        {!currentTreeId && (
            <footer
                className="border-t border-neutral-200 bg-white/60 py-4 dark:border-neutral-800 dark:bg-neutral-900/40">
              <div
                  className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 text-xs text-neutral-500 sm:flex-row dark:text-neutral-400">
                <span>© {new Date().getFullYear()} Ferry Suhandri — Ranji, free family tree builder.</span>
                <a
                    href="https://github.com/7sferry/ranji"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                    aria-label="Contribute on GitHub"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path
                        d="M12 .5C5.73.5.5 5.74.5 12.04c0 5.09 3.29 9.4 7.86 10.93.58.11.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.75.4-1.27.74-1.56-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.07 0 0 .97-.31 3.18 1.18a11 11 0 015.8 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.6.23 2.78.11 3.07.74.81 1.19 1.84 1.19 3.1 0 4.44-2.7 5.4-5.27 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56A11.55 11.55 0 0023.5 12.04C23.5 5.74 18.27.5 12 .5z"/>
                  </svg>
                  Contribute on GitHub
                </a>
              </div>
            </footer>
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
    </HelmetProvider>
  );
}
