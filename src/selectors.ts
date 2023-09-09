import { createSelector } from "@reduxjs/toolkit";
import { getConsonant, getVowel, reverseSyllableMask } from "./glyph";
import {
  ReverseSyllableStatus,
  SelectionSliceState,
} from "./redux/reducers/selection";
import {
  ContextWordJunction,
  GraphemeData,
  WordData,
} from "./redux/services/data";
import { RootState } from "./redux/store";
import { has, isEmpty, isEqual, isNull, uniq } from "lodash";

export const selectVowelFilter = (state: RootState) =>
  state.selection.vowelFilter;
export const selectConsonantFilter = (state: RootState) =>
  state.selection.consonantFilter;
export const selectReverseSyllableFilter = (state: RootState) =>
  state.selection.reverseSyllableFilter;

export const selectPartial = (state: RootState) => state.selection.partial;
export const selectExclusive = (state: RootState) => state.selection.exclusive;
export const selectN = (state: RootState) => state.selection.n;
export const selectMode = (state: RootState) => state.selection.mode;

export const selectSelectedGrapheme = (state: RootState) =>
  state.selection.selectedGrapheme;
export const selectSelectedNGram = (state: RootState) =>
  state.selection.selectedNGram;
export const selectSelectedWord = (state: RootState) =>
  state.selection.selectedWord;
export const selectSelectedContext = (state: RootState) =>
  state.selection.selectedContext;

export const selectGlyphFilterDirection = (state: RootState) =>
  state.selection.glyphFilterDirection;
export const selectGraphemeFilterDirection = (state: RootState) =>
  state.selection.graphemeFilterDirection;
export const selectWordFilterDirection = (state: RootState) =>
  state.selection.wordFilterDirection;
export const selectContextFilterDirection = (state: RootState) =>
  state.selection.contextFilterDirection;

const graphemeMatchesFilters = (
  g: number,
  vowelFilter: number | null,
  consonantFilter: number | null,
  reverseSyllableFilter: ReverseSyllableStatus,
  partial: boolean
): {
  matchesVowel: boolean;
  matchesConsonant: boolean;
  reverseSyllablePass: boolean;
} => {
  let matchesVowel = true;
  let matchesConsonant = true;
  if (vowelFilter != null) {
    matchesVowel = false;
    if (partial) {
      // contains glyph (partial match)
      matchesVowel = (getVowel(g) | vowelFilter) === getVowel(g);
    } else {
      // exact match
      matchesVowel = getVowel(g) === vowelFilter;
    }
  }
  if (consonantFilter != null) {
    matchesConsonant = false;
    if (partial) {
      // contains glyph (partial match)
      matchesConsonant =
        (getConsonant(g) | consonantFilter) === getConsonant(g);
    } else {
      // exact match
      matchesConsonant = getConsonant(g) === consonantFilter;
    }
  }
  let reverseSyllablePass = true;
  if (reverseSyllableFilter === "present") {
    reverseSyllablePass = (g | reverseSyllableMask) === g;
  } else if (reverseSyllableFilter === "absent") {
    reverseSyllablePass = (g | reverseSyllableMask) !== g;
  }
  return { matchesVowel, matchesConsonant, reverseSyllablePass };
};

const getTotalPassValue = (
  vowelFilter: number | null,
  consonantFilter: number | null,
  matchesVowel: boolean,
  matchesConsonant: boolean,
  reverseSyllablePass: boolean,
  exclusive: boolean
): boolean => {
  let vowelConsonantCombinedPass = false;
  if (vowelFilter === null && consonantFilter === null) {
    vowelConsonantCombinedPass = true;
  } else {
    if (vowelFilter === null) {
      vowelConsonantCombinedPass = matchesConsonant;
    } else if (consonantFilter === null) {
      vowelConsonantCombinedPass = matchesVowel;
      // neither are null
    } else {
      if (exclusive) {
        vowelConsonantCombinedPass = matchesVowel && matchesConsonant;
      } else {
        vowelConsonantCombinedPass = matchesVowel || matchesConsonant;
      }
    }
  }
  return reverseSyllablePass && vowelConsonantCombinedPass;
};

