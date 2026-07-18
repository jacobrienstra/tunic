import { persist } from "zustand/middleware";
import { create } from "zustand";
import { createContext, useContext, useMemo } from "react";

import { useTrunes, useGlyphSubsets, useSettings, getGrapheme } from "./store";

export interface RulesetState {
  exclusiveSubsetMasks: boolean;
}

interface RulesetActions {
  setExclusiveSubsetMasks: (v: boolean) => void;
}

const initialState: RulesetState = {
  exclusiveSubsetMasks: true,
};

export const useRulesetStore = create<RulesetState & RulesetActions>()(
  persist(
    (set) => ({
      ...initialState,
      setExclusiveSubsetMasks: (v) => set({ exclusiveSubsetMasks: v }),
    }),
    {
      name: "tunic-ruleset",
      version: 4,
    }
  )
);

// Computed once by DerivedMeaningProvider (in App.tsx) and shared via
// DerivedMeaningContext, rather than every consumer re-subscribing to
// trunes/glyphSubsets/settings and recomputing the same closure.
export function useComputeDerivedMeaning(): (val: number) => string {
  const trunes = useTrunes();
  const { data: glyphSubsets } = useGlyphSubsets();
  const { data: settings } = useSettings();

  return useMemo(() => {
    const subsetsByName = new Map((glyphSubsets ?? []).map((s) => [s.name, s]));

    const applyRule = (trune: number, rule: string): string =>
      rule.replace(/\{\{([^}]+)\}\}/g, (_, name) => {
        const subset = subsetsByName.get(String(name));
        if (!subset) return "?";
        const derived = getGrapheme(trune, subset.mask);
        if (derived === 0) return "";
        return trunes.collection.get(derived)?.meaning ?? "?";
      });

    return (trune: number): string => {
      if (!trunes || !glyphSubsets || settings?.defaultSubsetRule == null)
        return "";
      for (const s of glyphSubsets) {
        if (!s.modifier || !s.rule) continue;
        if ((trune & s.mask) !== s.mask) continue;
        return applyRule(trune, s.rule);
      }
      return applyRule(trune, settings?.defaultSubsetRule);
    };
  }, [trunes, glyphSubsets, settings]);
}

export const DerivedMeaningContext = createContext<(val: number) => string>(
  () => ""
);

export function useDerivedMeaning(): (val: number) => string {
  return useContext(DerivedMeaningContext);
}
