import Grapheme from "../components/Grapheme";
import Tile from "../components/Tile";
import { setSelectedGrapheme } from "../redux/reducers/selection";
import { selectFilteredGraphemes, selectSelectedGrapheme } from "../selectors";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { GraphemeData, useGetGraphemesQuery } from "../redux/services/data";

interface GraphemesProps {
  tileSize: number;
}

function Graphemes({ tileSize }: GraphemesProps) {
  const dispatch = useAppDispatch();

  const { data: graphemes } = useGetGraphemesQuery();

  const selectedGrapheme = useAppSelector(selectSelectedGrapheme);
  const filteredGraphemes = useAppSelector(selectFilteredGraphemes(graphemes));

  return (
    <>
      {filteredGraphemes.map((g: GraphemeData) => (
        <Tile
          size={tileSize}
          key={g.id}
          active={selectedGrapheme?.id === g.id}
          onClick={() => {
            if (selectedGrapheme?.id !== g.id) {
              dispatch(setSelectedGrapheme(g));
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