export const selectVowelGlyphs = (graphemes?: GraphemeData[]) =>
  createSelector(
    [
      selectGraphemeFilterDirection,
      selectSelectedGrapheme,
      selectSelectedNGram,
      selectPartial,
      selectMode,
      selectVowelFilter,
    ],
    (
      graphemeFilterDirection,
      selectedGrapheme,
      selectedNGram,
      partial,
      mode,
      vowelFilter
    ): number[] => {
      if (!graphemes) return [];
      const allVowelGlyphs = uniq(
        graphemes.map((g) => getVowel(g.id as number))
      ).sort((a, b) => {
        // if (a === vowelFilter) return -1;
        // if (b === vowelFilter) return 1;
        // else
        return a - b;
      });
      if (graphemeFilterDirection === "left") {
        return allVowelGlyphs.filter((g) => {
          if (mode === "ngrams" && selectedNGram) {
            return selectedNGram.reduce((acc, val) => {
              if (partial) {
                return acc || (g | getVowel(val)) === getVowel(val);
              } else {
                return acc || g === getVowel(val);
              }
            }, false);
          } else if (mode === "graphemes" && selectedGrapheme) {
            if (partial) {
              return (
                (g | getVowel(selectedGrapheme.id)) ===
                getVowel(selectedGrapheme.id)
              );
            } else {
              return g === getVowel(selectedGrapheme.id);
            }
          } else return true;
        });
      } else return allVowelGlyphs;
    }
  );

export const selectConsonantGlyphs = (graphemes?: GraphemeData[]) =>
  createSelector(
    [
      selectGraphemeFilterDirection,
      selectSelectedGrapheme,
      selectSelectedNGram,
      selectPartial,
      selectMode,
      selectConsonantFilter,
    ],
    (
      graphemeFilterDirection,
      selectedGrapheme,
      selectedNGram,
      partial,
      mode,
      consonantFilter
    ): number[] => {
      if (!graphemes) return [];
      const allConsonantGlyphs = uniq(
        graphemes.map((g) => getConsonant(g.id as number))
      ).sort((a, b) => {
        // if (a === vowelFilter) return -1;
        // if (b === vowelFilter) return 1;
        // else
        return a - b;
      });
      if (graphemeFilterDirection === "left") {
        return allConsonantGlyphs.filter((g) => {
          if (mode === "ngrams" && selectedNGram) {
            return selectedNGram.reduce((acc, val) => {
              if (partial) {
                return acc || (g | getConsonant(val)) === getConsonant(val);
              } else {
                return acc || g === getConsonant(val);
              }
            }, false);
          } else if (mode === "graphemes" && selectedGrapheme) {
            if (partial) {
              return (
                (g | getConsonant(selectedGrapheme.id)) ===
                getConsonant(selectedGrapheme.id)
              );
            } else {
              return g === getConsonant(selectedGrapheme.id);
            }
          } else return true;
        });
      } else return allConsonantGlyphs;
    }
  );

export const calcFilteredGraphemes = (
  {
    vowelFilter,
    consonantFilter,
    reverseSyllableFilter,
    partial,
    exclusive,
    selectedWord,
    glyphFilterDirection,
    wordFilterDirection,
    selectedGrapheme,
  }: Pick<
    SelectionSliceState,
    | "vowelFilter"
    | "consonantFilter"
    | "reverseSyllableFilter"
    | "partial"
    | "exclusive"
    | "selectedWord"
    | "glyphFilterDirection"
    | "wordFilterDirection"
    | "selectedGrapheme"
  >,
  graphemes: GraphemeData[]
): GraphemeData[] => {
  let filteredGraphemes = graphemes;
  if (glyphFilterDirection === "right") {
    filteredGraphemes = graphemes.filter((gd) => {
      const { matchesVowel, matchesConsonant, reverseSyllablePass } =
        graphemeMatchesFilters(
          gd.id,
          vowelFilter,
          consonantFilter,
          reverseSyllableFilter,
          partial
        );
      return getTotalPassValue(
        vowelFilter,
        consonantFilter,
        matchesVowel,
        matchesConsonant,
        reverseSyllablePass,
        exclusive
      );
    });
  } else if (wordFilterDirection === "left" && selectedWord != null) {
    filteredGraphemes = graphemes.filter((gd) =>
      selectedWord.word.includes(gd.id)
    );
  }
  return filteredGraphemes;
  // .sort((a, b) => {
  //   // if (a.id === selectedGrapheme) return -1;
  //   // if (b.id === selectedGrapheme) return 1;
  //   if (isEmpty(a.sound) && isEmpty(b.sound)) {
  //     return 0;
  //   } else if (isEmpty(a.sound)) {
  //     return 1;
  //   } else if (isEmpty(b.sound)) {
  //     return -1;
  //   } else {
  //     return -1;
  //   }
  // });
};

