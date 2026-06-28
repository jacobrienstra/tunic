import { useMemo } from "react";

import { useSelectionStore } from "../data/state";
import { useGraphemes, useWords } from "../data/queries";
import { calcFilteredGraphemes } from "../data/filters";
import { Grapheme as GraphemeData } from "../data/db";
import Tile from "../components/Tile";
import Grapheme from "../components/Grapheme";

interface GraphemesProps {
  tileSize: number;
}

function Graphemes({ tileSize }: GraphemesProps) {
  const graphemes = useGraphemes();
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
  const selectedGrapheme = useSelectionStore((s) => s.selectedGrapheme);
  const toggleSelectedGrapheme = useSelectionStore(
    (s) => s.toggleSelectedGrapheme
  );

  const filteredGraphemes = useMemo(
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
        graphemes,
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
      graphemes,
      words,
    ]
  );

  return (
    <>
      {filteredGraphemes.map((g: GraphemeData) => (
        <Tile
          size={tileSize}
          key={g.id}
          active={selectedGrapheme === g.id}
          toggleFn={toggleSelectedGrapheme}
          val={g.id}
        >
          <Grapheme {...g} />
        </Tile>
      ))}
    </>
  );
}

export default Graphemes;
