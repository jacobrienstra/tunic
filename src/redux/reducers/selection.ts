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
import { ULVK, getLower, getUpper } from "../../glyph";
import type { RootState } from "../store";
import { has, isEmpty, isEqual, uniq } from "lodash";

export type LeftLineStatus = "present" | "absent" | "either";
export type Mode = "graphemes" | "ngrams";
export type FilterDirection = "off" | "left" | "right";
export interface SelectionSliceState {
  leftLineFilter: LeftLineStatus;
  upperFilter: number | null;
  lowerFilter: number | null;
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
    setUpperFilter: (state, action: PayloadAction<number | null>): void => {
      state.upperFilter = action.payload;
    },
    setLowerFilter: (state, action: PayloadAction<number | null>): void => {
      state.lowerFilter = action.payload;
    },
    setLeftLineFilter: (state, action: PayloadAction<LeftLineStatus>): void => {
      state.leftLineFilter = action.payload;
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

export const selectUpperFilter = (state: RootState) =>
  state.selection.upperFilter;
export const selectLowerFilter = (state: RootState) =>
  state.selection.lowerFilter;
export const selectLeftLineFilter = (state: RootState) =>
  state.selection.leftLineFilter;

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
  upperFilter: number | null,
  lowerFilter: number | null,
  leftLineFilter: LeftLineStatus,
  partial: boolean
): {
  matchesUpper: boolean;
  matchesLower: boolean;
  leftLinePass: boolean;
} => {
  let matchesUpper = true;
  let matchesLower = true;
  if (upperFilter != null) {
    matchesUpper = false;
    if (partial) {
      // contains glyph (partial match)
      matchesUpper = (getUpper(g) | upperFilter) === getUpper(g);
    } else {
      // exact match
      matchesUpper = getUpper(g) === upperFilter;
    }
  }
  if (lowerFilter != null) {
    matchesLower = false;
    if (partial) {
      // contains glyph (partial match)
      matchesLower = (getLower(g) | lowerFilter) === getLower(g);
    } else {
      // exact match
      matchesLower = getLower(g) === lowerFilter;
    }
  }
  let leftLinePass = true;
  if (leftLineFilter === "present") {
    leftLinePass = (g | ULVK) === g;
  } else if (leftLineFilter === "absent") {
    leftLinePass = (g | ULVK) !== g;
  }
  return { matchesUpper, matchesLower, leftLinePass };
};

const getTotalPassValue = (
  upperFilter: number | null,
  lowerFilter: number | null,
  matchesUpper: boolean,
  matchesLower: boolean,
  leftLinePass: boolean,
  exclusive: boolean
): boolean => {
  let upperLowerCombinedPass = false;
  if (upperFilter === null && lowerFilter === null) {
    upperLowerCombinedPass = true;
  } else {
    if (upperFilter === null) {
      upperLowerCombinedPass = matchesLower;
    } else if (lowerFilter === null) {
      upperLowerCombinedPass = matchesUpper;
      // neither are null
    } else {
      if (exclusive) {
        upperLowerCombinedPass = matchesUpper && matchesLower;
      } else {
        upperLowerCombinedPass = matchesUpper || matchesLower;
      }
    }
  }
  return leftLinePass && upperLowerCombinedPass;
};

export const selectUpperGlyphs = createSelector(
  [
    selectGraphemeIds,
    selectGraphemeFilterDirection,
    selectSelectedGrapheme,
    selectPartial,
  ],
  (graphemes, graphemeFilterDirection, selectedGrapheme, partial): number[] => {
    const allUpperGlyphs = uniq(
      graphemes.map((gid) => getUpper(gid as number))
    ).sort();
    if (graphemeFilterDirection === "left" && selectedGrapheme != null) {
      return allUpperGlyphs.filter((g) => {
        if (partial) {
          return (
            (g | getUpper(selectedGrapheme)) === getUpper(selectedGrapheme)
          );
        } else {
          return g === getUpper(selectedGrapheme);
        }
      });
    } else return allUpperGlyphs;
  }
);

export const selectLowerGlyphs = createSelector(
  [
    selectGraphemeIds,
    selectGraphemeFilterDirection,
    selectSelectedGrapheme,
    selectPartial,
  ],
  (graphemes, graphemeFilterDirection, selectedGrapheme, partial) => {
    const allLowerGlyphs = uniq(
      graphemes.map((gid) => getLower(gid as number))
    ).sort();
    if (graphemeFilterDirection === "left" && selectedGrapheme != null) {
      return allLowerGlyphs.filter((g) => {
        if (partial) {
          return (
            (g | getLower(selectedGrapheme)) === getLower(selectedGrapheme)
          );
        } else {
          return g === getLower(selectedGrapheme);
        }
      });
    } else return allLowerGlyphs;
  }
);

export const calcFilteredGraphemes = (
  {
    upperFilter,
    lowerFilter,
    leftLineFilter,
    partial,
    exclusive,
    selectedWord,
    glyphFilterDirection,
    wordFilterDirection,
  }: Pick<
    SelectionSliceState,
    | "upperFilter"
    | "lowerFilter"
    | "leftLineFilter"
    | "partial"
    | "exclusive"
    | "selectedWord"
    | "glyphFilterDirection"
    | "wordFilterDirection"
  >,
  graphemes: GraphemeData[]
): GraphemeData[] => {
  let filteredGraphemes = graphemes;
  if (glyphFilterDirection === "right") {
    filteredGraphemes = graphemes.filter((gd) => {
      const { matchesUpper, matchesLower, leftLinePass } =
        graphemeMatchesFilters(
          gd.id,
          upperFilter,
          lowerFilter,
          leftLineFilter,
          partial
        );
      return getTotalPassValue(
        upperFilter,
        lowerFilter,
        matchesUpper,
        matchesLower,
        leftLinePass,
        exclusive
      );
    });
  } else if (wordFilterDirection === "left" && selectedWord != null) {
    filteredGraphemes = graphemes.filter((gd) =>
      selectedWord.word.includes(gd.id)
    );
  }
  return filteredGraphemes.sort((a, b) => {
    if (isEmpty(a.sound) && isEmpty(b.sound)) {
      return 0;
    } else if (isEmpty(a.sound)) {
      return 1;
    } else if (isEmpty(b.sound)) {
      return -1;
    } else {
      return a.sound.localeCompare(b.sound);
    }
  });
};

export const selectFilteredGraphemes = createSelector(
  [
    selectUpperFilter,
    selectLowerFilter,
    selectLeftLineFilter,
    selectPartial,
    selectExclusive,
    selectSelectedWord,
    selectGlyphFilterDirection,
    selectWordFilterDirection,
    selectAllGraphemes,
  ],
  (
    upperFilter,
    lowerFilter,
    leftLineFilter,
    partial,
    exclusive,
    selectedWord,
    glyphFilterDirection,
    wordFilterDirection,
    graphemes
  ) => {
    return calcFilteredGraphemes(
      {
        upperFilter,
        lowerFilter,
        leftLineFilter,
        partial,
        exclusive,
        selectedWord,
        glyphFilterDirection,
        wordFilterDirection,
      },
      graphemes
    );
  }
);

export const calcFilteredNGrams = (
  {
    upperFilter,
    lowerFilter,
    leftLineFilter,
    partial,
    exclusive,
    n,
    selectedWord,
    glyphFilterDirection,
    wordFilterDirection,
  }: Pick<
    SelectionSliceState,
    | "upperFilter"
    | "lowerFilter"
    | "leftLineFilter"
    | "partial"
    | "exclusive"
    | "n"
    | "selectedWord"
    | "glyphFilterDirection"
    | "wordFilterDirection"
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
            upperFilter,
            lowerFilter,
            leftLineFilter,
            partial
          );
        });
        let leftLinePassExists = results.some((r) => r.leftLinePass);
        let lowerMatchExists = results.some((r) => r.matchesLower);
        let upperMatchExists = results.some((r) => r.matchesUpper);
        nGramMatches = getTotalPassValue(
          upperFilter,
          lowerFilter,
          upperMatchExists,
          lowerMatchExists,
          leftLinePassExists,
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

  return Object.values(filteredNGrams)
    .map((ng) => {
      return ng.ngram;
    })
    .sort((a, b) => {
      return (
        filteredNGrams[getWordId(b)].count - filteredNGrams[getWordId(a)].count
      );
    });
};

