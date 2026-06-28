import { useMemo } from "react";
import { isEqual } from "lodash";
import { css } from "@emotion/react";

import { getGraphemeSoundGuess } from "../glyph";
import { useSelectionStore } from "../data/state";
import { useGraphemes, useWords } from "../data/queries";
import { calcFilteredNGrams } from "../data/filters";
import Word from "../components/Word";
import Tile from "../components/Tile";

const wordGuess = css`
  color: var(--cyan-600);
`;

interface NGramsProps {
  tileSize: number;
}
function NGrams({ tileSize }: NGramsProps) {
  const words = useWords();
  const graphemes = useGraphemes();

  const vowelFilter = useSelectionStore((s) => s.vowelFilter);
  const consonantFilter = useSelectionStore((s) => s.consonantFilter);
  const reverseSyllableFilter = useSelectionStore(
    (s) => s.reverseSyllableFilter
  );
  const partial = useSelectionStore((s) => s.partial);
  const exclusive = useSelectionStore((s) => s.exclusive);
  const n = useSelectionStore((s) => s.n);
  const selectedWord = useSelectionStore((s) => s.selectedWord);
  const glyphFilterDirection = useSelectionStore((s) => s.glyphFilterDirection);
  const wordFilterDirection = useSelectionStore((s) => s.wordFilterDirection);
  const selectedNGram = useSelectionStore((s) => s.selectedNGram);
  const toggleSelectedNGram = useSelectionStore((s) => s.toggleSelectedNGram);

  const filteredNGrams = useMemo(
    () =>
      calcFilteredNGrams(
        {
          vowelFilter,
          consonantFilter,
          reverseSyllableFilter,
          partial,
          exclusive,
          n,
          selectedWord,
          glyphFilterDirection,
          wordFilterDirection,
        },
        words
      ),
    [
      vowelFilter,
      consonantFilter,
      reverseSyllableFilter,
      partial,
      exclusive,
      n,
      selectedWord,
      glyphFilterDirection,
      wordFilterDirection,
      words,
    ]
  );

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
          <Word word={ng} />
          <div css={wordGuess}>
            {ng
              .map((val) => {
                const meaning = graphemes?.find(
                  (g) => g.id === parseInt(val)
                )?.meaning;
                if (meaning === "" || meaning === undefined) {
                  return getGraphemeSoundGuess(parseInt(val), graphemes);
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
