import { css } from "@emotion/react";
import Tile from "../components/Tile";
import Word from "../components/Word";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { setSelectedNGram } from "../redux/reducers/selection";
import { selectFilteredNGrams, selectSelectedNGram } from "../selectors";
import { isEqual } from "lodash";
import {
  useGetGraphemeByIdQuery,
  useGetWordsQuery,
} from "../redux/services/data";

const wordGuess = css`
  color: var(--cyan-600);
`;

interface NGramsProps {
  tileSize: number;
}
function NGrams({ tileSize }: NGramsProps) {
  const dispatch = useAppDispatch();

  const { data: words } = useGetWordsQuery();
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
            {ng.map((val) => {
              let sound = useGetGraphemeByIdQuery(val).data?.sound;
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
