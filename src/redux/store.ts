import { configureStore } from "@reduxjs/toolkit";
import { dataReducer, selectionReducer } from "./reducers";
import { DataSliceState, addWord } from "./reducers/data";
import { SelectionSliceState } from "./reducers/selection";
import storage from "../storage";
import { readSingleton } from "@directus/sdk";
import { has, isEmpty } from "lodash";
import { updateSingleton } from "@directus/sdk";

export interface RootState {
  data: DataSliceState;
  selection: SelectionSliceState;
}

const initialState: RootState = {
  selection: {
    filterLeftLine: "either",
    filterUpper: null,
    filterLower: null,
    n: 1,
    ngram: null,
    word: null,
  },
  data: {
    graphemes: [
      { id: 2001, sound: "", sure: false },
      { id: 1490, sound: "", sure: false },
      { id: 2093, sound: "", sure: false },
      { id: 187, sound: "", sure: false },
      { id: 1924, sound: "", sure: false },
      { id: 3432, sound: "", sure: false },
      { id: 7892, sound: "", sure: false },
      { id: 1093, sound: "", sure: false },
      { id: 5810, sound: "", sure: false },
    ],
    words: [
      { word: [15, 5321, 287, 198, 2], meaning: "", ctxs: [], sure: false },
      { word: [141], meaning: "", ctxs: [], sure: false },
      { word: [109, 510, 512], meaning: "", ctxs: [], sure: false },
      { word: [151, 1029], meaning: "", ctxs: [], sure: false },
    ],
  },
};

try {
  const initialData = await storage.request(
    readSingleton("corpus", { fields: ["state"] })
  );

  if (
    !isEmpty(initialData) &&
    has(initialData, "state") &&
    typeof initialData.state === "string" &&
    !isEmpty(JSON.parse(initialData["state"]))
  ) {
    initialState.data = JSON.parse(initialData["state"]);
  }
} catch (e) {}

const store = configureStore<RootState>({
  reducer: {
    data: dataReducer,
    selection: selectionReducer,
  },
  preloadedState: initialState,
});

export const addWordSave = async (word: number[], ctx: string) => {
  addWord({ word, ctx });
  await storage.request(
    updateSingleton("corpus", { state: store.getState().data })
  );
};

export default store;
