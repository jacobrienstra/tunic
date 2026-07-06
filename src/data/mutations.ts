import _ from "lodash";
import { safeRandomUUID } from "@tanstack/react-db";

import {
  trunes,
  words,
  contexts,
  glyphSubsets,
  contextWordsJunction,
  wordTrunesJunction,
  WORD_KEY_SEP,
} from "./store";
import type { GlyphSubset, Trune } from "./store";

// Writes are optimistic against each collection's in-memory state; the SQLite
// persister writes through in the background.

export function updateTrune(
  id: number,
  patch: Partial<Omit<Trune, "id">>
): void {
  if (!trunes.has(id)) return;
  const cleaned = _.pickBy(patch, (v) => v !== undefined);
  trunes.update(id, (d) => Object.assign(d, cleaned));
}

export function updateWordMeaning(id: string, meaning: string | null): void {
  if (!words.has(id)) return;
  words.update(id, (draft) => {
    draft.meaning = meaning;
  });
}

export function updateContextText(id: string, text: string | null): void {
  if (!contexts.has(id)) return;
  contexts.update(id, (draft) => {
    draft.text = text;
  });
}

export function addGlyphSubset(s: Omit<GlyphSubset, "id">): void {
  glyphSubsets.insert({ id: safeRandomUUID(), ...s });
}

export function updateGlyphSubset(
  id: string,
  patch: Partial<Omit<GlyphSubset, "id">>
): void {
  if (!glyphSubsets.has(id)) return;
  const oldName = glyphSubsets.get(id)!.name;

  const cleaned = _.pickBy(patch, (v) => v !== undefined);
  glyphSubsets.update(id, (draft) => Object.assign(draft, cleaned));

  if (
    patch.name != null &&
    patch.name.toLowerCase() !== oldName.toLowerCase()
  ) {
    const oldRef = `{${oldName}}`.toLowerCase();
    const newRef = `{${patch.name}}`;
    const oldRefPattern = new RegExp(`\\{${oldName}\\}`, "gi");
    // Snapshot before iterating: updates below mutate the collection.
    for (const r of [...glyphSubsets.values()]) {
      if (r.id === id) continue;
      if (!r.modifier || !r.rule) continue;
      if (!r.rule.toLowerCase().includes(oldRef)) continue;
      const newRule = r.rule.replace(oldRefPattern, newRef);
      glyphSubsets.update(r.id, (draft) => {
        draft.rule = newRule;
      });
    }
  }
}

export function removeGlyphSubset(id: string): void {
  glyphSubsets.delete(id);
}

export function upsertWord(
  wordTrunes: number[],
  ctxId: string,
  order: number
): { wordId: string } {
  for (const truneId of wordTrunes) {
    if (!trunes.has(truneId))
      trunes.insert({ id: truneId, derived: false, meaning: null });
  }

  // The word's id is its ordered trune ids joined; same sequence -> same id.
  const wordId = wordTrunes.join(WORD_KEY_SEP);
  if (!words.has(wordId)) {
    words.insert({ id: wordId, meaning: null });
    wordTrunes.forEach((truneId, o) => {
      wordTrunesJunction.insert({ wordId, order: o, truneId });
    });
  }

  const junctionKey: `${string}:${number}` = `${ctxId}:${order}`;
  if (contextWordsJunction.has(junctionKey)) {
    contextWordsJunction.update(junctionKey, (d) => {
      d.contextId = ctxId;
      d.order = order;
      d.wordId = wordId;
    });
  } else {
    contextWordsJunction.insert({ contextId: ctxId, order, wordId });
  }

  return { wordId };
}
