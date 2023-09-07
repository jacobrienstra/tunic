import {
  ActionCreatorWithPayload,
  AnyAction,
  Dispatch,
  configureStore,
} from "@reduxjs/toolkit";
import { dataReducer, selectionReducer } from "./reducers";
import type {
  FilterDirection,
  LeftLineStatus,
  Mode,
} from "./reducers/selection";
import storage from "../storage";
import { readSingleton } from "@directus/sdk";
import { has, isEmpty } from "lodash";

const initialState = {
  selection: {
    upperFilter: null,
    lowerFilter: null,
    leftLineFilter: "either" as LeftLineStatus,
    partial: true,
    exclusive: false,
    n: 2,
    mode: "graphemes" as Mode,
    graphemeFilterDirection: "right" as FilterDirection,
    wordFilterDirection: "right" as FilterDirection,
    selectedGrapheme: null,
    selectedNGram: null,
    selectedWord: null,
    selectedContext: null,
  },
  data: {
    graphemes: { ids: [], entities: {} },
    words: { ids: [], entities: {} },
  },
};

try {
  const initialData = await storage.request(
    readSingleton("corpus", { fields: ["state"] })
  );

  if (
    !isEmpty(initialData) &&
    has(initialData, "state") &&
    !isEmpty(initialData.state)
  ) {
    initialState.data = initialData["state"];
  }
} catch (e) {}

const store = configureStore({
  reducer: {
    data: dataReducer,
    selection: selectionReducer,
  },
  preloadedState: initialState,
});

// export const saveAction = async (
//   dispatch: Dispatch<AnyAction>,
//   action: ActionCreatorWithPayload<any>,
//   argsObj: any
// ) => {
//   dispatch(action(argsObj));
//   await storage.request(
//     updateSingleton("corpus", { state: store.getState().data })
//   );
// };
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
