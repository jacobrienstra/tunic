import {
  ActionCreatorWithPayload,
  AnyAction,
  Dispatch,
  configureStore,
} from "@reduxjs/toolkit";
import { dataReducer, selectionReducer } from "./reducers";
import { DataSliceState } from "./reducers/data";
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
    partial: true,
    exclusive: false,
    n: 2,
    selectedGrapheme: null,
    selectedNGram: null,
    selectedWord: null,
    selectedContext: null,
    mode: "graphemes",
  },
  data: {
    graphemes: [],
    words: [],
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

const store = configureStore<RootState>({
  reducer: {
    data: dataReducer,
    selection: selectionReducer,
  },
  preloadedState: initialState,
});

export const saveAction = async (
  dispatch: Dispatch<AnyAction>,
  action: ActionCreatorWithPayload<any>,
  argsObj: any
) => {
  dispatch(action(argsObj));
  await storage.request(
    updateSingleton("corpus", { state: store.getState().data })
  );
};

export default store;
