import { configureStore } from "@reduxjs/toolkit";
import selectionReducer from "./reducers/selection";
import type {
  FilterDirection,
  ReverseSyllableStatus,
  Mode,
} from "./reducers/selection";
import dataApi from "./services/data";

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

const store = configureStore({
  reducer: {
    [dataApi.reducerPath]: dataApi.reducer,
    selection: selectionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(dataApi.middleware),
  preloadedState: initialState,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
