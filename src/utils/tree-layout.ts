import type { Person, Relationship } from "../types";

export interface NodePosition {
  personId: string;
  x: number;
  y: number;
}

const NODE_WIDTH = 160;
const NODE_HEIGHT = 80;
const H_GAP = 40;
const V_GAP = 100;

export function computeLayout(persons: Person[], relationships: Relationship[]): NodePosition[] {
  if (persons.length === 0) return [];

  const parentChildRels = relationships.filter((r) => r.type === "parent-child");
  const spouseRels = relationships.filter((r) => r.type === "spouse");

  // Build adjacency: parent -> children
  const childrenOf = new Map<string, string[]>();
  const parentsOf = new Map<string, string[]>();

  for (const rel of parentChildRels) {
    if (!childrenOf.has(rel.fromPersonId)) childrenOf.set(rel.fromPersonId, []);
    childrenOf.get(rel.fromPersonId)!.push(rel.toPersonId);
    if (!parentsOf.has(rel.toPersonId)) parentsOf.set(rel.toPersonId, []);
    parentsOf.get(rel.toPersonId)!.push(rel.fromPersonId);
  }

  // Build spouse pairs
  const spouseOf = new Map<string, string[]>();
  for (const rel of spouseRels) {
    if (!spouseOf.has(rel.fromPersonId)) spouseOf.set(rel.fromPersonId, []);
    spouseOf.get(rel.fromPersonId)!.push(rel.toPersonId);
    if (!spouseOf.has(rel.toPersonId)) spouseOf.set(rel.toPersonId, []);
    spouseOf.get(rel.toPersonId)!.push(rel.fromPersonId);
  }

  // Find roots (persons with no parents)
  const roots = persons.filter((p) => !parentsOf.has(p.id) || parentsOf.get(p.id)!.length === 0);

  // Assign generations via BFS
  const generation = new Map<string, number>();
  const visited = new Set<string>();
  const queue: { id: string; gen: number }[] = [];

  for (const root of roots) {
    if (!visited.has(root.id)) {
      queue.push({ id: root.id, gen: 0 });
      visited.add(root.id);
    }
  }

  // Also enqueue any persons not reachable from roots
  for (const p of persons) {
    if (!visited.has(p.id)) {
      queue.push({ id: p.id, gen: 0 });
      visited.add(p.id);
    }
  }

  while (queue.length > 0) {
    const { id, gen } = queue.shift()!;
    generation.set(id, Math.max(generation.get(id) ?? 0, gen));

    const children = childrenOf.get(id) ?? [];
    for (const childId of children) {
      if (!visited.has(childId)) {
        visited.add(childId);
        queue.push({ id: childId, gen: gen + 1 });
      } else {
        // Ensure child is at least one generation below
        if ((generation.get(childId) ?? 0) <= gen) {
          generation.set(childId, gen + 1);
        }
      }
    }
  }

  // Group by generation
  const generations = new Map<number, string[]>();
  for (const [id, gen] of generation) {
    if (!generations.has(gen)) generations.set(gen, []);
    generations.get(gen)!.push(id);
  }

  // Position nodes
  const positions: NodePosition[] = [];
  const sortedGens = [...generations.keys()].sort((a, b) => a - b);

  // Track placed spouses to avoid duplicates
  const placed = new Set<string>();

  for (const gen of sortedGens) {
    const genPersons = generations.get(gen)!;
    // Group spouses together
    const orderedIds: string[] = [];
    for (const id of genPersons) {
      if (placed.has(id)) continue;
      orderedIds.push(id);
      placed.add(id);
      // Place spouses next to this person
      const spouses = (spouseOf.get(id) ?? []).filter(
        (sid) => generation.get(sid) === gen && !placed.has(sid)
      );
      for (const sid of spouses) {
        orderedIds.push(sid);
        placed.add(sid);
      }
    }

    const totalWidth = orderedIds.length * (NODE_WIDTH + H_GAP) - H_GAP;
    const startX = -totalWidth / 2;

    for (let i = 0; i < orderedIds.length; i++) {
      positions.push({
        personId: orderedIds[i]!,
        x: startX + i * (NODE_WIDTH + H_GAP),
        y: gen * (NODE_HEIGHT + V_GAP),
      });
    }
  }

  return positions;
}