export const selectFilteredGraphemes = (graphemes?: GraphemeData[]) =>
  createSelector(
    [
      selectVowelFilter,
      selectConsonantFilter,
      selectReverseSyllableFilter,
      selectPartial,
      selectExclusive,
      selectSelectedWord,
      selectGlyphFilterDirection,
      selectWordFilterDirection,
      selectSelectedGrapheme,
    ],
    (
      vowelFilter,
      consonantFilter,
      reverseSyllableFilter,
      partial,
      exclusive,
      selectedWord,
      glyphFilterDirection,
      wordFilterDirection,
      selectedGrapheme
    ) => {
      if (!graphemes) return [];
      return calcFilteredGraphemes(
        {
          vowelFilter,
          consonantFilter,
          reverseSyllableFilter,
          partial,
          exclusive,
          selectedWord,
          glyphFilterDirection,
          wordFilterDirection,
          selectedGrapheme,
        },
        graphemes
      );
    }
  );

export const calcFilteredNGrams = (
  {
    vowelFilter,
    consonantFilter,
    reverseSyllableFilter,
    partial,
    exclusive,
    n,
    selectedWord,
    glyphFilterDirection,
    wordFilterDirection,
    selectedNGram,
  }: Pick<
    SelectionSliceState,
    | "vowelFilter"
    | "consonantFilter"
    | "reverseSyllableFilter"
    | "partial"
    | "exclusive"
    | "n"
    | "selectedWord"
    | "glyphFilterDirection"
    | "wordFilterDirection"
    | "selectedNGram"
  >,
  words: WordData[]
): number[][] => {
  const filteredNGrams = {} as {
    [id: string]: { count: number; ngram: number[] };
  };

  for (let w of words) {
    for (let i = 0; i < w.word.length - (n - 1); i++) {
      const nGramSlice = w.word.slice(i, i + n);
      let nGramMatches = true;
      if (glyphFilterDirection === "right") {
        const results = nGramSlice.map((g) => {
          return graphemeMatchesFilters(
            g,
            vowelFilter,
            consonantFilter,
            reverseSyllableFilter,
            partial
          );
        });
        let reverseSyllablePassExists = results.some(
          (r) => r.reverseSyllablePass
        );
        let consonantMatchExists = results.some((r) => r.matchesConsonant);
        let vowelMatchExists = results.some((r) => r.matchesVowel);
        nGramMatches = getTotalPassValue(
          vowelFilter,
          consonantFilter,
          vowelMatchExists,
          consonantMatchExists,
          reverseSyllablePassExists,
          exclusive
        );
      } else if (wordFilterDirection === "left" && selectedWord != null) {
        nGramMatches = wordContainsNGram(selectedWord.word, nGramSlice);
      }
      if (nGramMatches) {
        const id = nGramSlice.join("_");
        if (!has(filteredNGrams, id)) {
          filteredNGrams[id] = { count: 1, ngram: nGramSlice };
        } else {
          filteredNGrams[id].count++;
        }
      }
    }
  }

  return Object.values(filteredNGrams).map((ng) => {
    return ng.ngram;
  });
  // .sort((a, b) => {
  //   // if (a === selectedNGram) return -1;
  //   // if (b === selectedNGram) return 1;
  //   return (
  //     filteredNGrams[getWordId(b)].count - filteredNGrams[getWordId(a)].count
  //   );
  // });
};

