import { useMemo } from "react";
import { uniq } from "lodash";
import { useLiveQuery, eq, count } from "@tanstack/react-db";

import {
  useGlyphSubsets,
  contexts,
  wordTrunesJunction,
  contextWordsJunction,
  allContexts,
  allTrunes,
  trunes as trunesCollection,
  wordsWithTruneIds,
  NGRAM_COLLECTIONS,
  truneIdsFromWordKey,
  useTrunes,
  type Trune,
  type GlyphSubsetsCollection,
} from "./store";
import { getGrapheme } from "./store";
import { NGramSize, useSelectionStore } from "./selectionStore";
import { valPassesFilter, type LogicNode } from "./logic";

export function useDerivedGraphemes(): Map<string, Trune[]> {
  const { data: subsets } = useGlyphSubsets();
  const selectedTruneId = useSelectionStore((s) => s.selectedTrune);
  const truneFilterDirection = useSelectionStore((s) => s.truneFilterDirection);

  const trunes = useTrunes();

  return useMemo(() => {
    const truneSource =
      truneFilterDirection == "backward" &&
      selectedTruneId != null &&
      trunes.collection.get(selectedTruneId) != null
        ? [trunes.collection.get(selectedTruneId)!]
        : trunes.data;
    const result = new Map<string, Trune[]>();
    for (const subset of subsets) {
      if (subset.modifier) continue;
      result.set(
        subset.id,
        uniq(truneSource.map((t) => getGrapheme(t.id, subset.mask)))
          .filter((g) => g !== 0)
          .map(
            (g) =>
              trunes.collection.get(g) ?? { id: g, meaning: "", derived: true }
          )
          .sort((a, b) => a.id - b.id)
      );
    }
    return result;
  }, [subsets, trunes, truneFilterDirection, selectedTruneId]);
}

// Trune ids matching the grapheme filter tree. Each subset leaf tests
// getGrapheme(t.id, mask) against that subset's selected grapheme; a subset
// with no selection is discarded (see valPassesFilter). A null result — no
// constraint — counts as a match, so a fully-discarded tree matches every trune.
export function matchingTruneIds(
  tree: LogicNode,
  trunes: Trune[],
  subsets: GlyphSubsetsCollection,
  selectedGraphemes: Record<string, number | null>
): Set<number> {
  const ids = new Set<number>();
  for (const t of trunes) {
    const r = valPassesFilter(tree, t.id, subsets, selectedGraphemes);
    if (r !== false) ids.add(t.id);
  }
  return ids;
}

// The trune ids to show. With no active filter, that's every trune.
export function useFilteredTrunes(): Set<number> {
  const selectedWord = useSelectionStore((s) => s.selectedWord);
  const wordFilterDirection = useSelectionStore((s) => s.wordFilterDirection);
  const graphemeFilterLogic = useSelectionStore((s) => s.graphemeFilterLogic);
  const selectedGraphemes = useSelectionStore((s) => s.selectedGraphemes);
  const graphemesFilterDirection = useSelectionStore(
    (s) => s.graphemesFilterDirection
  );
  const subsets = useGlyphSubsets();

  const byWord = wordFilterDirection === "backward" && selectedWord != null;
  // valPassesFilter returns null iff every leaf discards (no live selection),
  // independent of the value passed — so any value reveals whether the filter
  // constrains anything.
  const byGraphemes =
    graphemesFilterDirection === "forward" &&
    graphemeFilterLogic !== null &&
    valPassesFilter(
      graphemeFilterLogic,
      0,
      subsets.collection,
      selectedGraphemes
    ) !== null;

  // The candidate trunes to filter: the selected word's, joined through the
  // junction, or every trune when the word filter is off (also the no-op
  // collection the hook must return each render).
  const candidates = useLiveQuery(
    (q) => {
      if (!byWord || selectedWord == null) return allTrunes;
      return {
        getKey: (t: { id: number }) => t.id,
        query: q
          .from({ j: wordTrunesJunction })
          .where(({ j }) => eq(j.wordId, selectedWord))
          .innerJoin({ t: trunesCollection }, ({ j, t }) => eq(t.id, j.truneId))
          .orderBy(({ j }) => j.order)
          .select(({ t }) => t),
      };
    },
    [byWord, selectedWord]
  );

  return useMemo(() => {
    const source = candidates.data ?? [];
    // The grapheme tree can't be expressed in the query, so filter candidates
    // in JS. With byWord on, source is already the word's trunes, so matching
    // over it yields the intersection.
    if (byGraphemes && graphemeFilterLogic) {
      return matchingTruneIds(
        graphemeFilterLogic,
        source,
        subsets.collection,
        selectedGraphemes
      );
    }
    return new Set(source.map((t) => t.id));
  }, [
    byGraphemes,
    candidates,
    graphemeFilterLogic,
    selectedGraphemes,
    subsets,
  ]);
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
