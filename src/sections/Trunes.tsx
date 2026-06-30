import { useSelectionStore } from "../data/selection";
import { useFilteredTrunes } from "../data/filters";
import { Trune as TruneShape } from "../data/db";
import Trune from "../components/Trune";
import Tile from "../components/Tile";

interface TrunesProps {
  tileSize: number;
}

function Trunes({ tileSize }: TrunesProps) {
  const selectedTrune = useSelectionStore((s) => s.selectedTrune);
  const toggleSelectedTrune = useSelectionStore((s) => s.toggleSelectedTrune);
  const filteredTrunes = useFilteredTrunes();
  return (
    <>
      {filteredTrunes.map((t: TruneShape) => (
        <Tile
          size={tileSize}
          key={t.id}
          active={selectedTrune === t.id}
          toggleFn={toggleSelectedTrune}
          val={t.id}
        >
          <Trune {...t} />
        </Tile>
      ))}
    </>
  );
}

export default Trunes;
