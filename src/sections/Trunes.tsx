import { useTrunes } from "../data/store";
import { useSelectionStore } from "../data/selectionStore";
import { useFilteredTrunes } from "../data/filtered";
import Trune from "../components/Trune";
import Tile from "../components/Tile";

interface TrunesProps {
  tileSize: number;
}

function Trunes({ tileSize }: TrunesProps) {
  const selectedTrune = useSelectionStore((s) => s.selectedTrune);
  const toggleSelectedTrune = useSelectionStore((s) => s.toggleSelectedTrune);
  const filteredTrunes = useFilteredTrunes();
  const allTrunes = useTrunes();

  return (
    <>
      {allTrunes.data.map((t) => (
        <Tile
          size={tileSize}
          key={t.id}
          active={selectedTrune === t.id}
          toggleFn={toggleSelectedTrune}
          val={t.id}
          hidden={!filteredTrunes.collection?.has(t.id)}
        >
          <Trune {...t} />
        </Tile>
      ))}
    </>
  );
}

export default Trunes;
