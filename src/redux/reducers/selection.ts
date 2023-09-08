/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  type GraphemeData,
  type WordData,
  getWordId,
  selectGraphemeIds,
  selectAllGraphemes,
  selectAllWords,
} from "./data";
import { createSelector } from "@reduxjs/toolkit";
import { getConsonant, getVowel, reverseSyllableMask } from "../../glyph";
import type { RootState } from "../store";
import { has, isEmpty, isEqual, uniq } from "lodash";

export type ReverseSyllableStatus = "present" | "absent" | "either";
export type Mode = "graphemes" | "ngrams";
export type FilterDirection = "off" | "left" | "right";
export interface SelectionSliceState {
  reverseSyllableFilter: ReverseSyllableStatus;
  vowelFilter: number | null;
  consonantFilter: number | null;
  partial: boolean;
  exclusive: boolean;
  n: number;
  mode: Mode;
  glyphFilterDirection: FilterDirection;
  graphemeFilterDirection: FilterDirection;
  wordFilterDirection: FilterDirection;
  contextFilterDirection: FilterDirection;
  selectedGrapheme: null | number;
  selectedNGram: null | number[];
  selectedWord: WordData | null;
  selectedContext: string | null;
}

export const selectionSlice = createSlice({
  name: "selection",
  initialState: {} as SelectionSliceState,
  reducers: {
    setVowelFilter: (state, action: PayloadAction<number | null>): void => {
      state.vowelFilter = action.payload;
    },
    setConsonantFilter: (state, action: PayloadAction<number | null>): void => {
      state.consonantFilter = action.payload;
    },
    setReverseSyllableFilter: (
      state,
      action: PayloadAction<ReverseSyllableStatus>
    ): void => {
      state.reverseSyllableFilter = action.payload;
    },
    togglePartialFilter: (state): void => {
      state.partial = !state.partial;
    },
    toggleExclusive: (state): void => {
      state.exclusive = !state.exclusive;
    },
    setN: (state, action: PayloadAction<number>): void => {
      state.n = action.payload;
    },
    setMode: (state, action: PayloadAction<Mode>): void => {
      state.mode = action.payload;
    },
    setGlyphFilterDirection: (
      state,
      action: PayloadAction<FilterDirection>
    ): void => {
      state.glyphFilterDirection = action.payload;
      if (action.payload === "right") {
        if (state.graphemeFilterDirection === "left") {
          state.graphemeFilterDirection = "off";
        } else if (state.wordFilterDirection === "left") {
          state.wordFilterDirection = "off";
        }
      }
    },
    setGraphemeFilterDirection: (
      state,
      action: PayloadAction<FilterDirection>
    ): void => {
      state.graphemeFilterDirection = action.payload;
      if (action.payload === "left" && state.glyphFilterDirection === "right") {
        state.glyphFilterDirection = "off";
      }
      if (action.payload === "right" && state.wordFilterDirection === "left") {
        state.wordFilterDirection = "off";
      }
    },
    setWordFilterDirection: (
      state,
      action: PayloadAction<FilterDirection>
    ): void => {
      state.wordFilterDirection = action.payload;
      if (action.payload === "left") {
        if (state.graphemeFilterDirection === "right") {
          state.graphemeFilterDirection = "off";
        }
        if (state.glyphFilterDirection === "right") {
          state.glyphFilterDirection = "off";
        }
      }
      if (
        action.payload === "right" &&
        state.contextFilterDirection === "left"
      ) {
        state.contextFilterDirection = "off";
      }
    },
    setContextFilterDirection: (
      state,
      action: PayloadAction<FilterDirection>
    ): void => {
      state.contextFilterDirection = action.payload;
      if (action.payload === "left") {
        if (state.wordFilterDirection === "right") {
          state.wordFilterDirection = "off";
        }
        if (state.graphemeFilterDirection === "right") {
          state.graphemeFilterDirection = "off";
        }
      }
    },
    setSelectedGrapheme: (
      state,
      action: PayloadAction<null | number>
    ): void => {
      // state.selectedContext = null;
      state.selectedGrapheme = action.payload;
    },
    setSelectedNGram: (state, action: PayloadAction<null | number[]>): void => {
      // state.selectedContext = null;
      state.selectedNGram = action.payload;
    },
    setSelectedWord: (state, action: PayloadAction<null | WordData>): void => {
      state.selectedWord = action.payload;
      // if (state.selectedContext) {
      //   state.selectedContext = null;
      // }
    },
    setSelectedContext: (state, action: PayloadAction<null | string>): void => {
      // state.selectedWord = null;
      // state.selectedGrapheme = null;
      // state.selectedNGram = null;
      state.selectedContext = action.payload;
    },
  },
});

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

