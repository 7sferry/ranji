import React from "react";
import type { FamilyTree, Person } from "../types";

interface ListViewProps {
  tree: FamilyTree;
  searchQuery: string;
  onSelectPerson: (person: Person) => void;
}

export function ListView({ tree, searchQuery, onSelectPerson }: ListViewProps) {
  const filtered = tree.persons.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      (p.nickname?.toLowerCase().includes(q) ?? false)
    );
  });

  function getParents(person: Person): Person[] {
    return tree.relationships
      .filter((r) => r.type === "parent-child" && r.toPersonId === person.id)
      .map((r) => tree.persons.find((p) => p.id === r.fromPersonId))
      .filter(Boolean) as Person[];
  }

  function getSpouses(person: Person): Person[] {
    return tree.relationships
      .filter((r) => r.type === "spouse" && (r.fromPersonId === person.id || r.toPersonId === person.id))
      .map((r) => {
        const otherId = r.fromPersonId === person.id ? r.toPersonId : r.fromPersonId;
        return tree.persons.find((p) => p.id === otherId);
      })
      .filter(Boolean) as Person[];
  }

  function getChildren(person: Person): Person[] {
    return tree.relationships
      .filter((r) => r.type === "parent-child" && r.fromPersonId === person.id)
      .map((r) => tree.persons.find((p) => p.id === r.toPersonId))
      .filter(Boolean) as Person[];
  }

  if (tree.persons.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-neutral-500 dark:text-neutral-400">No members yet. Add your first family member.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left dark:border-neutral-700">
              <th className="px-3 py-2 font-medium text-neutral-600 dark:text-neutral-400">Name</th>
              <th className="px-3 py-2 font-medium text-neutral-600 dark:text-neutral-400">Gender</th>
              <th className="px-3 py-2 font-medium text-neutral-600 dark:text-neutral-400">Birth</th>
              <th className="px-3 py-2 font-medium text-neutral-600 dark:text-neutral-400">Death</th>
              <th className="px-3 py-2 font-medium text-neutral-600 dark:text-neutral-400">Parents</th>
              <th className="px-3 py-2 font-medium text-neutral-600 dark:text-neutral-400">Spouse(s)</th>
              <th className="px-3 py-2 font-medium text-neutral-600 dark:text-neutral-400">Children</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((person) => (
              <tr
                key={person.id}
                onClick={() => onSelectPerson(person)}
                className="cursor-pointer border-b border-neutral-100 transition hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/50"
              >
                <td className="px-3 py-2 font-medium text-neutral-900 dark:text-neutral-100">
                  {person.firstName} {person.lastName}
                  {person.nickname && <span className="ml-1 text-xs text-neutral-500">({person.nickname})</span>}
                </td>
                <td className="px-3 py-2 capitalize text-neutral-700 dark:text-neutral-300">{person.gender}</td>
                <td className="px-3 py-2 text-neutral-700 dark:text-neutral-300">{person.birthDate ?? "-"}</td>
                <td className="px-3 py-2 text-neutral-700 dark:text-neutral-300">{person.deathDate ?? "-"}</td>
                <td className="px-3 py-2 text-neutral-600 dark:text-neutral-400">
                  {getParents(person).map((p) => `${p.firstName} ${p.lastName}`).join(", ") || "-"}
                </td>
                <td className="px-3 py-2 text-neutral-600 dark:text-neutral-400">
                  {getSpouses(person).map((p) => `${p.firstName} ${p.lastName}`).join(", ") || "-"}
                </td>
                <td className="px-3 py-2 text-neutral-600 dark:text-neutral-400">
                  {getChildren(person).map((p) => `${p.firstName} ${p.lastName}`).join(", ") || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && searchQuery && (
        <p className="mt-4 text-center text-sm text-neutral-500">No results for "{searchQuery}"</p>
      )}
    </div>
  );
}
