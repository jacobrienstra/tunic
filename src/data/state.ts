import { persist } from "zustand/middleware";
import { create } from "zustand";
import { isEqual } from "lodash";

export type ReverseSyllableStatus = "present" | "absent" | "either";
export type Mode = "trunes" | "ngrams";
export type FilterDirection = "off" | "left" | "right";

export interface SelectionState {
  reverseSyllableFilter: ReverseSyllableStatus;
  vowelFilter: number | null;
  consonantFilter: number | null;
  partial: boolean;
  exclusive: boolean;
  n: number;
  mode: Mode;
  glyphFilterDirection: FilterDirection;
  truneFilterDirection: FilterDirection;
  wordFilterDirection: FilterDirection;
  contextFilterDirection: FilterDirection;
  selectedTrune: number | null;
  selectedNGram: string[] | null;
  selectedWord: number | null;
  selectedContext: number | null;
}

const initialState: SelectionState = {
  vowelFilter: null,
  consonantFilter: null,
  reverseSyllableFilter: "either",
  partial: false,
  exclusive: true,
  n: 2,
  mode: "trunes",
  glyphFilterDirection: "right",
  truneFilterDirection: "right",
  wordFilterDirection: "right",
  contextFilterDirection: "off",
  selectedTrune: null,
  selectedNGram: null,
  selectedWord: null,
  selectedContext: null,
};

interface SelectionActions {
  toggleVowelFilter: (v: number | null) => void;
  toggleConsonantFilter: (v: number | null) => void;
  setReverseSyllableFilter: (v: ReverseSyllableStatus) => void;
  togglePartialFilter: () => void;
  toggleExclusive: () => void;
  setN: (v: number) => void;
  setMode: (v: Mode) => void;
  setGlyphFilterDirection: (v: FilterDirection) => void;
  setTruneFilterDirection: (v: FilterDirection) => void;
  setWordFilterDirection: (v: FilterDirection) => void;
  setContextFilterDirection: (v: FilterDirection) => void;
  toggleSelectedTrune: (v: number | null) => void;
  toggleSelectedNGram: (v: string[] | null) => void;
  toggleSelectedWord: (v: number | null) => void;
  toggleSelectedContext: (v: number | null) => void;
}

export const useSelectionStore = create<SelectionState & SelectionActions>()(
  persist(
    (set) => ({
      ...initialState,
      toggleVowelFilter: (vowelFilter) =>
        set((s) => {
          if (s.vowelFilter === vowelFilter) {
            return { vowelFilter: null };
          } else return { vowelFilter };
        }),
      toggleConsonantFilter: (consonantFilter) =>
        set((s) => {
          if (s.consonantFilter === consonantFilter) {
            return { consonantFilter: null };
          } else return { consonantFilter };
        }),
      setReverseSyllableFilter: (reverseSyllableFilter) =>
        set({ reverseSyllableFilter }),
      togglePartialFilter: () => set((s) => ({ partial: !s.partial })),
      toggleExclusive: () => set((s) => ({ exclusive: !s.exclusive })),
      setN: (n) => set({ n }),
      setMode: (mode) => set({ mode }),
      setGlyphFilterDirection: (v) =>
        set((s) => {
          const next: Partial<SelectionState> = { glyphFilterDirection: v };
          if (v === "right") {
            if (s.truneFilterDirection === "left")
              next.truneFilterDirection = "off";
            else if (s.wordFilterDirection === "left")
              next.wordFilterDirection = "off";
          }
          return next;
        }),
      setTruneFilterDirection: (v) =>
        set((s) => {
          const next: Partial<SelectionState> = { truneFilterDirection: v };
          if (v === "left" && s.glyphFilterDirection === "right")
            next.glyphFilterDirection = "off";
          if (v === "right") {
            if (s.wordFilterDirection === "left")
              next.wordFilterDirection = "off";
            if (s.contextFilterDirection === "left")
              next.contextFilterDirection = "off";
          }
          return next;
        }),
      setWordFilterDirection: (v) =>
        set((s) => {
          const next: Partial<SelectionState> = { wordFilterDirection: v };
          if (v === "left") {
            if (s.truneFilterDirection === "right")
              next.truneFilterDirection = "off";
            if (s.glyphFilterDirection === "right")
              next.glyphFilterDirection = "off";
          }
          if (v === "right" && s.contextFilterDirection === "left")
            next.contextFilterDirection = "off";
          return next;
        }),
      setContextFilterDirection: (v) =>
        set((s) => {
          const next: Partial<SelectionState> = { contextFilterDirection: v };
          if (v === "left") {
            if (s.wordFilterDirection === "right")
              next.wordFilterDirection = "off";
            if (s.truneFilterDirection === "right")
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
      name: "tunic-selection-state",
      version: 1,
      migrate: (persisted, version) => {
        if (version < 1 && persisted && typeof persisted === "object") {
          const { selectedGrapheme, graphemeFilterDirection, ...rest } =
            persisted as Record<string, unknown> & {
              selectedGrapheme?: number | null;
              graphemeFilterDirection?: FilterDirection;
            };
          return {
            ...rest,
            selectedTrune: selectedGrapheme ?? null,
            truneFilterDirection: graphemeFilterDirection ?? "right",
          } as SelectionState & SelectionActions;
        }
        return persisted as SelectionState & SelectionActions;
      },
    }
  )
);
