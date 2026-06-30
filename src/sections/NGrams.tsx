import { isEqual } from "lodash";

import { useSelectionStore } from "../data/selection";
import { useDerivedMeaning } from "../data/ruleset";
import { useTrunes } from "../data/queries";
import { useFilteredNGrams } from "../data/filters";
import TrunicWord from "../components/TrunicWord";
import Tile from "../components/Tile";

interface NGramsProps {
  tileSize: number;
}
function NGrams({ tileSize }: NGramsProps) {
  const trunes = useTrunes();
  const selectedNGram = useSelectionStore((s) => s.selectedNGram);
  const toggleSelectedNGram = useSelectionStore((s) => s.toggleSelectedNGram);
  const filteredNGrams = useFilteredNGrams();
  const deriveMeaning = useDerivedMeaning();

  return (
    <>
      {filteredNGrams.map((ng) => (
        <Tile
          size={tileSize}
          key={ng.join("_")}
          active={isEqual(selectedNGram, ng)}
          toggleFn={toggleSelectedNGram}
          val={ng}
        >
          <TrunicWord wordTrunes={ng} />
          <div className="text-cyan-600">
            {ng
              .map((val) => {
                const meaning = trunes?.find((g) => g.id === val)?.meaning;
                if (meaning === "" || meaning === undefined) {
                  return deriveMeaning(val);
                }
                return meaning.replace("?", "");
              })
              .join("")}
          </div>
        </Tile>
      ))}
    </>
  );
}

export default NGrams;
