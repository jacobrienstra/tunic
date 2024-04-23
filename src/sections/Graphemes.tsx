import { selectFilteredGraphemes, selectSelectedGrapheme } from "../selectors";
import {
  GraphemeData,
  useGetGraphemesQuery,
  useGetWordsQuery,
} from "../redux/services/data";
import { setSelectedGrapheme } from "../redux/reducers/selection";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import Tile from "../components/Tile";
import Grapheme from "../components/Grapheme";

interface GraphemesProps {
  tileSize: number;
}

function Graphemes({ tileSize }: GraphemesProps) {
  const dispatch = useAppDispatch();

  const { data: graphemes } = useGetGraphemesQuery();
  const { data: words } = useGetWordsQuery();

  const selectedGrapheme = useAppSelector(selectSelectedGrapheme);
  const filteredGraphemes = useAppSelector(
    selectFilteredGraphemes(
      () => graphemes,
      () => words
    )
  );

  return (
    <>
      {filteredGraphemes.map((g: GraphemeData) => (
        <Tile
          size={tileSize}
          key={g.id}
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
