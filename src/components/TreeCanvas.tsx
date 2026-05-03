import React, { useState, useRef, useCallback, useEffect } from "react";
import type { FamilyTree, Person } from "../types";
import { computeLayout } from "../utils/tree-layout";

interface TreeCanvasProps {
  tree: FamilyTree;
  searchQuery: string;
  onSelectPerson: (person: Person) => void;
}

export function TreeCanvas({ tree, searchQuery, onSelectPerson }: TreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const positions = computeLayout(tree.persons, tree.relationships);

  // Center view and fit on mount or when tree changes
  useEffect(() => {
    if (positions.length === 0) return;
    const container = containerRef.current;
    if (!container) return;
    const minX = Math.min(...positions.map((p) => p.x));
    const maxX = Math.max(...positions.map((p) => p.x + 160));
    const minY = Math.min(...positions.map((p) => p.y));
    const maxY = Math.max(...positions.map((p) => p.y + 80));
    const treeW = maxX - minX;
    const treeH = maxY - minY;
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    // Auto-fit zoom with some padding
    const fitZoom = Math.min(1, (cw - 40) / treeW, (ch - 40) / treeH);
    const z = Math.max(0.1, fitZoom);
    setZoom(z);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    setPan({ x: cw / 2 - cx * z, y: ch / 2 - cy * z });
  }, [tree.persons.length, tree.relationships.length]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).dataset.canvas) {
      setDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setPanStart(pan);
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setPan({
      x: panStart.x + (e.clientX - dragStart.x),
      y: panStart.y + (e.clientY - dragStart.y),
    });
  }, [dragging, dragStart, panStart]);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.min(2, Math.max(0.05, z * delta)));
  }, []);

  function isMatch(person: Person) {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      person.name.toLowerCase().includes(q) ||
      (person.nickname?.toLowerCase().includes(q) ?? false)
    );
  }

  function getGenderColor(gender: Person["gender"]) {
    switch (gender) {
      case "male": return "border-blue-400 dark:border-blue-500";
      case "female": return "border-pink-400 dark:border-pink-500";
      default: return "border-neutral-400 dark:border-neutral-500";
    }
  }

  // Draw relationship lines as SVG
  const posMap = new Map(positions.map((p) => [p.personId, p]));

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden bg-neutral-50 dark:bg-neutral-950 ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      data-canvas="true"
    >
      {tree.persons.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-neutral-500 dark:text-neutral-400">Add your first family member to get started</p>
        </div>
      ) : (
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
          className="absolute"
          data-canvas="true"
        >
          {/* Relationship lines */}
          <svg className="pointer-events-none absolute" style={{ left: 0, top: 0, width: "5000px", height: "5000px", overflow: "visible" }}>
            {tree.relationships.map((rel) => {
              const from = posMap.get(rel.fromPersonId);
              const to = posMap.get(rel.toPersonId);
              if (!from || !to) return null;
              const x1 = from.x + 80;
              const y1 = from.y + 80;
              const x2 = to.x + 80;
              const y2 = to.y;

              if (rel.type === "spouse") {
                // Horizontal dashed line at the midpoint
                const midY = from.y + 40;
                return (
                  <line
                    key={rel.id}
                    x1={from.x + 160}
                    y1={midY}
                    x2={to.x}
                    y2={midY}
                    stroke="currentColor"
                    className="text-pink-400 dark:text-pink-600"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                  />
                );
              }

              // Parent-child: vertical line with curve
              const midY = (y1 + y2) / 2;
              return (
                <path
                  key={rel.id}
                  d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                  fill="none"
                  stroke="currentColor"
                  className="text-neutral-400 dark:text-neutral-600"
                  strokeWidth={2}
                />
              );
            })}
          </svg>

          {/* Person nodes */}
          {positions.map((pos) => {
            const person = tree.persons.find((p) => p.id === pos.personId);
            if (!person) return null;
            const matched = isMatch(person);
            return (
              <div
                key={person.id}
                className={`absolute w-40 cursor-pointer rounded-xl border-2 bg-white p-3 shadow-sm transition hover:shadow-md dark:bg-neutral-900 ${getGenderColor(person.gender)} ${!matched && searchQuery ? "opacity-30" : ""}`}
                style={{ left: pos.x, top: pos.y }}
                onClick={(e) => { e.stopPropagation(); onSelectPerson(person); }}
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
                    {person.photo ? (
                      <img src={person.photo} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      person.name.split(" ").map((w) => w[0] ?? "").join("").slice(0, 2)
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                      {person.name}
                    </p>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                      {person.birthDate?.slice(0, 4) ?? "?"} {person.deathDate ? `- ${person.deathDate.slice(0, 4)}` : ""}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
