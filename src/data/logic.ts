import { safeRandomUUID } from "@tanstack/react-db";

import { getGrapheme, type GlyphSubsetsCollection } from "./store";

// The expression AST. Empty operands are modeled by absence:
//   - a `not` with `child: null`
//   - an `and`/`or` with fewer than 2 children
// The view derives drop slots from those gaps; there is no "empty" node type.
export type LogicNode =
  | { id: string; type: "subset"; subsetId: string }
  | { id: string; type: "not"; child: LogicNode | null }
  | { id: string; type: "and" | "or"; children: LogicNode[] };

export type GroupType = "and" | "or";
export type OperatorType = GroupType | "not";

// A destination position for place().
export type Slot =
  | { kind: "root" } // the whole expression (only when tree is null)
  | { kind: "notOperand"; parentId: string } // a not node's operand
  | { kind: "groupOperand"; parentId: string; index: number }; // an and/or child operand

// --- constructors (the only place new ids are minted) ---
export function createSubsetNode(subsetId: string): LogicNode {
  return { id: safeRandomUUID(), type: "subset", subsetId };
}
export function createGroupNode(
  type: GroupType,
  children: LogicNode[] = []
): LogicNode {
  return { id: safeRandomUUID(), type, children };
}
export function createNotNode(child: LogicNode | null = null): LogicNode {
  return { id: safeRandomUUID(), type: "not", child };
}

// Replace the node matching id via updater, immutably.
function findNodeAndUpdate(
  node: LogicNode,
  id: string,
  updater: (n: LogicNode) => LogicNode
): LogicNode {
  if (node.id === id) return updater(node);
  switch (node.type) {
    case "subset":
      return node;
    case "not":
      return node.child
        ? { ...node, child: findNodeAndUpdate(node.child, id, updater) }
        : node;
    case "and":
    case "or":
      return {
        ...node,
        children: node.children.map((c) => findNodeAndUpdate(c, id, updater)),
      };
  }
}

// --- edit operations (immutable; return a new tree) ---

// Insert `node` at `slot`.
export function placeNodeInSlot(
  tree: LogicNode | null,
  slot: Slot,
  node: LogicNode
): LogicNode {
  if (slot.kind === "root") return node;
  if (!tree) return node;
  if (slot.kind === "notOperand") {
    return findNodeAndUpdate(tree, slot.parentId, (n) =>
      n.type === "not" ? { ...n, child: node } : n
    );
  }
  return findNodeAndUpdate(tree, slot.parentId, (n) => {
    if (n.type !== "and" && n.type !== "or") return n;
    const children = [...n.children];
    children.splice(slot.index, 0, node);
    return { ...n, children };
  });
}

// Delete the node at id and its subtree.
export function remove(tree: LogicNode | null, id: string): LogicNode | null {
  if (!tree) return null;
  if (tree.id === id) return null;
  return removeInnerNode(tree, id);
}

function removeInnerNode(node: LogicNode, id: string): LogicNode {
  switch (node.type) {
    case "subset":
      return node;
    case "not":
      if (node.child?.id === id) return { ...node, child: null };
      return node.child
        ? { ...node, child: removeInnerNode(node.child, id) }
        : node;
    case "and":
    case "or":
      return {
        ...node,
        children: node.children
          .filter((c) => c.id !== id)
          .map((c) => removeInnerNode(c, id)),
      };
  }
}

// Swap the node at id for a new node (its subtree is discarded).
export function replace(
  tree: LogicNode,
  id: string,
  node: LogicNode
): LogicNode {
  return findNodeAndUpdate(tree, id, () => node);
}

// --- validity ---

// Whole-tree validity: gates Save. An empty (null) tree is valid — no filter.
export function isValid(tree: LogicNode | null): boolean {
  if (!tree) return true;
  switch (tree.type) {
    case "subset":
      return true;
    case "not":
      return tree.child !== null && isValid(tree.child);
    case "and":
    case "or":
      return tree.children.length >= 2 && tree.children.every(isValid);
  }
}

// A single node's own requirement (for the destructive outline on that node).
// Child invalidity is shown on the children themselves.
export function nodeInvalid(node: LogicNode): boolean {
  switch (node.type) {
    case "subset":
      return false;
    case "not":
      return node.child === null;
    case "and":
    case "or":
      return node.children.length < 2;
  }
}

// --- evaluation ---

// Filtering: does `value` satisfy passed filterLogic, given each subset's selected
// grapheme? For a subset node/leaf, the function checks whether the trune
// contains that subset's selected grapheme. A subset with no
// selection (or an unknown id) has no answer, so its leaf is discarded — it
// drops out of its enclosing group, and a `not`/group left with nothing to
// constrain collapses to null. A null result means "no constraint" — matches
// everything.
export function valPassesFilter(
  filterLogic: LogicNode,
  value: number,
  subsets: GlyphSubsetsCollection,
  selectedGraphemes: Record<string, number | null>
): boolean | null {
  switch (filterLogic.type) {
    case "subset": {
      const subset = subsets.get(filterLogic.subsetId);
      if (!subset) return null;
      const selectedGrapheme = subset.modifier
        ? subset.mask
        : selectedGraphemes[filterLogic.subsetId];
      if (selectedGrapheme == null || !subset) return null;
      return getGrapheme(value, subset.mask) === selectedGrapheme;
    }
    case "not": {
      const child = filterLogic.child
        ? valPassesFilter(filterLogic.child, value, subsets, selectedGraphemes)
        : null;
      return child === null ? null : !child;
    }
    case "and":
    case "or": {
      const results = filterLogic.children
        .map((c) => valPassesFilter(c, value, subsets, selectedGraphemes))
        .filter((r): r is boolean => r !== null);
      if (results.length === 0) return null;
      return filterLogic.type === "and"
        ? results.every(Boolean)
        : results.some(Boolean);
    }
  }
}
