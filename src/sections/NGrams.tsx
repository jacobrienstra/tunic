import { isEqual } from "lodash";
import { css } from "@emotion/react";

import { selectFilteredNGrams, selectSelectedNGram } from "../selectors";
import { useGetGraphemesQuery, useGetWordsQuery } from "../redux/services/data";
import { setSelectedNGram } from "../redux/reducers/selection";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { getGraphemeSoundGuess } from "../glyph";
import Word from "../components/Word";
import Tile from "../components/Tile";

const wordGuess = css`
  color: var(--cyan-600);
`;

interface NGramsProps {
  tileSize: number;
}
function NGrams({ tileSize }: NGramsProps) {
  const dispatch = useAppDispatch();

  const { data: words } = useGetWordsQuery();
  const { data: graphemes } = useGetGraphemesQuery();
  const filteredNGrams = useAppSelector(selectFilteredNGrams(() => words));
  const selectedNGram = useAppSelector(selectSelectedNGram);

  return (
    <>
      {filteredNGrams.map((ng) => (
        <Tile
          size={tileSize}
          key={ng.join("_")}
          active={isEqual(selectedNGram, ng)}
          onClick={() => {
            if (!isEqual(selectedNGram, ng)) {
              dispatch(setSelectedNGram(ng));
            } else {
              dispatch(setSelectedNGram(null));
            }
          }}
        >
          <Word word={ng} />
          <div css={wordGuess}>
            {ng
              .map((val) => {
                const sound = graphemes?.find(
                  (g) => g.id === parseInt(val)
                )?.sound;
                if (sound === "" || sound === undefined) {
                  return getGraphemeSoundGuess(parseInt(val), graphemes);
                }
                return sound.replace("?", "");
              })
              .join("")}
          </div>
        </Tile>
      ))}
    </>
  );
}

export default NGrams;
