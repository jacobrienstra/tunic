import Grapheme from "../components/Grapheme";
import Tile from "../components/Tile";
import { RootState } from "../redux/store";
import {
  selectFilteredGraphemes,
  selectSelectedGrapheme,
  setSelectedGrapheme,
} from "../redux/reducers/selection";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { GraphemeData } from "../redux/reducers/data";

interface GraphemesProps {
  tileSize: number;
}

function Graphemes({ tileSize }: GraphemesProps) {
  const dispatch = useAppDispatch();

  const selectedGrapheme = useAppSelector(selectSelectedGrapheme);
  const filteredGraphemes = useAppSelector(selectFilteredGraphemes);

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
