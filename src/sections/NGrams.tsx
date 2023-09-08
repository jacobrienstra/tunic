import { css } from "@emotion/react";
import Tile from "../components/Tile";
import Word from "../components/Word";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { getWordId } from "../redux/reducers/data";
import {
  selectFilteredNGrams,
  selectSelectedNGram,
  setSelectedNGram,
} from "../redux/reducers/selection";
import { isEqual } from "lodash";

const wordGuess = css`
  color: var(--cyan-600);
`;

interface NGramsProps {
  tileSize: number;
}
function NGrams({ tileSize }: NGramsProps) {
  const dispatch = useAppDispatch();

  const graphemes = useAppSelector((state) => state.data.graphemes.entities);
  const filteredNGrams = useAppSelector(selectFilteredNGrams);
  const selectedNGram = useAppSelector(selectSelectedNGram);

  return (
    <>
      {filteredNGrams.map((ng) => (
        <Tile
          size={tileSize}
          key={getWordId(ng)}
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
            {ng.map((val) => {
              let sound = graphemes[val].sound;
              if (sound === "" || sound === undefined) {
                return "??";
              }
              return sound.replace("?", "");
            })}
          </div>
        </Tile>
      ))}
    </>
  );
}

export default NGrams;
