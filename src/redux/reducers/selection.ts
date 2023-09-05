/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { GraphemeData, WordData } from "./data";
import { createSelector } from "@reduxjs/toolkit";
import { ULVK, getLower, getUpper } from "../../glyph";
import type { RootState } from "../store";

export type LeftLineStatus = "present" | "absent" | "either";
export type Mode = "graphemes" | "ngrams";

export interface SelectionSliceState {
  leftLineFilter: LeftLineStatus;
  upperFilter: number | null;
  lowerFilter: number | null;
  partial: boolean;
  exclusive: boolean;
  n: number;
  selectedGrapheme: null | number;
  selectedNGram: null | number[];
  selectedWord: WordData | null;
  selectedContext: string | null;
  mode: Mode;
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
    setSelectedGrapheme: (
      state,
      action: PayloadAction<null | number>
    ): void => {
      state.selectedGrapheme = action.payload;
    },
    setSelectedNGram: (state, action: PayloadAction<null | number[]>): void => {
      state.selectedNGram = action.payload;
    },
    setSelectedWord: (state, action: PayloadAction<null | WordData>): void => {
      state.selectedWord = action.payload;
    },
    setMode: (state, action: PayloadAction<Mode>): void => {
      state.mode = action.payload;
    },
  },
});

const selectUpperFilter = (state: RootState) => state.selection.upperFilter;
const selectLowerFilter = (state: RootState) => state.selection.lowerFilter;
const selectLeftLineFilter = (state: RootState) =>
  state.selection.leftLineFilter;

const selectPartial = (state: RootState) => state.selection.partial;
const selectExclusive = (state: RootState) => state.selection.exclusive;
const selectN = (state: RootState) => state.selection.n;

const selectSelectedGrapheme = (state: RootState) =>
  state.selection.selectedGrapheme;
const selectSelectedNGram = (state: RootState) => state.selection.selectedNGram;
const selectSelectedWord = (state: RootState) => state.selection.selectedWord;
const selectSelectedContext = (state: RootState) =>
  state.selection.selectedContext;

const selectGraphemes = (state: RootState) => state.data.graphemes;
const selectWords = (state: RootState) => state.data.words;

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
      matchesLower = getLower(g) === upperFilter;
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

export const calcFilteredGraphemes = (
  {
    upperFilter,
    lowerFilter,
    leftLineFilter,
    partial,
    exclusive,
  }: Pick<
    SelectionSliceState,
    "upperFilter" | "lowerFilter" | "leftLineFilter" | "partial" | "exclusive"
  >,
  graphemes: GraphemeData[]
): GraphemeData[] => {
  const filteredGraphemes = graphemes.filter((gd) => {
    const { matchesUpper, matchesLower, leftLinePass } = graphemeMatchesFilters(
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
  return filteredGraphemes;
};

export const selectFilteredGraphemes = createSelector(
  [
    selectUpperFilter,
    selectLowerFilter,
    selectLeftLineFilter,
    selectPartial,
    selectExclusive,
    selectGraphemes,
  ],
  (upperFilter, lowerFilter, leftLineFilter, partial, exclusive, graphemes) => {
    return calcFilteredGraphemes(
      {
        upperFilter,
        lowerFilter,
        leftLineFilter,
        partial,
        exclusive,
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
  }: Pick<
    SelectionSliceState,
    | "upperFilter"
    | "lowerFilter"
    | "leftLineFilter"
    | "partial"
    | "exclusive"
    | "n"
  >,
  words: WordData[]
): number[][] => {
  const filteredNGrams = new Set<number[]>();
  for (let w of words) {
    for (let i = 0; i < w.word.length - (n - 1); i++) {
      const nGramSlice = w.word.slice(i, i + n);
      let nGramMatches = false;
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
      if (nGramMatches) {
        filteredNGrams.add(nGramSlice);
      }
    }
  }
  return [...filteredNGrams];
};

export const selectFilteredNGrams = createSelector(
  [
    selectUpperFilter,
    selectLowerFilter,
    selectLeftLineFilter,
    selectPartial,
    selectExclusive,
    selectN,
    selectWords,
  ],
  (upperFilter, lowerFilter, leftLineFilter, partial, exclusive, n, words) => {
    return calcFilteredNGrams(
      {
        upperFilter,
        lowerFilter,
        leftLineFilter,
        partial,
        exclusive,
        n,
      },
      words
    );
  }
);

export const {
  setUpperFilter,
  setLowerFilter,
  setLeftLineFilter,
  togglePartialFilter,
  toggleExclusive,
  setN,
  setSelectedGrapheme,
  setSelectedNGram,
  setSelectedWord,
  setMode,
} = selectionSlice.actions;

export default selectionSlice.reducer;
