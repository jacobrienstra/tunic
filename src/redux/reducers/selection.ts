/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ContextData,
  type GraphemeData,
  type WordData,
} from "../services/data";

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
  selectedGrapheme: null | GraphemeData;
  selectedNGram: null | number[];
  selectedWord: WordData | null;
  selectedContext: ContextData | null;
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
      if (action.payload === "right") {
        if (state.wordFilterDirection === "left") {
          state.wordFilterDirection = "off";
        }
        if (state.contextFilterDirection === "left") {
          state.contextFilterDirection = "off";
        }
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
      action: PayloadAction<null | GraphemeData>
    ): void => {
      state.selectedGrapheme = action.payload;
    },
    setSelectedNGram: (state, action: PayloadAction<null | number[]>): void => {
      state.selectedNGram = action.payload;
    },
    setSelectedWord: (state, action: PayloadAction<null | WordData>): void => {
      state.selectedWord = action.payload;
    },
    setSelectedContext: (
      state,
      action: PayloadAction<null | ContextData>
    ): void => {
      state.selectedContext = action.payload;
    },
  },
});


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
