import { css } from "@emotion/react";
import Grapheme from "../components/Grapheme";
import Tile from "../components/Tile";
import Word from "../components/Word";
import { useDispatch, useSelector } from "react-redux";
import {
  selectFilteredNGrams,
  setSelectedNGram,
} from "../redux/reducers/selection";
import { RootState } from "../redux/store";
import { isEqual } from "lodash";

interface NGramsProps {
  tileSize: number;
}
function NGrams({ tileSize }: NGramsProps) {
  const dispatch = useDispatch();
  const selectSelectedNGram = (state: RootState) =>
    state.selection.selectedNGram;

  const filteredNGrams = useSelector(selectFilteredNGrams);
  const selectedNGram = useSelector(selectSelectedNGram);

  return (
    <>
      {filteredNGrams.map((ng) => (
        <Tile
          size={tileSize}
          key={ng.toString()}
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
        </Tile>
      ))}
    </>
  );
}

export default NGrams;