export const selectVowelGlyphs = createSelector(
  [
    selectGraphemeIds,
    selectGraphemeFilterDirection,
    selectSelectedGrapheme,
    selectPartial,
    selectVowelFilter,
  ],
  (
    graphemes,
    graphemeFilterDirection,
    selectedGrapheme,
    partial,
    vowelFilter
  ): number[] => {
    const allVowelGlyphs = uniq(
      graphemes.map((gid) => getVowel(gid as number))
    ).sort((a, b) => {
      // if (a === vowelFilter) return -1;
      // if (b === vowelFilter) return 1;
      // else
      return a - b;
    });
    if (graphemeFilterDirection === "left" && selectedGrapheme != null) {
      return allVowelGlyphs.filter((g) => {
        if (partial) {
          return (
            (g | getVowel(selectedGrapheme)) === getVowel(selectedGrapheme)
          );
        } else {
          return g === getVowel(selectedGrapheme);
        }
      });
    } else return allVowelGlyphs;
  }
);

export const selectConsonantGlyphs = createSelector(
  [
    selectGraphemeIds,
    selectGraphemeFilterDirection,
    selectSelectedGrapheme,
    selectPartial,
    selectConsonantFilter,
  ],
  (
    graphemes,
    graphemeFilterDirection,
    selectedGrapheme,
    partial,
    consonantFilter
  ) => {
    const allConsonantGlyphs = uniq(
      graphemes.map((gid) => getConsonant(gid as number))
    ).sort((a, b) => {
      // if (a === consonantFilter) return -1;
      // if (b === consonantFilter) return 1;
      // else
      return a - b;
    });
    if (graphemeFilterDirection === "left" && selectedGrapheme != null) {
      return allConsonantGlyphs.filter((g) => {
        if (partial) {
          return (
            (g | getConsonant(selectedGrapheme)) ===
            getConsonant(selectedGrapheme)
          );
        } else {
          return g === getConsonant(selectedGrapheme);
        }
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

export const selectFilteredGraphemes = createSelector(
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
    selectAllGraphemes,
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
    selectedGrapheme,
    graphemes
  ) => {
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
        const id = getWordId(nGramSlice);
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

export const selectFilteredNGrams = createSelector(
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
    selectAllWords,
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
    selectedNGram,
    words
  ) => {
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
  words: WordData[]
): WordData[] => {
  let filteredWords = words;
  if (contextFilterDirection === "left" && selectedContext) {
    filteredWords = words.filter((w) => w.ctxs.includes(selectedContext));
  } else if (graphemeFilterDirection === "right") {
    if (mode === "graphemes" && selectedGrapheme) {
      filteredWords = words.filter((w) => w.word.includes(selectedGrapheme));
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

export const selectFilteredWords = createSelector(
  [
    selectSelectedGrapheme,
    selectSelectedNGram,
    selectSelectedContext,
    selectMode,
    selectGraphemeFilterDirection,
    selectContextFilterDirection,
    selectSelectedWord,
    selectAllWords,
  ],
  (
    selectedGrapheme,
    selectedNGram,
    selectedContext,
    mode,
    graphemeFilterDirection,
    contextFilterDirection,
    selectedWord,
    words
  ) => {
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
      words
    );
  }
);

// type AppThunkAction = ThunkAction<void, RootState, unknown, Action<unknown>>;

export const {
  setVowelFilter,
  setConsonantFilter,
  setReverseSyllableFilter,
  togglePartialFilter,
  toggleExclusive,
  setN,
  setMode,
  setGlyphFilterDirection,
  setGraphemeFilterDirection,
  setWordFilterDirection,
  setContextFilterDirection,
  setSelectedGrapheme,
  setSelectedNGram,
  setSelectedWord,
  setSelectedContext,
} = selectionSlice.actions;



export default selectionSlice.reducer;
