import { persist } from "zustand/middleware";
import { create } from "zustand";
import { isEqual } from "lodash";

export type Mode = "trunes" | "ngrams";
export type FilterDirection = "off" | "backward" | "forward";

export interface SelectionState {
  n: number;
  mode: Mode;
  graphemesFilterDirection: FilterDirection;
  truneFilterDirection: FilterDirection;
  wordFilterDirection: FilterDirection;
  contextFilterDirection: FilterDirection;
  selectedTrune: number | null;
  selectedNGram: number[] | null;
  selectedWord: number | null;
  selectedContext: number | null;
}

const initialState: SelectionState = {
  n: 2,
  mode: "trunes",
  graphemesFilterDirection: "forward",
  truneFilterDirection: "forward",
  wordFilterDirection: "forward",
  contextFilterDirection: "off",
  selectedTrune: null,
  selectedNGram: null,
  selectedWord: null,
  selectedContext: null,
};

interface SelectionActions {
  setN: (v: number) => void;
  setMode: (v: Mode) => void;
  setGraphemesFilterDirection: (v: FilterDirection) => void;
  setTruneFilterDirection: (v: FilterDirection) => void;
  setWordFilterDirection: (v: FilterDirection) => void;
  setContextFilterDirection: (v: FilterDirection) => void;
  toggleSelectedTrune: (v: number | null) => void;
  toggleSelectedNGram: (v: number[] | null) => void;
  toggleSelectedWord: (v: number | null) => void;
  toggleSelectedContext: (v: number | null) => void;
}

export const useSelectionStore = create<SelectionState & SelectionActions>()(
  persist(
    (set) => ({
      ...initialState,
      setN: (n) => set({ n }),
      setMode: (mode) => set({ mode }),
      setGraphemesFilterDirection: (v) =>
        set((s) => {
          const next: Partial<SelectionState> = { graphemesFilterDirection: v };
          if (v === "forward") {
            if (s.truneFilterDirection === "backward")
              next.truneFilterDirection = "off";
            else if (s.wordFilterDirection === "backward")
              next.wordFilterDirection = "off";
          }
          return next;
        }),
      setTruneFilterDirection: (v) =>
        set((s) => {
          const next: Partial<SelectionState> = { truneFilterDirection: v };
          if (v === "backward" && s.graphemesFilterDirection === "forward")
            next.graphemesFilterDirection = "off";
          if (v === "forward") {
            if (s.wordFilterDirection === "backward")
              next.wordFilterDirection = "off";
            if (s.contextFilterDirection === "backward")
              next.contextFilterDirection = "off";
          }
          return next;
        }),
      setWordFilterDirection: (v) =>
        set((s) => {
          const next: Partial<SelectionState> = { wordFilterDirection: v };
          if (v === "backward") {
            if (s.truneFilterDirection === "forward")
              next.truneFilterDirection = "off";
            if (s.graphemesFilterDirection === "forward")
              next.graphemesFilterDirection = "off";
          }
          if (v === "forward" && s.contextFilterDirection === "backward")
            next.contextFilterDirection = "off";
          return next;
        }),
      setContextFilterDirection: (v) =>
        set((s) => {
          const next: Partial<SelectionState> = { contextFilterDirection: v };
          if (v === "backward") {
            if (s.wordFilterDirection === "forward")
              next.wordFilterDirection = "off";
            if (s.truneFilterDirection === "forward")
              next.truneFilterDirection = "off";
          }
          return next;
        }),
      toggleSelectedTrune: (selectedTrune) =>
        set((s) => {
          if (s.selectedTrune === selectedTrune) {
            return { selectedTrune: null };
          } else return { selectedTrune };
        }),
      toggleSelectedNGram: (selectedNGram) =>
        set((s) => {
          if (isEqual(s.selectedNGram, selectedNGram)) {
            return { selectedNGram: null };
          } else return { selectedNGram };
        }),
      toggleSelectedWord: (selectedWord) =>
        set((s) => {
          if (s.selectedWord === selectedWord) {
            return { selectedWord: null };
          } else return { selectedWord };
        }),
      toggleSelectedContext: (selectedContext) =>
        set((s) => {
          if (s.selectedContext === selectedContext) {
            return { selectedContext: null };
          } else return { selectedContext };
        }),
    }),
    {
      name: "tunic-selection",
      version: 3,
      migrate: (persisted, version) => {
        let p = persisted as Record<string, unknown>;
        if (version < 1 && p && typeof p === "object") {
          const { selectedGrapheme, graphemeFilterDirection, ...rest } =
            p as Record<string, unknown> & {
              selectedGrapheme?: number | null;
              graphemeFilterDirection?: FilterDirection;
            };
          p = {
            ...rest,
            selectedTrune: selectedGrapheme ?? null,
            truneFilterDirection: graphemeFilterDirection ?? "forward",
          };
        }
        if (version < 2 && p && typeof p === "object") {
          const idOf = (v: unknown): number | null => {
            if (v == null) return null;
            if (typeof v === "number") return v;
            if (typeof v === "object" && "id" in v) {
              const id = (v as { id: unknown }).id;
              return typeof id === "number" ? id : null;
            }
            return null;
          };
          p = {
            ...p,
            selectedTrune: idOf(p.selectedTrune),
            selectedWord: idOf(p.selectedWord),
            selectedContext: idOf(p.selectedContext),
          };
        }
        if (version < 3 && p && typeof p === "object") {
          const ng = p.selectedNGram;
          if (Array.isArray(ng)) {
            p = { ...p, selectedNGram: ng.map((v) => Number(v)) };
          }
        }
        return p as unknown as SelectionState & SelectionActions;
      },
    }
  )
);
