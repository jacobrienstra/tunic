/* eslint-disable no-param-reassign */
import {
  createEntityAdapter,
  createSlice,
  createAsyncThunk,
  PayloadAction,
  Dispatch,
} from "@reduxjs/toolkit";
import type { RootState } from "../store";
import storage from "../../storage";
import { updateSingleton } from "@directus/sdk";

const graphemesAdapter = createEntityAdapter<GraphemeData>({
  selectId: (graphemeData): number => graphemeData.id,
  // sortComparer: (a, b) => a.sound.localeCompare(b.sound),
});

export const getWordId = (word: number[]): string => {
  return word.reduce((acc, cur) => {
    return acc + "_" + cur.toString();
  }, "");
};

const wordsAdapter = createEntityAdapter<WordData>({
  selectId: (wordData) => getWordId(wordData.word),
  // sortComparer: (a, b) => a.meaning.localeCompare(b.meaning),
});

export const {
  selectIds: selectGraphemeIds,
  selectAll: selectAllGraphemes,
  selectById: selectGraphemeById,
} = graphemesAdapter.getSelectors((state: RootState) => state.data.graphemes);

export const {
  selectIds: selectWordIds,
  selectAll: selectAllWords,
  selectById: selectWordById,
} = wordsAdapter.getSelectors((state: RootState) => state.data.words);

export interface DataSliceState {
  graphemes: { ids: number[]; entities: { [id: number]: GraphemeData } };
  words: { ids: number[]; entities: { [id: string]: WordData } };
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
      graphemesAdapter.updateOne(state.graphemes, {
        id: action.payload.id,
        changes: { sound: action.payload.sound },
      });
    },
    toggleGraphemeSure: (state, action: PayloadAction<{ id: number }>) => {
      const grapheme = state.graphemes.entities[action.payload.id];
      if (grapheme) {
        grapheme.sure = !grapheme.sure;
      }
    },
    setMeaning: (
      state,
      action: PayloadAction<{ word: number[]; meaning: string }>
    ) => {
      wordsAdapter.updateOne(state.words, {
        id: getWordId(action.payload.word),
        changes: { meaning: action.payload.meaning },
      });
    },
    toggleWordSure: (state, action: PayloadAction<{ word: number[] }>) => {
      const word = state.words.entities[getWordId(action.payload.word)];
      if (word) {
        word.sure = !word.sure;
      }
    },
    addWord: (
      state,
      action: PayloadAction<{ word: number[]; ctx: string }>
    ): void => {
      const matchedWord = state.words.entities[getWordId(action.payload.word)];
      // If we already have the word stored
      if (matchedWord) {
        // Add the context, if not already present
        if (!matchedWord.ctxs.includes(action.payload.ctx)) {
          matchedWord.ctxs.push(action.payload.ctx);
        }
      }
      // Otherwise, add the word as new, initializing values appropriately
      else {
        wordsAdapter.addOne(state.words, {
          word: action.payload.word,
          ctxs: [action.payload.ctx],
          meaning: "",
          sure: false,
        });
      }

      for (let num of action.payload.word) {
        graphemesAdapter.upsertOne(state.graphemes, {
          id: num,
        } as GraphemeData);
      }
    },
  },
});

export const toggleGraphemeSureSave = createAsyncThunk<
  void,
  { id: number },
  { state: RootState; dispatch: Dispatch }
>("data/toggleGraphemeSureSave", async (args, thunkAPI) => {
  thunkAPI.dispatch(toggleGraphemeSure(args));
  const newState = thunkAPI.getState();
  await storage.request(updateSingleton("corpus", { state: newState.data }));
  return;
});

export const toggleWordSureSave = createAsyncThunk<
  void,
  { word: number[] },
  { state: RootState; dispatch: Dispatch }
>("data/toggleWordSureSave", async (args, thunkAPI) => {
  thunkAPI.dispatch(toggleWordSure(args));
  const newState = thunkAPI.getState();
  await storage.request(updateSingleton("corpus", { state: newState.data }));
  return;
});

export const setMeaningSave = createAsyncThunk<
  void,
  { word: number[]; meaning: string },
  { state: RootState; dispatch: Dispatch }
>("data/setMeaningSave", async (args, thunkAPI) => {
  thunkAPI.dispatch(setMeaning(args));
  const newState = thunkAPI.getState();
  await storage.request(updateSingleton("corpus", { state: newState.data }));
  return;
});

export const setSoundSave = createAsyncThunk<
  void,
  { sound: string; id: number },
  { state: RootState; dispatch: Dispatch }
>("data/setSoundSave", async (args, thunkAPI) => {
  thunkAPI.dispatch(setSound(args));
  const newState = thunkAPI.getState();
  await storage.request(updateSingleton("corpus", { state: newState.data }));
  return;
});

export const addWordSave = createAsyncThunk<
  void,
  { word: number[]; ctx: string },
  { state: RootState; dispatch: Dispatch }
>("data/addWordSave", async (args, thunkAPI) => {
  thunkAPI.dispatch(addWord(args));
  const newState = thunkAPI.getState();
  await storage.request(updateSingleton("corpus", { state: newState.data }));
  return;
});

const { setSound, setMeaning, toggleGraphemeSure, toggleWordSure, addWord } =
  dataSlice.actions;
export default dataSlice.reducer;
