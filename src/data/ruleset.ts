import { persist } from "zustand/middleware";
import { create } from "zustand";

import { useTrunes, useGlyphSubsets, useSettings } from "./store";
import { getGrapheme } from "./filters";

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

export function useDerivedMeaning(): (val: number) => string {
  const trunes = useTrunes();
  const glyphSubsets = useGlyphSubsets();
  const defaultSubsetRule = useDefaultSubsetRule();

  return useMemo(() => {
    const subsetsByName = new Map((glyphSubsets ?? []).map((s) => [s.name, s]));
    const trunesById = new Map((trunes ?? []).map((t) => [t.id, t]));

    const applyRule = (trune: number, rule: string): string =>
      rule.replace(/\{([^}]+)\}/g, (_, name) => {
        const subset = subsetsByName.get(String(name));
        if (!subset) return "?";
        const derived = getGrapheme(trune, subset.mask);
        if (derived === 0) return "";
        return trunesById.get(derived)?.meaning ?? "?";
      });

    return (trune: number): string => {
      if (!trunes || !glyphSubsets || defaultSubsetRule == null) return "";
      for (const s of glyphSubsets) {
        if (!s.modifier || !s.rule) continue;
        if ((trune & s.mask) !== s.mask) continue;
        return applyRule(trune, s.rule);
      }
      return applyRule(trune, defaultSubsetRule);
    };
  }, [trunes, glyphSubsets, defaultSubsetRule]);
}
