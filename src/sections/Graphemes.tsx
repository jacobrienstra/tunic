import Grapheme from "../components/Grapheme";
import Tile from "../components/Tile";
import { RootState } from "../redux/store";
import {
  selectFilteredGraphemes,
  setSelectedGrapheme,
} from "../redux/reducers/selection";
import { useDispatch, useSelector } from "react-redux";
import { GraphemeData } from "../redux/reducers/data";

interface GraphemesProps {
  tileSize: number;
}

function Graphemes({ tileSize }: GraphemesProps) {
  const dispatch = useDispatch();

  const selectSelectedGrapheme = (state: RootState) =>
    state.selection.selectedGrapheme;
  const selectedGrapheme = useSelector(selectSelectedGrapheme);
  const filteredGraphemes = useSelector(selectFilteredGraphemes);

  return (
    <>
      {filteredGraphemes.map((g: GraphemeData) => (
        <Tile
          size={tileSize}
          key={g.id}
          sure={g.sure}
          active={selectedGrapheme === g.id}
          onClick={() => {
            if (selectedGrapheme !== g.id) {
              dispatch(setSelectedGrapheme(g.id));
            } else {
              dispatch(setSelectedGrapheme(null));
            }
          }}
        >
          <Grapheme glyph={g} />
        </Tile>
      ))}
    </>
  );
}

export default Graphemes;
