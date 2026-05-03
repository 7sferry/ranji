import React, { useState } from "react";
import type { Person, FamilyTree, Relationship } from "../types";
import { useApp } from "../context";

interface PersonFormProps {
  treeId: string;
  person?: Person;
  onClose: () => void;
}

export function PersonForm({ treeId, person, onClose }: PersonFormProps) {
  const { state, dispatch } = useApp();
  const tree = state.trees.find((t) => t.id === treeId)!;

  const [firstName, setFirstName] = useState(person?.firstName ?? "");
  const [lastName, setLastName] = useState(person?.lastName ?? "");
  const [nickname, setNickname] = useState(person?.nickname ?? "");
  const [gender, setGender] = useState<Person["gender"]>(person?.gender ?? "other");
  const [birthDate, setBirthDate] = useState(person?.birthDate ?? "");
  const [deathDate, setDeathDate] = useState(person?.deathDate ?? "");
  const [notes, setNotes] = useState(person?.notes ?? "");
  const [photo, setPhoto] = useState(person?.photo ?? "");

  // Relationship management
  const [addRelType, setAddRelType] = useState<"parent" | "spouse" | "child" | null>(null);
  const [selectedRelPerson, setSelectedRelPerson] = useState("");

  const existingRels = person
    ? tree.relationships.filter((r) => r.fromPersonId === person.id || r.toPersonId === person.id)
    : [];

  function getRelatedPersons(): { parents: Person[]; spouses: Person[]; children: Person[] } {
    if (!person) return { parents: [], spouses: [], children: [] };
    const parents: Person[] = [];
    const spouses: Person[] = [];
    const children: Person[] = [];

    for (const rel of existingRels) {
      if (rel.type === "parent-child") {
        if (rel.fromPersonId === person.id) {
          const child = tree.persons.find((p) => p.id === rel.toPersonId);
          if (child) children.push(child);
        } else {
          const parent = tree.persons.find((p) => p.id === rel.fromPersonId);
          if (parent) parents.push(parent);
        }
      } else if (rel.type === "spouse") {
        const otherId = rel.fromPersonId === person.id ? rel.toPersonId : rel.fromPersonId;
        const spouse = tree.persons.find((p) => p.id === otherId);
        if (spouse) spouses.push(spouse);
      }
    }
    return { parents, spouses, children };
  }

  function handleSave() {
    if (!firstName.trim() || !lastName.trim()) return;
    const personData: Person = {
      id: person?.id ?? crypto.randomUUID(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      nickname: nickname.trim() || undefined,
      gender,
      birthDate: birthDate || undefined,
      deathDate: deathDate || undefined,
      notes: notes.trim() || undefined,
      photo: photo || undefined,
    };

    if (person) {
      dispatch({ type: "UPDATE_PERSON", treeId, person: personData });
    } else {
      dispatch({ type: "ADD_PERSON", treeId, person: personData });
    }
    onClose();
  }

  function handleDelete() {
    if (person && confirm("Delete this person and all their relationships?")) {
      dispatch({ type: "DELETE_PERSON", treeId, personId: person.id });
      onClose();
    }
  }

  function handleAddRelationship() {
    if (!person || !selectedRelPerson || !addRelType) return;
    const rel: Relationship = {
      id: crypto.randomUUID(),
      type: addRelType === "spouse" ? "spouse" : "parent-child",
      fromPersonId: addRelType === "child" ? person.id : (addRelType === "parent" ? selectedRelPerson : person.id),
      toPersonId: addRelType === "child" ? selectedRelPerson : (addRelType === "parent" ? person.id : selectedRelPerson),
    };
    dispatch({ type: "ADD_RELATIONSHIP", treeId, relationship: rel });
    setAddRelType(null);
    setSelectedRelPerson("");
  }

  function handleRemoveRelationship(relId: string) {
    dispatch({ type: "DELETE_RELATIONSHIP", treeId, relationshipId: relId });
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 200;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d")!;
        const scale = Math.max(size / img.width, size / img.height);
        const x = (size - img.width * scale) / 2;
        const y = (size - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        setPhoto(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  const related = person ? getRelatedPersons() : { parents: [] as Person[], spouses: [] as Person[], children: [] as Person[] };
  const availableForRel = tree.persons.filter((p) => p.id !== person?.id);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/50" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl dark:bg-neutral-900 sm:rounded-l-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {person ? "Edit Person" : "Add Person"}
          </h2>
          <button onClick={onClose} className="rounded p-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Photo */}
        <div className="mb-4 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
            {photo ? (
              <img src={photo} alt="Photo" className="h-full w-full object-cover" />
            ) : (
              <span className="text-lg font-bold text-neutral-500 dark:text-neutral-400">
                {firstName?.[0] ?? ""}{lastName?.[0] ?? ""}
              </span>
            )}
          </div>
          <label className="cursor-pointer rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-800">
            Upload Photo
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>
          {photo && (
            <button onClick={() => setPhoto("")} className="text-xs text-red-500">Remove</button>
          )}
        </div>

        {/* Form fields */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">First Name *</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-600" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">Last Name *</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-600" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">Nickname</label>
            <input value={nickname} onChange={(e) => setNickname(e.target.value)} className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-600" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value as Person["gender"])} className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-600">
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">Birth Date</label>
              <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-600" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">Death Date</label>
              <input type="date" value={deathDate} onChange={(e) => setDeathDate(e.target.value)} className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-600" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-600" />
          </div>
        </div>

        {/* Relationships (only in edit mode) */}
        {person && (
          <div className="mt-6 border-t border-neutral-200 pt-4 dark:border-neutral-700">
            <h3 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">Relationships</h3>

            {related.parents.length > 0 && (
              <div className="mb-3">
                <p className="mb-1 text-xs font-medium text-neutral-500">Parents</p>
                {related.parents.map((p) => {
                  const rel = existingRels.find((r) => r.type === "parent-child" && r.fromPersonId === p.id && r.toPersonId === person.id);
                  return (
                    <div key={p.id} className="flex items-center justify-between rounded px-2 py-1 text-sm text-neutral-700 dark:text-neutral-300">
                      <span>{p.firstName} {p.lastName}</span>
                      {rel && <button onClick={() => handleRemoveRelationship(rel.id)} className="text-xs text-red-500">Remove</button>}
                    </div>
                  );
                })}
              </div>
            )}

            {related.spouses.length > 0 && (
              <div className="mb-3">
                <p className="mb-1 text-xs font-medium text-neutral-500">Spouses</p>
                {related.spouses.map((p) => {
                  const rel = existingRels.find((r) => r.type === "spouse" && (r.fromPersonId === p.id || r.toPersonId === p.id));
                  return (
                    <div key={p.id} className="flex items-center justify-between rounded px-2 py-1 text-sm text-neutral-700 dark:text-neutral-300">
                      <span>{p.firstName} {p.lastName}</span>
                      {rel && <button onClick={() => handleRemoveRelationship(rel.id)} className="text-xs text-red-500">Remove</button>}
                    </div>
                  );
                })}
              </div>
            )}

            {related.children.length > 0 && (
              <div className="mb-3">
                <p className="mb-1 text-xs font-medium text-neutral-500">Children</p>
                {related.children.map((p) => {
                  const rel = existingRels.find((r) => r.type === "parent-child" && r.fromPersonId === person.id && r.toPersonId === p.id);
                  return (
                    <div key={p.id} className="flex items-center justify-between rounded px-2 py-1 text-sm text-neutral-700 dark:text-neutral-300">
                      <span>{p.firstName} {p.lastName}</span>
                      {rel && <button onClick={() => handleRemoveRelationship(rel.id)} className="text-xs text-red-500">Remove</button>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add relationship */}
            {addRelType ? (
              <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                <p className="mb-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  Add {addRelType}
                </p>
                <select
                  value={selectedRelPerson}
                  onChange={(e) => setSelectedRelPerson(e.target.value)}
                  className="mb-2 w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-600"
                >
                  <option value="">Select person...</option>
                  {availableForRel.map((p) => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button onClick={handleAddRelationship} className="rounded bg-indigo-600 px-3 py-1 text-xs text-white hover:bg-indigo-700">Add</button>
                  <button onClick={() => { setAddRelType(null); setSelectedRelPerson(""); }} className="text-xs text-neutral-500">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setAddRelType("parent")} className="rounded-lg border border-neutral-300 px-3 py-1 text-xs text-neutral-600 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-800">+ Parent</button>
                <button onClick={() => setAddRelType("spouse")} className="rounded-lg border border-neutral-300 px-3 py-1 text-xs text-neutral-600 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-800">+ Spouse</button>
                <button onClick={() => setAddRelType("child")} className="rounded-lg border border-neutral-300 px-3 py-1 text-xs text-neutral-600 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-800">+ Child</button>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center justify-between border-t border-neutral-200 pt-4 dark:border-neutral-700">
          {person ? (
            <button onClick={handleDelete} className="rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">
              Delete Person
            </button>
          ) : <div />}
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800">Cancel</button>
            <button onClick={handleSave} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
