import { useMemo } from "react";
import { isEqual, uniq } from "lodash";
import { useLiveQuery, eq } from "@tanstack/react-db";

import type { WordWithTruneIds, Trune, Context } from "./store";
import {
  useGlyphSubsets,
  contexts,
  trunes,
  wordTrunesJunction,
  contextWordsJunction,
  allTrunes,
  allContexts,
  useTruneIds,
  wordsWithTruneIds,
} from "./store";
import { useSelectionStore } from "./selectionStore";

export function getGrapheme(trune: number, mask: number) {
  return trune & mask;
}

export function useDerivedGraphemeIds(): Map<string, number[]> {
  const { data: subsets } = useGlyphSubsets();
  const { data: truneIds } = useTruneIds();

  return useMemo(() => {
    const result = new Map<string, number[]>();
    for (const subset of subsets.filter((s) => !s.modifier)) {
      result.set(
        subset.id,
        uniq(truneIds.map((t) => getGrapheme(t.id, subset.mask)))
          .filter((g) => g !== 0)
          .sort((a, b) => a - b)
      );
    }
    return result;
  }, [subsets, truneIds]);
}

export function useFilteredTrunes(): Trune[] {
  const selectedWord = useSelectionStore((s) => s.selectedWord);
  const wordFilterDirection = useSelectionStore((s) => s.wordFilterDirection);
  const byWord = wordFilterDirection === "backward" && selectedWord != null;

  return (useLiveQuery(
    (q) => {
      if (!byWord) return allTrunes;
      return q
        .from({ j: wordTrunesJunction })
        .where(({ j }) => eq(j.wordId, selectedWord))
        .innerJoin({ t: trunes }, ({ j, t }) => eq(t.id, j.truneId))
        .orderBy(({ j }) => j.order)
        .select(({ t }) => t);
    },
    [byWord, selectedWord]
  ).data ?? []) as Trune[];
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
  const selectedWord = useSelectionStore((s) => s.selectedWord);
  const wordFilterDirection = useSelectionStore((s) => s.wordFilterDirection);
  const byWord = wordFilterDirection === "backward" && selectedWord != null;

  const source =
    useLiveQuery(
      (q) => {
        if (!byWord) return wordsWithTruneIds;
        return q
          .from({ w: wordsWithTruneIds })
          .where(({ w }) => eq(w.id, selectedWord));
      },
      [byWord, selectedWord]
    ).data ?? [];

  return useMemo(() => {
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
    return [...counts.values()]
      .sort((a, b) => b.count - a.count)
      .map((v) => v.ngram);
  }, [source, n]);
}

export function useFilteredWords(): WordWithTruneIds[] {
  const selectedContextId = useSelectionStore((s) => s.selectedContext);
  const selectedTruneId = useSelectionStore((s) => s.selectedTrune);
  const selectedNGram = useSelectionStore((s) => s.selectedNGram);
  const contextFilterDirection = useSelectionStore(
    (s) => s.contextFilterDirection
  );
  const truneFilterDirection = useSelectionStore((s) => s.truneFilterDirection);
  const mode = useSelectionStore((s) => s.mode);

  const byContext =
    contextFilterDirection === "backward" && selectedContextId != null;
  const byTrune =
    truneFilterDirection === "forward" &&
    mode === "trunes" &&
    selectedTruneId != null;
  const byNGram =
    truneFilterDirection === "forward" &&
    mode === "ngrams" &&
    selectedNGram != null;

  // Every branch joins wordsWithTruneIds and projects the full row so
  // consumers get { id, meaning, truneIds } and can render without a per-row
  // subscription. byContext/byTrune can both be on (different filter
  // directions); byNGram and byTrune are mutually exclusive by mode. byNGram
  // narrows in memory below via wordContainsNGram.
  const rows = (useLiveQuery(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (q): any => {
      if (byContext && byTrune) {
        return q
          .from({ cwj: contextWordsJunction })
          .where(({ cwj }) => eq(cwj.contextId, selectedContextId))
          .innerJoin({ j: wordTrunesJunction }, ({ cwj, j }) =>
            eq(j.wordId, cwj.wordId)
          )
          .where(({ j }) => eq(j.truneId, selectedTruneId))
          .innerJoin({ w: wordsWithTruneIds }, ({ cwj, w }) =>
            eq(w.id, cwj.wordId)
          )
          .orderBy(({ w }) => w.id)
          .select(({ w }) => w)
          .distinct();
      } else if (byContext) {
        return q
          .from({ cw: contextWordsJunction })
          .where(({ cw }) => eq(cw.contextId, selectedContextId))
          .innerJoin({ w: wordsWithTruneIds }, ({ cw, w }) =>
            eq(w.id, cw.wordId)
          )
          .orderBy(({ w }) => w.id)
          .select(({ w }) => w);
      } else if (byTrune) {
        return q
          .from({ j: wordTrunesJunction })
          .where(({ j }) => eq(j.truneId, selectedTruneId))
          .innerJoin({ w: wordsWithTruneIds }, ({ j, w }) => eq(w.id, j.wordId))
          .orderBy(({ w }) => w.id)
          .select(({ w }) => w)
          .distinct();
      }
      return wordsWithTruneIds;
    },
    [byContext, byTrune, selectedContextId, selectedTruneId]
  ).data ?? []) as WordWithTruneIds[];

  return useMemo(() => {
    if (byNGram && selectedNGram) {
      return rows.filter((w) => wordContainsNGram(w.truneIds, selectedNGram));
    }
    return rows;
  }, [rows, byNGram, selectedNGram]);
}

export function useFilteredContexts(): Context[] {
  const selectedWord = useSelectionStore((s) => s.selectedWord);
  const wordFilterDirection = useSelectionStore((s) => s.wordFilterDirection);
  const byWord = wordFilterDirection === "forward" && selectedWord != null;

  return (useLiveQuery(
    (q) => {
      if (!byWord) return allContexts;
      return q
        .from({ cw: contextWordsJunction })
        .where(({ cw }) => eq(cw.wordId, selectedWord))
        .innerJoin({ c: contexts }, ({ cw, c }) => eq(c.id, cw.contextId))
        .orderBy(({ c }) => c.order)
        .select(({ c }) => c)
        .distinct();
    },
    [byWord, selectedWord]
  ).data ?? []) as Context[];
}
