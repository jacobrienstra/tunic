import { useMemo } from "react";
import { isEqual, uniq } from "lodash";
import { useLiveQuery } from "dexie-react-hooks";

import { useSelectionStore } from "./selection";
import { useTrunes, useGlyphSubsets } from "./queries";
import { Context, Trune, Word, db } from "./db";

export function getGrapheme(trune: number, mask: number) {
  return trune & mask;
}

export function useDerivedGraphemes(): Map<number, Trune[]> {
  const trunes = useTrunes();
  const glyphSubsets = useGlyphSubsets();

  return useMemo(() => {
    const result = new Map<number, Trune[]>();
    if (!trunes || !glyphSubsets) return result;
    const byId = new Map(trunes.map((t) => [t.id, t]));
    for (const subset of glyphSubsets) {
      if (subset.modifier) continue;
      result.set(
        subset.id,
        uniq(trunes.map((t) => getGrapheme(t.id, subset.mask)))
          .filter((g) => g !== 0)
          .sort((a, b) => a - b)
          .map((g) => byId.get(g) ?? { id: g, derived: true })
      );
    }
    return result;
  }, [trunes, glyphSubsets]);
}

export function useFilteredTrunes(): Trune[] {
  const selectedWordId = useSelectionStore((s) => s.selectedWord);
  const wordFilterDirection = useSelectionStore((s) => s.wordFilterDirection);
  const graphemesFilterDirection = useSelectionStore(
    (s) => s.graphemesFilterDirection
  );

  const result = useLiveQuery(async () => {
    if (wordFilterDirection === "backward" && selectedWordId != null) {
      const word = await db.words.get(selectedWordId);
      if (!word) return [];
      const rows = await db.trunes.bulkGet(word.truneIds);
      return rows.filter((t): t is Trune => !!t);
    }
    if (graphemesFilterDirection === "forward") {
      // TODO: filter trunes by selected graphemes across subsets —
      // requires defining how per-subset selections combine (union vs intersection).
    }
    return db.trunes.toArray();
  }, [wordFilterDirection, selectedWordId, graphemesFilterDirection]);

  return result ?? [];
}
const wordContainsNGram = (word: number[], nGram: number[]): boolean => {
  const n = nGram.length;
  for (let i = 0; i < word.length - (n - 1); i++) {
    const nGramSlice = word.slice(i, i + n);
    if (isEqual(nGramSlice, nGram)) {
      return true;
    }
  }
  return false;
};

export function useFilteredNGrams(): number[][] {
  const n = useSelectionStore((s) => s.n);
  const selectedWordId = useSelectionStore((s) => s.selectedWord);
  const wordFilterDirection = useSelectionStore((s) => s.wordFilterDirection);
  const graphemesFilterDirection = useSelectionStore(
    (s) => s.graphemesFilterDirection
  );

  const result = useLiveQuery(async () => {
    let source: Word[];
    if (wordFilterDirection === "backward" && selectedWordId != null) {
      const selectedWord = await db.words.get(selectedWordId);
      source = selectedWord ? [selectedWord] : [];
    } else {
      source = await db.words.toArray();
    }
    const counts = new Map<string, { ngram: number[]; count: number }>();
    for (const w of source) {
      for (let i = 0; i <= w.truneIds.length - n; i++) {
        const slice = w.truneIds.slice(i, i + n);
        const key = slice.join("_");
        const existing = counts.get(key);
        if (existing) existing.count++;
        else counts.set(key, { ngram: slice, count: 1 });
      }
    }
    if (graphemesFilterDirection === "forward") {
      // TODO: filter ngrams by selected graphemes across subsets —
      // requires defining how per-subset selections combine (union vs intersection).
    }
    return [...counts.values()]
      .sort((a, b) => b.count - a.count)
      .map((v) => v.ngram);
  }, [n, selectedWordId, wordFilterDirection, graphemesFilterDirection]);

  return result ?? [];
}

export function useFilteredWords(): Word[] {
  const selectedContextId = useSelectionStore((s) => s.selectedContext);
  const selectedTrune = useSelectionStore((s) => s.selectedTrune);
  const selectedNGram = useSelectionStore((s) => s.selectedNGram);
  const contextFilterDirection = useSelectionStore(
    (s) => s.contextFilterDirection
  );
  const truneFilterDirection = useSelectionStore((s) => s.truneFilterDirection);
  const mode = useSelectionStore((s) => s.mode);

  const result = useLiveQuery(async () => {
    if (contextFilterDirection === "backward" && selectedContextId != null) {
      const ctx = await db.contexts.get(selectedContextId);
      if (!ctx) return [];
      const rows = await db.words.bulkGet(ctx.wordIds);
      return rows.filter((w): w is Word => !!w);
    }
    if (truneFilterDirection === "forward") {
      if (mode === "trunes" && selectedTrune != null) {
        return db.words.where("truneIds").equals(selectedTrune).toArray();
      }
      if (mode === "ngrams" && selectedNGram) {
        const all = await db.words.toArray();
        return all.filter((w) => wordContainsNGram(w.truneIds, selectedNGram));
      }
    }
    return db.words.toArray();
  }, [
    contextFilterDirection,
    selectedContextId,
    truneFilterDirection,
    mode,
    selectedTrune,
    selectedNGram,
  ]);

  return result ?? [];
}

export function useFilteredContexts(): Context[] {
  const selectedWordId = useSelectionStore((s) => s.selectedWord);
  const wordFilterDirection = useSelectionStore((s) => s.wordFilterDirection);

  const result = useLiveQuery(async () => {
    if (wordFilterDirection === "forward" && selectedWordId != null) {
      return db.contexts.where("wordIds").equals(selectedWordId).toArray();
    }
    return db.contexts.toArray();
  }, [wordFilterDirection, selectedWordId]);

  return result ?? [];
}