export const selectFilteredNGrams = createSelector(
  [
    selectUpperFilter,
    selectLowerFilter,
    selectLeftLineFilter,
    selectPartial,
    selectExclusive,
    selectN,
    selectSelectedWord,
    selectGlyphFilterDirection,
    selectWordFilterDirection,
    selectAllWords,
  ],
  (
    upperFilter,
    lowerFilter,
    leftLineFilter,
    partial,
    exclusive,
    n,
    selectedWord,
    glyphFilterDirection,
    wordFilterDirection,
    words
  ) => {
    return calcFilteredNGrams(
      {
        upperFilter,
        lowerFilter,
        leftLineFilter,
        partial,
        exclusive,
        n,
        selectedWord,
        glyphFilterDirection,
        wordFilterDirection,
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
  }: Pick<
    SelectionSliceState,
    | "selectedGrapheme"
    | "selectedNGram"
    | "selectedContext"
    | "mode"
    | "graphemeFilterDirection"
    | "contextFilterDirection"
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
  return filteredWords.sort((a, b) => {
    if (isEmpty(a.meaning) && isEmpty(b.meaning)) {
      return 0;
    } else if (isEmpty(a.meaning)) {
      return 1;
    } else if (isEmpty(b.meaning)) {
      return -1;
    } else {
      return a.meaning.localeCompare(b.meaning);
    }
  });
};

export const selectFilteredWords = createSelector(
  [
    selectSelectedGrapheme,
    selectSelectedNGram,
    selectSelectedContext,
    selectMode,
    selectGraphemeFilterDirection,
    selectContextFilterDirection,
    selectAllWords,
  ],
  (
    selectedGrapheme,
    selectedNGram,
    selectedContext,
    mode,
    graphemeFilterDirection,
    contextFilterDirection,
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
      },
      words
    );
  }
);

// type AppThunkAction = ThunkAction<void, RootState, unknown, Action<unknown>>;

export const {
  setUpperFilter,
  setLowerFilter,
  setLeftLineFilter,
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
