import { configureStore } from "@reduxjs/toolkit";
import { dataReducer, selectionReducer } from "./reducers";
import corpusData from "../corpusData.json";
import { DataSliceState } from "./reducers/data";
import { SelectionSliceState } from "./reducers/selection";

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
  data: { graphemes: [], words: [] },
};
if (corpusData != null) {
  initialState.data = corpusData as DataSliceState;
}

const store = configureStore<RootState>({
  reducer: {
    data: dataReducer,
    selection: selectionReducer,
  },
  preloadedState: initialState,
});

export default store;
