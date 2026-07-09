import { useMemo } from "react";
import { uniq } from "lodash";
import { useLiveQuery, eq, count } from "@tanstack/react-db";

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
  NGRAM_COLLECTIONS,
  truneIdsFromWordKey,
} from "./store";
import { NGramSize, useSelectionStore } from "./selectionStore";

export function getGrapheme(trune: number, mask: number) {
  return trune & mask;
}

export function useDerivedGraphemeIds(): Map<string, number[]> {
  const { data: subsets } = useGlyphSubsets();
  const { data: truneIds } = useTruneIds();

  return useMemo(() => {
    const result = new Map<string, number[]>();
    for (const subset of subsets) {
      if (subset.modifier) continue;
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

export function useFilteredTrunes() {
  const selectedWord = useSelectionStore((s) => s.selectedWord);
  const wordFilterDirection = useSelectionStore((s) => s.wordFilterDirection);
  const byWord = wordFilterDirection === "backward" && selectedWord != null;

  return useLiveQuery(
    (q) => {
      if (!byWord) return allTrunes;
      return {
        getKey: (t: { id: number }) => t.id,
        query: q
          .from({ j: wordTrunesJunction })
          .where(({ j }) => eq(j.wordId, selectedWord))
          .innerJoin({ t: trunes }, ({ j, t }) => eq(t.id, j.truneId))
          .orderBy(({ j }) => j.order)
          .select(({ t }) => t),
      };
    },
    [byWord, selectedWord]
  );
}

export function useFilteredNGrams() {
  const n = useSelectionStore((s) => s.n);
  const selectedWord = useSelectionStore((s) => s.selectedWord);
  const wordFilterDirection = useSelectionStore((s) => s.wordFilterDirection);
  const byWord = wordFilterDirection === "backward" && selectedWord != null;

  const collection = NGRAM_COLLECTIONS[n];

  return useLiveQuery(
    (q) => {
      let query = q.from({ ng: collection });
      if (byWord) {
        query = query.where(({ ng }) => eq(ng.wordId, selectedWord));
      }
      return query
        .groupBy(({ ng }) => ng.ngKey)
        .select(({ ng }) => ({
          ngKey: ng.ngKey,
          cnt: count(ng.wordId),
        }))
        .orderBy(({ ng }) => count(ng.wordId), "desc");
    },
    [collection, byWord, selectedWord]
  );
}

export function useFilteredWords() {
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

  const ngramCollection = byNGram
    ? NGRAM_COLLECTIONS[truneIdsFromWordKey(selectedNGram).length as NGramSize]
    : null;

  const getKey = (w: { id: string }) => w.id;

  /* byContext can combine with byTrune or byNGram (different
   * filter directions); byTrune and byNGram are mutually exclusive by mode.
   * A join produces a composite result key, not the joined-in row's own key,
   * so every joined branch below sets getKey explicitly to keep it as w.id
   * (WordsSection looks words up in this collection by that id).
   */
  return useLiveQuery(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (q): any => {
      if (byContext && byTrune) {
        return {
          getKey,
          query: q
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
            .distinct(),
        };
      } else if (byContext && byNGram && ngramCollection && selectedNGram) {
        return {
          getKey,
          query: q
            .from({ cwj: contextWordsJunction })
            .where(({ cwj }) => eq(cwj.contextId, selectedContextId))
            .innerJoin({ ng: ngramCollection }, ({ cwj, ng }) =>
              eq(ng.wordId, cwj.wordId)
            )
            .where(({ ng }) => eq(ng.ngKey, selectedNGram))
            .innerJoin({ w: wordsWithTruneIds }, ({ cwj, w }) =>
              eq(w.id, cwj.wordId)
            )
            .orderBy(({ w }) => w.id)
            .select(({ w }) => w)
            .distinct(),
        };
      } else if (byContext) {
        return {
          getKey,
          query: q
            .from({ cw: contextWordsJunction })
            .where(({ cw }) => eq(cw.contextId, selectedContextId))
            .innerJoin({ w: wordsWithTruneIds }, ({ cw, w }) =>
              eq(w.id, cw.wordId)
            )
            .orderBy(({ w }) => w.id)
            .select(({ w }) => w),
        };
      } else if (byTrune) {
        return {
          getKey,
          query: q
            .from({ j: wordTrunesJunction })
            .where(({ j }) => eq(j.truneId, selectedTruneId))
            .innerJoin({ w: wordsWithTruneIds }, ({ j, w }) =>
              eq(w.id, j.wordId)
            )
            .orderBy(({ w }) => w.id)
            .select(({ w }) => w)
            .distinct(),
        };
      } else if (byNGram && ngramCollection && selectedNGram) {
        return {
          getKey,
          query: q
            .from({ ng: ngramCollection })
            .where(({ ng }) => eq(ng.ngKey, selectedNGram))
            .innerJoin({ w: wordsWithTruneIds }, ({ ng, w }) =>
              eq(w.id, ng.wordId)
            )
            .orderBy(({ w }) => w.id)
            .select(({ w }) => w)
            .distinct(),
        };
      }
      return wordsWithTruneIds;
    },
    [
      byContext,
      byTrune,
      selectedContextId,
      selectedTruneId,
      ngramCollection,
      selectedNGram,
    ]
  );
}

export function useFilteredContexts() {
  const selectedWord = useSelectionStore((s) => s.selectedWord);
  const wordFilterDirection = useSelectionStore((s) => s.wordFilterDirection);
  const byWord = wordFilterDirection === "forward" && selectedWord != null;

  return useLiveQuery(
    (q) => {
      if (!byWord) return allContexts;
      return {
        getKey: (c: { id: string }) => c.id,
        query: q
          .from({ cw: contextWordsJunction })
          .where(({ cw }) => eq(cw.wordId, selectedWord))
          .innerJoin({ c: contexts }, ({ cw, c }) => eq(c.id, cw.contextId))
          .orderBy(({ c }) => c.order)
          .select(({ c }) => c)
          .distinct(),
      };
    },
    [byWord, selectedWord]
  );
}
