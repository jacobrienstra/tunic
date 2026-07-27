import _ from "lodash";
import { createTransaction, safeRandomUUID } from "@tanstack/react-db";

import {
  trunes,
  words,
  contexts,
  glyphSubsets,
  contextWordsJunction,
  contextWordsJunctionByWordId,
  wordTrunesJunction,
  wordTrunesJunctionByWordId,
  wordTrunesJunctionByTruneId,
  WORD_KEY_SEP,
} from "./store";
import type { ContextWordJunctionKey, GlyphSubset, Trune } from "./store";
import { saveImage } from "./images";

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

export async function createContextWithImage(
  image: Blob
): Promise<{ contextId: string; imageId: string }> {
  const imageId = await saveImage(image);
  const contextId = safeRandomUUID();
  contexts.insert({
    id: contextId,
    imageId,
    text: null,
    order: 0,
  });
  return { contextId, imageId };
}

export async function updateContextWords(
  contextId: string,
  wordsArr: number[][]
): Promise<{ orphanedWordIds: string[]; orphanedTruneIds: number[] }> {
  const tx = createTransaction({
    mutationFn: async ({ transaction }) => {
      await Promise.all([
        trunes.utils.acceptMutations(transaction),
        words.utils.acceptMutations(transaction),
        wordTrunesJunction.utils.acceptMutations(transaction),
        contextWordsJunction.utils.acceptMutations(transaction),
      ]);
    },
  });
  const orphanedWordIds = new Set<string>();
  const orphanedTruneIds = new Set<number>();
  tx.mutate(() => {
    const oldWordIds: string[] = [];
    for (let i = 0; ; i++) {
      const key: ContextWordJunctionKey = `${contextId}:${i}`;
      const r = contextWordsJunction.get(key);
      if (!r) break;
      oldWordIds.push(r.wordId);
    }
    const oldLen = oldWordIds.length;
    const newLen = wordsArr.length;

    for (const [order, w] of wordsArr.entries()) {
      upsertWord(w, contextId, order);
    }
    for (let i = newLen; i < oldLen; i++) {
      const key: ContextWordJunctionKey = `${contextId}:${i}`;
      contextWordsJunction.delete(key);
    }

    const affectedTruneIds = new Set<number>();
    for (const wordId of new Set(oldWordIds)) {
      if (contextWordsJunctionByWordId.equalityLookup(wordId).size > 0)
        continue;
      for (const key of wordTrunesJunctionByWordId.equalityLookup(wordId)) {
        const row = wordTrunesJunction.get(key);
        if (row) affectedTruneIds.add(row.truneId);
        // wordTrunesJunction.delete(key);
      }
      // TODO: Should probably surface this to the user and ask if the word should be deleted or left orphaned, so any meaning they added to it is preserved
      orphanedWordIds.add(wordId);
      // words.delete(wordId);
    }

    for (const truneId of affectedTruneIds) {
      if (wordTrunesJunctionByTruneId.equalityLookup(truneId).size > 0)
        continue;
      // TODO: Surface to user before deleting to preserve meaning annotations
      orphanedTruneIds.add(truneId);
      // trunes.delete(truneId);
    }
  });
  await tx.isPersisted.promise;
  return {
    orphanedWordIds: [...orphanedWordIds],
    orphanedTruneIds: [...orphanedTruneIds],
  };
}

export function previewContextDeleteOrphans(contextId: string): string[] {
  const oldWordIds: string[] = [];
  for (let i = 0; ; i++) {
    const key: ContextWordJunctionKey = `${contextId}:${i}`;
    const r = contextWordsJunction.get(key);
    if (!r) break;
    oldWordIds.push(r.wordId);
  }
  const orphaned: string[] = [];
  for (const wordId of new Set(oldWordIds)) {
    let referencedElsewhere = false;
    for (const key of contextWordsJunctionByWordId.equalityLookup(wordId)) {
      const row = contextWordsJunction.get(key);
      if (!row) continue;
      if (row.contextId !== contextId) {
        referencedElsewhere = true;
        break;
      }
    }
    if (!referencedElsewhere) orphaned.push(wordId);
  }
  return orphaned;
}

export async function deleteContext(contextId: string): Promise<void> {
  const tx = createTransaction({
    mutationFn: async ({ transaction }) => {
      await Promise.all([
        contexts.utils.acceptMutations(transaction),
        contextWordsJunction.utils.acceptMutations(transaction),
      ]);
    },
  });
  tx.mutate(() => {
    for (let i = 0; ; i++) {
      const key: ContextWordJunctionKey = `${contextId}:${i}`;
      if (!contextWordsJunction.has(key)) break;
      contextWordsJunction.delete(key);
    }
    contexts.delete(contextId);
  });
  await tx.isPersisted.promise;
}

export async function deleteWord(wordId: string): Promise<void> {
  const tx = createTransaction({
    mutationFn: async ({ transaction }) => {
      await Promise.all([
        words.utils.acceptMutations(transaction),
        wordTrunesJunction.utils.acceptMutations(transaction),
      ]);
    },
  });
  tx.mutate(() => {
    for (const key of wordTrunesJunctionByWordId.equalityLookup(wordId)) {
      wordTrunesJunction.delete(key);
    }
    words.delete(wordId);
  });
  await tx.isPersisted.promise;
}

export async function deleteTrune(truneId: number): Promise<void> {
  const tx = createTransaction({
    mutationFn: async ({ transaction }) => {
      await trunes.utils.acceptMutations(transaction);
    },
  });
  tx.mutate(() => {
    trunes.delete(truneId);
  });
  await tx.isPersisted.promise;
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
  const oldColor = glyphSubsets.get(id)!.color;

  const cleaned = _.pickBy(patch, (v) => v !== undefined) as Partial<
    Omit<GlyphSubset, "id">
  >;

  if (cleaned.color != null && cleaned.color !== oldColor) {
    const takenColorSubset = [...glyphSubsets.values()].find(
      (gs) => gs.color == cleaned.color
    );
    if (takenColorSubset != null) {
      glyphSubsets.update(takenColorSubset.id, (draft) => {
        draft.color = oldColor;
      });
    }
  }
  glyphSubsets.update(id, (draft) => Object.assign(draft, cleaned));

  if (
    cleaned.name != null &&
    cleaned.name.toLowerCase() !== oldName.toLowerCase()
  ) {
    const oldRef = `{{${oldName}}}`.toLowerCase();
    const newRef = `{{${patch.name}}}`;
    const oldRefPattern = new RegExp(`\\{\\{${oldName}\\}\\}`, "gi");
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

  const junctionKey: ContextWordJunctionKey = `${ctxId}:${order}`;
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
