import { persist } from "zustand/middleware";
import { create } from "zustand";
import { useMemo } from "react";

import { useTrunes, useGlyphSubsets } from "./queries";
import { getGrapheme } from "./filters";
import type { GlyphSubset } from "./db";

export interface RulesetState {
  exclusiveSubsetMasks: boolean;
  defaultSubsetOrder: number[];
}

interface RulesetActions {
  setExclusiveSubsetMasks: (v: boolean) => void;
  setDefaultSubsetOrder: (v: number[]) => void;
}

const initialState: RulesetState = {
  exclusiveSubsetMasks: true,
  defaultSubsetOrder: [],
};

export const useRulesetStore = create<RulesetState & RulesetActions>()(
  persist(
    (set) => ({
      ...initialState,
      setExclusiveSubsetMasks: (v) => set({ exclusiveSubsetMasks: v }),
      setDefaultSubsetOrder: (v) => set({ defaultSubsetOrder: v }),
    }),
    {
      name: "tunic-ruleset",
      version: 3,
      migrate: (persisted, version) => {
        let p = persisted as Record<string, unknown>;
        if (version < 2 && p && typeof p === "object") {
          const { exclusiveGroupMasks, defaultGroupOrder, ...rest } =
            p as Record<string, unknown> & {
              exclusiveGroupMasks?: boolean;
              defaultGroupOrder?: number[];
            };
          p = {
            ...rest,
            exclusiveSubsetMasks: exclusiveGroupMasks ?? true,
            defaultSubsetOrder: defaultGroupOrder ?? [],
          };
        }
        return p as unknown as RulesetState & RulesetActions;
      },
    }
  )
);

export function useDerivedMeaning(): (val: number) => string {
  const trunes = useTrunes();
  const glyphSubsets = useGlyphSubsets();
  const defaultSubsetOrder = useRulesetStore((s) => s.defaultSubsetOrder);

  return useMemo(() => {
    const subsetsById = new Map((glyphSubsets ?? []).map((s) => [s.id, s]));
    const subsetsByName = new Map((glyphSubsets ?? []).map((s) => [s.name, s]));
    const trunesById = new Map((trunes ?? []).map((t) => [t.id, t]));

    const getDerivedMeaningOfTruneSubset = (
      t: number,
      subset: GlyphSubset
    ): string => {
      const derived = getGrapheme(t, subset.mask);
      if (derived === 0) return "";
      return trunesById.get(derived)?.meaning ?? "?";
    };

    return (trune: number): string => {
      if (!trunes) return "";
      if (!glyphSubsets || glyphSubsets.length === 0)
        return trunesById.get(trune)?.meaning ?? "";

      // for (const id of glyphSubsets
      //   .filter((s) => s.modifier)
      //   .map((s) => s.id)) {
      //   const mod = subsetsById.get(id);
      //   if (!mod?.rule) continue;
      //   if ((val & mod.mask) !== mod.mask) continue;
      //   return mod.rule.replace(/\{([^}]+)\}/g, (_, name: string) => {
      //     const subset = subsetsByName.get(name);
      //     if (!subset) return "?";
      //     return getDerivedMeaningOfTruneSubset(trune, subset);
      //   });
      // }

      const order =
        defaultSubsetOrder.length > 0
          ? defaultSubsetOrder
          : glyphSubsets.map((g) => g.id).reverse();

      return order
        .map((id) => {
          const subset = subsetsById.get(id);
          if (!subset || subset.modifier) return "";
          return getDerivedMeaningOfTruneSubset(trune, subset);
        })
        .join("");
    };
  }, [trunes, glyphSubsets, defaultSubsetOrder]);
}