export const selectFilteredNGrams = (words?: WordData[]) =>
  createSelector(
    [
      selectVowelFilter,
      selectConsonantFilter,
      selectReverseSyllableFilter,
      selectPartial,
      selectExclusive,
      selectN,
      selectSelectedWord,
      selectGlyphFilterDirection,
      selectWordFilterDirection,
      selectSelectedNGram,
    ],
    (
      vowelFilter,
      consonantFilter,
      reverseSyllableFilter,
      partial,
      exclusive,
      n,
      selectedWord,
      glyphFilterDirection,
      wordFilterDirection,
      selectedNGram
    ) => {
      if (!words) return [];
      return calcFilteredNGrams(
        {
          vowelFilter,
          consonantFilter,
          reverseSyllableFilter,
          partial,
          exclusive,
          n,
          selectedWord,
          glyphFilterDirection,
          wordFilterDirection,
          selectedNGram,
        },
        words
      );
    }
  );

const wordContainsNGram = (word: number[], nGram: number[]): boolean => {
  const n = nGram.length;
  for (let i = 0; i < word.length - (n - 1); i++) {
    let nGramSlice = word.slice(i, i + n);
    if (isEqual(nGramSlice, nGram)) {
      return true;
    }
  }
  return false;
};

export const calcFilteredWords = (
  {
    selectedGrapheme,
    selectedNGram,
    selectedContext,
    mode,
    graphemeFilterDirection,
    contextFilterDirection,
    selectedWord,
  }: Pick<
    SelectionSliceState,
    | "selectedGrapheme"
    | "selectedNGram"
    | "selectedContext"
    | "mode"
    | "graphemeFilterDirection"
    | "contextFilterDirection"
    | "selectedWord"
  >,
  words: WordData[],
  junctions?: ContextWordJunction[]
): WordData[] => {
  let filteredWords = words;
  if (contextFilterDirection === "left" && selectedContext) {
    if (!junctions) {
      return filteredWords;
    }
    const filteredJunctions = junctions
      .filter((j) => j.contexts_id === selectedContext.id)
      .sort((a, b) => a.order - b.order);
    filteredWords = filteredJunctions.reduce((acc, j) => {
      const word = words.find((w) => w.id === j.words_id);
      if (word) acc.push(word);
      return acc;
    }, [] as WordData[]);
  } else if (graphemeFilterDirection === "right") {
    if (mode === "graphemes" && selectedGrapheme) {
      filteredWords = words.filter((w) => w.word.includes(selectedGrapheme.id));
    } else if (mode === "ngrams" && selectedNGram) {
      filteredWords = words.filter((w) =>
        wordContainsNGram(w.word, selectedNGram)
      );
    }
  }
  return filteredWords;
  // .sort((a, b) => {
  // if (a === selectedWord) return -1;
  // if (b === selectedWord) return 1;
  // if (isEmpty(a.meaning) && isEmpty(b.meaning)) {
  //   return 0;
  // } else if (isEmpty(a.meaning)) {
  //   return 1;
  // } else if (isEmpty(b.meaning)) {
  //   return -1;
  // } else {
  //   return -1;
  // }
  // });
};

export const selectFilteredWords = (
  words?: WordData[],
  junctions?: ContextWordJunction[]
) =>
  createSelector(
    [
      selectSelectedGrapheme,
      selectSelectedNGram,
      selectSelectedContext,
      selectMode,
      selectGraphemeFilterDirection,
      selectContextFilterDirection,
      selectSelectedWord,
    ],
    (
      selectedGrapheme,
      selectedNGram,
      selectedContext,
      mode,
      graphemeFilterDirection,
      contextFilterDirection,
      selectedWord
    ) => {
      if (!words) return [];
      return calcFilteredWords(
        {
          selectedGrapheme,
          selectedNGram,
          selectedContext,
          mode,
          graphemeFilterDirection,
          contextFilterDirection,
          selectedWord,
        },
        words,
        junctions
      );
    }
  );
