import { isEqual } from "lodash";

import { Context, GlyphSubset, Trune, Word, db } from "./db";

export function updateTrune(id: number, patch: Partial<Trune>) {
  return db.trunes.update(id, patch);
}

export function updateWord(id: number, patch: Partial<Word>) {
  return db.words.update(id, patch);
}

export function updateContext(id: number, patch: Partial<Context>) {
  return db.contexts.update(id, patch);
}

export function addGlyphSubset(s: Omit<GlyphSubset, "id">) {
  return db.glyphSubsets.add(s as GlyphSubset);
}

export async function updateGlyphSubset(
  id: number,
  patch: Partial<Omit<GlyphSubset, "id">>
) {
  return db.transaction("rw", db.glyphSubsets, async () => {
    const existing = await db.glyphSubsets.get(id);
    if (!existing) return;
    await db.glyphSubsets.update(id, patch);
    if (patch.name != null && patch.name !== existing.name) {
      const oldRef = `{${existing.name}}`;
      const newRef = `{${patch.name}}`;
      const all = await db.glyphSubsets.toArray();
      const references = all.filter(
        (s) => s.id !== id && s.modifier && s.rule?.includes(oldRef)
      );
      for (const s of references) {
        await db.glyphSubsets.update(s.id, {
          rule: s.rule!.replaceAll(oldRef, newRef),
        });
      }
    }
  });
}

export function removeGlyphSubset(id: number) {
  return db.glyphSubsets.delete(id);
}

export async function upsertContext(imageId?: number): Promise<Context> {
  return db.transaction("rw", db.contexts, async () => {
    if (imageId != null) {
      const found = await db.contexts.where("imageId").equals(imageId).first();
      if (found) return found;
    }
    const id = await db.contexts.add({ imageId, wordIds: [] });
    return (await db.contexts.get(id))!;
  });
}

export async function addWord(
  word: number[],
  ctxId: number
): Promise<{ wordId: number }> {
  return db.transaction("rw", [db.words, db.contexts, db.trunes], async () => {
    let existingWord = await db.words
      .where("truneIds")
      .equals(word[0])
      .and((w) => isEqual(w.truneIds, word))
      .first();
    if (!existingWord) {
      const wordId = await db.words.add({ truneIds: word });
      existingWord = (await db.words.get(wordId))!;
    }

    const context = await db.contexts.get(ctxId);
    if (context) {
      await db.contexts.update(ctxId, {
        wordIds: [...context.wordIds, existingWord.id],
      });
    }

    for (const trune of word) {
      const existing = await db.trunes.get(trune);
      if (!existing) {
        await db.trunes.put({ id: trune, derived: false });
      }
    }

    return { wordId: existingWord.id };
  });
}
