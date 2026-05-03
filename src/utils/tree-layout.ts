import type { Person, Relationship } from "../types";

export interface NodePosition {
  personId: string;
  x: number;
  y: number;
}

const NODE_WIDTH = 160;
const NODE_HEIGHT = 80;
const H_GAP = 30;
const V_GAP = 100;
const SPOUSE_GAP = 10;

export function computeLayout(persons: Person[], relationships: Relationship[]): NodePosition[] {
  if (persons.length === 0) return [];

  const parentChildRels = relationships.filter((r) => r.type === "parent-child");
  const spouseRels = relationships.filter((r) => r.type === "spouse");

  // Build adjacency
  const childrenOf = new Map<string, string[]>();
  const parentsOf = new Map<string, string[]>();

  for (const rel of parentChildRels) {
    if (!childrenOf.has(rel.fromPersonId)) childrenOf.set(rel.fromPersonId, []);
    childrenOf.get(rel.fromPersonId)!.push(rel.toPersonId);
    if (!parentsOf.has(rel.toPersonId)) parentsOf.set(rel.toPersonId, []);
    parentsOf.get(rel.toPersonId)!.push(rel.fromPersonId);
  }

  // Build spouse map
  const spouseOf = new Map<string, string[]>();
  for (const rel of spouseRels) {
    if (!spouseOf.has(rel.fromPersonId)) spouseOf.set(rel.fromPersonId, []);
    spouseOf.get(rel.fromPersonId)!.push(rel.toPersonId);
    if (!spouseOf.has(rel.toPersonId)) spouseOf.set(rel.toPersonId, []);
    spouseOf.get(rel.toPersonId)!.push(rel.fromPersonId);
  }

  // Find roots (no parents) and assign generations via BFS
  const generation = new Map<string, number>();
  const visited = new Set<string>();
  const queue: { id: string; gen: number }[] = [];

  const roots = persons.filter((p) => !parentsOf.has(p.id) || parentsOf.get(p.id)!.length === 0);
  for (const root of roots) {
    if (!visited.has(root.id)) {
      queue.push({ id: root.id, gen: 0 });
      visited.add(root.id);
    }
  }
  // Enqueue unreachable persons
  for (const p of persons) {
    if (!visited.has(p.id)) {
      queue.push({ id: p.id, gen: 0 });
      visited.add(p.id);
    }
  }

  while (queue.length > 0) {
    const { id, gen } = queue.shift()!;
    generation.set(id, Math.max(generation.get(id) ?? 0, gen));

    // Place spouses at same generation
    for (const sid of spouseOf.get(id) ?? []) {
      if (!generation.has(sid)) {
        generation.set(sid, gen);
      }
    }

    for (const childId of childrenOf.get(id) ?? []) {
      const childGen = gen + 1;
      if (!visited.has(childId)) {
        visited.add(childId);
        queue.push({ id: childId, gen: childGen });
      } else if ((generation.get(childId) ?? 0) <= gen) {
        generation.set(childId, childGen);
      }
    }
  }

  // Build family units: a primary person + their spouses grouped together
  // A "family unit" is placed as one block, with children hanging below the primary person
  const placed = new Set<string>();
  const positions = new Map<string, { x: number; y: number }>();

  // For each person, compute the width of their subtree (including spouse)
  const subtreeWidth = new Map<string, number>();

  function getUnitWidth(id: string): number {
    if (subtreeWidth.has(id)) return subtreeWidth.get(id)!;

    // Unit = person + spouses side by side
    const spouses = (spouseOf.get(id) ?? []).filter(
      (sid) => generation.get(sid) === generation.get(id)
    );
    const unitNodeWidth = (1 + spouses.length) * NODE_WIDTH + spouses.length * SPOUSE_GAP;

    // Children of this person (and their subtrees)
    const children = childrenOf.get(id) ?? [];
    if (children.length === 0) {
      subtreeWidth.set(id, unitNodeWidth);
      return unitNodeWidth;
    }

    let childrenTotalWidth = 0;
    for (const childId of children) {
      childrenTotalWidth += getUnitWidth(childId);
    }
    childrenTotalWidth += (children.length - 1) * H_GAP;

    const width = Math.max(unitNodeWidth, childrenTotalWidth);
    subtreeWidth.set(id, width);
    return width;
  }

  // Compute widths for all roots first
  const allIds = persons.map((p) => p.id);
  for (const id of allIds) {
    getUnitWidth(id);
  }

  // Place nodes top-down, starting from roots
  function placeSubtree(id: string, x: number, y: number) {
    if (placed.has(id)) return;
    placed.add(id);

    const gen = generation.get(id) ?? 0;
    const nodeY = gen * (NODE_HEIGHT + V_GAP);

    // Place spouses
    const spouses = (spouseOf.get(id) ?? []).filter(
      (sid) => generation.get(sid) === generation.get(id) && !placed.has(sid)
    );

    const totalUnitWidth = (1 + spouses.length) * NODE_WIDTH + spouses.length * SPOUSE_GAP;
    const treeWidth = subtreeWidth.get(id) ?? NODE_WIDTH;

    // Center the unit within the allocated width
    const unitStartX = x + (treeWidth - totalUnitWidth) / 2;

    positions.set(id, { x: unitStartX, y: nodeY });

    let sx = unitStartX + NODE_WIDTH + SPOUSE_GAP;
    for (const sid of spouses) {
      placed.add(sid);
      positions.set(sid, { x: sx, y: nodeY });
      sx += NODE_WIDTH + SPOUSE_GAP;
    }

    // Place children
    const children = childrenOf.get(id) ?? [];
    if (children.length === 0) return;

    let childX = x;
    for (const childId of children) {
      if (placed.has(childId)) continue;
      const childWidth = subtreeWidth.get(childId) ?? NODE_WIDTH;
      placeSubtree(childId, childX, 0);
      childX += childWidth + H_GAP;
    }
  }

  // Find top-level roots (persons with no parents who aren't spouses of someone with parents)
  const topRoots: string[] = [];
  const handledAsSpouse = new Set<string>();

  for (const p of persons) {
    const parents = parentsOf.get(p.id);
    if (!parents || parents.length === 0) {
      // Check if this person is a spouse of someone who HAS parents
      const isSpouseOfNonRoot = (spouseOf.get(p.id) ?? []).some(
        (sid) => parentsOf.has(sid) && (parentsOf.get(sid)?.length ?? 0) > 0
      );
      if (!isSpouseOfNonRoot && !handledAsSpouse.has(p.id)) {
        topRoots.push(p.id);
        // Mark their spouses so they don't become separate roots
        for (const sid of spouseOf.get(p.id) ?? []) {
          handledAsSpouse.add(sid);
        }
      }
    }
  }

  // Place each top-level root side by side
  let currentX = 0;
  for (const rootId of topRoots) {
    if (placed.has(rootId)) continue;
    placeSubtree(rootId, currentX, 0);
    currentX += (subtreeWidth.get(rootId) ?? NODE_WIDTH) + H_GAP * 3;
  }

  // Place any remaining unplaced persons
  for (const p of persons) {
    if (!placed.has(p.id)) {
      placeSubtree(p.id, currentX, 0);
      currentX += (subtreeWidth.get(p.id) ?? NODE_WIDTH) + H_GAP * 3;
    }
  }

  // Convert to array
  const result: NodePosition[] = [];
  for (const [personId, pos] of positions) {
    result.push({ personId, x: pos.x, y: pos.y });
  }

  return result;
}
