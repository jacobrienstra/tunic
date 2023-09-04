/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { isEqual } from "lodash";

export interface DataSliceState {
  graphemes: GraphemeData[];
  words: WordData[];
}

export interface GraphemeData {
  id: number;
  sound: string;
  sure: boolean;
}

export interface WordData {
  word: number[];
  ctxs: string[];
  meaning: string;
  sure: boolean;
}

export const dataSlice = createSlice({
  name: "data",
  initialState: {} as DataSliceState,
  reducers: {
    setSound: (
      state,
      action: PayloadAction<{ sound: string; id: number }>
    ): void => {
      const grapheme = state.graphemes.find((g) => g.id === action.payload.id);
      if (grapheme) {
        grapheme.sound = action.payload.sound;
      }
    },
    toggleGraphemeSure: (state, action: PayloadAction<{ id: number }>) => {
      const grapheme = state.graphemes.find((g) => g.id === action.payload.id);
      if (grapheme) {
        grapheme.sure = !grapheme.sure;
      }
    },
    setMeaning: (
      state,
      action: PayloadAction<{ word: number[]; meaning: string }>
    ) => {
      const word = state.words.find((w) =>
        isEqual(w.word, action.payload.word)
      );
      if (word) {
        word.meaning = action.payload.meaning;
      }
    },
    toggleWordSure: (state, action: PayloadAction<{ word: number[] }>) => {
      const word = state.words.find((w) => w.word === action.payload.word);
      if (word) {
        word.sure = !word.sure;
      }
    },
    addWord: (
      state,
      action: PayloadAction<{ word: number[]; ctx: string }>
    ): void => {
      const matchedWord = state.words.find((w) =>
        isEqual(w.word, action.payload.word)
      );
      // If we already have the word stored
      if (matchedWord != undefined) {
        // Add the context, if not already present
        if (!matchedWord.ctxs.includes(action.payload.ctx)) {
          matchedWord.ctxs.push(action.payload.ctx);
        }
      }
      // Otherwise, add the word as new, initializing values appropriately
      else {
        state.words.push({
          word: action.payload.word,
          ctxs: [action.payload.ctx],
          meaning: "",
          sure: false,
        });
      }

      for (let num of action.payload.word) {
        if (!state.graphemes.some((g) => g.id === num)) {
          state.graphemes.push({ id: num, sound: "", sure: false });
        }
      }
    },
  },
});

export const {
  setSound,
  setMeaning,
  toggleGraphemeSure,
  toggleWordSure,
  addWord,
} = dataSlice.actions;
export default dataSlice.reducer;
