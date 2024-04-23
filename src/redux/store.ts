import { isEmpty, throttle } from "lodash";
import { configureStore } from "@reduxjs/toolkit";

import dataApi from "./services/data";
import selectionReducer from "./reducers/selection";
import type {
  FilterDirection,
  ReverseSyllableStatus,
  Mode,
} from "./reducers/selection";

const initialState = {
  selection: {
    vowelFilter: null,
    consonantFilter: null,
    reverseSyllableFilter: "either" as ReverseSyllableStatus,
    partial: false,
    exclusive: true,
    n: 2,
    mode: "graphemes" as Mode,
    glyphFilterDirection: "right" as FilterDirection,
    graphemeFilterDirection: "right" as FilterDirection,
    wordFilterDirection: "right" as FilterDirection,
    contextFilterDirection: "off" as FilterDirection,
    selectedGrapheme: null,
    selectedNGram: null,
    selectedWord: null,
    selectedContext: null,
  },
};

export const loadState = () => {
  try {
    const serializedState = localStorage.getItem("tunicState");
    if (serializedState === null || isEmpty(serializedState)) {
      return initialState;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

export const saveState = (state: Partial<RootState>) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("tunicState", serializedState);
  } catch {
    // ignore write errors
  }
};
const persistedState = loadState();

const store = configureStore({
  reducer: {
    [dataApi.reducerPath]: dataApi.reducer,
    selection: selectionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(dataApi.middleware),
  preloadedState: persistedState,
});

store.subscribe(
  throttle(() => {
    saveState({
      selection: store.getState().selection,
    });
  }, 1000)
);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
