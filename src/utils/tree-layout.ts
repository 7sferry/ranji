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

  const childrenOf = new Map<string, string[]>();
  const parentsOf = new Map<string, string[]>();

  for (const rel of parentChildRels) {
    if (!childrenOf.has(rel.fromPersonId)) childrenOf.set(rel.fromPersonId, []);
    childrenOf.get(rel.fromPersonId)!.push(rel.toPersonId);
    if (!parentsOf.has(rel.toPersonId)) parentsOf.set(rel.toPersonId, []);
    parentsOf.get(rel.toPersonId)!.push(rel.fromPersonId);
  }

  const spouseOf = new Map<string, string[]>();
  for (const rel of spouseRels) {
    if (!spouseOf.has(rel.fromPersonId)) spouseOf.set(rel.fromPersonId, []);
    spouseOf.get(rel.fromPersonId)!.push(rel.toPersonId);
    if (!spouseOf.has(rel.toPersonId)) spouseOf.set(rel.toPersonId, []);
    spouseOf.get(rel.toPersonId)!.push(rel.fromPersonId);
  }

  // --- Step 1: Assign generations via BFS ---
  const generation = new Map<string, number>();
  const visited = new Set<string>();
  const queue: { id: string; gen: number }[] = [];

  // Roots = persons with no parents
  for (const p of persons) {
    if (!parentsOf.has(p.id) || parentsOf.get(p.id)!.length === 0) {
      // Skip if this person is a spouse of someone who has parents (they'll be placed alongside their partner)
      const isSpouseOfChild = (spouseOf.get(p.id) ?? []).some(
        (sid) => (parentsOf.get(sid)?.length ?? 0) > 0
      );
      if (!isSpouseOfChild) {
        queue.push({ id: p.id, gen: 0 });
        visited.add(p.id);
      }
    }
  }

  // If no roots found (circular), just pick the first person
  if (queue.length === 0 && persons.length > 0) {
    queue.push({ id: persons[0]!.id, gen: 0 });
    visited.add(persons[0]!.id);
  }

  while (queue.length > 0) {
    const { id, gen } = queue.shift()!;
    generation.set(id, Math.max(generation.get(id) ?? 0, gen));

    // Spouse gets same generation
    for (const sid of spouseOf.get(id) ?? []) {
      if (!visited.has(sid)) {
        visited.add(sid);
        generation.set(sid, gen);
        queue.push({ id: sid, gen });
      }
    }

    // Children get next generation
    for (const childId of childrenOf.get(id) ?? []) {
      if (!visited.has(childId)) {
        visited.add(childId);
        queue.push({ id: childId, gen: gen + 1 });
      } else if ((generation.get(childId) ?? 0) <= gen) {
        generation.set(childId, gen + 1);
        queue.push({ id: childId, gen: gen + 1 });
      }
    }
  }

  // Catch any disconnected persons
  for (const p of persons) {
    if (!generation.has(p.id)) {
      generation.set(p.id, 0);
    }
  }

  // --- Step 2: Compute subtree widths bottom-up ---
  const subtreeWidth = new Map<string, number>();
  const computing = new Set<string>();

  function getWidth(id: string): number {
    if (subtreeWidth.has(id)) return subtreeWidth.get(id)!;
    if (computing.has(id)) return NODE_WIDTH;
    computing.add(id);

    // This node's own width (including spouse if any)
    const spouses = (spouseOf.get(id) ?? []).filter(
      (sid) => generation.get(sid) === generation.get(id)
    );
    const selfWidth = (1 + spouses.length) * NODE_WIDTH + spouses.length * SPOUSE_GAP;

    // Collect ALL children (from this person and their spouses)
    const allChildren = new Set<string>();
    for (const cid of childrenOf.get(id) ?? []) allChildren.add(cid);
    for (const sid of spouses) {
      for (const cid of childrenOf.get(sid) ?? []) allChildren.add(cid);
    }

    const children = [...allChildren];
    if (children.length === 0) {
      subtreeWidth.set(id, selfWidth);
      return selfWidth;
    }

    let childrenTotal = 0;
    for (const cid of children) {
      childrenTotal += getWidth(cid);
    }
    childrenTotal += (children.length - 1) * H_GAP;

    const width = Math.max(selfWidth, childrenTotal);
    subtreeWidth.set(id, width);
    return width;
  }

  for (const p of persons) getWidth(p.id);

  // --- Step 3: Place nodes top-down ---
  const positions = new Map<string, { x: number; y: number }>();
  const placed = new Set<string>();

  function place(id: string, left: number) {
    if (placed.has(id)) return;
    placed.add(id);

    const gen = generation.get(id) ?? 0;
    const y = gen * (NODE_HEIGHT + V_GAP);
    const myWidth = subtreeWidth.get(id) ?? NODE_WIDTH;

    // Spouses at same gen
    const spouses = (spouseOf.get(id) ?? []).filter(
      (sid) => generation.get(sid) === generation.get(id) && !placed.has(sid)
    );
    const selfWidth = (1 + spouses.length) * NODE_WIDTH + spouses.length * SPOUSE_GAP;

    // Center the person+spouse block within allocated width
    const blockStart = left + (myWidth - selfWidth) / 2;
    positions.set(id, { x: blockStart, y });

    let sx = blockStart + NODE_WIDTH + SPOUSE_GAP;
    for (const sid of spouses) {
      placed.add(sid);
      positions.set(sid, { x: sx, y });
      sx += NODE_WIDTH + SPOUSE_GAP;
    }

    // Collect children from self and spouses
    const allChildren = new Set<string>();
    for (const cid of childrenOf.get(id) ?? []) allChildren.add(cid);
    for (const sid of spouses) {
      for (const cid of childrenOf.get(sid) ?? []) allChildren.add(cid);
    }

    // Place children left to right within our allocated width
    let childLeft = left;
    for (const cid of allChildren) {
      if (placed.has(cid)) continue;
      const cw = subtreeWidth.get(cid) ?? NODE_WIDTH;
      place(cid, childLeft);
      childLeft += cw + H_GAP;
    }
  }

  // Place each root tree
  let currentX = 0;
  const rootIds = persons
    .filter((p) => !parentsOf.has(p.id) || parentsOf.get(p.id)!.length === 0)
    .filter((p) => !(spouseOf.get(p.id) ?? []).some((sid) => (parentsOf.get(sid)?.length ?? 0) > 0))
    .map((p) => p.id);

  for (const rid of rootIds) {
    if (placed.has(rid)) continue;
    place(rid, currentX);
    currentX += (subtreeWidth.get(rid) ?? NODE_WIDTH) + H_GAP * 3;
  }

  // Place any remaining
  for (const p of persons) {
    if (!placed.has(p.id)) {
      place(p.id, currentX);
      currentX += (subtreeWidth.get(p.id) ?? NODE_WIDTH) + H_GAP * 3;
    }
  }

  return [...positions.entries()].map(([personId, pos]) => ({
    personId,
    x: pos.x,
    y: pos.y,
  }));
}
