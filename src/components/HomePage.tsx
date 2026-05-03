import React, { useState } from "react";
import { useApp } from "../context";
import type { FamilyTree } from "../types";
import { generateId } from "../utils/id";

interface HomePageProps {
  onOpenTree: (id: string) => void;
}

export function HomePage({ onOpenTree }: HomePageProps) {
  const { state, dispatch } = useApp();
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  function handleCreate() {
    if (!newName.trim()) return;
    const tree: FamilyTree = {
      id: generateId(),
      name: newName.trim(),
      description: newDesc.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      persons: [],
      relationships: [],
    };
    dispatch({ type: "ADD_TREE", tree });
    setNewName("");
    setNewDesc("");
    setShowNewDialog(false);
    onOpenTree(tree.id);
  }

  function handleRename(id: string) {
    if (!editName.trim()) return;
    dispatch({ type: "UPDATE_TREE", treeId: id, updates: { name: editName.trim() } });
    setEditingId(null);
  }

  function handleDelete(id: string) {
    dispatch({ type: "DELETE_TREE", treeId: id });
    setDeleteConfirm(null);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Your Family Trees</h1>
        <button
          onClick={() => setShowNewDialog(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          + New Tree
        </button>
      </div>

      {state.trees.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 py-20 dark:border-neutral-700">
          <svg className="mb-4 h-16 w-16 text-neutral-400 dark:text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="mb-2 text-lg font-medium text-neutral-600 dark:text-neutral-400">No family trees yet</p>
          <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-500">Create your first family tree to get started</p>
          <button
            onClick={() => setShowNewDialog(true)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            Create Family Tree
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {state.trees.map((tree) => (
            <div
              key={tree.id}
              className="group cursor-pointer rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-indigo-700"
              onClick={() => onOpenTree(tree.id)}
            >
              {editingId === tree.id ? (
                <div onClick={(e) => e.stopPropagation()}>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleRename(tree.id)}
                    className="mb-2 w-full rounded border border-neutral-300 bg-transparent px-2 py-1 text-sm dark:border-neutral-600"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleRename(tree.id)} className="text-xs text-indigo-600 dark:text-indigo-400">Save</button>
                    <button onClick={() => setEditingId(null)} className="text-xs text-neutral-500">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="mb-1 font-semibold text-neutral-900 dark:text-neutral-100">{tree.name}</h3>
                  {tree.description && <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">{tree.description}</p>}
                  <div className="mb-3 flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                    <span>{tree.persons.length} member{tree.persons.length !== 1 ? "s" : ""}</span>
                    <span>Updated {new Date(tree.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2 opacity-0 transition group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => { setEditingId(tree.id); setEditName(tree.name); }}
                      className="rounded px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(tree.id)}
                      className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Tree Dialog */}
      {showNewDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowNewDialog(false)}>
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-900" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">New Family Tree</h2>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Tree name"
              className="mb-3 w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-600"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <input
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Description (optional)"
              className="mb-4 w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-600"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNewDialog(false)} className="rounded-lg px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800">Cancel</button>
              <button onClick={handleCreate} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteConfirm(null)}>
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-900" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">Delete Tree?</h2>
            <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">This action cannot be undone. All members and relationships will be lost.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="rounded-lg px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
