import { isEqual } from "lodash";
import { useLiveQuery } from "@tanstack/react-db";

import { NGRAM_COLLECTIONS, truneIdsFromWordKey } from "../data/store";
import { useSelectionStore } from "../data/selectionStore";
import { useDerivedMeaning } from "../data/ruleset";
import { useFilteredNGrams } from "../data/filtered";
import TrunicWord from "../components/TrunicWord";
import Tile from "../components/Tile";

interface NGramsProps {
  tileSize: number;
}
function NGrams({ tileSize }: NGramsProps) {
  const selectedNGram = useSelectionStore((s) => s.selectedNGram);
  const toggleSelectedNGram = useSelectionStore((s) => s.toggleSelectedNGram);
  const n = useSelectionStore((s) => s.n);
  const filteredNGrams = useFilteredNGrams();
  const allNGrams = useLiveQuery(NGRAM_COLLECTIONS[n]);
  const derivedMeaning = useDerivedMeaning();

  return (
    <>
      {allNGrams.data.map((ng) => (
        <Tile
          size={tileSize}
          key={ng.ngKey}
          active={isEqual(selectedNGram, ng)}
          toggleFn={toggleSelectedNGram}
          val={ng.ngKey}
          hidden={!filteredNGrams.collection.has(ng.ngKey)}
        >
          <TrunicWord wordTrunes={truneIdsFromWordKey(ng.ngKey)} />
          <div className="text-cyan-600">
            {truneIdsFromWordKey(ng.ngKey)
              .map((val) => {
                derivedMeaning(val);
              })
              .join("")}
          </div>
        </Tile>
      ))}
    </>
  );
}

export default NGrams;
