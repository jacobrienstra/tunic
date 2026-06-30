import { Context, Trune, Word, db } from "./db";

export function updateTrune(id: number, patch: Partial<Trune>) {
  return db.trunes.put({ id, meaning: patch.meaning ?? "" });
}

export function updateWord(id: number, patch: Partial<Word>) {
  return db.words.update(id, patch);
}

export function updateContext(id: number, patch: Partial<Context>) {
  return db.contexts.update(id, patch);
}

export async function upsertContext(imageId?: number): Promise<Context> {
  return db.transaction("rw", db.contexts, async () => {
    if (imageId != null) {
      const found = await db.contexts.where("imageId").equals(imageId).first();
      if (found) return found;
    }
    const id = await db.contexts.add({ imageId, words: [] });
    return (await db.contexts.get(id))!;
  });
}

export async function addWord(
  word: number[],
  ctxId: number
): Promise<{ wordId: number }> {
  return db.transaction("rw", [db.words, db.contexts, db.trunes], async () => {
    const glyphs = word.map(String);
    let existingWord = await db.words.where("glyphs").equals(glyphs).first();
    if (!existingWord) {
      const wordId = await db.words.add({ glyphs });
      existingWord = (await db.words.get(wordId))!;
    }

    const context = await db.contexts.get(ctxId);
    if (context) {
      await db.contexts.update(ctxId, {
        words: [...context.words, existingWord.id],
      });
    }

    for (const trune of word) {
      const existing = await db.trunes.get(trune);
      if (!existing) {
        await db.trunes.put({ id: trune });
      }
    }

    return { wordId: existingWord.id };
  });
}
