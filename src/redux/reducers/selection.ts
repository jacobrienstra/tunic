/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WordData } from "./data";

type LeftLineStatus = "present" | "absent" | "either";

export interface SelectionSliceState {
  filterLeftLine: LeftLineStatus;
  filterUpper: number | null;
  filterLower: number | null;
  partial: boolean;
  exclusive: boolean;
  n: number;
  ngram: null | number | number[];
  word: WordData | null;
}

export const selectionSlice = createSlice({
  name: "selection",
  initialState: {} as SelectionSliceState,
  reducers: {
    setUpperFilter: (state, action: PayloadAction<number | null>): void => {
      state.filterUpper = action.payload;
    },
    setLowerFilter: (state, action: PayloadAction<number | null>): void => {
      state.filterLower = action.payload;
    },
    setLeftLineFilter: (state, action: PayloadAction<LeftLineStatus>): void => {
      state.filterLeftLine = action.payload;
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
    setNGram: (
      state,
      action: PayloadAction<null | number | number[]>
    ): void => {
      state.ngram = action.payload;
    },
    setWord: (state, action: PayloadAction<null | WordData>): void => {
      state.word = action.payload;
    },
  },
});

export const {
  setUpperFilter,
  setLowerFilter,
  setLeftLineFilter,
  togglePartialFilter,
  toggleExclusive,
  setN,
  setNGram,
  setWord,
} = selectionSlice.actions;

export default selectionSlice.reducer;
