/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { isEqual } from "lodash";


export interface DataSliceState {
  graphemes: GraphemeData[];
  words: WordData[];
}

interface GraphemeData {
  id: number;
  sound: string;
  sure: boolean;
}

interface WordData {
  word: number[];
  ctxs: string[];
  meaning: string;
  sure: boolean;
}

export const dataSlice = createSlice({
  name: "data",
  initialState: {} as DataSliceState,
  reducers: {
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
          ctxs: [],
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

export const { addWord } = dataSlice.actions;
export default dataSlice.reducer;
