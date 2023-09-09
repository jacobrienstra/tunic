import Grapheme from "../components/Grapheme";
import Tile from "../components/Tile";
import { setSelectedGrapheme } from "../redux/reducers/selection";
import { selectFilteredGraphemes, selectSelectedGrapheme } from "../selectors";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  GraphemeData,
  useGetGraphemesQuery,
  useGetWordsQuery,
} from "../redux/services/data";

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
