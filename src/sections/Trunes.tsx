import { useMemo } from "react";

import { useSelectionStore } from "../data/state";
import { useTrunes, useWords } from "../data/queries";
import { calcFilteredGraphemes } from "../data/filters";
import { Trune as TruneShape } from "../data/db";
import Trune from "../components/Trune";
import Tile from "../components/Tile";

interface TrunesProps {
  tileSize: number;
}

function Trunes({ tileSize }: TrunesProps) {
  const trunes = useTrunes();
  const words = useWords();

  const vowelFilter = useSelectionStore((s) => s.vowelFilter);
  const consonantFilter = useSelectionStore((s) => s.consonantFilter);
  const reverseSyllableFilter = useSelectionStore(
    (s) => s.reverseSyllableFilter
  );
  const partial = useSelectionStore((s) => s.partial);
  const exclusive = useSelectionStore((s) => s.exclusive);
  const selectedWord = useSelectionStore((s) => s.selectedWord);
  const glyphFilterDirection = useSelectionStore((s) => s.glyphFilterDirection);
  const wordFilterDirection = useSelectionStore((s) => s.wordFilterDirection);
  const selectedTrune = useSelectionStore((s) => s.selectedTrune);
  const toggleSelectedTrune = useSelectionStore((s) => s.toggleSelectedTrune);

  const filteredTrunes = useMemo(
    () =>
      calcFilteredGraphemes(
        {
          vowelFilter,
          consonantFilter,
          reverseSyllableFilter,
          partial,
          exclusive,
          selectedWord,
          glyphFilterDirection,
          wordFilterDirection,
        },
        trunes,
        words
      ),
    [
      vowelFilter,
      consonantFilter,
      reverseSyllableFilter,
      partial,
      exclusive,
      selectedWord,
      glyphFilterDirection,
      wordFilterDirection,
      trunes,
      words,
    ]
  );

  return (
    <>
      {filteredTrunes.map((g: TruneShape) => (
        <Tile
          size={tileSize}
          key={g.id}
          active={selectedTrune === g.id}
          toggleFn={toggleSelectedTrune}
          val={g.id}
        >
          <Trune {...g} />
        </Tile>
      ))}
    </>
  );
}

export default Trunes;
