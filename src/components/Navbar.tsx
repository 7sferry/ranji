import React from "react";
import { useApp } from "../context";

interface NavbarProps {
  currentTreeId?: string;
  onGoHome: () => void;
  onSelectTree: (id: string) => void;
  onImport: () => void;
  onExportCurrent: () => void;
  onExportAll: () => void;
}

export function Navbar({ currentTreeId, onGoHome, onSelectTree, onImport, onExportCurrent, onExportAll }: NavbarProps) {
  const { state, toggleTheme } = useApp();
  const [showTreeMenu, setShowTreeMenu] = React.useState(false);
  const [showExportMenu, setShowExportMenu] = React.useState(false);

  const currentTree = state.trees.find((t) => t.id === currentTreeId);

  return (
    <nav className="sticky top-0 z-50 h-14 border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        {/* Left: Logo */}
        <button onClick={onGoHome} className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
          Ranji
        </button>

        {/* Center: Tree switcher */}
        {currentTree && (
          <div className="relative">
            <button
              onClick={() => setShowTreeMenu(!showTreeMenu)}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              {currentTree.name}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showTreeMenu && (
              <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 rounded-lg border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                {state.trees.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { onSelectTree(t.id); setShowTreeMenu(false); }}
                    className={`block w-full rounded-md px-3 py-1.5 text-left text-sm whitespace-nowrap ${t.id === currentTreeId ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"}`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Import/Export */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              title="Import / Export"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                <button onClick={() => { onImport(); setShowExportMenu(false); }} className="block w-full rounded-md px-3 py-1.5 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700">
                  Import JSON...
                </button>
                {currentTree && (
                  <button onClick={() => { onExportCurrent(); setShowExportMenu(false); }} className="block w-full rounded-md px-3 py-1.5 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700">
                    Export Current Tree
                  </button>
                )}
                <button onClick={() => { onExportAll(); setShowExportMenu(false); }} className="block w-full rounded-md px-3 py-1.5 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700">
                  Export All Data
                </button>
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            title="Toggle theme"
          >
            {state.settings.theme === "dark" ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
