import React, {useState} from "react";
import {useApp} from "../context";
import type {FamilyTree} from "../types";
import {generateId} from "../utils/id";

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
	    <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Your Family Trees</h1>
        <button
          onClick={() => setShowNewDialog(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          + New Tree
        </button>
	    </div>

	    <div
			    className="mb-8 rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/30">
		    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-900 dark:text-indigo-200">
			    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
			         aria-hidden="true">
				    <path strokeLinecap="round" strokeLinejoin="round"
				          d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75M6.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/>
			    </svg>
			    Your data stays with you
		    </div>
		    <ul className="grid grid-cols-1 gap-2 text-xs text-indigo-900/80 sm:grid-cols-2 lg:grid-cols-4 dark:text-indigo-200/80">
			    <li className="flex items-start gap-2">
				    <svg className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24"
				         fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
					    <path strokeLinecap="round" strokeLinejoin="round"
					          d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25"/>
				    </svg>
				    <span>100% client-side — runs entirely in your browser.</span>
			    </li>
			    <li className="flex items-start gap-2">
				    <svg className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24"
				         fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
					    <path strokeLinecap="round" strokeLinejoin="round"
					          d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"/>
				    </svg>
				    <span>No servers, no cloud — nothing is uploaded.</span>
			    </li>
			    <li className="flex items-start gap-2">
				    <svg className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24"
				         fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
					    <path strokeLinecap="round" strokeLinejoin="round"
					          d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"/>
				    </svg>
				    <span>All trees are stored in your browser's local storage.</span>
			    </li>
			    <li className="flex items-start gap-2">
				    <svg className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24"
				         fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
					    <path strokeLinecap="round" strokeLinejoin="round"
					          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/>
				    </svg>
				    <span>No account, no sign-up — just open and start.</span>
			    </li>
		    </ul>
		    <p className="mt-3 text-[11px] text-indigo-900/60 dark:text-indigo-200/60">
			    Clearing your browser data will erase your trees. Use <span className="font-medium">Export</span> from the
			    navbar to keep a backup.
		    </p>
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
