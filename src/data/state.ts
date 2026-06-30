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
  graphemeFilterDirection: FilterDirection;
  wordFilterDirection: FilterDirection;
  contextFilterDirection: FilterDirection;
  selectedGrapheme: number | null;
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
  graphemeFilterDirection: "right",
  wordFilterDirection: "right",
  contextFilterDirection: "off",
  selectedGrapheme: null,
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
  setGraphemeFilterDirection: (v: FilterDirection) => void;
  setWordFilterDirection: (v: FilterDirection) => void;
  setContextFilterDirection: (v: FilterDirection) => void;
  toggleSelectedGrapheme: (v: number | null) => void;
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
            if (s.graphemeFilterDirection === "left")
              next.graphemeFilterDirection = "off";
            else if (s.wordFilterDirection === "left")
              next.wordFilterDirection = "off";
          }
          return next;
        }),
      setGraphemeFilterDirection: (v) =>
        set((s) => {
          const next: Partial<SelectionState> = { graphemeFilterDirection: v };
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
            if (s.graphemeFilterDirection === "right")
              next.graphemeFilterDirection = "off";
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
            if (s.graphemeFilterDirection === "right")
              next.graphemeFilterDirection = "off";
          }
          return next;
        }),
      toggleSelectedGrapheme: (selectedGrapheme) =>
        set((s) => {
          if (s.selectedGrapheme === selectedGrapheme) {
            return { selectedGrapheme: null };
          } else return { selectedGrapheme };
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
    { name: "tunic-selection-state" }
  )
);
