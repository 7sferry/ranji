import React, { useState } from "react";
import { useApp } from "../context";
import type { Person } from "../types";
import { TreeCanvas } from "./TreeCanvas";
import { ListView } from "./ListView";
import { PersonForm } from "./PersonForm";

interface TreePageProps {
  treeId: string;
}

export function TreePage({ treeId }: TreePageProps) {
  const { state } = useApp();
  const tree = state.trees.find((t) => t.id === treeId);
  const [view, setView] = useState<"canvas" | "list">("canvas");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  if (!tree) return <div className="p-8 text-center text-neutral-500">Tree not found</div>;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-neutral-200 px-4 py-2 dark:border-neutral-800">
        <button
          onClick={() => setShowAddForm(true)}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          + Add Person
        </button>

        <div className="mx-2 h-5 w-px bg-neutral-200 dark:bg-neutral-700" />

        {/* View toggle */}
        <div className="flex rounded-lg border border-neutral-200 dark:border-neutral-700">
          <button
            onClick={() => setView("canvas")}
            className={`rounded-l-lg px-3 py-1 text-xs font-medium ${view === "canvas" ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100" : "text-neutral-600 dark:text-neutral-400"}`}
          >
            Tree
          </button>
          <button
            onClick={() => setView("list")}
            className={`rounded-r-lg px-3 py-1 text-xs font-medium ${view === "list" ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100" : "text-neutral-600 dark:text-neutral-400"}`}
          >
            List
          </button>
        </div>

        <div className="mx-2 h-5 w-px bg-neutral-200 dark:bg-neutral-700" />

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search people..."
            className="w-full rounded-lg border border-neutral-200 bg-transparent py-1.5 pl-8 pr-3 text-sm dark:border-neutral-700"
          />
        </div>

        <span className="ml-auto text-xs text-neutral-500 dark:text-neutral-400">
          {tree.persons.length} member{tree.persons.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1">
        {view === "canvas" ? (
          <TreeCanvas tree={tree} searchQuery={searchQuery} onSelectPerson={setSelectedPerson} />
        ) : (
          <ListView tree={tree} searchQuery={searchQuery} onSelectPerson={setSelectedPerson} />
        )}
      </div>

      {/* Person Form Panel */}
      {(selectedPerson || showAddForm) && (
        <PersonForm
          treeId={treeId}
          person={selectedPerson ?? undefined}
          onClose={() => { setSelectedPerson(null); setShowAddForm(false); }}
        />
      )}
    </div>
  );
}
